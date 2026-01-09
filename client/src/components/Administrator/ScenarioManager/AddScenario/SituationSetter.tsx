import {
  Card,
  Form,
  Input,
  Select,
  TimePicker,
  Typography,
  Button,
  message,
  Space,
} from "antd";
import { useContext, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Dayjs } from "dayjs";
import {
  PlusOutlined,
  PlayCircleFilled,
  PauseCircleFilled,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { UniversalContext } from "../../../../contexts/UniversalHelpers";
import { AuthContext } from "../../../../contexts/AuthProvider";
import { api } from "../../../../utils/api";
import { toTitleCase } from "../../../../utils/tools";
import { v4 as uuidv4 } from "uuid";
import type {  Speaker } from "../../../../types/index.types";

const { TextArea } = Input;
const { Title, Text } = Typography;

export const voices = [
  { label: "Achernar", name: "en-US-Chirp3-HD-Achernar", gender: "FEMALE" },
  { label: "Achird", name: "en-US-Chirp3-HD-Achird", gender: "MALE" },
  { label: "Algenib", name: "en-US-Chirp3-HD-Algenib", gender: "MALE" },
  { label: "Algieba", name: "en-US-Chirp3-HD-Algieba", gender: "MALE" },
  { label: "Alnilam", name: "en-US-Chirp3-HD-Alnilam", gender: "MALE" },
  { label: "Aoede", name: "en-US-Chirp3-HD-Aoede", gender: "FEMALE" },
  { label: "Autonoe", name: "en-US-Chirp3-HD-Autonoe", gender: "FEMALE" },
  { label: "Callirrhoe", name: "en-US-Chirp3-HD-Callirrhoe", gender: "FEMALE" },
  { label: "Charon", name: "en-US-Chirp3-HD-Charon", gender: "MALE" },
  { label: "Despina", name: "en-US-Chirp3-HD-Despina", gender: "FEMALE" },
  { label: "Enceladus", name: "en-US-Chirp3-HD-Enceladus", gender: "MALE" },
  { label: "Erinome", name: "en-US-Chirp3-HD-Erinome", gender: "FEMALE" },
  { label: "Fenrir", name: "en-US-Chirp3-HD-Fenrir", gender: "MALE" },
  { label: "Gacrux", name: "en-US-Chirp3-HD-Gacrux", gender: "FEMALE" },
  { label: "Iapetus", name: "en-US-Chirp3-HD-Iapetus", gender: "MALE" },
  { label: "Kore", name: "en-US-Chirp3-HD-Kore", gender: "FEMALE" },
  { label: "Laomedeia", name: "en-US-Chirp3-HD-Laomedeia", gender: "FEMALE" },
  { label: "Leda", name: "en-US-Chirp3-HD-Leda", gender: "FEMALE" },
  { label: "Orus", name: "en-US-Chirp3-HD-Orus", gender: "MALE" },
  { label: "Puck", name: "en-US-Chirp3-HD-Puck", gender: "MALE" },
  { label: "Pulcherrima", name: "en-US-Chirp3-HD-Pulcherrima", gender: "FEMALE" },
  { label: "Rasalgethi", name: "en-US-Chirp3-HD-Rasalgethi", gender: "MALE" },
  { label: "Sadachbia", name: "en-US-Chirp3-HD-Sadachbia", gender: "MALE" },
  { label: "Sadaltager", name: "en-US-Chirp3-HD-Sadaltager", gender: "MALE" },
  { label: "Schedar", name: "en-US-Chirp3-HD-Schedar", gender: "MALE" },
  { label: "Sulafat", name: "en-US-Chirp3-HD-Sulafat", gender: "FEMALE" },
  { label: "Umbriel", name: "en-US-Chirp3-HD-Umbriel", gender: "MALE" },
  { label: "Vindemiatrix", name: "en-US-Chirp3-HD-Vindemiatrix", gender: "FEMALE" },
  { label: "Zephyr", name: "en-US-Chirp3-HD-Zephyr", gender: "FEMALE" },
  { label: "Zubenelgenubi", name: "en-US-Chirp3-HD-Zubenelgenubi", gender: "MALE" },
];

export default function SituationSetterCard() {
  const [form] = Form.useForm();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [customType, setCustomType] = useState("");
  const [showPage, setShowPage] = useState(1);
  const [speakers, setSpeakers] = useState<Speaker[]>([{
    id: uuidv4(), name: "Caller", voice: undefined
  }, {
    id: uuidv4(), name: "Officer", voice: undefined
  }]);
  const [errors, setErrors] = useState<Record<string, { name?: boolean; voice?: boolean }>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { preferences, setPreferences } = useContext(UniversalContext);

const scenarioTypes = useMemo(() => {
  const types = preferences?.scenario_types ?? [];
  const filtered = types.filter((t) => t !== "+ Custom Type");
  return [...filtered, "+ Custom Type"];
}, [preferences]);

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const SEASONS = ["Spring", "Summer", "Fall", "Winter"];



  const generateAutoDescription = (time: Dayjs | null, day?: string, season?: string) => {
    if (!time || !day || !season) return "";
    const hour = time.hour();
    const partOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    return `It is a ${day} ${partOfDay} during the ${season.toLowerCase()}.`;
  };

  const addSpeaker = () => {
    setSpeakers([...speakers, { id: uuidv4(), name: "", voice: undefined }]);
  };

  const removeSpeaker = (id: string) => {
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleNameChange = (id: string, name: string) => {
    setSpeakers((prev) => prev.map((s) => s.id === id ? { ...s, name } : s));
  };

  const handleVoiceChange = (id: string, voice: string) => {
    setSpeakers((prev) => prev.map((s) => s.id === id ? { ...s, voice } : s));
  };

  const handlePlay = (id: string) => {
    const speaker = speakers.find((s) => s.id === id);
    if (!speaker?.voice) return messageApi.warning("No voice selected for this speaker");
    if (!token) return messageApi.error("Missing token to access audio files");

    const audio = new Audio(`http://localhost:5000/data/audio/${speaker.voice}.mp3?token=${token}`);
    if (audioRef.current) audioRef.current.pause();
    audioRef.current = audio;
    audio.play();
    setPlayingId(id);
    audio.onended = () => setPlayingId(null);
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
  };

  const validateSpeakers = () => {
    let valid = true;
    const newErrors: typeof errors = {};
    for (const s of speakers) {
      if (!s.name.trim()) {
        newErrors[s.id] = { ...newErrors[s.id], name: true };
        messageApi.error(`Speaker ${s.name || s.id} name is required.`);
        valid = false;
      }
      if (!s.voice) {
        newErrors[s.id] = { ...newErrors[s.id], voice: true };
        messageApi.error(`Speaker ${s.name || s.id} voice is required.`);
        valid = false;
      }
    }
    setErrors(newErrors);
    return valid;
  };

  const handleNext = () => {
    form.validateFields()
      .then(() => {
        setShowPage(2);
      })
      .catch(() => {
        messageApi.error("Please fill in all required fields.");
      });
  }


  const handleAudioNext = () => validateSpeakers() && finishSituationSetup();
  const exitMakeScenario = () => navigate("/scenario-manager", { replace: true });



const finishSituationSetup = async () => {
  try {
    const time: Dayjs | null = form.getFieldValue("time");


    const scenarioDetails = {
      id: uuidv4(),
      name: form.getFieldValue("scenarioName"),
      description: form.getFieldValue("situation"),
      difficulty: form.getFieldValue("difficulty"),
      type: form.getFieldValue("type"),
      audience: form.getFieldValue("audience"),
      timing: {
        time: time ? time.toISOString() : null,
        day: form.getFieldValue("day"),
        season: form.getFieldValue("season"),
      },
      speakers: speakers,
      scenes: [
        {
          id: uuidv4(),
          speaker: "",
          sceneDescription: "",
          options: [],
          correctOption: null,
          tip: "",
          highlights: [],
        },
      ],
      status: "draft",
    };

    navigate("/scenario-manager/edit-scenario", {
      state: { scenarioDetails },
      replace: true,
    });
  } catch (err) {
    console.error("❌ Error finishing scenario setup:", err);
    messageApi.error("Failed to initialize scenario. Check console.");
  }
};


 const handleCustomTypeSave = async () => {
  const trimmed = toTitleCase(customType).trim();
  if (!trimmed || trimmed === "Custom") return;

  if (scenarioTypes.includes(trimmed)) {
    form.setFieldsValue({ type: trimmed });
    setSelectedScenario(trimmed);
    setCustomType("");
    return;
  }

  const updated = [...(preferences?.scenario_types || []), trimmed];

  try {
    await api.patch("/preferences/scenario_types", { value: updated });
    setPreferences({ ...preferences, scenario_types: updated });
    form.setFieldsValue({ type: trimmed });
    setSelectedScenario(trimmed);
    setCustomType("");
    messageApi.success("Custom scenario type saved successfully.");
  } catch (err) {
    messageApi.error("Could not save custom type.");
  }
};




  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 720,
          borderRadius: 10,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
          background: "#fff",
        }}
        bodyStyle={{ padding: 32 }}
      >

        {/** Situation Setter */}
        {showPage === 1 && (<div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", flexDirection: "column" }}>

          <div style={{ marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0 }}>
              Situation Setter
            </Title>
            <Text type="secondary">Set the situation for the scenario.</Text>
          </div>



          <Form layout="vertical" form={form} requiredMark={false}
            onValuesChange={(__, allValues) => {
              const { time, day, season } = allValues;

              if (time && day && season) {
                const autoDesc = generateAutoDescription(time, day, season);

                // ✅ Only set the description if it's currently empty
                const current = form.getFieldValue("situation");
                if (!current) {
                  form.setFieldsValue({ situation: autoDesc });
                }
              }
            }}
          >
            {/* Scenario Name */}
            <Form.Item
              label="Scenario Name"
              name="scenarioName"
              rules={[{ required: true, message: "Please enter a scenario name" }]}
            >
              <Input placeholder="Enter scenario name" />
            </Form.Item>

            {/* Scenario Type */}
            <Form.Item
              label="Scenario Type"
              name="type"
              rules={[{ required: true, message: "Please select a scenario type" }]}
            >
              <Select
                placeholder="Select a scenario type"
                onChange={(val) => {
                  setSelectedScenario(val);
                  if (val !== "+ Custom Type") setCustomType("");
                }}
              >
                {scenarioTypes.map((type) => (
                  <Select.Option key={type} value={type}>
                    {type}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* Custom Type Field */}
            {selectedScenario === "+ Custom Type" && (
              <Form.Item label="Custom Type" required>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Enter custom scenario type"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCustomTypeSave();
                      }
                    }}

                  />
                  <Button type="primary" onClick={handleCustomTypeSave}>Save</Button>
                </Space.Compact>
              </Form.Item>
            )}

            {/* Difficulty & Audience */}
            <Space
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 0,
              }}
            >
              <Form.Item
                label="Difficulty"
                name="difficulty"
                style={{ flex: 1 }}
                rules={[{ required: true }]}
              >
                <Select placeholder="Select difficulty">
                  <Select.Option value="Easy">Easy</Select.Option>
                  <Select.Option value="Medium">Medium</Select.Option>
                  <Select.Option value="Hard">Hard</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Audience"
                name="audience"
                style={{ flex: 1 }}
                rules={[{ required: true }]}
              >
                <Select placeholder="Select audience">
                  <Select.Option value="All">All</Select.Option>
                  <Select.Option value="Dispatchers">Dispatchers</Select.Option>
                  <Select.Option value="Trainees">Trainees</Select.Option>
                </Select>
              </Form.Item>
            </Space>

            {/* Time, Day, Season */}
            <Space style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <Form.Item
                label="Time"
                name="time"
                style={{ flex: 1 }}
                rules={[{ required: true }]}
              >
                <TimePicker use12Hours format="h:mm A" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Day"
                name="day"
                style={{ width: 160 }}
                rules={[{ required: true }]}
              >
                <Select placeholder="Day">
                  {DAYS.map((d) => (
                    <Select.Option key={d} value={d}>
                      {d}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Season"
                name="season"
                style={{ width: 160 }}
                rules={[{ required: true }]}
              >
                <Select placeholder="Season">
                  {SEASONS.map((s) => (
                    <Select.Option key={s} value={s}>
                      {s}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>

            {/* Situation Description */}
            <Form.Item
              label="Situation Description"
              name="situation"
              rules={[{ required: true }]}
            >
              <TextArea rows={4} placeholder="Describe the situation..." />
            </Form.Item>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <Button className="border-btn" onClick={exitMakeScenario}>Cancel</Button>
              <Button type="primary" onClick={handleNext} className="regular-btn">
                Next
              </Button>
            </div>
          </Form>


        </div>
        )}


        {/** Audio Profiles */}

        {showPage === 2 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Audio Profiles
              </Title>
              <Text type="secondary">
                Assign voices to each character in this scenario.
              </Text>
            </div>


            {/* Table Header */}
            <div
              style={{
                display: "flex",
                background: "var(--color-bg-muted)",
                borderRadius: 10,
                paddingLeft: 12,
                paddingTop: 12,
                gap: 12,
                boxShadow: "var(--shadow)",
                justifyContent: "space-between",
              }}
            >
              <Typography style={{ flex: 1, fontWeight: "bold" }}>Name</Typography>
              <Typography style={{ flex: 2, fontWeight: "bold" }}>Voice</Typography>
            </div>

            {/* Speaker Rows */}
            {speakers.map((speaker, index) => {
              const error = errors[speaker.id] || {};
              return (
                <div
                  key={speaker.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    background: "var(--color-bg-muted)",
                    padding: "0px 12px 12px 12px",
                    borderRadius: 10,
                    boxShadow: "var(--shadow)",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Name */}
                  <Input
                    style={{ flex: 1 }}
                    placeholder="Speaker Name"
                    value={speaker.name}
                    onChange={(e) => handleNameChange(speaker.id, e.target.value)}
                    status={error.name ? "error" : ""}
                  />

                  {/* Voice */}
                  <Select
                    style={{ flex: 2 }}
                    placeholder="Select a voice"
                    value={speaker.voice}
                    onChange={(val) => handleVoiceChange(speaker.id, val)}
                    status={error.voice ? "error" : ""}
                  >
                    {voices.map((opt) => (
                      <Select.Option key={opt.name} value={opt.name}>
                        {opt.label} - {opt.gender}
                      </Select.Option>
                    ))}
                  </Select>

                  {/* Play Button */}
                  <Button
                    disabled={!speaker.voice}
                    type="default"
                    size="middle"
                    className="!p-0 !h-auto !bg-transparent hover:!bg-transparent shadow-none !border-none"
                    icon={
                      playingId === speaker.id ? (
                        <PauseCircleFilled style={{ fontSize: 24 }} />
                      ) : (
                        <PlayCircleFilled style={{ fontSize: 24 }} />
                      )
                    }
                    onClick={() =>
                      playingId === speaker.id ? handlePause() : handlePlay(speaker.id)
                    }
                  />

                  {/* Remove Speaker */}
                  {index > 1 && (
                    <Button
                      shape="circle"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeSpeaker(speaker.id)}
                    />
                  )}
                </div>
              );
            })}

            {/* Add Speaker */}
            <Button
              icon={<PlusOutlined />}
              className="dashed-btn"
              onClick={addSpeaker}
              block
              style={{ marginTop: 20 }}
            >
              Add New Speaker
            </Button>

            {/* Navigation Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 20,
              }}
            >
              <Button
                className="border-btn"
                icon={<ArrowLeftOutlined />}
                onClick={() => setShowPage(1)}
              >
                Back
              </Button>
              <Button
                type="primary"
                className="regular-btn"
                onClick={handleAudioNext} // ✅ now validates speakers before next
              >
                Next
              </Button>
            </div>
          </div>
        )}


      </Card>
      {contextHolder}
    </div>
  );
}
