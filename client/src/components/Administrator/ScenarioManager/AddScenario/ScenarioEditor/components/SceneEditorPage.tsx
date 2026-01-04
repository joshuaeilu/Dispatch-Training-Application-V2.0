import { Button, Divider, Input, Popover, Select, Typography, message, Form } from "antd";
import { PauseCircleFilled, PlayCircleFilled, PlusOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import type { SceneEditorProps } from "../../../../../../types/index.types";
import SceneOptionsEditor from "./SceneOptionsEditor";
import AudioEditorModal from "./AudioEditorModal";
import { voices } from "../../SituationSetter"
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from "../../../../../../contexts/AuthProvider";
const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function SceneEditorPage({
  scenario,
  setScenario,
  currentIndex,
  setCurrentIndex,
 audioRef,
  playing, setPlaying
}: SceneEditorProps) {
  const scene = scenario?.scenes[currentIndex];
  const [messageApi, contextHolder] = message.useMessage();
  const [tipOpen, setTipOpen] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [showAudioEditor, setShowAudioEditor] = useState(false);
  const [form] = Form.useForm();





  const onSubmit = () => {
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


    if (setScenario) {
  setScenario({
    ...scenario!,
    scenes: [
      ...scenario!.scenes.slice(0, currentIndex + 1),
      newScene,
      ...scenario!.scenes.slice(currentIndex + 1),
    ],
  });
}


    setCurrentIndex(currentIndex + 1); // stay on new scene


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



    // Reset form fields when selected question changes
    useEffect(() => {
      form.resetFields();
    }, [currentIndex]);

    // load current question into form when exercise or selectedIndex changes
  useEffect(() => {
    form.setFieldsValue({ ...scene });
  }, [scenario?.scenes, currentIndex]);





  return (
    <>

      <Form form={form} layout="vertical" style={{
        display: "flex",
        padding: 16,
        backgroundColor: "#ffffff",
        height: "100%",
        flexDirection: "column",
        overflowY: "auto",
        paddingRight: 8,
      }}>
        <Title level={5} style={{ textAlign: "center", margin: 0 }}>
          Scene {currentIndex + 1}
        </Title>
        <Divider style={{ margin: "8px 0" }} />

        {/* Scene Speaker Selector */}
        <Form.Item label="Speaker" name="speaker" rules={[{ required: true, message: 'Please select a speaker' }]} >
          <Select
            placeholder="Select a Speaker"
            onChange={(value) => {
              if (value === "add_new_speaker") {
                // 1. Show the modal
                setShowAudioEditor(true);

                return;
              }
              else {
if (!scenario) return;

setScenario({
  ...scenario,
  scenes: scenario.scenes.map((s, idx) =>
    idx === currentIndex ? { ...s, speaker: value } : s
  ),
});

              }
            }}
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
        </Form.Item>

        {/* Scene Description Input */}
        <Form.Item label="Scene Description" name="sceneDescription" rules={[{ required: true, message: 'Please enter a scene description' }]} >
          <TextArea
            rows={4}
            placeholder="Describe the scene..."
            value={scene?.sceneDescription}
            onChange={(e) => {
              if (!scenario) return;
              setScenario({ ...scenario!, scenes: scenario!.scenes.map((s, idx) => idx === currentIndex ? { ...s, sceneDescription: e.target.value } : s) });
            }}
          />
        </Form.Item>
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
            loading={loadingAudio}
          >
            {loadingAudio
              ? "Loading Audio..."
              : playing
                ? "Pause Audio Description"
                : "Play Audio Description"}
          </Button>
        </div>



        {/* Scene Options */}
        <Text>Scene Options</Text>
        <SceneOptionsEditor
  key={scene?.id} // keep this from earlier fix
  options={scene?.options || []}
  correctOption={scene?.correctOption || null}
  onChange={(updatedOptions) =>
    setScenario?.((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        scenes: prev.scenes.map((s, idx) =>
          idx === currentIndex ? { ...s, options: updatedOptions } : s
        ),
      };
    })
  }
  onCorrectChange={(correctOption) =>
    setScenario?.((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        scenes: prev.scenes.map((s, idx) =>
          idx === currentIndex ? { ...s, correctOption } : s
        ),
      };
    })
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
            onClick={() => onSubmit()}
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

        </div>
      </Form>

      <AudioEditorModal
        visible={showAudioEditor}
        onClose={() => setShowAudioEditor(false)}
        speakers={scenario?.speakers || []}
        setSpeakers={(newSpeakers) => {
          if (!scenario) return;

          setScenario({ ...scenario!, speakers: newSpeakers, scenes: scenario!.scenes.map((s, idx) => idx === currentIndex ? { ...s, speaker: newSpeakers[newSpeakers.length - 1]?.name || "" } : s) });

        }}

        voices={voices}
      />


      {contextHolder}
    </>
  );
}
