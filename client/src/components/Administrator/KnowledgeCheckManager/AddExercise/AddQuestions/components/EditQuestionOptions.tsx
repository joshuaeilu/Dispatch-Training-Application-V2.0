import { useEffect,  useRef, useState } from "react";
import { Button, Input, Space, Tag, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { Exercise, Option } from "../../../../../../types/index.types";

interface OptionsEditorProps {
  exercise: Exercise;
  setExercise:  React.Dispatch<React.SetStateAction<Exercise | null>>; // ✅ safer React guideline
  selectedIndex: number;
}

function updateQuestion(
  exercise: Exercise,
  selectedIndex: number,
  updater: (q: Exercise["questions"][number]) => Exercise["questions"][number]
): Exercise {
  const questions = exercise.questions.map((q, i) => (i === selectedIndex ? updater(q) : q));
  return { ...exercise, questions };
}

function dedupeStrings(arr: string[]) {
  return Array.from(new Set(arr));
}

export default function OptionsEditor({ exercise, setExercise, selectedIndex }: OptionsEditorProps) {
  const currentQuestion = exercise.questions[selectedIndex];

  const [newOptionText, setNewOptionText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // ✅ stable id generator per-question
  const nextIdRef = useRef<number>(1);

  // Reset id counter whenever you change questions (or options replaced from server)
  useEffect(() => {
    const maxId = currentQuestion.options.reduce((m, o) => Math.max(m, o.id), 0);
    nextIdRef.current = maxId + 1;

    // exit edit mode if switching questions
    setEditingId(null);
    setEditingText("");
  }, [selectedIndex, currentQuestion.options]);

  // If the option being edited gets removed externally, exit edit mode gracefully
  useEffect(() => {
    if (editingId === null) return;
    const exists = currentQuestion.options.some((o) => o.id === editingId);
    if (!exists) {
      setEditingId(null);
      setEditingText("");
    }
  }, [editingId, currentQuestion.options]);

  const options = currentQuestion.options;
  const correctCount = currentQuestion.correctOptions.length;

  const addOption = () => {
    const text = newOptionText.trim();
    if (!text) return;

    // Optional safety: prevent duplicates by text
    const alreadyExists = currentQuestion.options.some(
      (o) => o.text.trim().toLowerCase() === text.toLowerCase()
    );
    if (alreadyExists) return;

    const newOption: Option = { id: nextIdRef.current++, text };

    setExercise((prev) =>
      updateQuestion(prev!, selectedIndex, (q) => ({
        ...q,
        options: [...q.options, newOption],
      }))
    );

    setNewOptionText("");
  };

  const removeOption = (id: number) => {
    setExercise((prev) =>
      updateQuestion(prev!, selectedIndex, (q) => {
        const removed = q.options.find((o) => o.id === id);
        const filteredOptions = q.options.filter((o) => o.id !== id);

        // ✅ keep correctOptions consistent (because it's stored by text)
        const filteredCorrect = removed
          ? q.correctOptions.filter((t) => t !== removed.text)
          : q.correctOptions;

        return {
          ...q,
          options: filteredOptions,
          correctOptions: filteredCorrect,
        };
      })
    );

    // if you deleted the one you're editing
    if (editingId === id) {
      setEditingId(null);
      setEditingText("");
    }
  };

  const toggleCorrect = (optionText: string) => {
    setExercise((prev) =>
      updateQuestion(prev!, selectedIndex, (q) => {
        const isCorrect = q.correctOptions.includes(optionText);
        const next = isCorrect
          ? q.correctOptions.filter((t) => t !== optionText)
          : dedupeStrings([...q.correctOptions, optionText]);

        return { ...q, correctOptions: next };
      })
    );
  };

  const startEditOption = (id: number) => {
    const opt = currentQuestion.options.find((o) => o.id === id);
    if (!opt) return;
    setEditingId(id);
    setEditingText(opt.text);
  };

  const cancelEditOption = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEditOption = () => {
    if (editingId === null) return;

    const newText = editingText.trim();
    if (!newText) return;

    // Optional safety: prevent duplicates by text (excluding self)
    const duplicate = currentQuestion.options.some(
      (o) =>
        o.id !== editingId && o.text.trim().toLowerCase() === newText.toLowerCase()
    );
    if (duplicate) return;

    setExercise((prev) =>
      updateQuestion(prev!, selectedIndex, (q) => {
        const oldOpt = q.options.find((o) => o.id === editingId);
        if (!oldOpt) return q;

        const oldText = oldOpt.text;

        const updatedOptions = q.options.map((o) =>
          o.id === editingId ? { ...o, text: newText } : o
        );

        // ✅ KEY FIX:
        // if this option was marked correct by old text, replace it with new text
        const updatedCorrect = q.correctOptions.includes(oldText)
          ? dedupeStrings(q.correctOptions.map((t) => (t === oldText ? newText : t)))
          : q.correctOptions;

        return {
          ...q,
          options: updatedOptions,
          correctOptions: updatedCorrect,
        };
      })
    );

    setEditingId(null);
    setEditingText("");
  };

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
      <div className="space-y-2" style={{ maxHeight: 240, overflowY: "auto" }}>
        {options.map((option, index) => {
          const isEditing = editingId === option.id;
          const isCorrect = currentQuestion.correctOptions.includes(option.text);

          return (
            <div
              key={option.id}
              className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg shadow-sm"
            >
              <span className="font-semibold">
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
                    style={{ borderRadius: 6 }}
                  />
                  <Space size="small">
                    <Tooltip title="Save changes">
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={saveEditOption}
                        style={{ backgroundColor: "#8C2131" }}
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
                    {isCorrect ? (
                      <Tooltip title="Unmark correct">
                        <Tag
                          className="cursor-pointer"
                          color="green"
                          onClick={() => toggleCorrect(option.text)}
                        >
                          Correct
                        </Tag>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Mark correct">
                        <Button
                          type="link"
                          icon={<CheckCircleOutlined />}
                          onClick={() => toggleCorrect(option.text)}
                        />
                      </Tooltip>
                    )}

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
        <div className={`mt-2 text-xs ${correctCount === 0 ? "text-red-500" : "text-green-600"}`}>
          {correctCount === 0
            ? "⚠ Please mark at least one option as correct"
            : `✓ ${correctCount} correct ${correctCount === 1 ? "answer" : "answers"} marked`}
        </div>
      )}
    </div>
  );
}
