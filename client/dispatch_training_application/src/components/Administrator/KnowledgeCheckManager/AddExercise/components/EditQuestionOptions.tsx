// types (keep your server/persisted shape clean)
import type { Option } from "../../../../../types/index.types";

type OptionsEditorProps = {
  options: Option[];
  setOptions: (opts: Option[]) => void;
};

import { useEffect, useState } from "react";
import { Button, Input, Space, Tag, Tooltip } from "antd";
import { CheckCircleOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

export default function OptionsEditor({ options, setOptions }: OptionsEditorProps) {
  const [newOptionText, setNewOptionText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  

  // If the option being edited gets removed externally, exit edit mode gracefully
  useEffect(() => {
    if (editingId && !options.some(o => o.id === editingId)) {
      setEditingId(null);
      setEditingText("");
    }
  }, [options, editingId]);

  const addOption = () => {
  const text = newOptionText.trim();
  if (!text) return;
  setOptions([
    ...options,
    { id: nextId, text, isCorrect: false }
  ]);
  setNextId(nextId + 1); // increment for next use
  setNewOptionText("");
};


const removeOption = (id: number) => {
  setOptions(options.filter(opt => opt.id !== id));
  if (editingId === id) {
    setEditingId(null);
    setEditingText("");
  }
};


  const toggleCorrect = (id: number) => {
    setOptions(options.map(opt =>
      opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt
    ));
  };

  const startEditOption = (id: number) => {
    const opt = options.find(o => o.id === id);
    if (!opt) return;
    setEditingId(id);
    setEditingText(opt.text);
  };

  const saveEditOption = () => {
    if (!editingId) return;
    const text = editingText.trim();
    if (!text) return;
    setOptions(options.map(opt =>
      opt.id === editingId ? { ...opt, text } : opt
    ));
    setEditingId(null);
    setEditingText("");
  };

  const cancelEditOption = () => {
    setEditingId(null);
    setEditingText("");
  };

  const correctCount = options.filter(o => o.isCorrect).length;

  const [nextId, setNextId] = useState(() =>
  options.length > 0 ? Math.max(...options.map((o) => o.id)) + 1 : 1
);


  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>

      {/* Add New Option */}
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Type answer option..."
          value={newOptionText}
          onChange={(e) => setNewOptionText(e.target.value)}
          onPressEnter={(e) => {
            e.preventDefault();
            addOption();
          }}
        />
        <Button
          type="primary"
          className="regular-btn"
          icon={<PlusOutlined />}
          onClick={addOption}
          disabled={!newOptionText.trim()}
        >
          Add
        </Button>
      </div>

      {/* Options List */}
      <div className="space-y-2 " style={{ maxHeight: 240, overflowY: 'auto' }}>
        {options.map((option, index) => {
          const isEditing = editingId === option.id;
         return (
  <div
    key={option.id}
    className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg bg-[var(--color-bg-alt)] shadow-sm"
  >
    {/* Option letter */}
    <span className="font-semibold text-[var(--color-muted)] ">
      {String.fromCharCode(65 + index).toLowerCase()}.
    </span>

    {isEditing ? (
      <>
        <Input
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onPressEnter={saveEditOption}
          className="flex-1"
          autoFocus
          style={{
            backgroundColor: "var(--color-bg)",
            borderRadius: 6,
            borderColor: "var(--color-border)",
          }}
        />
        <Space size="small">
          <Tooltip title="Save changes">
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={saveEditOption}
              style={{ backgroundColor: "var(--color-primary)" }}
            />
          </Tooltip>
          <Tooltip title="Cancel editing">
            <Button
              type="default"
              size="small"
              icon={<CloseOutlined />}
              onClick={cancelEditOption}
              style={{ color: "var(--color-error)" }}
            />
          </Tooltip>
        </Space>
      </>
    ) : (
      <>
        <span className="flex-1 text-[var(--color-text)]">{option.text}</span>
        <Space size="small">
          <Tooltip title={option.isCorrect ? "Unmark correct" : "Mark correct"}>
            {option.isCorrect ? (
                <Tag
                  className="cursor-pointer"
                  color="green"
                  onClick={() => toggleCorrect(option.id)}
                >
                  Correct
                </Tag>
              ) : (
                <Tooltip title="Mark correct">
                  <Button
                    type="link"
                    icon={<CheckCircleOutlined />}
                    onClick={() => toggleCorrect(option.id)}
                  />
                </Tooltip>
              )}
</Tooltip>


          <Tooltip title="Edit option">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => startEditOption(option.id)}
            />
          </Tooltip>

          <Tooltip title="Delete option">
            <Button
              type="text"
              variant="filled"
              color="red"
              icon={<DeleteOutlined />}
              onClick={() => removeOption(option.id)}
            />
          </Tooltip>
        </Space>
      </>
    )}
  </div>
);

        })}
      </div>

      {options.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {correctCount === 0
            ? "⚠ Please mark at least one option as correct"
            : `✓ ${correctCount} correct ${correctCount === 1 ? "answer" : "answers"} marked`}
        </div>
      )}
    </div>
  );
}
