// types (keep your server/persisted shape clean)
import type { Exercise, Option } from "../../../../../../types/index.types";

interface OptionsEditorProps {
  exercise: Exercise;
  setExercise: (exercise: Exercise) => void;
  selectedIndex: number;
}

import { useEffect, useState } from "react";
import { Button, Input, Space, Tag, Tooltip } from "antd";
import { CheckCircleOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

export default function OptionsEditor({ exercise, setExercise, selectedIndex }: OptionsEditorProps) {
  const [newOptionText, setNewOptionText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const currentQuestion = exercise.questions[selectedIndex];

  useEffect(() => {
    console.log(currentQuestion);
  }, [currentQuestion]);
  


  // If the option being edited gets removed externally, exit edit mode gracefully
  useEffect(() => {
    if (editingId !== null) {
      if (!currentQuestion.options.some(o => o.id === editingId)) {
        setEditingId(null);
        setEditingText("");
      }
    }
  }, [exercise.questions, editingId, selectedIndex]);

  // Add a new option
const addOption = () => {
  const text = newOptionText.trim();
  if (!text) return;
  const newOption: Option = { id: nextId, text };
  const updatedQuestions = exercise.questions.map((q, index) =>
    index === selectedIndex ? { ...q, options: [...q.options, newOption] } : q
  );
  setExercise({ ...exercise, questions: updatedQuestions });
  setNextId(nextId + 1); // increment for next use
  setNewOptionText("");
};

// Remove an option by id
const removeOption = (id: number) => {
  const updatedQuestions = exercise.questions.map((q, index) =>
    index === selectedIndex ? { ...q, options: q.options.filter(opt => opt.id !== id) } : q
  );
  setExercise({ ...exercise, questions: updatedQuestions });
};


  // Toggle an option as correct/incorrect
  const toggleCorrect = (text: string) => {
    const isAlreadyCorrect = currentQuestion.correctOptions.includes(text);
    const updatedCorrectOptions = isAlreadyCorrect
      ? currentQuestion.correctOptions.filter(co => co !== text)
      : [...currentQuestion.correctOptions, text];
    const updatedQuestions = exercise.questions.map((q, index) =>
      index === selectedIndex ? { ...q, correctOptions: updatedCorrectOptions } : q
    );
    setExercise({ ...exercise, questions: updatedQuestions });
  };


  // Start editing an option
  const startEditOption = (id: number) => {
    const opt = currentQuestion.options.find(o => o.id === id);
    if (!opt) return;
    setEditingId(id);
    setEditingText(opt.text);
  }

  // Save edited option text
  const saveEditOption = () => {
    if (editingId === null) return;
    const text = editingText.trim();
    if (!text) return;
    const updatedQuestions = exercise.questions.map((q, index) =>
      index === selectedIndex
        ? {
            ...q,
            options: q.options.map((opt) =>
              opt.id === editingId ? { ...opt, text } : opt
            ),
          }
        : q
    );
    setExercise({ ...exercise, questions: updatedQuestions });
    setEditingId(null);
    setEditingText("");
  };

  // Cancel editing mode
  const cancelEditOption = () => {
    setEditingId(null);
    setEditingText("");
  };

  const options = currentQuestion.options;
  const correctCount = currentQuestion.correctOptions.length;

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
    className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg  shadow-sm"
  >
    {/* Option letter */}
    <span className="font-semibold  ">
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
            borderRadius: 6,
          }}
        />
        <Space size="small">
          <Tooltip title="Save changes">
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={saveEditOption}
              style={{ backgroundColor: "#8C2131"}}
            />
          </Tooltip>
          <Tooltip title="Cancel editing">
            <Button
              type="default"
              size="small"
              icon={<CloseOutlined />}
              onClick={cancelEditOption}
              style={{ color: "#8C2131" }}
            />
          </Tooltip>
        </Space>
      </>
    ) : (
      <>
        <span className="flex-1 text-[var(--color-text)]">{option.text}</span>
        <Space size="small">
          <Tooltip title={currentQuestion.correctOptions.includes(option.text) ? "Unmark correct" : "Mark correct"}>
            {currentQuestion.correctOptions.includes(option.text) ? (
                <Tag
                  className="cursor-pointer"
                  color="green"
                  onClick={() => toggleCorrect(option.text)}
                >
                  Correct
                </Tag>
              ) : (
                <Tooltip title="Mark correct">
                  <Button
                    type="link"
                    icon={<CheckCircleOutlined />}
                    onClick={() => toggleCorrect(option.text)}
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
   <div
  className={`mt-2 text-xs ${
    correctCount === 0 ? "text-red-500" : "text-green-600"
  }`}
>
  {correctCount === 0
    ? "⚠ Please mark at least one option as correct"
    : `✓ ${correctCount} correct ${correctCount === 1 ? "answer" : "answers"} marked`}
</div>

      )}
    </div>
  );
}
