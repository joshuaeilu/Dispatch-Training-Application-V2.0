import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Tabs,
  Collapse,
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Empty,
  Modal,
  Button,
  Skeleton,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { toTitleCase } from "../../../../utils/tools";
import { api } from "../../../../utils/api";
import dayjs from "dayjs";
import { PROFILE_PIC_URL } from "../../../../data/data";
import KnowledgeCheckResults from "../../../User/KnowledgeChecks/components/KnowledgeCheckResults";
import { getToken } from "../../../../contexts/AuthProvider";

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

export default function UserProgressPage() {
  const location = useLocation();
  const user = location.state?.user;
  const [exercises, setExercises] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [__, setSubmittedMap] = useState<Record<string, boolean>>({});
  const [___, setScenarioMap] = useState<Record<string, boolean>>({});
  const [activeKey, setActiveKey] = useState("exercises");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const token = getToken();

  // Calculate stats
  const getStats = () => {
    const totalExercises = exercises.reduce((sum, sec) => sum + sec.items.length, 0);
    const completedExercises = exercises.reduce(
      (sum, sec) => sum + sec.items.filter((ex: any) => ex.completed).length,
      0
    );
    const totalScenarios = scenarios.reduce((sum, sec) => sum + sec.items.length, 0);
    const completedScenarios = scenarios.reduce(
      (sum, sec) => sum + sec.items.filter((sc: any) => sc.completed).length,
      0
    );

    return {
      totalExercises,
      completedExercises,
      totalScenarios,
      completedScenarios,
      exercisePercentage: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
      scenarioPercentage: totalScenarios > 0 ? Math.round((completedScenarios / totalScenarios) * 100) : 0,
    };
  };

  const stats = getStats();

  const handleCompletedCardClick = async (exerciseId: string) => {
    setLoadingSubmission(true);
    try {
      const exerciseResult = await api.get(`/submissions/${exerciseId}`, { params: { userId: user.id } });
      setSelectedSubmission({...exerciseResult.data});
      setShowResultModal(true);
    }
    catch(err){
      console.error("❌ Error fetching exercise submission:", err);
    }
    finally {
      setLoadingSubmission(false);
    }
  };

  // ✅ Fetch Exercises + Completed Map
  const fetchExercises = async () => {
    setLoadingExercises(true);
    try {
      const { data } = await api.get("/exercises");
      const audienceExercises = data.filter(
        (ex: any) =>
          ["All", toTitleCase(user.role) + "s"].includes(ex.audience) &&
          ex.status === "published"
      );

      const userId = user.id;
      const submissionRes = await api.get(`/submissions/exercises/${userId}`);
      const completedMap = submissionRes.data?.exerciseIds?.reduce(
        (acc: Record<string, boolean>, id: string) => {
          acc[id] = true;
          return acc;
        },
        {}
      );

      const exercisesWithStatus = audienceExercises.map((ex: any) => ({
        ...ex,
        completed: !!completedMap?.[ex.id],
      }));

      const grouped = exercisesWithStatus.reduce(
        (acc: Record<string, any[]>, ex: any) => {
          const dateKey = dayjs(ex.created_at).format("MMMM D, YYYY");
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(ex);
          return acc;
        },
        {}
      );

      const dateSections = Object.entries(grouped)
        .map(([date, items]) => ({ date, items }))
        .sort(
          (a, b) =>
            dayjs(b.date, "MMMM D, YYYY").unix() -
            dayjs(a.date, "MMMM D, YYYY").unix()
        );

      setExercises(dateSections);
      setSubmittedMap(completedMap || {});
    } catch (err) {
      console.error("❌ Error fetching exercises:", err);
    } finally {
      setLoadingExercises(false);
    }
  };

  // ✅ Fetch Scenarios (with audience inside scenario_data)
  const fetchScenarios = async () => {
    setLoadingScenarios(true);
    try {
      const { data } = await api.get("/scenarios");
      const audienceScenarios = data.scenarios.filter((sc: any) => {
        const audience = sc?.scenario_data?.audience || "All";
        return (
          ["All", toTitleCase(user.role) + "s"].includes(audience) &&
          sc.scenario_data.status === "published"
        );
      });

      const userId = user.id;
      const submissionRes = await api.get(`/submissions/scenarios/${userId}`);
      const completedMap = submissionRes.data?.scenarioIds?.reduce(
        (acc: Record<string, boolean>, id: string) => {
          acc[id] = true;
          return acc;
        },
        {}
      );

      const scenariosWithStatus = audienceScenarios.map((sc: any) => ({
        ...sc,
        completed: !!completedMap?.[sc.id],
      }));

      const grouped = scenariosWithStatus.reduce(
        (acc: Record<string, any[]>, sc: any) => {
          const dateKey = dayjs(sc.created_at).format("MMMM D, YYYY");
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(sc);
          return acc;
        },
        {}
      );

      const dateSections = Object.entries(grouped)
        .map(([date, items]) => ({ date, items }))
        .sort(
          (a, b) =>
            dayjs(b.date, "MMMM D, YYYY").unix() -
            dayjs(a.date, "MMMM D, YYYY").unix()
        );

      setScenarios(dateSections);
      setScenarioMap(completedMap || {});
    } catch (err) {
      console.error("❌ Error fetching scenarios:", err);
    } finally {
      setLoadingScenarios(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchExercises();
      fetchScenarios();
    }
  }, [user]);

  // 🧩 Loading skeleton for cards
  const renderLoadingSkeleton = () => (
    <Row gutter={[20, 20]}>
      {[1, 2, 3, 4].map((i) => (
        <Col xs={24} sm={12} md={8} lg={6} key={i}>
          <Card
            style={{
              borderRadius: 16,
              height: "100%",
            }}
          >
            <Skeleton active paragraph={{ rows: 3 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );

  // 🧩 Reusable Card with refined design
  const renderCard = (item: any, isScenario = false) => {
    const sceneCount = isScenario
      ? item?.scenario_data?.scenes?.length || 0
      : 0;
    const description = isScenario
      ? item?.scenario_data?.description || "No description provided."
      : "";
    const scenarioName = isScenario ? item?.scenario_data?.name || "Untitled Scenario" : "";

    return (
      <Card
        hoverable
        className="transition-all duration-200"
        style={{
          borderRadius: 16,
          border: item.completed ? "2px solid #52c41a" : "1px solid #e8e8e8",
          boxShadow: item.completed 
            ? "0 4px 16px rgba(82, 196, 26, 0.12)" 
            : "0 2px 8px rgba(0,0,0,0.04)",
          height: "100%",
          position: "relative",
          overflow: "visible",
          background: "#fff",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        bodyStyle={{ padding: "1.5rem" }}
        onClick={() =>{
         if( item.completed && !isScenario ){
           setSelectedExercise(item);
           handleCompletedCardClick(item.id);
         }
        }}
      >
        {/* Completed badge in top right corner */}
        {item.completed && (
          <div
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#52c41a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(82, 196, 26, 0.35)",
              zIndex: 1,
              border: "3px solid #fff",
            }}
          >
            <CheckCircleOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
        )}

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <Title
            level={5}
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 17,
              lineHeight: 1.4,
              color: "#262626",
            }}
          >
            {isScenario ? scenarioName : item.name}
          </Title>
        </div>

        {/* Metadata Section */}
        <div style={{ marginBottom: 16, minHeight: 40 }}>
          {isScenario ? (
            <>
              <div style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#8c8c8c",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FileTextOutlined style={{ fontSize: 14 }} />
                  <span>{sceneCount} {sceneCount === 1 ? "scene" : "scenes"}</span>
                </Text>
              </div>
              {description && (
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "#595959",
                    lineHeight: 1.6,
                  }}
                >
                  {description}
                </Paragraph>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "row", gap: 8 }}>
              <Text
                style={{
                  fontSize: 13,
                  color: "#8c8c8c",
                  background: "#fafafa",
                  padding: "6px 12px",
                  borderRadius: 8,
                  display: "inline-block",
                  border: "1px solid #f0f0f0",
                  width: "fit-content",
                }}
              >
                {item.type || "General"}
              </Text>
              {item.questions?.length > 0 && (
                <Text
                  style={{
                    fontSize: 13,
                    color: "#8c8c8c",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FileTextOutlined style={{ fontSize: 14 }} />
                  <span>{item.questions.length} {item.questions.length === 1 ? "question" : "questions"}</span>
                </Text>
              )}
            </div>
          )}
        </div>

        {/* Status and Action Footer */}
        <div 
          style={{ 
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
          }}
        >
          {item.completed ? (
            <>
              <Tag
                icon={<CheckCircleOutlined style={{ fontSize: 14 }} />}
                style={{
                  margin: 0,
                  fontWeight: 500,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 13,
                  border: "1px solid #52c41a",
                  color: "#52c41a",
                  background: "#f6ffed",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Completed
              </Tag>
            
            </>
          ) : (
            <Tag
              icon={<ClockCircleOutlined style={{ fontSize: 14 }} />}
              style={{
                margin: 0,
                fontWeight: 500,
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 13,
                border: "1px solid #d9d9d9",
                color: "#8c8c8c",
                background: "#fafafa",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Not Started
            </Tag>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div style={{ background: "#fafafa", minHeight: "100vh", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Hero Section with Trainee Info - STICKY */}
      <div
        style={{
          background: "linear-gradient(135deg, #8C2131 0%, #a83145 100%)",
          padding: "32px 24px 48px",
          color: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div>
          <Row gutter={[32, 32]} align="middle">
            {/* Left section: Back + Avatar + Name */}
            <Col xs={24} md={14}>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                {/* Back button */}
                <div
                  onClick={() => window.history.back()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")
                  }
                >
                  <ArrowLeftOutlined style={{ fontSize: 16 }} />
                  <Text style={{ color: "#fff", fontWeight: 500 }}>Back</Text>
                </div>

                {/* Avatar + Name */}
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                      flexShrink: 0,
                    }}
                  >
                    {user?.avatar ? (
                      <img
                        src={`${PROFILE_PIC_URL}${user.avatar}?token=${token}`}
                        alt={user.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <UserOutlined style={{ fontSize: 48, color: "#8C2131" }} />
                    )}
                  </div>
                  <div>
                    <Title
                      level={1}
                      style={{
                        color: "#fff",
                        margin: 0,
                        marginBottom: 8,
                        fontSize: 32,
                        fontWeight: 700,
                      }}
                    >
                      {toTitleCase(user?.name || "Unknown User")}
                    </Title>
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      {toTitleCase(user?.role || "Trainee")}
                    </Text>
                  </div>
                </div>
              </div>
            </Col>

            {/* Right section: Stats */}
            <Col xs={24} md={10}>
              <Row gutter={16}>
                <Col span={8}>
                  <Card
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 12,
                      textAlign: "center",
                    }}
                    bodyStyle={{ padding: "20px 12px" }}
                  >
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: "#fff",
                        marginBottom: 4,
                      }}
                    >
                      {stats.completedExercises + stats.completedScenarios}
                    </div>
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: 13,
                      }}
                    >
                      Completed
                    </Text>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 12,
                      textAlign: "center",
                    }}
                    bodyStyle={{ padding: "20px 12px" }}
                  >
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: "#fff",
                        marginBottom: 4,
                      }}
                    >
                      {stats.totalExercises + stats.totalScenarios}
                    </div>
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: 13,
                      }}
                    >
                      Total Assigned
                    </Text>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 12,
                      textAlign: "center",
                    }}
                    bodyStyle={{ padding: "20px 12px" }}
                  >
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: "#fff",
                        marginBottom: 4,
                      }}
                    >
                      {Math.round(
                        ((stats.completedExercises + stats.completedScenarios) /
                          (stats.totalExercises + stats.totalScenarios || 1)) *
                          100
                      )}
                      %
                    </div>
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.9)",
                        fontSize: 13,
                      }}
                    >
                      Overall Progress
                    </Text>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>

      {/* Tabs Section - SCROLLABLE */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <div>
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            size="large"
            style={{
              background: "#fff",
              padding: "8px 24px 0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            items={[
              {
                key: "exercises",
                label: (
                  <span style={{ fontSize: 16, fontWeight: 500 }}>
                    Exercises
                    <Tag
                      color="blue"
                      style={{ marginLeft: 8, borderRadius: 10 }}
                    >
                      {stats.completedExercises}/{stats.totalExercises}
                    </Tag>
                  </span>
                ),
                children: (
                  <div style={{ padding: "1rem 0" }}>
                    {loadingExercises ? (
                      <div style={{ padding: "24px" }}>
                        {renderLoadingSkeleton()}
                      </div>
                    ) : exercises.length === 0 ? (
                      <Empty
                        description="No exercises assigned yet"
                        style={{ padding: "60px 0" }}
                      />
                    ) : (
                      <Collapse
                        bordered={false}
                        defaultActiveKey={exercises.map((_, idx) => idx.toString())}
                        expandIconPosition="end"
                        style={{
                          background: "transparent",
                        }}
                      >
                        {exercises.map((section, idx) => (
                          <Panel
                            key={idx}
                            header={
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Title
                                  level={4}
                                  style={{
                                    color: "#8C2131",
                                    margin: 0,
                                    fontWeight: 600,
                                  }}
                                >
                                  {section.date}
                                </Title>
                                <Tag color="default" style={{ borderRadius: 8 }}>
                                  {section.items.length}{" "}
                                  {section.items.length === 1 ? "item" : "items"}
                                </Tag>
                              </div>
                            }
                            style={{
                              marginBottom: 16,
                              background: "#fff",
                              borderRadius: 16,
                              border: "1px solid #f0f0f0",
                              overflow: "hidden",
                            }}
                          >
                            <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
                              {section.items.map((ex: any) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={ex.id}>
                                  {renderCard(ex)}
                                </Col>
                              ))}
                            </Row>
                          </Panel>
                        ))}
                      </Collapse>
                    )}
                  </div>
                ),
              },
              {
                key: "scenarios",
                label: (
                  <span style={{ fontSize: 16, fontWeight: 500 }}>
                    Scenarios
                    <Tag
                      color="purple"
                      style={{ marginLeft: 8, borderRadius: 10 }}
                    >
                      {stats.completedScenarios}/{stats.totalScenarios}
                    </Tag>
                  </span>
                ),
                children: (
                  <div style={{ padding: "24px 0" }}>
                    {loadingScenarios ? (
                      <div style={{ padding: "24px" }}>
                        {renderLoadingSkeleton()}
                      </div>
                    ) : scenarios.length === 0 ? (
                      <Empty
                        description="No scenarios assigned yet"
                        style={{ padding: "60px 0" }}
                      />
                    ) : (
                      <Collapse
                        bordered={false}
                        defaultActiveKey={scenarios.map((_, idx) => idx.toString())}
                        expandIconPosition="end"
                        style={{
                          background: "transparent",
                        }}
                      >
                        {scenarios.map((section, idx) => (
                          <Panel
                            key={idx}
                            header={
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Title
                                  level={4}
                                  style={{
                                    color: "#8C2131",
                                    margin: 0,
                                    fontWeight: 600,
                                  }}
                                >
                                  {section.date}
                                </Title>
                                <Tag color="default" style={{ borderRadius: 8 }}>
                                  {section.items.length}{" "}
                                  {section.items.length === 1 ? "item" : "items"}
                                </Tag>
                              </div>
                            }
                            style={{
                              marginBottom: 16,
                              background: "#fff",
                              borderRadius: 16,
                              border: "1px solid #f0f0f0",
                              overflow: "hidden",
                            }}
                          >
                            <Row gutter={[20, 20]} style={{ marginTop: 16 }}>
                              {section.items.map((sc: any) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={sc.id}>
                                  {renderCard(sc, true)}
                                </Col>
                              ))}
                            </Row>
                          </Panel>
                        ))}
                      </Collapse>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Result Modal */}
      <Modal
        open={showResultModal}
        centered
        width={800}
        maskClosable={true}
        closable={false}
        onCancel={() => {
          setShowResultModal(false);
          setSelectedSubmission(null);
        }}
        footer={
          <div style={{ textAlign: "right", marginTop: 16, marginBottom: 16 }}>
            <Button
              type="default"
              size="large"
              onClick={() => {
                setShowResultModal(false);
                setSelectedSubmission(null);
              }}
              style={{
                borderRadius: 8,
                fontWeight: 500,
              }}
            >
              Close
            </Button>
          </div>
        }
        bodyStyle={{
          maxHeight: "80vh",
          overflowY: "auto",
          paddingRight: 16,
        }}
      >
        {loadingSubmission ? (
          <div style={{ padding: "24px" }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : selectedSubmission ? (
          <KnowledgeCheckResults
            name={selectedExercise?.name}
            questions={selectedExercise?.questions || []}
            userAnswers={selectedSubmission?.answers || {}}
          />
        ) : (
          <Empty description="No submission data available" />
        )}
      </Modal>
    </div>
  );
}