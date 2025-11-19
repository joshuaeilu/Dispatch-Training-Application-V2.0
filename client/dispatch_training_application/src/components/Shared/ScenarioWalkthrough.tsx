import { useState, useRef, useContext, useEffect } from "react";
import {
  Button,
  Card,
  Progress,
  Input,
  Typography,
  Space,
  Divider,
} from "antd";

import {
  PlayCircleOutlined,
  CheckCircleTwoTone,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import type { Scene } from "../../types/index.types";
import SceneCard from "./SceneCard";
import { AuthContext } from "../../contexts/AuthProvider";
import dayjs from "dayjs";
import { api } from "../../utils/api";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ScenarioTime {
  time: dayjs.Dayjs | null | string;
  day: string;
}

export default function ScenarioWalkthrough() {
  const [started, setStarted] = useState(false);
  const location = useLocation();
  const scenarioData = location.state?.scenario;

  useEffect(() => {
    console.log("Scenario Data:", scenarioData);
  }, [scenarioData]);

  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set()
  );
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [__, setScenarioTime] = useState<ScenarioTime | null>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textAreaRef = useRef<any>(null);
  const { token } = useContext(AuthContext);
  const completionRef = useRef<HTMLDivElement | null>(null);

  const progress = (answeredQuestions.size / scenarioData.scenes.length) * 100;

  const handleStart = () => setStarted(true);

  const handleCorrect = async (index: number) => {
    setAnsweredQuestions((prev) => new Set(prev).add(index));

    const nextIndex = index + 1;
    if (nextIndex < scenarioData.scenes.length) {
      const nextEl = questionRefs.current[nextIndex];
      if (nextEl) {
        nextEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    } else {
      setCompleted(true);
      try {
        await api.post("/submissions/scenario_walkthrough", {
          scenarioId: scenarioData.id,
        });
      } catch (err) {
        console.error("Failed to submit scenario completion", err);
      }

      setTimeout(() => {
        if (completionRef.current) {
          completionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300);
    }
  };

  const handleAddTimestamp = () => {
    const now = dayjs();

    const newScenarioTime: ScenarioTime = {
      time: now,
      day: now.format("dddd"),
    };
    setScenarioTime(newScenarioTime);

    const timestamp = `[${now.format("MM/DD/YYYY hh:mm A")}] `;

    if (textAreaRef.current?.resizableTextArea?.textArea) {
      const textareaEl = textAreaRef.current.resizableTextArea.textArea;
      const start = textareaEl.selectionStart;
      const end = textareaEl.selectionEnd;

      const before = notes.substring(0, start);
      const after = notes.substring(end);

      const newNotes = before + timestamp + after;
      setNotes(newNotes);

      setTimeout(() => {
        textareaEl.selectionStart = textareaEl.selectionEnd =
          start + timestamp.length;
        textareaEl.focus();
      }, 0);
    } else {
      setNotes((prev) =>
        prev + (prev.endsWith("\n") || prev === "" ? "" : "\n") + timestamp
      );
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Fixed Header */}
      <div
        style={{
          flexShrink: 0,
          backgroundColor: "#f5f5f5",
          paddingTop: "1rem",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "1600px",
            margin: "0 auto",
            padding: "0 clamp(1rem, 3vw, 2rem)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #8C2131 0%, #6B1724 100%)",
              borderRadius: "12px 12px 0 0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              padding: "1.5rem clamp(1rem, 3vw, 2rem)",
            }}
          >
            {/* Title Section */}
            <div style={{ marginBottom: "1rem" }}>
              <Title
                level={2}
                style={{
                  color: "white",
                  margin: 0,
                  marginBottom: "0.5rem",
                  fontFamily: "Urbanist, Inter, sans-serif",
                  fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {scenarioData.name}
              </Title>

              <Paragraph
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  marginBottom: 0,
                  maxWidth: "900px",
                  lineHeight: 1.6,
                }}
              >
                {scenarioData.description}
              </Paragraph>
            </div>

            {/* Progress Section */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <Text
                  strong
                  style={{
                    color: "white",
                    fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                  }}
                >
                  Progress
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                    fontWeight: 600,
                  }}
                >
                  {answeredQuestions.size} / {scenarioData.scenes.length} completed
                </Text>
              </div>
              <Progress
                percent={progress}
                showInfo={false}
                strokeColor="#B4975A"
                trailColor="rgba(255, 255, 255, 0.3)"
                strokeWidth={10}
                style={{
                  maxWidth: "600px",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
        }}
      >
        <div
          style={{
            maxWidth: "1600px",
            margin: "0 auto",
            width: "100%",
            display: "flex",
            gap: "1rem",
            padding: "0 clamp(1rem, 3vw, 2rem) 1rem",
            overflow: "hidden",
          }}
        >
          {/* Questions Section - Scrollable */}
          <div
            style={{
              flex: "1 1 65%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {!started ? (
              <Card
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: "none",
                }}
                bodyStyle={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "clamp(2rem, 5vw, 4rem)",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    maxWidth: "500px",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "2rem",
                      display: "inline-flex",
                      padding: "2rem",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #e6f7ff 0%, #d9f7be 100%)",
                    }}
                  >
                    <PlayCircleOutlined
                      style={{
                        fontSize: "clamp(3rem, 8vw, 4rem)",
                        color: "#52c41a",
                      }}
                    />
                  </div>

                  <Title
                    level={2}
                    style={{
                      fontSize: "clamp(1.5rem, 4vw, 2rem)",
                      marginBottom: "1rem",
                      color: "#1f1f1f",
                    }}
                  >
                    Ready to Begin?
                  </Title>

                  <Paragraph
                    style={{
                      fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
                      color: "#666",
                      lineHeight: 1.7,
                      marginBottom: "2rem",
                    }}
                  >
                    You'll navigate through {scenarioData.scenes.length}{" "}
                    real-world scenarios. Choose the best response for each
                    situation and take notes as you progress.
                  </Paragraph>

                  <Button
                    type="primary"
                    size="large"
                    onClick={handleStart}
                    style={{
                      height: "auto",
                      padding: "1rem 3rem",
                      fontSize: "clamp(1rem, 2vw, 1.125rem)",
                      fontWeight: 600,
                      background: "#8C2131",
                      borderColor: "#8C2131",
                      boxShadow: "0 4px 12px rgba(140, 33, 49, 0.3)",
                    }}
                  >
                    Start Walkthrough
                  </Button>
                </div>
              </Card>
            ) : (
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  paddingRight: "0.5rem",
                }}
              >
                <div style={{ paddingBottom: "2rem" }}>
                  {scenarioData.scenes.map((scene: Scene, index: number) => {
                    const isUnlocked =
                      answeredQuestions.has(index) ||
                      index === answeredQuestions.size;

                    return (
                      <div
                        key={scene.id}
                        ref={(el) => {
                          questionRefs.current[index] = el;
                        }}
                        style={{
                          marginBottom: "1.5rem",
                          transition: "all 0.3s ease",
                          opacity: isUnlocked ? 1 : 0.4,
                          pointerEvents: isUnlocked ? "auto" : "none",
                          filter: isUnlocked ? "none" : "blur(3px)",
                        }}
                      >
                        {isUnlocked ? (
                          <SceneCard
                            scenarioId={scenarioData.id}
                            scene={scene}
                            index={index}
                            onCorrect={handleCorrect}
                            audioUrl={`http://localhost:5000/data/scenario_audios/${scenarioData.id}/scene-${index}.mp3?token=${token}`}
                          />
                        ) : (
                          <Card
                            style={{
                              minHeight: "250px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#fafafa",
                              border: "2px dashed #d9d9d9",
                            }}
                          >
                            <Text
                              type="secondary"
                              style={{
                                fontSize: "clamp(0.875rem, 2vw, 1rem)",
                              }}
                            >
                              🔒 Complete the previous scene to unlock
                            </Text>
                          </Card>
                        )}
                      </div>
                    );
                  })}

                  {/* Completion Card */}
                  {completed && (
                    <div ref={completionRef}>
                      <Card
                        style={{
                          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                          border: "2px solid #52c41a",
                        }}
                        bodyStyle={{
                          padding: "clamp(2rem, 5vw, 3rem)",
                        }}
                      >
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              marginBottom: "2rem",
                              display: "inline-flex",
                              padding: "2rem",
                              borderRadius: "50%",
                              background: "#f6ffed",
                            }}
                          >
                            <CheckCircleTwoTone
                              twoToneColor="#52c41a"
                              style={{
                                fontSize: "clamp(3rem, 8vw, 4rem)",
                              }}
                            />
                          </div>

                          <Title
                            level={2}
                            style={{
                              fontSize: "clamp(1.5rem, 4vw, 2rem)",
                              marginBottom: "1rem",
                              color: "#1f1f1f",
                            }}
                          >
                            🎉 Walkthrough Complete!
                          </Title>

                          <Paragraph
                            style={{
                              fontSize: "clamp(0.875rem, 2vw, 1.125rem)",
                              color: "#666",
                              lineHeight: 1.7,
                              marginBottom: "2rem",
                              maxWidth: "500px",
                              marginLeft: "auto",
                              marginRight: "auto",
                            }}
                          >
                            Excellent work! You've successfully navigated all
                            scenarios. Review your dispatch notes or restart to
                            reinforce your learning.
                          </Paragraph>

                          <Space size="middle" wrap>
                            <Button
                              type="primary"
                              size="large"
                              onClick={() => window.history.back()}
                              style={{
                                height: "auto",
                                padding: "0.75rem 2rem",
                                fontSize: "clamp(0.875rem, 2vw, 1rem)",
                                background: "#8C2131",
                                borderColor: "#8C2131",
                              }}
                            >
                              End Walkthrough
                            </Button>
                            <Button
                              size="large"
                              onClick={() => window.location.reload()}
                              style={{
                                height: "auto",
                                padding: "0.75rem 2rem",
                                fontSize: "clamp(0.875rem, 2vw, 1rem)",
                              }}
                            >
                              Restart
                            </Button>
                          </Space>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes Section - Fixed Position on Desktop, Below on Mobile */}
          <div
            style={{
              flex: "0 0 35%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
            className="notes-section"
          >
            <Card
              title={
                <Space>
                  <span style={{ fontSize: "1.25rem" }}>📓</span>
                  <span
                    style={{
                      fontSize: "clamp(1rem, 2vw, 1.125rem)",
                      fontWeight: 600,
                    }}
                  >
                    Dispatch Notes
                  </span>
                </Space>
              }
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #e8e8e8",
              }}
              bodyStyle={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "1rem",
                overflow: "hidden",
              }}
            >
              {/* Notes Textarea */}
              <div
                style={{
                  flex: 1,
                  marginBottom: "1rem",
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#fafafa",
                }}
              >
                <TextArea
                  ref={textAreaRef}
                  placeholder="[Dispatcher] Begin logging scenario notes here...&#10;&#10;Use the timestamp button to add time markers."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#262626",
                    fontFamily: "'Courier New', monospace",
                    fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
                    lineHeight: 1.6,
                    resize: "none",
                    height: "100%",
                    padding: "1rem",
                  }}
                />
              </div>

              <Divider style={{ margin: "0.5rem 0" }} />

              {/* Controls */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <Button
                  type="primary"
                  icon={<ClockCircleOutlined />}
                  onClick={handleAddTimestamp}
                  block
                  style={{
                    height: "auto",
                    padding: "0.625rem 1rem",
                    fontSize: "clamp(0.875rem, 1.5vw, 0.9375rem)",
                    fontWeight: 500,
                    background: "#8C2131",
                    borderColor: "#8C2131",
                  }}
                >
                  Insert Timestamp
                </Button>

                <Text
                  type="secondary"
                  style={{
                    fontSize: "clamp(0.75rem, 1.5vw, 0.8125rem)",
                    textAlign: "center",
                  }}
                >
                  💡 Tip: Press Shift+Enter for a new line
                </Text>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .notes-section {
            display: none !important;
          }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #8C2131;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #6B1724;
        }
      `}</style>
    </div>
  );
}