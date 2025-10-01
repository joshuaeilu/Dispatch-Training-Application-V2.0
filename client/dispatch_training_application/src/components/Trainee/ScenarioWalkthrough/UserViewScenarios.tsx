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
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { PageHeader } from "../../Shared/PageHeader";
import ScenarioCard from "../../Shared/ScenarioCard";
import { UniversalContext } from "../../../contexts/UniversalHelpers";
import { api } from "../../../utils/api";
import type { Scenario } from "../../../types/index.types";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export default function UserViewScenarios() {
  const [form] = Form.useForm();
  const { preferences } = useContext(UniversalContext);

  const [selectedScenarioType, setSelectedScenarioType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const scenarioTypes = preferences?.scenario_types || ["No types found"];

  const navigate = useNavigate();
  // Fetch scenarios from database
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await api.get("/scenarios");
        const data = response.data.scenarios.map((s: any) => ({
          ...s.scenario_data,
        }));
        setScenarios(data);
      } catch (err) {
        console.error("Failed to fetch scenarios", err);
      }
    };

    fetchScenarios();
  }, []);

  // Apply filters (type + search)
  const filteredScenarios = scenarios.filter((s) => {
    const matchesType =
      selectedScenarioType === "All" || s.type === selectedScenarioType;
    const matchesSearch =
      searchQuery === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Group scenarios by type
  const grouped = filteredScenarios.reduce(
    (acc: Record<string, Scenario[]>, scenario) => {
      if (!acc[scenario.type]) {
        acc[scenario.type] = [];
      }
      acc[scenario.type].push(scenario);
      return acc;
    },
    {}
  );

  // Sort group headings alphabetically
  const sortedTypes = Object.keys(grouped).sort();

  return (
    <div className="p-5">
      <PageHeader
        title="Scenario Walkthroughs"
        subtitle="Explore and complete available scenarios"
      />

      {/* Filters */}
      <Form form={form} layout="vertical">
        <Row gutter={[16, 12]}>
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="Scenario Type" name="type">
              <Select
                defaultValue={selectedScenarioType}
                options={[
                  { label: "All", value: "All" },
                  ...scenarioTypes.map((type) => ({
                    label: type,
                    value: type,
                  })),
                ]}
                onChange={(value) => setSelectedScenarioType(value)}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={10}>
            <Form.Item label="Search by name" name="q">
              <Input
                prefix={<SearchOutlined />}
                placeholder="Type to search…"
                allowClear
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={(e) =>
                  setSearchQuery((e.target as HTMLInputElement).value)
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={2}>
            <Space
              className="w-full justify-center"
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <Button
                className="border-btn"
                size="middle"
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

      <p>{filteredScenarios.length} scenarios found</p>

      {/* Grouped Scenarios */}
      {sortedTypes.map((type) => (
        <div key={type} style={{ marginBottom: 32 }}>
          <Title level={4}>{type}</Title>
          <Divider style={{ margin: "8px 0 16px" }} />
          <Space wrap size="large">
            {grouped[type].map((scenario, index) => (
              <ScenarioCard
                key={`${type}-${index}`}
                name={scenario.name}
                description={scenario.description}
                type={scenario.type}
                completed={ false}
                onClick={() => navigate("view-scenario", { state: { scenario } })}

              />
            ))}
          </Space>
        </div>
      ))}
    </div>
  );
}
