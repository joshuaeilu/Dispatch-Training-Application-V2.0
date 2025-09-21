
import { Button, Form, Input, Select, Space, TimePicker, Typography, message } from 'antd';
import type { Scenario, SceneEditorProps } from '../../../../../types/index.types';
import { useContext, useMemo } from 'react';
import { UniversalContext } from '../../../../../contexts/UniversalHelpers';
import dayjs from 'dayjs';
import { useState } from 'react';
import { api } from '../../../../../utils/api';
import { toTitleCase } from '../../../../../utils/tools';

export interface ScenarioDetailsProps {
  scenario: Scenario;
  setScenario: React.Dispatch<React.SetStateAction<Scenario>>;
}
export default function ScenarioDetails({ scenario, setScenario }: ScenarioDetailsProps) {

  const [customType, setCustomType] = useState("");
  const { preferences, setPreferences } = useContext(UniversalContext);

  const scenarioTypes = useMemo(() => preferences?.scenario_types ?? [], [preferences]);
  const [messageApi, contextHolder] = message.useMessage();
  const handleCustomTypeSave = async () => {
    const trimmed = toTitleCase(customType);
    if (!trimmed) return;
    if (scenarioTypes.includes(trimmed)) {
      setScenario({ ...scenario, type: trimmed });
      setCustomType("");
      return;
    }
    const updated = [...scenarioTypes, trimmed];
    try {
      await api.patch("/preferences/scenario_types", { value: updated });
      setPreferences({ ...preferences, scenario_types: updated });
      setScenario({ ...scenario, type: trimmed });
      setCustomType("");
      messageApi.success("Custom scenario type saved successfully.");
    } catch (err) {
      messageApi.error("Could not save custom type.");
    }
  };
  return (
    <div style={{ padding: 16, backgroundColor: '#ffffff', height: '100%', overflowY: 'auto' }}>
      {/* Add your form fields and logic here */}

      {/* Scenario Name */}
      <Typography.Text >Scenario Name</Typography.Text>
      <Input placeholder="Enter scenario name" value={scenario.name} onChange={(e) => setScenario({ ...scenario, name: e.target.value })} style={{ marginTop: 8, marginBottom: 16 }} />

      {/*Scenario Type */}
      <Typography.Text >Scenario Type</Typography.Text> <br />
      <Select
        placeholder="Select a scenario type"
        value={scenario.type}
        style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
        onChange={(val) => {
          setScenario({ ...scenario, type: val });
          if (val !== "Custom") setCustomType("");
        }}
      >
        {scenarioTypes.map((type) => (
          <Select.Option key={type} value={type}>
            {type}
          </Select.Option>
        ))}
      </Select>
      <br />
      {/* Custom Type Field */}
      {scenario.type === "Custom" && (
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

      {/* Scenario Difficulty  and Audience*/}
      {/* Scenario Difficulty and Audience */}
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Typography.Text>Difficulty</Typography.Text>
          <Select
            placeholder="Select difficulty"
            style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
            value={scenario.difficulty}
            onChange={(value) => setScenario({ ...scenario, difficulty: value })}
          >
            {["Easy", "Medium", "Hard"].map((level) => (
              <Select.Option key={level} value={level}>
                {level}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div style={{ flex: 1 }}>
          <Typography.Text>Audience</Typography.Text>
          <Select
            placeholder="Select audience"
            style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
            value={scenario.audience}
            onChange={(value) => setScenario({ ...scenario, audience: value })}
          >
            {["All", "Dispatchers", "Trainees"].map((audience) => (
              <Select.Option key={audience} value={audience}>
                {audience}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
      {/* Scenario Day and Season */}
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Typography.Text>Day</Typography.Text>
          <Select
            placeholder="Select day"
            style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
            value={scenario.timing.day}
            onChange={(value) => setScenario({ ...scenario, timing: { ...scenario.timing, day: value } })}
          >
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
              <Select.Option key={day} value={day}>
                {day}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div style={{ flex: 1 }}>
          <Typography.Text>Season</Typography.Text>
          <Select
            placeholder="Select season"
            style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
            value={scenario.timing.season}
            onChange={(value) => setScenario({ ...scenario, timing: { ...scenario.timing, season: value } })}
          >
            {["Winter", "Spring", "Summer", "Fall"].map((season) => (
              <Select.Option key={season} value={season}>
                {season}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Scenario Time */}
      <Typography.Text>Time</Typography.Text>

      <TimePicker
        use12Hours
        format="h:mm A"
        value={scenario.timing.time ? dayjs(scenario.timing.time) : null} // ✅ convert back
        style={{ width: "100%", cursor: "pointer", marginTop: 8, marginBottom: 16 }}

        onChange={(value) =>
          setScenario({
            ...scenario,
            timing: { ...scenario.timing, time: value ? value.toISOString() : null }, // keep serializable
          })
        }
      />
      {/* Scenario Description */}
      <Typography.Text >Scenario Description</Typography.Text>
      <Input.TextArea rows={4} placeholder="Enter scenario description" value={scenario.description} onChange={(e) => setScenario({ ...scenario, description: e.target.value })} style={{ marginTop: 8, marginBottom: 16 }} />

      {contextHolder}
    </div>
  );
}