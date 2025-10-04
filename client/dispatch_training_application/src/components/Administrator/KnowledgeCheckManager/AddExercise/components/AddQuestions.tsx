import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tabs,
  Typography,
  message,
} from "antd";
import {
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { Exercise, Question } from "../../../../../types/index.types";
import { useContext, useEffect, useState } from "react";
import OptionsEditor from "./EditQuestionOptions";
import { UniversalContext } from "../../../../../contexts/UniversalHelpers";
import { api } from "../../../../../utils/api";
import type { AddQuestionsSectionsProps } from "../../../../../types/index.types";
import { SelectedResourceCard } from "./SelectedResourceCard";
import { v4 as uuid } from "uuid";

const { TextArea } = Input;

export default function AddQuestionsSections({
  selectedIndex,
  setSelectedIndex,
  exercise,
  setExercise,
}: AddQuestionsSectionsProps) {
  const [showTip, setShowTip] = useState(false);
  const [canAddQuestion, setCanAddQuestion] = useState(false);
  const { preferences, setPreferences } = useContext(UniversalContext);
  const [customInputVisible, setCustomInputVisible] = useState(false);
  const [customType, setCustomType] = useState("");
  const [activeTab, setActiveTab] = useState("2");
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const currentQuestion = exercise.questions[selectedIndex];

const exerciseTypes = [
  ...(preferences?.exercise_types ?? [])
    .filter((type) => type !== "Mixed")
    .map((type) => ({
      value: type,
      label: type,
    })),
  { value: "Custom", label: "Custom" },
];


  useEffect(() => {
    if (currentQuestion.answerType === "text-area") {
      setCanAddQuestion(true);
    } else {
      const typeIsMC = currentQuestion.answerType === "multiple-choice";
      const hasCorrect =
        currentQuestion.options.length > 0 &&
        currentQuestion.options.some((o) => o.isCorrect);

      setCanAddQuestion(typeIsMC && hasCorrect);
    }
  }, [exercise.questions, selectedIndex]);

  async function handleCustomTypeSave(source: "exercise" | "question") {
    const newType = customType.trim();
    if (!newType) return messageApi.warning("Please enter a valid type");

    const current = preferences?.exercise_types ?? [];
    if (current.includes(newType)) {
      messageApi.warning("Exercise type already exists");
      return;
    }

    const updated = [...current, newType];
    try {
      const { data } = await api.patch(`/preferences/exercise_types`, { value: updated });
      if (data) {
        messageApi.success("Custom type saved");
        setPreferences({ ...preferences, exercise_types: updated });

        if (source === "exercise") {
          setExercise({ ...exercise, type: newType });
        } else {
          setExercise({
            ...exercise,
            questions: exercise.questions.map((q, i) =>
              i === selectedIndex ? { ...q, questionCategory: newType } : q
            ),
          });
        }

        setCustomType("");
        setCustomInputVisible(false);
      }
    } catch (err: any) {
      messageApi.error(`Error saving type: ${err?.message || String(err)}`);
    }
  }

  function handleAddQuestion() {
    const newQuestion: Question = {
      id: uuid(),
      question: "",
      resource: undefined,
      questionCategory: "",
      correctAnswer: "",
      answerType: "text-area",
      options: [],
      correctOptions: [],
      tip: "",
    };

    setExercise({
      ...exercise,
      questions: [...exercise.questions, newQuestion],
    });

    form.resetFields();
    setSelectedIndex(exercise.questions.length);
  }

  useEffect(() => {
    form.resetFields();
    setShowTip(false);
  }, [selectedIndex]);

  useEffect(() => {
    form.setFieldsValue({ ...currentQuestion });
  }, [exercise.questions, selectedIndex]);

  function handleClearCurrent() {
    setExercise({
      ...exercise,
      questions: exercise.questions.map((q, index) =>
        index === selectedIndex
          ? {
              id: q.id,
              question: "",
              resource: undefined,
              questionCategory: "",
              correctAnswer: "",
              answerType: "text-area",
              options: [],
              correctOptions: [],
              tip: "",
            }
          : q
      ),
    });
    form.resetFields();
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Tabs
        type="card"
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        tabBarStyle={{ marginBottom: 0 }}
        style={{ flexShrink: 0 }}
        items={[
          { label: "Exercise Details", key: "1", children: null },
          { label: "Exercise Editor", key: "2", children: null },
        ]}
      />

      {/* === Exercise Details Tab === */}
      {activeTab === "1" && (
        <Card style={{ flex: 1, display: "flex", flexDirection: "column" }} bodyStyle={{ flex: 1, overflow: "auto" }}>
          <Typography.Text>Exercise Name</Typography.Text>
          <Input
            placeholder="Enter exercise name"
            value={exercise.name}
            onChange={(e) => setExercise({ ...exercise, name: e.target.value })}
            style={{ margin: "8px 0 16px" }}
          />

          <Typography.Text>Exercise Type</Typography.Text>
          <Select
            placeholder="Select an exercise type"
            value={exercise.type}
            style={{ width: "100%", marginBottom: 16 }}
            onChange={(val) => {
              setExercise({ ...exercise, type: val });
              setCustomInputVisible(val === "Custom");
              if (val !== "Custom") setCustomType("");
            }}
            options={exerciseTypes}
          />

          {customInputVisible && (
            <Form.Item label="Custom Exercise Type" required>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="Enter custom type..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCustomTypeSave("exercise");
                    }
                  }}
                />
                <Button type="primary" onClick={() => handleCustomTypeSave("exercise")}>
                  Save
                </Button>
              </Space.Compact>
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Typography.Text>Difficulty</Typography.Text>
              <Select
                placeholder="Select difficulty"
                value={exercise.difficulty}
                style={{ width: "100%", marginTop: 8 }}
                onChange={(value) => setExercise({ ...exercise, difficulty: value })}
              >
                {["Easy", "Medium", "Hard"].map((level) => (
                  <Select.Option key={level} value={level}>
                    {level}
                  </Select.Option>
                ))}
              </Select>
            </Col>

            <Col span={12}>
              <Typography.Text>Audience</Typography.Text>
              <Select
                placeholder="Select audience"
                value={exercise.audience}
                style={{ width: "100%", marginTop: 8 }}
                onChange={(value) => setExercise({ ...exercise, audience: value })}
              >
                {["All", "Dispatchers", "Trainees"].map((aud) => (
                  <Select.Option key={aud} value={aud}>
                    {aud}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>
      )}

      {/* === Exercise Editor Tab === */}
      {activeTab === "2" && (
        <Card style={{ flex: 1, display: "flex", flexDirection: "column" }} bodyStyle={{ flex: 1, overflow: "auto" }}>
          <Form layout="vertical" form={form} onFinish={handleAddQuestion} className="flex flex-col flex-grow">
            <h2 style={{ color: "var(--color-primary)", textAlign: "center" }}>
              Question: {selectedIndex + 1}
            </h2>

            {currentQuestion.resource && (
              <Form.Item label="Selected Resource">
                <SelectedResourceCard
                  resource={currentQuestion.resource}
                  onRemove={() => {
                    setExercise({
                      ...exercise,
                      questions: exercise.questions.map((q, index) =>
                        index === selectedIndex ? { ...q, resource: undefined } : q
                      ),
                    });
                  }}
                />
              </Form.Item>
            )}

            {exercise.type === "Mixed" && (
              <Form.Item label="Question Category" name="questionCategory" rules={[{ required: true }]}>
                <Select
                  placeholder="Select Category"
                  value={currentQuestion.questionCategory}
                  onChange={(value) => {
                    if (value === "Custom") {
                      setCustomInputVisible(true);
                    } else {
                      setCustomInputVisible(false);
                      setExercise({
                        ...exercise,
                        questions: exercise.questions.map((q, index) =>
                          index === selectedIndex ? { ...q, questionCategory: value } : q
                        ),
                      });
                    }
                  }}
                  options={[
                    ...(preferences?.exercise_types ?? [])
                      .filter((type) => type !== "Mixed")
                      .map((type) => ({ value: type, label: type })),
                    { value: "Custom", label: "Custom" },
                  ]}
                />
              </Form.Item>
            )}

            {customInputVisible && (
              <div className="flex gap-4 mb-2">
                <Input
                  placeholder="Enter new custom category"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  onPressEnter={() => handleCustomTypeSave("question")}
                />
                <Button type="primary" onClick={() => handleCustomTypeSave("question")}>
                  Save
                </Button>
              </div>
            )}

            <Form.Item
              label="Question Text"
              name="question"
              rules={[{ required: true, message: "Please enter a question" }]}
            >
              <TextArea
                rows={3}
                placeholder="Enter the question here"
                onChange={(e) =>
                  setExercise({
                    ...exercise,
                    questions: exercise.questions.map((q, index) =>
                      index === selectedIndex ? { ...q, question: e.target.value } : q
                    ),
                  })
                }
              />
            </Form.Item>

            <Form.Item label="Question Type" name="answerType" initialValue={currentQuestion.answerType}>
              <Select
                placeholder="Select type"
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

            <Form.Item noStyle shouldUpdate={(prev, curr) => prev.answerType !== curr.answerType}>
              {({ getFieldValue }) =>
                getFieldValue("answerType") === "multiple-choice" ? (
                  <OptionsEditor
                    options={currentQuestion.options}
                    setOptions={(options) =>
                      setExercise({
                        ...exercise,
                        questions: exercise.questions.map((q, index) =>
                          index === selectedIndex ? { ...q, options } : q
                        ),
                      })
                    }
                  />
                ) : (
                  <Form.Item
                    label="Correct Response"
                    name="correctAnswer"
                    rules={[{ required: true }]}
                  >
                    <TextArea
                      rows={4}
                        placeholder="Enter the correct answer here"
                      onChange={(e) =>
                        setExercise({
                          ...exercise,
                          questions: exercise.questions.map((q, index) =>
                            index === selectedIndex ? { ...q, correctAnswer: e.target.value } : q
                          ),
                        })
                      }
                    />
                  </Form.Item>
                )
              }
            </Form.Item>

            <div className="my-4">
              <Button
                icon={<InfoCircleOutlined />}
                onClick={() => {
                  setShowTip(!showTip);
                  if (!showTip) {
                    setExercise({
                      ...exercise,
                      questions: exercise.questions.map((q, index) =>
                        index === selectedIndex ? { ...q, tip: "" } : q
                      ),
                    });
                  }
                }}
                className="dashed-btn"
              >
                {showTip ? "Remove Tip" : "Add a Tip?"}
              </Button>

              {showTip && (
                <div className="my-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tip Text
                  </label>
                  <TextArea
                    rows={2}
                    value={currentQuestion.tip}
                    onChange={(e) =>
                      setExercise({
                        ...exercise,
                        questions: exercise.questions.map((q, index) =>
                          index === selectedIndex ? { ...q, tip: e.target.value } : q
                        ),
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div className="mt-auto flex justify-between">
              <Button icon={<ReloadOutlined />} className="border-btn" onClick={handleClearCurrent}>
                Clear Current
              </Button>
              <Button
                type="primary"
                className="regular-btn"
                icon={<PlusOutlined />}
                htmlType="submit"
                disabled={!canAddQuestion}
              >
                Add Question
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {contextHolder}
    </div>
  );
}
