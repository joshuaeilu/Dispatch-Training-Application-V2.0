import { Card, Checkbox, Input, Modal, Radio, Tag, Typography } from "antd";
import type { Exercise } from "../../../../../../types/index.types";
import { useEffect, useState, useContext } from "react";
import { RESOURCE_URL } from "../../../../../../data/data";
import { AuthContext } from "../../../../../../contexts/AuthProvider";

export default function ViewExerciseModal({ exercise, setViewExerciseModal, viewExerciseModal }: { exercise: Exercise | null, setViewExerciseModal: React.Dispatch<React.SetStateAction<boolean>>, viewExerciseModal: boolean }) {
    const { token } = useContext(AuthContext);

    useEffect(() => {
        exercise?.questions.forEach((question) => {
            console.log(question.resource);
        });
    }, [exercise?.questions]);

    return (
        <Modal
            title={
                <span style={{ color: 'var(--color-primary)', fontSize: '18px', margin: '0 0 0 12px', fontWeight: 600 }}>
                    View Exercise
                </span>
            }
            style={{ top: 30 }}
            open={viewExerciseModal}
            onCancel={() => setViewExerciseModal(false)}
            
          
            width={800}
            footer={null}
        >
            <div style={{
                overflowY: 'auto',
                maxHeight: '80vh',
            }}>
                {exercise?.questions.map((question, index) => (
                    <Card
                        key={question.id}
                        type="inner"
                        style={{
                            margin: '2px 12px 14px 12px',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease',
                        }}
                        title={
                            <div className="flex justify-between items-center w-full bg-gray-50 p-2 ">
                                {/* Left side */}
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold ">Question {index + 1}</span>
                                    {question.answerType && (
                                        <Tag color="purple" className="rounded-full px-2 py-0.5 text-xs">
                                            {question.answerType}
                                        </Tag>
                                    )}
                                </div>


                            </div>
                        }
                        size="small"
                        className={` transition-all duration-200 cursor-pointer rounded-lg border-gray-200 bg-white`}>


                        {question.resource && (
                            <div className="flex flex-wrap w-full">
                                <Typography.Text className="font-medium text-gray-500 w-full sm:w-1/6 mb-1">
                                    Resource:
                                </Typography.Text>
                                <Typography.Paragraph className=" w-full sm:w-5/6 break-words">
                                    <div className=" mb-2">{question.resource.name}</div>
                                    {(() => {
                                        const secureUrl = `${RESOURCE_URL + question.resource.url}?token=${token}`;
                                        const mime = question.resource.mimeType;

                                        if (mime.startsWith("video/")) {
                                            return (
                                                <video
                                                    controls
                                                    width="100%"
                                                    style={{ borderRadius: '8px' }}
                                                    preload="metadata"
                                                    src={secureUrl}
                                                >
                                                    Your browser does not support the video tag.
                                                </video>
                                            );
                                        }

                                        if (mime.startsWith("audio/")) {
                                            return (
                                                <audio
                                                    controls
                                                    style={{ width: '100%', borderRadius: '8px' }}
                                                    preload="metadata"
                                                    src={secureUrl}
                                                >
                                                    Your browser does not support the audio element.
                                                </audio>
                                            );
                                        }

                                        if (mime.startsWith("image/")) {
                                            return (
                                                <img
                                                    src={secureUrl}
                                                    alt={question.resource.name}
                                                    style={{ width: '100%', borderRadius: '8px' }}
                                                />
                                            );
                                        }

                                        if (mime === "application/pdf") {
                                            return (
                                                <iframe
                                                    src={secureUrl}
                                                    width="100%"
                                                    height="400px"
                                                    style={{ border: '1px solid #ccc', borderRadius: '8px' }}
                                                />
                                            );
                                        }

                                        return (
                                            <a href={secureUrl} target="_blank" rel="noopener noreferrer">
                                                Download Resource
                                            </a>
                                        );
                                    })()}
                                </Typography.Paragraph>
                            </div>
                        )}
                        <div className="flex flex-wrap w-full  items-start">
                            <Typography.Text className="font-medium text-gray-500 w-full sm:w-1/6 mb-1">
                                Question:
                            </Typography.Text>
                            <Typography.Paragraph className=" w-full sm:w-5/6 break-words">
                                {question.question || <span className="text-gray-400 italic">No question text provided</span>}
                            </Typography.Paragraph>
                        </div>



                        <div className="flex flex-wrap w-full mb-4">
                            {/* Label */}
                            <Typography.Text className="font-medium text-gray-500 w-full sm:w-1/6 mb-1">
                                Correct Answer:
                            </Typography.Text>

                            {/* 🧠 Multiple Choice View */}
                            {question.answerType === 'multiple-choice' && (() => {
                                const isMultiCorrect = question.correctOptions.length > 1;

                                return (
                                    <div className="w-full sm:w-5/6 bg-[var(--color-bg-muted)] space-y-2 rounded-lg px-4 py-2">
                                        {
                                            question.options.length === 0 ? (
                                                <Typography.Text className="text-sm text-gray-500 ">Please fill in options for this question</Typography.Text>
                                            ) : (
                                                question.options.map((option, idx) => {
                                                    const isCorrect = question.correctOptions.includes(option.id.toString());
                                                    const letter = String.fromCharCode(65 + idx).toLowerCase();

                                                    const label = (
                                                        <div className="flex gap-2 items-start">
                                                            <span className="font-semibold">{letter}.</span>
                                                            <span>{option.text}</span>
                                                        </div>
                                                    );

                                                    const commonStyle = isCorrect
                                                        ? {
                                                            '--ant-primary-color': '#52c41a',
                                                            '--ant-primary-color-active': '#389e0d',
                                                            '--ant-primary-color-hover': '#73d13d',
                                                        } as React.CSSProperties
                                                        : {};

                                                    return (
                                                        <div
                                                            key={option.id}
                                                            className={`flex items-start px-3 py-2 rounded-md border transition-all ${isCorrect
                                                                ? 'bg-green-50 border-green-500'
                                                                : 'bg-[var(--color-bg)] border-[var(--color-border)]'
                                                                }`}
                                                        >
                                                            {isMultiCorrect ? (
                                                                <Checkbox
                                                                    checked={isCorrect}
                                                                    disabled
                                                                    style={commonStyle}
                                                                >
                                                                    <span style={{ color: isCorrect ? 'black' : 'gray' }}>{label}</span>
                                                                </Checkbox>
                                                            ) : (
                                                                <Radio
                                                                    checked={isCorrect}
                                                                    disabled
                                                                    style={commonStyle}
                                                                >
                                                                    <span style={{ color: isCorrect ? 'black' : 'gray' }}>{label}</span>
                                                                </Radio>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )
                                        }
                                    </div>
                                );
                            })()}

                            {/* ✍️ Text Area Response View */}
                            {question.answerType === 'text-area' && (
                                <div className="w-full sm:w-5/6">
                                    <Input.TextArea
                                        value={question.correctAnswer}
                                        placeholder="This is the correct answer that users will see at the end"
                                        autoSize={{ minRows: 2 }}
                                        className="bg-green-50 border-green-500"
                                        style={{
                                            pointerEvents: 'none', // disables hover & interaction
                                            backgroundColor: 'oklch(98.2% 0.018 155.826)', // keeps it light and clean
                                            boxShadow: 'none', // removes hover/focus box-shadow
                                            borderColor: '#52c41a',

                                        }}
                                    />
                                </div>
                            )}</div>


                        {question.tip && (
                            <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                                <div className=" font-medium text-blue-800 mb-1">Tip:</div>
                                {question.tip && (
                                    <Typography.Text className="text-xs text-blue-700 mb-2">{question.tip}</Typography.Text>
                                )}

                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </Modal>
    );
}
