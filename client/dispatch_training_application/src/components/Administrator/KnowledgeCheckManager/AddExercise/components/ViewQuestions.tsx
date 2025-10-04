import {
  Card,
  Tabs,
  Button,
  Typography,
  Tag,
  Input,
  Checkbox,
  Radio,
  Dropdown,
} from "antd";
import { EyeOutlined, MoreOutlined } from "@ant-design/icons";
import ViewResourcesPage from "./ViewResources";
import type { Exercise, Question } from "../../../../../types/index.types";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

interface ViewQuestionsProps {
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  exercise: Exercise;
  setExercise: (exercise: Exercise) => void;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [moved] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, moved);
  return result;
}

export default function ViewQuestions({
  selectedIndex,
  setSelectedIndex,
  exercise,
  setExercise,
}: ViewQuestionsProps) {
  const [activeTab, setActiveTab] = useState("1");

  const insertQuestionAt = (position: number) => {
    const newQuestion: Question = {
      id: uuidv4(),
      question: "",
      resource: undefined,
      questionCategory: "",
      answerType: "text-area",
      options: [],
      correctOptions: [],
      tip: "",
    };

    const updatedQuestions = [...exercise.questions];
    updatedQuestions.splice(position, 0, newQuestion);

    setExercise({ ...exercise, questions: updatedQuestions });
    setSelectedIndex(position);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const updated = reorder(exercise.questions, source.index, destination.index);
    setExercise({ ...exercise, questions: updated });
    setSelectedIndex(destination.index);
  };

  const reviewTab = (
    <Card
      style={{ flex: 1, display: "flex", flexDirection: "column" }}
      bodyStyle={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {exercise.questions.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <EyeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <p>No questions added yet</p>
          <p className="text-sm">Questions will appear here as you add them</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="questions-droppable">
            {(dropProvided) => (
              <div ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
                {exercise.questions.map((question, index) => (
                  <Draggable
                    key={question.id}
                    draggableId={question.id}
                    index={index}
                  >
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        style={{
                          ...dragProvided.draggableProps.style,
                          margin: "12px",
                          borderRadius: 12,
                          boxShadow: dragSnapshot.isDragging
                            ? "0 6px 16px rgba(0,0,0,0.12)"
                            : "none",
                        }}
                        onClick={() => setSelectedIndex(index)}
                      >
                        <Card
                          type="inner"
                          size="small"
                          className={`cursor-pointer transition-all ${
                            index === selectedIndex
                              ? "question-card-selected"
                              : "border border-gray-200 bg-white hover:shadow-md hover:scale-[1.01] rounded-lg"
                          }`}
                          title={
                            <div className="flex justify-between items-center p-2">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold">
                                  Question {index + 1}
                                </span>
                                {question.answerType && (
                                  <Tag
                                    color="purple"
                                    className="rounded-full px-2 py-0.5 text-xs"
                                  >
                                    {question.answerType}
                                  </Tag>
                                )}
                              </div>
                              <Dropdown
                                trigger={["click"]}
                                menu={{
                                  onClick: (e) => {
                                    e.domEvent.stopPropagation();
                                    if (e.key === "insert-before")
                                      insertQuestionAt(index);
                                    else if (e.key === "insert-after")
                                      insertQuestionAt(index + 1);
                                    else if (e.key === "delete") {
                                      const newQuestions =
                                        exercise.questions.filter(
                                          (q) => q.id !== question.id
                                        );
                                      setExercise({
                                        ...exercise,
                                        questions: newQuestions,
                                      });
                                      setSelectedIndex(
                                        Math.max(0, selectedIndex - 1)
                                      );
                                    }
                                  },
                                  items: [
                                    { key: "insert-before", label: "Insert Before" },
                                    { key: "insert-after", label: "Insert After" },
                                    ...(exercise.questions.length > 1
                                      ? [
                                          {
                                            key: "delete",
                                            label: (
                                              <span className="text-red-500">
                                                Delete
                                              </span>
                                            ),
                                          },
                                        ]
                                      : []),
                                  ],
                                }}
                                placement="bottomRight"
                              >
                                <Button
                                  type="text"
                                  icon={<MoreOutlined />}
                                  size="middle"
                                  onClick={(e) => e.stopPropagation()}
                                  className="rounded-md"
                                />
                              </Dropdown>
                            </div>
                          }
                        >
                          {question.resource && (
                            <div className="flex flex-wrap w-full mb-2">
                              <Typography.Text className="font-medium text-gray-500 w-full sm:w-1/6">
                                Resource:
                              </Typography.Text>
                              <Typography.Paragraph className="w-full sm:w-5/6 break-words">
                                {question.resource.name}
                              </Typography.Paragraph>
                            </div>
                          )}

                          <div className="flex flex-wrap w-full">
                            <Typography.Text className="font-medium text-gray-500 w-full sm:w-1/6 mb-1">
                              Question:
                            </Typography.Text>
                            <Typography.Paragraph className="w-full sm:w-5/6 break-words">
                              {question.question || (
                                <span className="text-gray-400 italic">
                                  No question text provided
                                </span>
                              )}
                            </Typography.Paragraph>
                          </div>

                          <div className="flex flex-wrap w-full mb-4">
                            <Typography.Text className="font-medium text-gray-500 w-full sm:w-1/6 mb-1">
                              Correct Answer:
                            </Typography.Text>
                            <div className="w-full sm:w-5/6">
                              {question.answerType === "multiple-choice" ? (
                                <div className="bg-[var(--color-bg-muted)] space-y-2 rounded-lg px-4 py-2">
                                  {question.options.length === 0 ? (
                                    <Typography.Text className="text-sm text-gray-500">
                                      Please fill in options for this question
                                    </Typography.Text>
                                  ) : (
                                    question.options.map((option, idx) => {
                                      const isCorrect = option.isCorrect;
                                      const isMulti =
                                        question.options.filter((o) => o.isCorrect)
                                          .length > 1;
                                      const letter = String.fromCharCode(
                                        65 + idx
                                      ).toLowerCase();

                                      const label = (
                                        <div className="flex gap-2 items-start">
                                          <span className="font-semibold">
                                            {letter}.
                                          </span>
                                          <span>{option.text}</span>
                                        </div>
                                      );

                                      return (
                                        <div
                                          key={option.id}
                                          className={`flex items-start px-3 py-2 rounded-md border ${
                                            isCorrect
                                              ? "bg-green-50 border-green-500"
                                              : "bg-[var(--color-bg)] border-[var(--color-border)]"
                                          }`}
                                        >
                                          {isMulti ? (
                                            <Checkbox checked={isCorrect} disabled>
                                              {label}
                                            </Checkbox>
                                          ) : (
                                            <Radio checked={isCorrect} disabled>
                                              {label}
                                            </Radio>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              ) : (
                                <Input.TextArea
                                  value={question.correctAnswer}
                                  placeholder="This is the correct answer that users will see at the end"
                                  autoSize={{ minRows: 2 }}
                                  style={{
                                    pointerEvents: "none",
                                    backgroundColor: "oklch(98.2% 0.018 155.826)",
                                    boxShadow: "none",
                                    borderColor: "#52c41a",
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          {question.tip && (
                            <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                              <div className="font-medium text-blue-800 mb-1">
                                Tip:
                              </div>
                              <Typography.Text className="text-xs text-blue-700">
                                {question.tip}
                              </Typography.Text>
                            </div>
                          )}
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Card>
  );

  return (
    <div
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      className="h-full"
    >
      <Tabs
        type="card"
        tabBarStyle={{ marginBottom: 0 }}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        style={{ flexShrink: 0 }}
        items={[
          {
            key: "1",
            label: "Review Questions",
            children: null,
          },
          {
            key: "2",
            label: "View Resources",
            children: null,
          },
        ]}
      />

      {activeTab === "1" && reviewTab}

      {activeTab === "2" && (
        <div
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <ViewResourcesPage
            selectedIndex={selectedIndex}
            exercise={exercise}
            setExercise={setExercise}
          />
        </div>
      )}
    </div>
  );
}
