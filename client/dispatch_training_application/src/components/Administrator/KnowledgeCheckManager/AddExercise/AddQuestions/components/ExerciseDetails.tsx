import { Typography, Input, Select, Form, Space, Button, Row, Col } from "antd";
import type { Exercise } from "../../../../../../types/index.types";
import { getPreferences } from "../../../../../../contexts/UniversalHelpers";
import { useState } from "react";
import { api } from "../../../../../../utils/api";
import { toast } from "react-hot-toast";

interface ExerciseDetailsProps {
    exercise: Exercise;
    setExercise: (exercise: Exercise) => void;
}



export default function ExerciseDetails({ exercise, setExercise }: ExerciseDetailsProps) {
    const [customInputVisible, setCustomInputVisible] = useState(false);
    const [customType, setCustomType] = useState("");
    const { preferences, setPreferences } = getPreferences();

      const exerciseTypes = [
    ...(preferences?.exercise_types ?? [])
      .map((type) => ({ value: type, label: type })),
    { value: "Custom", label: "Custom" },
  ];

    async function handleCustomTypeSave(source: "exercise" | "question") {
      const newType = customType.trim();
      if (!newType) return toast.error("Please enter a valid type");
  
      const current = preferences?.exercise_types ?? [];
      if (current.includes(newType)) {
        toast.error("Exercise type already exists");
        return;
      }
  
      const updated = [...current, newType];
      try {
        const { data } = await api.patch(`/preferences/exercise_types`, { value: updated });
        if (data) {
          toast.success("Custom type saved");
          setPreferences({ ...preferences, exercise_types: updated });
        setExercise({ ...exercise, type: newType });

          setCustomType("");
          setCustomInputVisible(false);
        }
      } catch (err: any) {
        toast.error(`Error saving type: ${err?.message || String(err)}`);
      }
    }
    return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        flex: 1,
        margin: "1rem 1.5rem",
      }}
    >
      {/* Name */}
      <div>
        <Typography.Text style={{ fontSize: 14 }}>Exercise Name</Typography.Text>
        <Input
          placeholder="Enter exercise name"
          value={exercise.name}
          size="middle"
          onChange={(e) =>
            setExercise({ ...exercise, name: e.target.value })
          }
          style={{ marginTop: 8 }}
        />
      </div>

      {/* Type */}
      <div>
        <Typography.Text style={{ fontSize: 14 }}>Exercise Type</Typography.Text>
        <Select
          placeholder="Select an exercise type"
          value={exercise.type}
          size="middle"
          onChange={(val) => {
            setExercise({ ...exercise, type: val });
            setCustomInputVisible(val === "Custom");
            if (val !== "Custom") setCustomType("");
          }}
          options={exerciseTypes}
          style={{ width: "100%", marginTop: 8 }}
        />
      </div>

      {/* Custom Type Input */}
      {customInputVisible && (
        <Form.Item label="Custom Exercise Type" required style={{ margin: 0 }}>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              size="middle"
              placeholder="Enter custom type..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCustomTypeSave("exercise");
                }
              }}
            />
            <Button
              type="primary"
              onClick={() => handleCustomTypeSave("exercise")}
              size="middle"
              style={{
                backgroundColor: "#8C2131",
                borderColor: "#8C2131",
              }}
            >
              Save
            </Button>
          </Space.Compact>
        </Form.Item>
      )}

      {/* Row: Difficulty + Audience */}
      <Row gutter={16}>
        <Col span={12}>
          <Typography.Text style={{ fontSize: 14 }}>Difficulty</Typography.Text>
          <Select
            placeholder="Select difficulty"
            value={exercise.difficulty}
            onChange={(value) =>
              setExercise({ ...exercise, difficulty: value })
            }
            style={{ width: "100%", marginTop: 8 }}
            size="middle"
          >
            {["Easy", "Medium", "Hard"].map((level) => (
              <Select.Option key={level} value={level}>
                {level}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col span={12}>
          <Typography.Text style={{ fontSize: 14 }}>Audience</Typography.Text>
          <Select
            placeholder="Select audience"
            value={exercise.audience}
            onChange={(value) =>
              setExercise({ ...exercise, audience: value })
            }
            style={{ width: "100%", marginTop: 8 }}
            size="middle"
          >
            {["All", "Dispatchers", "Trainees"].map((aud) => (
              <Select.Option key={aud} value={aud}>
                {aud}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
}
