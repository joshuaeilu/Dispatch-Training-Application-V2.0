import { useLocation } from "react-router-dom";
import { PageHeader } from "../../../Shared/PageHeader";
import { useEffect, useState } from "react";
import {
  Tabs,
  Collapse,
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { toTitleCase } from "../../../../utils/tools";
import { api } from "../../../../utils/api";
import dayjs from "dayjs";

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

export default function UserProgressPage() {
  const location = useLocation();
  const user = location.state?.user;
  const [exercises, setExercises] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [submittedMap, setSubmittedMap] = useState<Record<string, boolean>>({});
  const [scenarioMap, setScenarioMap] = useState<Record<string, boolean>>({});
  const [activeKey, setActiveKey] = useState("exercises");

  // ✅ Fetch Exercises + Completed Map
  const fetchExercises = async () => {
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
    }
  };

  // ✅ Fetch Scenarios (with audience inside scenario_data)
  const fetchScenarios = async () => {
    try {
      const { data } = await api.get("/scenarios");
      const audienceScenarios = data.scenarios.filter((sc: any) => {
        const audience = sc?.scenario_data?.audience || "All";
        return (
          ["All", toTitleCase(user.role) + "s"].includes(audience) &&
          sc.status === "published"
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
    }
  };

  useEffect(() => {
    if (user) {
      fetchExercises();
      fetchScenarios();
    }
  }, [user]);

  // 🧩 Reusable Card
  const renderCard = (item: any, isScenario = false) => {
    const sceneCount = isScenario
      ? item?.scenario_data?.scenes?.length || 0
      : 0;
    const description = isScenario
      ? item?.scenario_data?.description || "No description provided."
      : "";

    return (
      <Card
        hoverable
        onClick={() => console.log(`${isScenario ? "Scenario" : "Exercise"}:`, item.name)}
        style={{
          borderRadius: 12,
          border: "1px solid #eaeaea",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          transition: "all 0.2s ease-in-out",
        }}
        bodyStyle={{ padding: "1rem 1.25rem" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Title level={5} style={{ marginBottom: 0, fontWeight: 600 }}>
            {item.name}
          </Title>
          {item.completed ? (
            <Tooltip title="View response">
              <EyeOutlined
                style={{ color: "#71B1C8", fontSize: 18, cursor: "pointer" }}
              />
            </Tooltip>
          ) : (
            <ClockCircleOutlined style={{ color: "#999", fontSize: 16 }} />
          )}
        </div>

        {/* Extra info line */}
        {isScenario && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            <FileTextOutlined style={{ marginRight: 6 }} />
            {sceneCount} {sceneCount === 1 ? "scene" : "scenes"}
          </Text>
        )}

        {isScenario && (
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 1 }}
            style={{
              marginTop: 6,
              marginBottom: 6,
              fontSize: 13,
              color: "#666",
            }}
          >
            {description}
          </Paragraph>
        )}

        {!isScenario && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {item.type || "General"}
          </Text>
        )}

        <div style={{ marginTop: 12 }}>
          <Tag
            color={item.completed ? "green" : "volcano"}
            icon={
              item.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />
            }
            style={{
              fontWeight: 500,
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: 13,
            }}
          >
            {item.completed ? "Completed" : "Incomplete"}
          </Tag>
        </div>

        {item.completed && (
          <Text
            type="secondary"
            style={{
              display: "block",
              marginTop: 8,
              fontSize: 12,
              color: "#666",
            }}
          >
            Tap to view submission
          </Text>
        )}
      </Card>
    );
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <PageHeader
        title={`User Progress - ${toTitleCase(user.name) || "User"}`}
        onBack={() => window.history.back()}
        showBackButton
      />

      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        centered
        items={[
          {
            key: "exercises",
            label: "Exercises",
            children: (
              <div style={{ padding: "1.5rem" }}>
                {exercises.length === 0 ? (
                  <Text type="secondary">No exercises found.</Text>
                ) : (
                  <Collapse
                    bordered={false}
                    defaultActiveKey={exercises.map((_, idx) => idx.toString())}
                    expandIconPosition="end"
                    style={{ background: "#fff" }}
                  >
                    {exercises.map((section, idx) => (
                      <Panel
                        key={idx}
                        header={
                          <Title
                            level={4}
                            style={{
                              margin: 0,
                              marginBottom: 8,
                              color: "#8C2131",
                            }}
                          >
                            {section.date}
                          </Title>
                        }
                      >
                        <Row gutter={[20, 20]}>
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
            label: "Scenarios",
            children: (
              <div style={{ padding: "1.5rem" }}>
                {scenarios.length === 0 ? (
                  <Text type="secondary">No scenarios found.</Text>
                ) : (
                  <Collapse
                    bordered={false}
                    defaultActiveKey={scenarios.map((_, idx) => idx.toString())}
                    expandIconPosition="end"
                    style={{ background: "#fff" }}
                  >
                    {scenarios.map((section, idx) => (
                      <Panel
                        key={idx}
                        header={
                          <Title
                            level={4}
                            style={{
                              margin: 0,
                              marginBottom: 8,
                              color: "#8C2131",
                            }}
                          >
                            {section.date}
                          </Title>
                        }
                      >
                        <Row gutter={[20, 20]}>
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
  );
}
