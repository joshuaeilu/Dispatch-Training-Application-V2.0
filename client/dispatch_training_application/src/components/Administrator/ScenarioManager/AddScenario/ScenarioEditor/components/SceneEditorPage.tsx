import { useForm, Controller } from "react-hook-form";
import { Button, Divider, Empty, Input, Popover, Select, Typography, message } from "antd";
import { PauseCircleFilled, PlayCircleFilled, PlusOutlined } from "@ant-design/icons";
import { use, useContext, useEffect, useRef, useState } from "react";
import type { HighlightData, Scenario, SceneEditorProps } from "../../../../../../types/index.types";
import SceneOptionsEditor from "./SceneOptionsEditor";
import HighlightTagSection from "./HighlightTagSection";
import AudioEditorModal from "./AudioEditorModal";
import { voices } from "../../SituationSetter"
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from "../../../../../../contexts/AuthProvider";
import { api } from "../../../../../../utils/api";
const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function SceneEditorPage({
  scenario,
  setScenario,
  currentIndex,
  setCurrentIndex,
  scrollHighlight, audioRef,
  playing, setPlaying
}: SceneEditorProps) {
  const scene = scenario?.scenes[currentIndex];
  const [messageApi, contextHolder] = message.useMessage();
  const [tipOpen, setTipOpen] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [showAudioEditor, setShowAudioEditor] = useState(false);


  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      speaker: scene?.speaker,
      sceneDescription: scene?.sceneDescription,
    },
  });

  useEffect(() => {
    reset({
      speaker: scene?.speaker,
      sceneDescription: scene?.sceneDescription,
    });
  }, [currentIndex, scene, reset]);

  const onSubmit = (data: any) => {
    const currentScene = scenario?.scenes[currentIndex];

    const hasOptions = currentScene?.options && currentScene.options.length > 0;
    const hasCorrect = !!currentScene?.correctOption;

   

    if (hasOptions && !hasCorrect) {
      return messageApi.error("Please mark the correct option.");
    }

    const newScene = {
      id: uuidv4(),
      speaker: "",
      sceneDescription: "",
      options: [],
      correctOption: null,
      tip: '',
      highlights: []
    };


    setScenario && setScenario({
      ...scenario!,
      scenes: [
        ...scenario!.scenes.slice(0, currentIndex + 1),
        newScene,
        ...scenario!.scenes.slice(currentIndex + 1),
      ],
    });

    setCurrentIndex(currentIndex + 1); // stay on new scene

    reset({
      speaker: "",
      sceneDescription: "",
    });
  };


  const tipContent = (
    <div>
      <p>Add a tip for this scene:</p>
      <TextArea
        rows={4}
        style={{ marginBottom: 8, marginTop: 8 }}
        placeholder="e.g. Ask for the caller's location."
        value={scene?.tip}
        onChange={(e) =>

          setScenario && setScenario({ ...scenario!, scenes: scenario!.scenes.map((s, idx) => idx === currentIndex ? { ...s, tip: e.target.value } : s) })

        }
      />
      <Button type="primary" onClick={() => setTipOpen(false)}>
        Save
      </Button>
    </div>
  );

  const { token } = useContext(AuthContext);


  // ---- Audio Controls ----
  const handlePlayDescription = () => {
    if (!scene?.sceneDescription?.trim()) {
      return messageApi.warning("No description text to play.");
    }

    const speaker = scenario?.speakers.find((sp) => sp.name === scene?.speaker);
    if (!speaker?.voice) {
      return messageApi.error("No voice assigned to this speaker.");
    }

    const url = `/api/tts?voice=${encodeURIComponent(speaker.voice)}&text=${encodeURIComponent(scene.sceneDescription)}&token=${token}`;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    setLoadingAudio(true); // Start loading

    // Wait until the audio is ready to play
    audio.addEventListener("canplaythrough", () => {
      setLoadingAudio(false);
      setPlaying(true);
      audio.play();
    });

    // On end
    audio.onended = () => {
      setPlaying(false);
    };

    // On error
    audio.onerror = () => {
      setLoadingAudio(false);
      setPlaying(false);
      messageApi.error("Failed to load or play audio.");
    };
  };


  const handlePauseDescription = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  };

 





  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: "flex",
          padding: 16,
          backgroundColor: "#ffffff",
          height: "100%",
          flexDirection: "column",
          overflowY: "auto",
          paddingRight: 8,
        }}
      >
        <Title level={5} style={{ textAlign: "center", margin: 0 }}>
          Scene {currentIndex + 1}
        </Title>
        <Divider style={{ margin: "8px 0" }} />

        {/* Speaker Field */}
        <Text>Speaker</Text>
        <Controller
          name="speaker"
          control={control}
          rules={{ required: "Speaker is required." }}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="Select a Speaker"
              style={{
                width: "100%",
                marginTop: 8,
                marginBottom: errors.speaker ? 4 : 16,
                borderColor: errors.speaker ? "#ff4d4f" : undefined,
              }}
              onChange={(value) => {
                if (value === "add_new_speaker") {
                  // 1. Show the modal
                  setShowAudioEditor(true);

                  return;
                }
                else {
                  field.onChange(value);
               
                  setScenario && setScenario({ ...scenario!, scenes: scenario!.scenes.map((s, idx) => idx === currentIndex ? { ...s, speaker: value } : s) });
                }
              }}
              value={field.value || undefined}
            >
              {scenario?.speakers.map((sp) => (
                <Option key={sp.id} value={sp.name}>
                  {sp.name}
                </Option>
              ))}
              <Option value="add_new_speaker" style={{ fontStyle: "italic" }}>
                + Add / Edit Speaker
              </Option>
            </Select>
          )}
        />
        {errors.speaker && (
          <Text type="danger" style={{ fontSize: 12 }}>
            {errors.speaker.message}
          </Text>
        )}

        {/* Scene Description */}
        <Text>Scene Description</Text>
        <Controller
          name="sceneDescription"
          control={control}
          rules={{ required: "Description is required." }}
          render={({ field }) => (
            <>
              <TextArea
                {...field}
                rows={4}
                placeholder="Describe what is happening in this scene..."
                style={{
                  width: "100%",
                  minHeight: 100,
                  marginTop: 8,
                  marginBottom: errors.sceneDescription ? 4 : 16,
                  borderColor: errors.sceneDescription ? "#ff4d4f" : undefined,
                }}
                onChange={(e) => {
                  field.onChange(e.target.value);
                
                  setScenario && setScenario({ ...scenario!, scenes: scenario!.scenes.map((s, idx) => idx === currentIndex ? { ...s, sceneDescription: e.target.value } : s) });
                }}
              />
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  block
                  icon={
                    playing ? (
                      <PauseCircleFilled style={{ fontSize: 20 }} />
                    ) : (
                      <PlayCircleFilled style={{ fontSize: 20 }} />
                    )
                  }
                  onClick={playing ? handlePauseDescription : handlePlayDescription}
                  loading={loadingAudio} // AntD loading spinner
                >
                  {loadingAudio
                    ? "Loading Audio..."
                    : playing
                      ? "Pause Audio Description"
                      : "Play Audio Description"}
                </Button>

              </div>
            </>
          )}
        />
        {errors.sceneDescription && (
          <Text type="danger" style={{ fontSize: 12 }}>
            {errors.sceneDescription.message}
          </Text>
        )}

        {/* Highlights */}
        <Text>Highlights</Text>

        {scene?.highlights && scene.highlights.length > 0 ? (
          <HighlightTagSection
            highlights={scene.highlights}
            setHighlights={(highlights) =>
              setScenario && setScenario({ ...scenario!, scenes: scenario!.scenes.map((s, idx) => idx === currentIndex ? { ...s, highlights } : s) })
            }
            scrollToHighlight={scrollHighlight}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <p style={{ fontSize: 12, margin: 0 }}>No highlights available</p>
            }
            style={{ padding: 8, margin: 0 }}
          />
        )}

        {/* Scene Options */}
        <Text>Scene Options</Text>
        <SceneOptionsEditor
          options={scene?.options || []}
          correctOption={scene?.correctOption || null}
          onChange={(updatedOptions) =>        
            setScenario && setScenario({ ...scenario!, scenes: scenario!.scenes.map((s, idx) => idx === currentIndex ? { ...s, options: updatedOptions } : s) })
          }
          onCorrectChange={(correctOption) =>
            setScenario && setScenario({ ...scenario!, scenes: scenario!.scenes.map((s, idx) => idx === currentIndex ? { ...s, correctOption } : s) })
          }
        />

        {/* Footer Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <Popover
            content={tipContent}
            title="Add a Tip?"
            trigger="click"
            open={tipOpen}
            onOpenChange={setTipOpen}
          >
            <Button type="dashed">Add Tip</Button>
          </Popover>

     <Button
  type="primary"
  htmlType="submit"
  icon={<PlusOutlined />}
  disabled={
    (() => {
      const currentScene = scenario?.scenes?.[currentIndex];
      if (!currentScene) return true; // disable until scene exists

      const hasOptions = currentScene.options?.length > 0;
      const noCorrectOption = currentScene.correctOption === null || currentScene.correctOption === undefined;

      return hasOptions && noCorrectOption;
    })()
  }
>
  Add New Scene
</Button>

          
          {contextHolder}
        </div>
      </form>

      <AudioEditorModal
        visible={showAudioEditor}
        onClose={() => setShowAudioEditor(false)}
        speakers={scenario?.speakers || []}
        setSpeakers={(newSpeakers) => {
   
          setScenario && setScenario({ ...scenario!, speakers: newSpeakers, scenes: scenario!.scenes.map((s, idx) => idx === currentIndex ? { ...s, speaker: newSpeakers[newSpeakers.length - 1]?.name || "" } : s) });

        }}

        voices={voices}
      />

    </>
  );
}
