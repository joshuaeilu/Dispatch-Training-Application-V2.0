// components/MultipleChoiceQuestion.tsx
import { Card, Typography, Space, Checkbox, Radio, Alert } from "antd";
import type { Option } from "../../../../types/index.types";

const { Text } = Typography;

type Props = {
  options: Option[];
  selected: string[] | string;
  setSelected: (value: string[] | string) => void;
  allowMultiple: boolean;
};

export default function MultipleChoiceQuestion({
  options,
  selected,
  setSelected,
  allowMultiple,
}: Props) {
  const handleSelect = (value: string) => {
    if (allowMultiple) {
      const selectedArray = Array.isArray(selected) ? selected : [];
      if (selectedArray.includes(value)) {
        setSelected(selectedArray.filter((v) => v !== value));
      } else {
        setSelected([...selectedArray, value]);
      }
    } else {
      setSelected(value);
    }
  };

  const isSelected = (value: string) => {
    if (allowMultiple) return Array.isArray(selected) && selected.includes(value);
    return selected === value;
  };

  return (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      {allowMultiple && (
        <Alert
          message="This question has multiple correct answers. Select all that apply."
          type="info"
          showIcon
          style={{ marginBottom: 16, marginTop: -8 }}
        />
      )}

      {options.map((option) => (
        <Card
          key={option.id}
          onClick={() => handleSelect(option.text)}
          style={{
            border: isSelected(option.text) ? "1px solid #8C2131" : "1px solid #D9D9D9",
            borderRadius: 10,
            cursor: "pointer",
            background: isSelected(option.text) ? "#FDF7F8" : "#fff",
            transition: "all 0.2s ease-in-out",
          }}
          bodyStyle={{ display: "flex", alignItems: "center", gap: 8, padding: 12 }}
        >
          {allowMultiple ? (
            <Checkbox checked={isSelected(option.text)} />
          ) : (
            <Radio checked={isSelected(option.text)} />
          )}
          <Text style={{ fontSize: 15 }}>{option.text}</Text>
        </Card>
      ))}
    </Space>
  );
}
