import type { Exercise } from "../../../../../../types/index.types";
import {
  Card,
  Typography,
  Tag,
  Dropdown,
  Button,
  Checkbox,
  Radio,
  Input,
  Empty,
} from "antd";
import {
  MoreOutlined,
} from "@ant-design/icons";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { toTitleCase } from "../../../../../../utils/tools";

const { Text, Title } = Typography;

interface ListQuestionsProps {
  exercise: Exercise;
  setExercise: (exercise: Exercise) => void;
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [moved] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, moved);
  return result;
}

export default function ListQuestions({
  exercise,
  setExercise,
  selectedIndex,
  setSelectedIndex,
}: ListQuestionsProps) {
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const updated = reorder(exercise.questions, source.index, destination.index);
    setExercise({ ...exercise, questions: updated });
    setSelectedIndex(destination.index);
  };



  const deleteQuestionAt = (index: number) => {
    const updated = [...exercise.questions];
    updated.splice(index, 1);
    setExercise({ ...exercise, questions: updated });
    setSelectedIndex(Math.max(0, index - 1));
  };

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      {exercise.questions.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "100%",
            justifyContent: "center",
            textAlign: "center",
            color: "#8c8c8c",
          }}
        >
          <Empty description={false} />
          <Title level={3} style={{ margin: 0, color: "#262626" }}>
            No questions yet
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Questions you add will appear here for review and reordering
          </Text>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="questions-droppable">
            {(dropProvided) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
              >
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
                          margin: "1rem 1.5rem",
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
                                    {toTitleCase(question.answerType)}
                                  </Tag>
                                )}
                              </div>
                              <Dropdown
                                trigger={["click"]}
                                menu={{
                                  onClick: (e) => {
                                    e.domEvent.stopPropagation();
                                    if (e.key === "delete") {
                                      deleteQuestionAt(index);
                                    }
                                  },
                                  items: [
                                    {
                                      key: "delete",
                                      label: (
                                        <span className="text-red-500">
                                          Delete
                                        </span>
                                      ),
                                    },
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
                              <Text className="font-medium text-gray-500 w-full sm:w-1/6">
                                Resource:
                              </Text>
                              <Typography.Paragraph className="w-full sm:w-5/6 break-words">
                                {question.resource.name}
                              </Typography.Paragraph>
                            </div>
                          )}

                          <div className="flex flex-wrap w-full">
                            <Text className="font-medium text-gray-500 w-full sm:w-1/6 mb-1">
                              Question:
                            </Text>
                            <Typography.Paragraph className="w-full sm:w-5/6 break-words">
                              {question.question || (
                                <span className="text-gray-400 italic">
                                  No question text provided
                                </span>
                              )}
                            </Typography.Paragraph>
                          </div>

                          <div className="flex flex-wrap w-full mb-4">
                            <Text className="font-medium text-gray-500 w-full sm:w-1/6 mb-1">
                              Correct Answer:
                            </Text>
                            <div className="w-full sm:w-5/6">
                              {question.answerType === "multiple-choice" ? (
                                <div className="bg-[#f5f5f5] space-y-2 rounded-lg px-4 py-2">
                                  {question.options.length === 0 ? (
                                    <Text className="text-sm text-gray-500">
                                      Please fill in options for this question
                                    </Text>
                                  ) : (
                                    question.options.map((option, idx) => {
                                      const isCorrect = question.correctOptions.includes(option.text);
                                      const isMulti = question.correctOptions.length > 1;
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
                                              : "bg-[#ffffff] border-[#d9d9d9]"
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
                              <Text className="text-xs text-blue-700">
                                {question.tip}
                              </Text>
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
    </div>
  );
}
