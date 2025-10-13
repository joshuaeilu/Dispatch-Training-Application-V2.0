import {
  Button,
  Col,
  Row,
  Select,
  Space,
  Form,
  Input,
  Typography,
  Divider,
  Empty,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { PageHeader } from "../../Shared/PageHeader";
import ScenarioCard from "../../Shared/ListCard";
import { UniversalContext } from "../../../contexts/UniversalHelpers";
import { api } from "../../../utils/api";
import type { Scenario } from "../../../types/index.types";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function UserViewScenarios() {
  const [form] = Form.useForm();
  const { preferences } = useContext(UniversalContext);

  const [selectedScenarioType, setSelectedScenarioType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [__, setLoading] = useState(false);

  const scenarioTypes = preferences?.scenario_types || ["No types found"];
  const navigate = useNavigate();

  // Fetch scenarios
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true);
        const response = await api.get("/scenarios");
        const data = response.data.scenarios.map((s: any) => ({
          ...s.scenario_data,
        }));
        setScenarios(data);
      } catch (err) {
        console.error("Failed to fetch scenarios", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
  }, []);

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

  return (
    <div style={{ background: "#fafafa", height: "100vh" }}>
      <PageHeader
        title="Scenario Walkthroughs"
        subtitle="Explore and complete available training scenarios."
      />

      {/* Filters */}
      <Form form={form} layout="vertical" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 12]}>
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="Scenario Type" name="type">
              <Select
                value={selectedScenarioType}
                options={[
                  { label: "All", value: "All" },
                  ...scenarioTypes.map((type) => ({
                    label: type,
                    value: type,
                  })),
                ]}
                onChange={setSelectedScenarioType}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={10}>
            <Form.Item label="Search by name" name="q">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search scenarios..."
                allowClear
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={2}>
            <Space
              className="w-full"
              style={{
                height: "100%",
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              <Button
                className="border-btn"
                icon={<ReloadOutlined />}
                onClick={() => {
                  form.resetFields();
                  setSelectedScenarioType("All");
                  setSearchQuery("");
                }}
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      {/* Results */}
      <Text strong style={{ display: "block", marginBottom: 12 }}>
        {filteredScenarios.length} scenarios found
      </Text>

      {/* Grouped Scenarios */}
      {sortedTypes.length > 0 ? (
        sortedTypes.map((type) => (
          <div key={type} style={{ marginBottom: 48 }}>
            <Title level={4} style={{ color: "#8C2131" }}>
              {type}
            </Title>
            <Divider style={{ margin: "8px 0 24px" }} />

            <Row gutter={[24, 24]}>
              {grouped[type].map((scenario, index) => (
                <Col
                  key={`${type}-${index}`}
                  xs={24}
                  sm={12}
                >
                  <ScenarioCard
                    name={scenario.name}
                    completed={false}
                    questionCount={scenario.scenes?.length || 0}
                    onClick={() =>
                      navigate("view-scenario", { state: { scenario } })
                    }
                  />
                </Col>
              ))}
            </Row>
          </div>
        ))
      ) : (
        <Empty
          description="No scenarios available"
          style={{ marginTop: 64 }}
        />
      )}
    </div>
  );
}
