import { Button, Card, Col, Row, Space, Form, Select, Input, Typography, Table, type TableColumnType, Tag, Tooltip, Popconfirm, Skeleton } from "antd";
import { PageHeader } from "../../Shared/PageHeader"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "../../../utils/api";
import { DeleteOutlined, EditOutlined, FileTextOutlined, ReloadOutlined, SearchOutlined, SnippetsOutlined } from "@ant-design/icons";
import type {  ScenarioTableType } from "../../../types/index.types";
import ViewScenarioModal from "./components/ViewScenarioModal";
import { getUser } from "../../../contexts/AuthProvider";
import { TableViewer } from "../../Shared/TableViewer";
import { scenarioTableColumns } from "../../../data/data";
import { scenarioFilterOptions } from "../../../data/data";
export default function ViewScenarios() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const user = getUser();
  const [selectedScenarioType, setSelectedScenarioType] = useState<string | null>("All Types");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [scenarioFiles, setScenarioFiles] = useState<ScenarioTableType[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioTableType | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  

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
      setLoading(true);
      try {
        const { data } = await api.get('/scenarios');
        setScenarioFiles(data.scenarios.map((scenario: any) => ({
          id: scenario.id,
          authorId: scenario.author_id,
          name: scenario.scenario_data?.name || "Untitled",
          type: scenario.scenario_data?.type || "Unknown",
          difficulty: scenario.scenario_data?.difficulty || "N/A",
          questionCount: scenario.scenario_data?.scenes?.length || 0,
          status: scenario.scenario_data?.status || "draft",
          audience: scenario.scenario_data?.audience || "N/A",
          scenes: scenario.scenario_data?.scenes || [],
          created_by: {
            name: scenario.author_name || "Unknown",
            avatar_url: scenario.author_avatar || "/assets/avatars/avatar1.svg",
          },
        })));

        console.log("✅ Fetched scenarios from DB.");
      } catch (error) {
        console.error("❌ Failed to fetch scenarios:", error);
        toast.error("Failed to load scenarios");
      } finally {
        setLoading(false);
      }
    }

    fetchScenarios();
  }, []);


  const scenarioTypes = [
    "All Types",
    ...Array.from(new Set(scenarioFiles.map(s => s.type).filter(Boolean)))
  ];
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
    questionCount: file.questionCount,
    status: file.status,
    audience: file.audience,
    scenes: file.scenes,
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

  const scenarioTableColumnsd: TableColumnType<ScenarioTableType>[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Typography.Text style={{ fontSize: 14, color: "#262626", whiteSpace: "nowrap" }}>
          {text}
        </Typography.Text>),
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
          {record.questionCount}{" "}
          {record.questionCount === 1 ? "question" : "questions"}

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
                setSelectedScenario(record);
                setViewModalOpen(true);
              }}
            >View</Button>
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              variant="filled"
              onClick={() => {
                navigate(`/scenario-manager/edit-scenario/`, {
                  state: { scenarioId: record.id },
                });
              }}
            >Edit</Button>
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure to delete this scenario?"
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
              onConfirm={async () => {

                // try {
                //   const response = await api.delete(`/scenarios/${record.id}`, {
                //     data: { authorId: record.authorId }, // optional: verify ownership
                //   });
                //   if (response.status === 200) {
                //     setScenarioFiles(prev => prev.filter(s => s.id !== record.id));
                //     toast.success("Scenario deleted successfully.");
                //   }
                // } catch (error) {
                //   console.error("Error deleting scenario:", error);
                //   toast.error("Failed to delete scenario");
                // }


                try{
                  await api.post('/trash', { trash_item_id: record.id, who_deleted: user?.id, item_type: 'scenario' });
                  // alert(record.id + " -----" + record.created_by.id);
                  // await api.post('/trash', { trash_item_id: record.id, who_deleted: record.created_by.id, item_type: 'scenario' });
                  toast.success("Scenario moved to trash");
                  setScenarioFiles((prev) =>
                    prev.filter((file) => file.id !== record.id)
                  );
                } catch (error) {
                  console.error("Error moving scenario to trash:", error);
                  toast.error("Failed to move scenario to trash");
                }
              }}
            >
              <Button type="text" variant="filled" color="red" icon={<DeleteOutlined />} >Delete</Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Fixed Page Header */}
        <PageHeader title="View Scenarios" subtitle="Filter, search and manager scenarios"  />

        <TableViewer tableType="Scenario" columnDefinitions={scenarioTableColumns} columnData={scenarioData} filterOptions={scenarioFilterOptions} />
   
     


        {/* <Card
          style={{ margin: "1.5rem", overflowX: "auto" }}
          bodyStyle={{ padding: 16 }}
        >
          {loading ? (
            <>
              <Space direction="vertical" size={2} style={{ width: "100%", padding: "4px 0" }}>
                <Skeleton.Input active style={{ width: 200, height: 28 }} />
                <Skeleton.Input active style={{ width: 150, height: 20 }} />
              </Space>
              <div className="mt-2">
                <Skeleton active paragraph={{ rows: 8 }} />
              </div>
            </>
          ) : (
            <>
              <Space
                direction="vertical"
                size={2}
                style={{
                  width: "100%",
                  padding: "4px 0",
                }}
              >
                <Space>
                  <FileTextOutlined style={{ fontSize: 26, color: "#8C2131" }} />
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

              <div className="overflow-auto mt-2" style={{ maxHeight: "60vh" }}>
                <Table
                  rowKey="id"
                  columns={scenarioTableColumns}
                  dataSource={filteredData}
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showQuickJumper: true,
                    showTotal: (total) => `Total ${total} scenarios`,
                  }}
                  scroll={{
                    y: 400,
                    x: "max-content",
                  }}
                  sticky
                  bordered

                />
              </div>
            </>
          )}
        </Card> */}

      {/* <ViewScenarioModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        scenario={selectedScenario}
      /> */}

    </div>
  )
}