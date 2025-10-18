import {
  Button,
  Col,
  Row,
  Select,
  Form,
  Input,
  Typography,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import ScenarioCard from "../../Shared/ListCard";
import { UniversalContext } from "../../../contexts/UniversalHelpers";
import { api } from "../../../utils/api";
import type { Scenario } from "../../../types/index.types";
import { useNavigate } from "react-router-dom";
import UserPageHeader from "../../Shared/UserPageHeader";
import { checkIsMobile } from "../../../contexts/AuthProvider";

const { Title, Text } = Typography;

export default function UserViewScenarios() {
  const [form] = Form.useForm();
  const { preferences } = useContext(UniversalContext);
const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const [selectedScenarioType, setSelectedScenarioType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [__, setLoading] = useState(false);

  const scenarioTypes = preferences?.scenario_types || ["No types found"];
  const navigate = useNavigate();

  // Fetch completion status map
  async function fetchScenarioCompletionMap(scenarioIds: string[]) {
  if (!scenarioIds.length) return {};

  try {
    const res = await api.get("/submissions/scenario_walkthrough/status", {
      params: { scenario_ids: scenarioIds },
    });
    setCompletedMap(res.data.completedMap);

  } catch (err) {
    console.error("❌ Error fetching scenario completion map:", err);
    return {};
  }
}


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

      // 👉 Extract IDs and fetch completion map
      const scenarioIds = data.map((s: any) => s.id);
      await fetchScenarioCompletionMap(scenarioIds);
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
    <div style={{ background: "#fff", height: "100vh",  
 }}>
   
   <UserPageHeader title="Scenarios" subtitle="Explore and complete available training scenarios." />

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
        <Form form={form} layout="vertical" >
          <Row gutter={[16, 12]} >
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="type" style={{ marginBottom: 16 }}>
                <Select
                  size="large"
                  placeholder="Select Exercise type"
                  options={[
                    { label: "All", value: "All" },
                    ...scenarioTypes.map((type) => ({
                      label: type,
                      value: type,
                    })),
                  ]}
                  value={selectedScenarioType}
                  onChange={(value) => setSelectedScenarioType(value)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={10}>
              <Form.Item name="q" style={{ marginBottom: 0 }}>
                <Input
                  size="large"
                  prefix={<SearchOutlined />}
                  placeholder="Search by exercise name..."
                  allowClear
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              >
                Reset
              </Button>
            </Col>
            )}
          </Row>
        </Form>

        <Text type="secondary">{filteredScenarios.length} exercises found</Text>
      </div>


  

<div
        style={{
          flex: 1,
          padding: "1rem 1.5rem",
        }}
      >
        {sortedTypes.map((type) => (
          <div key={type} style={{ marginBottom: "1.5rem" }}>
            <Title level={4} style={{ marginBottom: 16 }}>{type}</Title>
            <Row gutter={[16, 16]}>
              {grouped[type].map((scenario, index) => (
             
               <ScenarioCard
  name={scenario.name}
  type={"scenario"}
  completed={completedMap[scenario.id] || false} // ✅ Pass status
  description={scenario.description || "No description provided."}
  questionCount={scenario.scenes?.length || 0}
  onClick={() =>
    navigate("view-scenario", { state: { scenario } })
  }
/>

              ))}
            </Row>
          </div>
        ))}
    </div>
    </div>
  );
}
