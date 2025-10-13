// components/TextAreaQuestion.tsx
import { Input } from "antd";
import { useEffect, useState } from "react";

const { TextArea } = Input;

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function TextAreaQuestion({ value, onChange }: Props) {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <TextArea
      value={localValue}
      onChange={handleChange}
      rows={4}
      maxLength={1000}
      placeholder="Type your answer here..."
      style={{
        borderRadius: 10,
        fontSize: 16,
        padding: 12,
        fontFamily: "Inter, sans-serif",
      }}
      autoSize={{ minRows: 4, maxRows: 8 }}
    />
  );
}
