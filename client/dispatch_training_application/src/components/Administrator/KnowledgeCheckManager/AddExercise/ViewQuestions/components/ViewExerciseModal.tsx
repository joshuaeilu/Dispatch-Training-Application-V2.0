import { Card, Checkbox, Input, Modal, Radio, Tag, Typography } from "antd";
import type { Exercise } from "../../../../../../types/index.types";
import { useEffect, useContext } from "react";
import { RESOURCE_URL } from "../../../../../../data/data";
import { AuthContext } from "../../../../../../contexts/AuthProvider";
import { CheckCircleFilled, InfoCircleOutlined } from "@ant-design/icons";

export default function ViewExerciseModal({ 
    exercise, 
    setViewExerciseModal, 
    viewExerciseModal 
}: { 
    exercise: Exercise | null, 
    setViewExerciseModal: React.Dispatch<React.SetStateAction<boolean>>, 
    viewExerciseModal: boolean 
}) {
    const { token } = useContext(AuthContext);

    useEffect(() => {
        exercise?.questions.forEach((question) => {
            console.log(question.resource);
        });
    }, [exercise?.questions]);

    return (
        <Modal
            title={
                <span style={{ 
                    color: 'var(--color-primary)', 
                    fontSize: '20px', 
                    fontWeight: 600,
                    letterSpacing: '-0.2px'
                }}>
                    {exercise?.name || "View Exercise"}
                </span>
            }
            style={{ top: 20 }}
            open={viewExerciseModal}
            onCancel={() => setViewExerciseModal(false)}
            width={850}
            footer={null}
            styles={{
                body: { padding: '16px 8px' }
            }}
        >
            <div style={{
                overflowY: 'auto',
                maxHeight: '80vh',
                padding: '0 16px',
            }}>
                {exercise?.questions.map((question, index) => (
                    <Card
                        key={question.id}
                        style={{
                            marginBottom: '20px',
                            borderRadius: '12px',
                            border: '1px solid #e8e8e8',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                        styles={{
                            header: {
                                borderBottom: '1px solid #f0f0f0',
                                padding: '12px 20px',
                                background: 'linear-gradient(to bottom, #fafafa, #ffffff)'
                            },
                            body: { padding: '20px' }
                        }}
                        title={
                            <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-3">
                                    <span style={{ 
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        color: '#262626'
                                    }}>
                                        Question {index + 1}
                                    </span>
                                    {question.answerType && (
                                        <Tag 
                                            color="purple" 
                                            style={{
                                                borderRadius: '12px',
                                                padding: '2px 12px',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                border: 'none'
                                            }}
                                        >
                                            {question.answerType}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        }
                    >
                        {/* Resource Section */}
                        {question.resource && (
                            <div className="flex flex-wrap w-full mb-5">
                                <Typography.Text 
                                    className="font-semibold text-gray-600 w-full sm:w-1/6 mb-2"
                                    style={{ 
                                        fontSize: '13px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    Resource
                                </Typography.Text>
                                <div className="w-full sm:w-5/6">
                                    <div 
                                        className="mb-3" 
                                        style={{ 
                                            fontWeight: 500,
                                            color: '#262626',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {question.resource.name}
                                    </div>
                                    <div style={{
                                        backgroundColor: '#fafafa',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #f0f0f0'
                                    }}>
                                        {(() => {
                                            const secureUrl = `${RESOURCE_URL + question.resource.url}?token=${token}`;
                                            const mime = question.resource.mimeType;

                                            if (mime.startsWith("video/")) {
                                                return (
                                                    <video
                                                        controls
                                                        width="100%"
                                                        style={{ 
                                                            borderRadius: '6px',
                                                            backgroundColor: '#000'
                                                        }}
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
                                                        style={{ width: '100%' }}
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
                                                        style={{ 
                                                            width: '100%', 
                                                            borderRadius: '6px',
                                                            border: '1px solid #e8e8e8'
                                                        }}
                                                    />
                                                );
                                            }

                                            if (mime === "application/pdf") {
                                                return (
                                                    <iframe
                                                        src={secureUrl}
                                                        width="100%"
                                                        height="400px"
                                                        style={{ 
                                                            border: '1px solid #e8e8e8', 
                                                            borderRadius: '6px'
                                                        }}
                                                    />
                                                );
                                            }

                                            return (
                                                <a 
                                                    href={secureUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: 'var(--color-primary)',
                                                        textDecoration: 'none',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    Download Resource →
                                                </a>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Question Text */}
                        <div className="flex flex-wrap w-full items-start mb-5">
                            <Typography.Text 
                                className="font-semibold text-gray-600 w-full sm:w-1/6 mb-2"
                                style={{ 
                                    fontSize: '13px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                Question
                            </Typography.Text>
                            <Typography.Paragraph 
                                className="w-full sm:w-5/6 break-words"
                                style={{
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    color: '#262626',
                                    marginBottom: 0
                                }}
                            >
                                {question.question || (
                                    <span className="text-gray-400 italic">
                                        No question text provided
                                    </span>
                                )}
                            </Typography.Paragraph>
                        </div>

                        {/* Correct Answer */}
                        <div className="flex flex-wrap w-full mb-4">
                           <Typography.Text 
                                className="font-semibold text-gray-600 w-full sm:w-1/6 mb-2"
                                style={{ 
                                    fontSize: '13px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                Correct Answer
                            </Typography.Text>

                            {/* Multiple Choice View */}
                            {question.answerType === 'multiple-choice' && (() => {
                                const isMultiCorrect = question.correctOptions.length > 1;

                                return (
                                    <div className="w-full sm:w-5/6" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {question.options.length === 0 ? (
                                            <Typography.Text 
                                                className="text-sm"
                                                style={{ 
                                                    color: '#8c8c8c',
                                                    fontStyle: 'italic'
                                                }}
                                            >
                                                Please fill in options for this question
                                            </Typography.Text>
                                        ) : (
                                            question.options.map((option, idx) => {
                                                const isCorrect = question.correctOptions.includes(option.text);
                                                const letter = String.fromCharCode(65 + idx);

                                                return (
                                                    <div
                                                        key={option.id}
                                                        style={{
                                                            padding: '12px 16px',
                                                            borderRadius: '8px',
                                                            border: isCorrect ? '2px solid #52c41a' : '1px solid #e8e8e8',
                                                            backgroundColor: isCorrect ? '#f6ffed' : '#fff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {isMultiCorrect ? (
                                                            <Checkbox
                                                                checked={isCorrect}
                                                                disabled
                                                                style={{ pointerEvents: 'none' }}
                                                            />
                                                        ) : (
                                                            <Radio
                                                                checked={isCorrect}
                                                                disabled
                                                                style={{ pointerEvents: 'none' }}
                                                            />
                                                        )}
                                                        <span style={{ 
                                                            fontWeight: isCorrect ? 500 : 400,
                                                            color: isCorrect ? '#262626' : '#595959',
                                                            fontSize: '14px',
                                                            flex: 1
                                                        }}>
                                                            <span style={{ fontWeight: 600, marginRight: '8px' }}>
                                                                {letter}.
                                                            </span>
                                                            {option.text}
                                                        </span>
                                                        {isCorrect && (
                                                            <CheckCircleFilled style={{ 
                                                                color: '#52c41a', 
                                                                fontSize: '16px'
                                                            }} />
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Text Area Response View */}
                            {question.answerType === 'text-area' && (
                                <div className="w-full sm:w-5/6">
                                    <Input.TextArea
                                        value={question.correctAnswer}
                                        placeholder="This is the correct answer"
                                        autoSize={{ minRows: 3 }}
                                        disabled
                                        style={{
                                            backgroundColor: '#f6ffed',
                                            border: '2px solid #52c41a',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            color: '#262626',
                                            cursor: 'default'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Tip Section */}
                        {question.tip && (
                            <div style={{
                                marginTop: '16px',
                                padding: '12px 16px',
                                backgroundColor: '#e6f7ff',
                                borderLeft: '4px solid #1890ff',
                                borderRadius: '8px'
                            }}>
                                <div style={{ 
                                    fontWeight: 600, 
                                    color: '#096dd9',
                                    marginBottom: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '13px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    <InfoCircleOutlined />
                                    Tip
                                </div>
                                <Typography.Text style={{ 
                                    fontSize: '13px', 
                                    color: '#0050b3',
                                    lineHeight: '1.5'
                                }}>
                                    {question.tip}
                                </Typography.Text>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </Modal>
    );
}