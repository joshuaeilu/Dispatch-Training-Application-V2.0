import { useState, useRef, useContext, useEffect } from "react";
import {
  Button,
  Card,
  Progress,
  Input,
  Typography,
  Row,
  Col,
  Space,
} from "antd";
import { Drawer } from "antd";
import PdfViewer from "../../components/Shared/PdfViewer"; 

import {
  PlayCircleOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import type { HighlightData, Scene } from "../../types/index.types";
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
  const [pdfOpen, setPdfOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
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
      try{
        await api.post("/submissions/scenario_walkthrough", {
          scenarioId: scenarioData.id,
        })
      }catch(err){
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

  const scrollToHighlight = (h: HighlightData) => {
    console.log('Scrolling to highlight:', h);
    
    const wasOpen = pdfOpen;
    if (!wasOpen) {
      setPdfOpen(true);
    }

    const delay = wasOpen ? 300 : 1000;
    
    setTimeout(() => {
      const container = scrollContainerRef.current;
      const pageEl = pageRefs.current[h.page - 1];
      
      console.log('Container:', container);
      console.log('Page element:', pageEl);
      console.log('Highlight rects:', h.rects);
      
      if (!container || !pageEl || !h.rects?.length) {
        console.log('Missing required elements for scrolling');
        return;
      }

      const pageTop = pageEl.offsetTop;
      const r = h.rects[0];

      const highlightTop = pageTop + r.y * pageEl.offsetHeight;
      const highlightHeight = r.height * pageEl.offsetHeight;

      const targetTop = highlightTop - (container.clientHeight / 2) + (highlightHeight / 2);

      console.log('Scrolling to top:', targetTop);

      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      });
    }, delay);
  };

  return (
    <div 
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div 
        className="mx-auto w-full" 
        style={{ 
          maxWidth: "1400px",
          padding: "0 1rem",
          flex: 1,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Header */}
        <div style={{ paddingTop: "1.5rem", paddingBottom: "1rem" }}>
          <div
            className="py-4 px-4 sm:py-6 sm:px-6 text-center rounded-lg"
            style={{
              backgroundColor: "#8C2131",
              color: "white",
            }}
          >
            <Title
              level={2}
              className="!mb-2 sm:!mb-3 font-bold tracking-tight"
              style={{
                color: "white",
                fontFamily: "Urbanist, Inter, sans-serif",
                fontSize: "clamp(1.25rem, 4vw, 2rem)",
                margin: 0
              }}
            >
              {scenarioData.name}
            </Title>

            <Paragraph
              className="mx-auto max-w-2xl leading-relaxed"
              style={{
                color: "#F3F3F3",
                fontFamily: "Inter, sans-serif",
                fontSize: "clamp(0.875rem, 2vw, 1rem)",
                marginBottom: 0,
                padding: "0 0.5rem"
              }}
            >
              {scenarioData.description}
            </Paragraph>
          </div>
        </div>

        {/* Progress */}
        <div style={{ paddingBottom: "1rem" }}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <Text strong style={{ fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}>
              Progress
            </Text>
            <Text type="secondary" style={{ fontSize: "clamp(0.75rem, 2vw, 0.875rem)" }}>
              {answeredQuestions.size}/{scenarioData.scenes.length}
            </Text>
          </div>
          <Progress 
            percent={progress} 
            showInfo={false} 
            strokeColor="#52c41a"
            strokeWidth={8}
          />
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, paddingBottom: "1rem", minHeight: 0 }}>
          <Row gutter={[16, 16]} style={{ height: "100%" }}>
            {/* Question Section */}
            <Col xs={24} lg={15} style={{ display: "flex", flexDirection: "column" }}>
              {!started ? (
                <Card 
                  className="p-4 sm:p-6 md:p-8" 
                  style={{ 
                    height: "100%",
                    minHeight: "400px",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <div className="flex flex-col items-center justify-center text-center" style={{ flex: 1 }}>
                    <div className="mb-4 sm:mb-6 rounded-full bg-green-100 p-4 sm:p-6">
                      <PlayCircleOutlined 
                        style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }} 
                      />
                    </div>
                    <Title 
                      level={3}
                      style={{ fontSize: "clamp(1.125rem, 3vw, 1.5rem)" }}
                    >
                      Ready to Begin?
                    </Title>
                    <Paragraph 
                      className="mb-6 sm:mb-8 max-w-md text-gray-600 leading-relaxed"
                      style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                    >
                      You'll be presented with {scenarioData.scenes.length} real-world scenes. 
                      Choose the best response for each situation.
                    </Paragraph>
                    <Button 
                      type="primary" 
                      size="large" 
                      onClick={handleStart}
                      style={{ 
                        height: "auto",
                        padding: "0.75rem 2rem",
                        fontSize: "clamp(0.875rem, 2vw, 1rem)"
                      }}
                    >
                      Start Walkthrough
                    </Button>
                  </div>
                </Card>
              ) : (
                <div
                  id="questions-container"
                  className="pr-2"
                  style={{ 
                    height: "100%",
                    overflowY: "auto",
                    overflowX: "hidden"
                  }}
                >
                  {scenarioData.scenes.map((scene: Scene, index: number) => {
                    const isUnlocked =
                      answeredQuestions.has(index) || index === answeredQuestions.size;

                    return (
                      <div
                        key={scene.id}
                        ref={(el) => {
                          questionRefs.current[index] = el;
                        }}
                        className={`transition-all mb-4`}
                        style={{
                          opacity: isUnlocked ? 1 : 0.3,
                          pointerEvents: isUnlocked ? "auto" : "none",
                          filter: isUnlocked ? "none" : "blur(4px)"
                        }}
                      >
                        {isUnlocked ? (
                          <SceneCard
                            scenarioId={scenarioData.id}
                            scene={scene}
                            index={index}
                            onCorrect={handleCorrect}
                            showHighlight={(highlight: HighlightData) => {
                              scrollToHighlight(highlight);
                            }}
                            audioUrl={`http://localhost:5000/data/scenario_audios/${scenarioData.id}/scene-${index}.mp3?token=${token}`}
                          />
                        ) : (
                          <Card 
                            style={{ 
                              minHeight: "300px",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                            className="bg-gray-100 border-dashed"
                          >
                            <Text 
                              type="secondary"
                              style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                            >
                              Locked — finish the previous scene first
                            </Text>
                          </Card>
                        )}
                      </div>
                    );
                  })}

                  {/* Completion card */}
                  {completed && (
                    <div ref={completionRef} className="mb-4">
                      <Card className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center">
                        <div className="mb-4 sm:mb-6 rounded-full bg-green-100 p-4 sm:p-6">
                          <CheckCircleTwoTone 
                            twoToneColor="#52c41a" 
                            style={{ fontSize: "clamp(2rem, 8vw, 3rem)" }}
                          />
                        </div>
                        <Title 
                          level={3}
                          style={{ fontSize: "clamp(1.125rem, 3vw, 1.5rem)" }}
                        >
                          Walkthrough Complete!
                        </Title>
                        <Paragraph 
                          className="mb-4 sm:mb-6 max-w-md text-gray-600 leading-relaxed"
                          style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)" }}
                        >
                          Great job! You've completed all the scenarios. Review your notes,
                          or try again to reinforce your learning.
                        </Paragraph>
                        <Space 
                          direction="horizontal" 
                          wrap
                          style={{ justifyContent: "center" }}
                        >
                          <Button
                            type="primary"
                            size="large"
                            onClick={() => window.history.back()}
                            style={{ 
                              height: "auto",
                              padding: "0.75rem 1.5rem",
                              fontSize: "clamp(0.875rem, 2vw, 1rem)"
                            }}
                          >
                            End Walkthrough
                          </Button>
                          <Button
                            type="default"
                            size="large"
                            onClick={() => window.location.reload()}
                            style={{ 
                              height: "auto",
                              padding: "0.75rem 1.5rem",
                              fontSize: "clamp(0.875rem, 2vw, 1rem)"
                            }}
                          >
                            Restart
                          </Button>
                        </Space>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </Col>

            {/* Notes Section */}
            <Col 
              xs={24} 
              lg={9} 
              style={{ 
                display: "flex", 
                flexDirection: "column",
                height: "100%"
              }}
            >
              <Card
                title={
                  <span 
                    className="font-bold"
                    style={{ fontSize: "clamp(0.875rem, 2vw, 1.125rem)" }}
                  >
                    📓 Dispatch Notes
                  </span>
                }
                className="shadow-md border border-gray-200"
                style={{ 
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  minHeight: "400px"
                }}
                bodyStyle={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  flex: 1,
                  padding: "clamp(0.75rem, 2vw, 1.5rem)"
                }}
              >
                {/* Log area */}
                <div
                  className="rounded-md border border-gray-300 bg-gray-100"
                  style={{ flex: 1, minHeight: "200px", marginBottom: "1rem" }}
                >
                  <TextArea
                    ref={textAreaRef}
                    placeholder="[Dispatcher] Begin logging scenario notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#333",
                      fontFamily: "monospace",
                      boxShadow: "none",
                      height: "100%",
                      fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
                      resize: "none"
                    }}
                  />
                </div>

                {/* Controls */}
                <div 
                  style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    gap: "0.5rem"
                  }}
                >
                  <div 
                    style={{ 
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.5rem"
                    }}
                  >
                    <Button
                      type="primary"
                      size="middle"
                      icon={<i className="far fa-clock" />}
                      onClick={handleAddTimestamp}
                      style={{ 
                        fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
                        height: "auto",
                        padding: "0.5rem 1rem"
                      }}
                    >
                      Insert Timestamp
                    </Button>

                    <Text 
                      type="secondary" 
                      style={{ 
                        fontSize: "clamp(0.625rem, 1.5vw, 0.75rem)"
                      }}
                    >
                      (Shift+Enter for newline)
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <Drawer
        title="📑 MANUAL OF PROCEDURES"
        placement="right"
        destroyOnClose
        width={window.innerWidth < 768 ? "90%" : window.innerWidth < 1024 ? "70%" : "40%"}
        onClose={() => setPdfOpen(false)}
        open={pdfOpen}
        bodyStyle={{ 
          padding: 0, 
          display: "flex", 
          flexDirection: "column", 
          height: '100%' 
        }}
      >
        <PdfViewer
          fileUrl={`http://localhost:5000/data/mop/${scenarioData.pdfFilename}?token=${token}`}
          highlights={scenarioData.scenes.flatMap((scene: Scene) => scene.highlights || [])}
          scrollContainerRef={scrollContainerRef}
          pageRefs={pageRefs}
        />
      </Drawer>
    </div>
  );
}