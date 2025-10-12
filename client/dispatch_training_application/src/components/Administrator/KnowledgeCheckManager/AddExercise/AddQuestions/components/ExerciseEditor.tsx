import { Form, Typography, Button, Select } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import type { Exercise, Question } from "../../../../../../types/index.types";
import { SelectedResourceCard } from "./SelectedResourceCard";
import OptionsEditor from "./EditQuestionOptions";
import { v4 as uuid } from "uuid";
import { useEffect, useState } from "react";
interface ExerciseEditorProps {
  exercise: Exercise;
  setExercise: (exercise: Exercise) => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

export default function ExerciseEditor({
  exercise,
  setExercise,
  selectedIndex,
  setSelectedIndex,
}: ExerciseEditorProps) {
  const [form] = Form.useForm();
  const currentQuestion = exercise.questions[selectedIndex];
  const [canAddQuestion, setCanAddQuestion] = useState(false);


  // Determine if we can add a new question
  function canAdd(currentQuestion: Question): boolean {
  if (currentQuestion.answerType === "text-area") return true;
  if (currentQuestion.answerType === "multiple-choice") {
    return currentQuestion.options.length >= 2 && currentQuestion.correctOptions.length >= 1;
  }
  return false;
}



useEffect(() => {
  setCanAddQuestion(canAdd(currentQuestion));
}, [exercise.questions, selectedIndex]);

// Add empty question after the currently selected one
  const addQuestionAfterSelected = () => {
    const newQuestion: Question = {
      id: uuid(),
      question: "",
      resource: undefined,
      questionCategory: "",
      answerType: "text-area",
      options: [],
      correctOptions: [],
      tip: "",
    };

    const updated = [...exercise.questions];
    const insertAt = Math.min(selectedIndex + 1, updated.length);
    updated.splice(insertAt, 0, newQuestion);

    setExercise({ ...exercise, questions: updated });
    setSelectedIndex(insertAt);
  };


  // Add a new question
    async function handleAddQuestion() {
        await form.validateFields();
        addQuestionAfterSelected();
    form.resetFields();
    setSelectedIndex(Math.min(selectedIndex + 1, exercise.questions.length) );
  }

    // Clear current question fields
    function handleClearCurrent() {
    setExercise({
      ...exercise,
      questions: exercise.questions.map((q, index) =>
        index === selectedIndex
          ? { id: q.id, question: "", resource: undefined, questionCategory: "", correctAnswer: "", answerType: "text-area", options: [], correctOptions: [], tip: "" }
          : q
      ),
    });
    form.resetFields();
  }

    // Reset form fields when selected question changes
    useEffect(() => {
      form.resetFields();
    }, [selectedIndex]);

    // load current question into form when exercise or selectedIndex changes
  useEffect(() => {
    form.setFieldsValue({ ...currentQuestion });
  }, [exercise.questions, selectedIndex]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
      }}
    >
      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem 1.5rem",
        }}
      >
        <Form
          layout="vertical"
          form={form}
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 820,
            margin: "0 auto",
          }}
        >
          <Typography.Title
            level={4}
            style={{
              textAlign: "center",
              color: "#8C2131",
              fontWeight: 700,
              letterSpacing: 0.3,
            }}
          >
            Question {selectedIndex + 1}
          </Typography.Title>

          {/* Selected Resource */}
          {currentQuestion.resource && (
            <Form.Item label="Selected Resource">
              <SelectedResourceCard
                resource={currentQuestion.resource}
                onRemove={() => {
                  const updated = exercise.questions.map((q, index) =>
                    index === selectedIndex ? { ...q, resource: undefined } : q
                  );
                  setExercise({ ...exercise, questions: updated });
                }}
              />
            </Form.Item>
          )}

          {/* Question Text */}
          <Form.Item
            label={<span style={labelStyle}>Question Text</span>}
            name="question"
            rules={[{ required: true, message: "Please enter a question" }]}
          >
            <TextArea
              rows={4}
              placeholder="Type your question clearly here..."
              style={textareaStyle}
              onChange={(e) =>
                setExercise({
                  ...exercise,
                  questions: exercise.questions.map((q, index) =>
                    index === selectedIndex
                      ? { ...q, question: e.target.value }
                      : q
                  ),
                })
              }
            />
          </Form.Item>

          {/* Question Type */}
          <Form.Item
            label={<span style={labelStyle}>Question Type</span>}
            name="answerType"
            initialValue={currentQuestion.answerType}
          >
            <Select
              placeholder="Select type"
              size="middle"
              onChange={(value) =>
                setExercise({
                  ...exercise,
                  questions: exercise.questions.map((q, index) =>
                    index === selectedIndex ? { ...q, answerType: value } : q
                  ),
                })
              }
            >
              <Select.Option value="text-area">Text Area</Select.Option>
              <Select.Option value="multiple-choice">Multiple Choice</Select.Option>
            </Select>
          </Form.Item>

          {/* Multiple Choice or Text Answer */}
          <Form.Item
            style={{ margin: 0 }}
            shouldUpdate={(prev, curr) => prev.answerType !== curr.answerType}
          >
            {({ getFieldValue }) =>
              getFieldValue("answerType") === "multiple-choice" ? (
                <OptionsEditor
                exercise={exercise}
                setExercise={setExercise}
                selectedIndex={selectedIndex}
                />
              ) : (
                <Form.Item
                  label={<span style={labelStyle}>Correct Response</span>}
                  name="correctAnswer"
                  rules={[{ required: true, message: "Please enter the correct answer" }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Enter the correct answer here..."
                    style={textareaStyle}
                    onChange={(e) =>
                      setExercise({
                        ...exercise,
                        questions: exercise.questions.map((q, index) =>
                          index === selectedIndex
                            ? { ...q, correctAnswer: e.target.value }
                            : q
                        ),
                      })
                    }
                  />
                </Form.Item>
              )
            }
          </Form.Item>

          {/* Tip Field */}
          <Form.Item
            style={{ marginBottom: 76 }}
            label={
              <span style={labelStyle}>
                Tip <span style={{ color: "#8C8C8C" }}>(optional)</span>
              </span>
            }
            name="tip"
          >
            <TextArea
              rows={2}
              placeholder="Add a short hint or tip to guide the trainee..."
              value={currentQuestion.tip}
              onChange={(e) =>
                setExercise({
                  ...exercise,
                  questions: exercise.questions.map((q, index) =>
                    index === selectedIndex ? { ...q, tip: e.target.value } : q
                  ),
                })
              }
              style={textareaStyle}
            />
          </Form.Item>
        </Form>
      </div>

      {/* Fixed Footer Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderTop: "1px solid #F0F0F0",
          padding: "12px 24px",
          display: "flex",
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Button
          icon={<ReloadOutlined />}
          style={{
            borderColor: "#D9D9D9",
            color: "#1F1F1F",
            backgroundColor: "#FFFFFF",
          }}
            onClick={handleClearCurrent}
        >
          Clear
        </Button>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          htmlType="submit"
          disabled={!canAddQuestion}
          style={{
            backgroundColor: "#8C2131",
            borderColor: "#8C2131",
            fontWeight: 600,
          }}
            onClick={handleAddQuestion}
        >
          Add Question
        </Button>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 14,
  fontWeight: 500,
  color: "#1F1F1F",
};

const textareaStyle = {
  fontSize: 14,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #D9D9D9",
};
