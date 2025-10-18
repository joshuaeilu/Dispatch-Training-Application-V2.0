import { useState, useRef, useContext } from "react";
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
        // Post submission to server
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
    
    // First open the PDF drawer if it's not already open
    const wasOpen = pdfOpen;
    if (!wasOpen) {
      setPdfOpen(true);
    }

    // Wait for drawer to open and PDF to render before scrolling
    const delay = wasOpen ? 300 : 1000; // Longer delay if drawer needs to open
    
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

      // Center the highlight vertically in the container
      const targetTop = highlightTop - (container.clientHeight / 2) + (highlightHeight / 2);

      console.log('Scrolling to top:', targetTop);

      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      });
    }, delay);
  };

  return (
    <div style={{height:"100vh", backgroundColor:"#fff"}}>
      <div className="mx-auto max-w-7xl " style={{ height:"100%", overflow:"hidden"}}>
        {/* Header */}
<div style={{ height:"20vh",  paddingTop:"1rem", paddingBottom:"1rem" }}>
        <div
  className=" py-3 text-center rounded-lg"
  style={{
    backgroundColor: "#8C2131", // Calvin maroon
    color: "white",
  }}
>
  <Title
    level={2}
    className="!mb-3  font-bold tracking-tight"
    style={{
      color: "white",
      fontFamily: "Urbanist, Inter, sans-serif",
    }}
  >
    {scenarioData.name}
  </Title>

  <Paragraph
    className="mx-auto max-w-2xl  leading-relaxed"
    style={{
      color: "#F3F3F3", // soft white for contrast
      fontFamily: "Inter, sans-serif",
      fontSize: "16px",
    }}
  >
    {scenarioData.description}
  </Paragraph>
</div>
</div>


        {/* Progress */}
        <div style={{height:"10vh"}}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <Text strong>Progress</Text>
            <Text type="secondary">
              {answeredQuestions.size}/{scenarioData.scenes.length}
            </Text>
          </div>
          <Progress percent={progress} showInfo={false} strokeColor="#52c41a" />
        </div>

       <div style={{ height:"65vh" }}>
         <Row gutter={[24, 24]} style={{ height:"100%"}}>
          {/* Question Section */}
          <Col xs={24} lg={15}>
            {!started ? (
              <Card className="p-6 md:p-8  " style={{height:"100%"}}>
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <div className="mb-6 rounded-full bg-green-100 p-6">
                    <PlayCircleOutlined className="text-5xl" />
                  </div>
                  <Title level={3}>Ready to Begin?</Title>
                  <Paragraph className="mb-8 max-w-md text-gray-600 leading-relaxed">
                    You'll be presented with {scenarioData.scenes.length} real-world scenes. Choose the best
                    response for each situation.
                  </Paragraph>
                  <Button type="primary" size="large" onClick={handleStart}>
                    Start Walkthrough
                  </Button>
                </div>
              </Card>
            ) : (
              <div
                id="questions-container"
                className=" pr-2"
                style={{ height: "65vh", overflowY: "auto" }}
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
                      className={`transition-all ${
                        isUnlocked
                          ? "opacity-100"
                          : "opacity-30 pointer-events-none blur-sm"
                      }`}
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
                        <Card className="h-[400px] flex items-center justify-center bg-gray-100 border-dashed">
                          <Text type="secondary">
                            Locked — finish the previous scene first
                          </Text>
                        </Card>
                      )}
                    </div>
                  );
                })}

                {/* Completion card */}
                {completed && (
                  <div ref={completionRef}>
                    <Card className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="mb-6 rounded-full bg-green-100 p-6">
                        <CheckCircleTwoTone twoToneColor="#52c41a" className="text-5xl" />
                      </div>
                      <Title level={3}>Walkthrough Complete!</Title>
                      <Paragraph className="mb-6 max-w-md text-gray-600 leading-relaxed">
                        Great job! You've completed all the scenarios. Review your notes,
                        or try again to reinforce your learning.
                      </Paragraph>
                      <Space>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => window.history.back()}
                        >
                          End Walkthrough
                        </Button>
                        <Button
                          type="default"
                          size="large"
                          onClick={() => window.location.reload()}
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
          <Col xs={24} lg={9}>
            <Card
              title={<span className="font-bold text-lg">📓 Dispatch Notes</span>}
              className="sticky  shadow-md border border-gray-200 "
              bodyStyle={{ display: "flex", flexDirection: "column", height: "60vh" }}
            >
            

              {/* Log area */}
              <div
                className="rounded-md border border-gray-300 bg-gray-100 flex-grow"
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
                  }}
                />
              </div>

                {/* Controls */}
              <div className="flex items-center justify-between mt-3">
                <Button
                  type="primary"
                  size="middle"
                  icon={<i className="far fa-clock" />}
                  onClick={handleAddTimestamp}
                >
                  Insert Timestamp
                </Button>

                <Text type="secondary" style={{ fontSize: 12 }}>
                  (Shift+Enter for newline)
                </Text>
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
        width="40%"
        onClose={() => setPdfOpen(false)}
        open={pdfOpen}
        bodyStyle={{ padding: 0, display: "flex", flexDirection: "column", height: '100%' }}
      >
        <PdfViewer
          highlights={scenarioData.scenes.flatMap((scene: Scene) => scene.highlights || [])}
          scrollContainerRef={scrollContainerRef}
          pageRefs={pageRefs}
        />
      </Drawer>
    </div>
  );
}