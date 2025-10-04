import { useContext, useEffect, useState } from "react";
import { Card, Row, Col, Form, Select, Input, Button, Table, Tag, Space, Tooltip, Popconfirm, message, type TableColumnType, Switch, Typography } from "antd";
import { ReloadOutlined, SearchOutlined, EditOutlined,  FileTextOutlined, DeleteOutlined, SnippetsOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import type { Exercise, ExerciseTableType } from "../../../types/index.types";
import {  AUDIENCE_COLORS, PROFILE_PIC_URL, STATUS_COLORS } from "../../../data/data";
import ViewExerciseModal from "./AddExercise/components/ViewExerciseModal";
import { PageHeader } from "../../Shared/PageHeader";
import {  exerciseDifficultyOptions, exerciseStatusOptions } from "../../../data/data";
import { UniversalContext } from "../../../contexts/UniversalHelpers";
import { AuthContext } from "../../../contexts/AuthProvider";
import { toTitleCase } from "../../../utils/tools";


export default function KnowledgeCheckViewExercises() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [exerciseFiles, setExerciseFiles] = useState<ExerciseTableType[]>([]);
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>("All Types");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewExerciseModal, setViewExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  
  const [messageApi, contextHolder] = message.useMessage();
  const { token } = useContext(AuthContext);


// Create a version of exerciseFiles that matches the TableType
  const exerciseData: ExerciseTableType[] = exerciseFiles.map(file => ({
    id: file.id,
    name: file.name,
    type: file.type,
    difficulty: file.difficulty,
    questionCount: file.questions.length,
    status: file.status,
    audience: file.audience,
    visibility: file.visibility,
    created_by: file.created_by,
    questions: file.questions,
  }));

  // Filter function that checks if an exercise matches the search query
  const matchesQuery = (ex: ExerciseTableType) => {
    const query = searchQuery.toLowerCase();
    return (
      ex.name.toLowerCase().includes(query) ||
      ex.type.toLowerCase().includes(query)
    );
  };

  // First filter by search query
  const searchFilteredExercises = exerciseData.filter(matchesQuery);
// Then apply type, difficulty, and status filters
  const filteredData = searchFilteredExercises.filter(ex => {
    const matchesType =
      selectedExerciseType === "All Types" || ex.type === selectedExerciseType;

    const matchesDifficulty =
      !selectedDifficulty || ex.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();

    const matchesStatus =
      !selectedStatus || ex.status?.toLowerCase() === selectedStatus.toLowerCase();

    return matchesType && matchesDifficulty && matchesStatus;
  });

// Reset all filters and search
  function handleResetFilteredFields() {
    form.resetFields();
    setSelectedExerciseType("All Types");
    setSelectedDifficulty(undefined);
    setSelectedStatus(undefined);
    setSearchQuery("");

  }






  // Get all exercise data from the database
  useEffect(() => {
    async function init() {
      try {
        const { data } = await api.get("/exercises");
        setExerciseFiles(data);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      }

    }

    init(); // call the async function
  }, []);





  const exerciseTableColumns: TableColumnType<ExerciseTableType>[] = [
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
            difficulty === "easy"
              ? "green"
              : difficulty === "medium"
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
      render: (_: any, record: ExerciseTableType) => (
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
          color={STATUS_COLORS[status] || "blue"}

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
          color={AUDIENCE_COLORS[audience] || "default"}

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
            src={PROFILE_PIC_URL+created_by.avatar_url + "?token=" + token}
            alt={created_by.name}
            style={{ width: 32, height: 32, borderRadius: "50%" }}
          />
          <span>{toTitleCase(created_by.name)}</span>
        </Space>
      ),
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      align: "center",
      key: "visibility",
      render: (visibility: boolean, record) => (
        <>
          <Switch
            size="small"
            checked={visibility}
            onChange={async (checked) => {
              try {
                const response = await api.patch(`/exercises/${record.id}`, { visibility: checked });
                if (response.status === 200) {
                  setExerciseFiles((prev) =>
                    prev.map((file) =>
                      file.id === record.id ? { ...file, visibility: checked } : file
                    )
                  );
                  messageApi.success("Visibility updated");
                }
              } catch (error) {
                messageApi.error("Failed to update visibility");
              }
            }}
          />
          <span>{visibility}</span>
        </>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_: any, record: ExerciseTableType) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="text"
              icon={<SnippetsOutlined />}
              variant="filled"
              color="geekblue"

              onClick={() => {
                const exercise: Exercise = {
                  id: record.id,
                  name: record.name,
                  type: record.type,
                  difficulty: record.difficulty,
                  questions: record.questions,
                  audience: record.audience,
                  createdBy: record.created_by.name,
                  status: record.status,
                  visibility: record.visibility,
                };
                setSelectedExercise(exercise);
                setViewExerciseModal(true);

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
                navigate(`/knowledge-check/edit-exercise/`, {
                  state: { exercise: record },
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure to delete this exercise?"
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
              onConfirm={async () => {
                try {
                  await api.delete(`/exercises/${record.id}`);
                  messageApi.success("Exercise deleted");
                  setExerciseFiles((prev) =>
                    prev.filter((file) => file.id !== record.id)
                  );
                } catch (error) {
                  messageApi.error("Failed to delete exercise");
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

  
const { preferences } = useContext(UniversalContext);


const exerciseTypes = (["All Types", preferences?.exercise_types].flat()).filter(t => t !== "Custom")



  return (
    <div  style={{ padding: 18, maxWidth: "100%", background: "#f5f5f5" }} >
      {/* Page Header */}
             <PageHeader title="View Exercises" subtitle="Filter, search and manager exercises" showAddButton addButtonText="Add Exercise" onAdd={() => navigate("/knowledge-checks/add-exercise")} />
     

      {/* Filters */}
      <Card className="shadow-soft mb-4">
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={[16, 12]}>
            <Col xs={24} sm={12} md={4}>
              <Form.Item label="Type" name="type">
                <Select defaultValue={selectedExerciseType} options={exerciseTypes?.map(type => ({ label: type, value: type }))} onChange={(value) => setSelectedExerciseType(value)} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item label="Difficulty" name="difficulty">
                <Select placeholder="Select difficulty" options={exerciseDifficultyOptions} onChange={(value) => setSelectedDifficulty(value)} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item label="Status" name="status">
                <Select placeholder="Select status" options={exerciseStatusOptions} onChange={(value) => setSelectedStatus(value)} />
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
              {selectedExerciseType === "All Types" ? "All Exercises" : selectedExerciseType}
            </Typography.Title>
          </Space>

          <Typography.Text
            type="secondary"
            style={{
              fontSize: "14px",
              color: "var(--color-text-secondary, #888)",
            }}
          >
            {filteredData.length} {filteredData.length === 1 ? "exercise" : "exercises"} found
          </Typography.Text>
        </Space>

        <div className="overflow-auto mt-2" style={{ maxHeight: "60vh" }}>
          <Table
            rowKey="id"
            columns={exerciseTableColumns}
            dataSource={filteredData}
            pagination={false}
          >

          </Table>
        </div>
      </Card>


      {/* View Exercise Modal */}
      {selectedExercise && (
        <ViewExerciseModal exercise={selectedExercise} setViewExerciseModal={setViewExerciseModal} viewExerciseModal={viewExerciseModal} />
      )}


      {contextHolder}
    </div>
  );
}