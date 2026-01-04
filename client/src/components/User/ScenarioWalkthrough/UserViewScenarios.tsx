import {
  Button,
  Col,
  Row,
  Select,
  Form,
  Input,
  Typography,
  Skeleton,
  Empty,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import ScenarioCard from "../../Shared/ListCard";
import { UniversalContext } from "../../../contexts/UniversalHelpers";
import { api } from "../../../utils/api";
import type { Scenario } from "../../../types/index.types";
import { useNavigate } from "react-router-dom";
import UserPageHeader from "../../Shared/UserPageHeader";
import { AuthContext, checkIsMobile } from "../../../contexts/AuthProvider";
const { Title, Text } = Typography;

export default function UserViewScenarios() {
  const [form] = Form.useForm();
  const { preferences } = useContext(UniversalContext);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [selectedScenarioType, setSelectedScenarioType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const scenarioTypes = preferences?.scenario_types || ["No types found"];
  const navigate = useNavigate();

  // Fetch scenarios
  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true);
      try {
        const response = await api.get("/scenarios");
        const data = response.data.scenarios.map((s: any) => ({
          ...s.scenario_data,
        }));

        setScenarios(data);

        // Fetch completed scenarios
        const submissionRes = await api.get(`/submissions/scenarios/${user?.id}`);
        const completedMap = submissionRes.data?.scenarioIds.reduce(
          (acc: Record<string, boolean>, id: string) => {
            acc[id] = true;
            return acc;
          },
          {}
        );
        setCompletedMap(completedMap);
      } catch (err) {
        console.error("Failed to fetch scenarios", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, [user?.id]);

  // Apply filters
  const filteredScenarios = scenarios.filter((s) => {
    const matchesType =
      selectedScenarioType === "All" || s.type === selectedScenarioType;
    const matchesSearch =
      searchQuery === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Group by type
  const grouped = filteredScenarios.reduce(
    (acc: Record<string, Scenario[]>, scenario) => {
      if (!acc[scenario.type]) acc[scenario.type] = [];
      acc[scenario.type].push(scenario);
      return acc;
    },
    {}
  );

  const sortedTypes = Object.keys(grouped).sort();

  // Skeleton for scenario cards
  const renderScenarioSkeletons = () => (
    <div style={{ marginBottom: "1.5rem" }}>
      <Skeleton.Input
        active
        size="default"
        style={{ width: 200, marginBottom: 16 }}
      />
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} md={8} lg={6} key={i}>
            <div
              style={{
                padding: "1.5rem",
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #f0f0f0",
              }}
            >
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );

  return (
    <div
      style={{
        background: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <UserPageHeader
        title="Scenarios"
        subtitle="Explore and complete available training scenarios."
      />

      {/* Filters */}
      <div
        style={{
          padding: "1rem 1.5rem",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          position: checkIsMobile() ? "relative" : "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 12]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="type" style={{ marginBottom: 16 }}>
                <Select
                  size="large"
                  placeholder="Select Scenario type"
                  options={[
                    { label: "All", value: "All" },
                    ...scenarioTypes.map((type) => ({
                      label: type,
                      value: type,
                    })),
                  ]}
                  value={selectedScenarioType}
                  onChange={(value) => setSelectedScenarioType(value)}
                  disabled={loading}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={10}>
              <Form.Item name="q" style={{ marginBottom: 0 }}>
                <Input
                  size="large"
                  prefix={<SearchOutlined />}
                  placeholder="Search by scenario name..."
                  allowClear
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                />
              </Form.Item>
            </Col>

            {!checkIsMobile() && (
              <Col xs={24} md={4}>
                <Button
                  size="large"
                  className="border-btn"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    form.resetFields();
                    setSelectedScenarioType("All");
                    setSearchQuery("");
                  }}
                  disabled={loading}
                >
                  Reset
                </Button>
              </Col>
            )}
          </Row>
        </Form>

        {loading ? (
          <Skeleton.Input
            active
            size="small"
            style={{ width: 150, marginTop: 8 }}
          />
        ) : (
          <Text type="secondary">
            {filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? "s" : ""} found
          </Text>
        )}
      </div>

      {/* Scrollable scenarios area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem 1.5rem",
        }}
      >
        {loading ? (
          <>
            {renderScenarioSkeletons()}
            {renderScenarioSkeletons()}
          </>
        ) : sortedTypes.length === 0 ? (
          <Empty
            description="No scenarios found"
            style={{ padding: "60px 0" }}
          />
        ) : (
          sortedTypes.map((type) => (
            <div key={type} style={{ marginBottom: "1.5rem" }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                {type}
              </Title>
              <Row gutter={[16, 16]}>
                {grouped[type].map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    name={scenario.name}
                    type={"scenario"}
                    completed={completedMap[scenario.id] || false}
                    description={scenario.description || "No description provided."}
                    questionCount={scenario.scenes?.length || 0}
                    onClick={() =>
                      navigate("view-scenario", { state: { scenario } })
                    }
                  />
                ))}
              </Row>
            </div>
          ))
        )}
      </div>
    </div>
  );
}