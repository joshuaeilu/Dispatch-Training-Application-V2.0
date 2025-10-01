
import { Button, Card, Col, Row, Space, Form, Select, Input, Typography, Table, type TableColumnType, Tag, Tooltip, Popconfirm } from "antd";
import { PageHeader } from "../../Shared/PageHeader"
import { useNavigate } from "react-router-dom"
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "../../../utils/api";
import { DeleteOutlined, EditOutlined, FileTextOutlined, ReloadOutlined, SearchOutlined, SnippetsOutlined } from "@ant-design/icons";
import type { Scenario, ScenarioTableType } from "../../../types/index.types";
import { UniversalContext } from "../../../contexts/UniversalHelpers";
export default function ViewScenarios() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedScenarioType, setSelectedScenarioType] = useState<string | null>("All Types");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [scenarioFiles, setScenarioFiles] = useState<ScenarioTableType[]>([]);

  const handleResetFilteredFields = () => {
    form.resetFields();
    setSelectedScenarioType("All Types");
    setSelectedDifficulty(null);
    setSelectedStatus(null);
    setSearchQuery("");
  };

  // Get all scenarios from the database
  useEffect(() => {
    async function fetchScenarios() {
      try {
        const { data } = await api.get('/scenarios');
        setScenarioFiles(data.scenarios.map((scenario: any) => ({
          id: scenario.id,
          authorId: scenario.author_id,
          name: scenario.scenario_data?.name || "Untitled",
          type: scenario.scenario_data?.type || "Unknown",
          difficulty: scenario.scenario_data?.difficulty || "N/A",
          questionsCount: scenario.scenario_data?.scenes?.length || 0,
          status: scenario.status,
          audience: scenario.scenario_data?.audience || "N/A",
          created_by: {
            name: scenario.author_name || "Unknown",
            avatar_url: scenario.author_avatar || "/assets/avatars/avatar1.svg",
          },
        })));

        console.log("✅ Fetched scenarios from DB.");
      } catch (error) {
        console.error("❌ Failed to fetch scenarios:", error);
      }
    }

    fetchScenarios();
  }, []);

  const { preferences } = useContext(UniversalContext);

  const scenarioTypes = (["All Types", preferences?.scenario_types].flat()).filter(t => t !== "Custom")
  const scenarioDifficultyOptions = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ];
  const scenarioStatusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
  ];




  const scenarioData: ScenarioTableType[] = scenarioFiles.map(file => ({
    id: file.id,
    authorId: file.authorId,
    name: file.name,
    type: file.type,
    difficulty: file.difficulty,
    questionsCount: file.questionsCount,
    status: file.status,
    audience: file.audience,
    created_by: file.created_by
  }));


  // Helper to match the name or type
  const matchesQuery = (ex: ScenarioTableType) => {
    const query = searchQuery.toLowerCase();
    return (
      ex.name.toLowerCase().includes(query) ||
      ex.type.toLowerCase().includes(query)
    );
  };

  const searchFilteredScenarios = scenarioData.filter(matchesQuery);

  const filteredData = searchFilteredScenarios.filter(ex => {
    const matchesType =
      selectedScenarioType === "All Types" || ex.type === selectedScenarioType;

    const matchesDifficulty =
      !selectedDifficulty || ex.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

    const matchesStatus =
      !selectedStatus || ex.status?.toLowerCase() === selectedStatus.toLowerCase();

    return matchesType && matchesDifficulty && matchesStatus;
  });


  const scenarioTableColumns: TableColumnType<ScenarioTableType>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span style={{ fontWeight: 500, fontSize: "16px" }}>{text}</span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text: string) => (
        <span style={{ fontSize: "14px" }}>{text}</span>
      ),
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      key: "difficulty",
      render: (difficulty: string) => (
        <Tag
          className="table-tag"
          color={
            difficulty === "Easy"
              ? "green"
              : difficulty === "Medium"
                ? "orange"
                : "red"
          }

        >
          {difficulty}
        </Tag>
      ),
    },
    {
      title: "Count",
      dataIndex: "questionCount",
      key: "questionCount",
      align: "center",
      render: (_: any, record: ScenarioTableType) => (
        <Tag
          className="table-tag"

        >
          {record.questionsCount}{" "}
          {record.questionsCount === 1 ? "question" : "questions"}

        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: string) => (
        <Tag
          className="table-tag"

          color={status === "published" ? "blue" : "default"}

        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Audience",
      dataIndex: "audience",
      key: "audience",
      align: "center",
      render: (audience: string) => (
        <Tag
          className="table-tag"
          color={"default"}

        >
          {audience}
        </Tag>
      ),
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      render: (created_by: { id: string; name: string; avatar_url: string }) => (
        <Space>
          <img
            src={created_by.avatar_url}
            alt={created_by.name}
            style={{ width: 32, height: 32, borderRadius: "50%" }}
          />
          <span>{created_by.name}</span>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_: any, record: ScenarioTableType) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="text"
              icon={<SnippetsOutlined />}
              variant="filled"
              color="geekblue"

              onClick={() => {
                navigate(`/scenario-manager/view-scenario/`, { state: { scenario: record } });
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              variant="filled"
              color="blue"
              onClick={() => {
                navigate(`/scenario-manager/edit-scenario/`, {
                  state: { scenario: record },
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure to delete this scenario?"
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
              onConfirm={async () => {

                try {
                  const response = await api.delete(`/scenarios/${record.id}`, {
                    data: { authorId: record.authorId }, // optional: verify ownership
                  });
                  if (response.status === 200) {
                    setScenarioFiles(prev => prev.filter(s => s.id !== record.id));
                    toast.success("Scenario deleted successfully.");
                  }
                } catch (error) {
                  console.error("Error deleting scenario:", error);
                  toast.error("Failed to delete scenario");
                }
              }}
            >
              <Button type="text" variant="filled" color="red" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 18, maxWidth: "100%", background: "#f5f5f5" }}>
      
        <PageHeader title="View Scenarios" subtitle="Filter, search and manager scenarios" showAddButton addButtonText="Add Scenario" onAdd={() => navigate("/scenario-manager/add-scenario")} />
      
      {/* Filters */}
      <Card className="shadow-soft mb-4">
        <Form
          form={form}
          layout="vertical"
        // onValuesChange={() => setPage(1)}
        >
          <Row gutter={[16, 12]}>
            <Col xs={24} sm={12} md={4}>
              <Form.Item label="Type" name="type">
                <Select defaultValue={selectedScenarioType} options={scenarioTypes?.map(type => ({ label: type, value: type }))} onChange={(value) => setSelectedScenarioType(value)} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item label="Difficulty" name="difficulty">
                <Select placeholder="Select difficulty" options={scenarioDifficultyOptions} onChange={(value) => setSelectedDifficulty(value)} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item label="Status" name="status">
                <Select placeholder="Select status" options={scenarioStatusOptions} onChange={(value) => setSelectedStatus(value)} />
              </Form.Item>
            </Col>


            <Col xs={24} md={10} >
              <Form.Item label="Search by name" name="q">
                <Input prefix={<SearchOutlined />} placeholder="Type to search…" allowClear onChange={(e) => setSearchQuery(e.target.value)}
                  onPressEnter={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={2} >
              <Space className="w-full justify-center" style={{ alignItems: "center", justifyContent: "center", alignContent: "center", height: "100%", width: "100%" }}>
                <Button
                  className="border-btn"
                  size="middle"
                  icon={<ReloadOutlined />}
                  onClick={handleResetFilteredFields}
                >
                  Reset
                </Button>

              </Space>
            </Col>
          </Row>
        </Form>
      </Card>


      <Card
        style={{
          marginTop: 16,
          width: "100%",

        }}
        bodyStyle={{ padding: 16 }}
      >
        <Space
          direction="vertical"
          size={2}
          style={{
            width: "100%",
            padding: "4px 0",
          }}
        >
          <Space>
            <FileTextOutlined style={{ fontSize: 24, color: "var(--color-primary, #1677ff)" }} />
            <Typography.Title
              level={4}
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: "20px",
                color: "var(--color-heading, #1f1f1f)",
              }}
            >
              {selectedScenarioType === "All Types" ? "All Scenarios" : selectedScenarioType}
            </Typography.Title>
          </Space>

          <Typography.Text
            type="secondary"
            style={{
              fontSize: "14px",
              color: "var(--color-text-secondary, #888)",
            }}
          >
            {filteredData.length} {filteredData.length === 1 ? "scenario" : "scenarios"} found
          </Typography.Text>
        </Space>

        <div className="overflow-auto mt-2">
          <Table
            rowKey="id"
            columns={scenarioTableColumns}
            dataSource={filteredData}
            pagination={false}
          >

          </Table>
        </div>
      </Card>

    </div>
  )
}