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
import ListCard from "../../Shared/ListCard";
import { UniversalContext } from "../../../contexts/UniversalHelpers";
import { api } from "../../../utils/api";
import type {  Exercise,  } from "../../../types/index.types";
import { AuthContext } from "../../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { set } from "lodash";

const { Title } = Typography;

export default function UserViewKnowledgeChecks() {
  const [form] = Form.useForm();
  const { preferences } = useContext(UniversalContext);

  const [selectedExerciseType, setSelectedExerciseType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const exerciseTypes = preferences?.exercise_types || ["No types found"];

  const navigate = useNavigate();
    const { user } = useContext(AuthContext);
  // Fetch exercises from database

  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
useEffect(() => {
  const fetchCompletedExercises = async () => {
    if (!user) return;

    try {
      const response = await api.get(`/submissions/${user.id}`);
      setCompletedExercises(response.data);
    } catch (err) {
      console.error("❌ Failed to fetch completed exercises:", err);
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await api.get("/exercises");
      setExercises(response.data);
    } catch (err) {
      console.error("❌ Failed to fetch exercises:", err);
    }
  };

  fetchCompletedExercises();
  fetchExercises();
}, [user]);


  // Apply filters (type + search)
  const filteredExercises = exercises.filter((e) => {
    const matchesType =
      selectedExerciseType === "All" || e.type === selectedExerciseType;
    const matchesSearch =
      searchQuery === "" ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Group exercises by type
  const grouped = filteredExercises.reduce(
    (acc: Record<string, Exercise[]>, exercise) => {
      if (!acc[exercise.type]) {
        acc[exercise.type] = [];
      }
      acc[exercise.type].push(exercise);
      return acc;
    },
    {}
  );

  // Sort group headings alphabetically
  const sortedTypes = Object.keys(grouped).sort();

  return (
    <div className="p-5">
      <PageHeader
        title="Knowledge Checks"
        subtitle="Explore and complete available exercises"
      />

      {/* Filters */}
      <Form form={form} layout="vertical">
        <Row gutter={[16, 12]}>
          <Col xs={24} sm={12} md={4}>
            <Form.Item label="Exercise Type" name="type">
              <Select
                defaultValue={selectedExerciseType}
                options={[
                  { label: "All", value: "All" },
                  ...exerciseTypes.map((type) => ({
                    label: type,
                    value: type,
                  })),
                ]}
                onChange={(value) => setSelectedExerciseType(value)}
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
                  setSelectedExerciseType("All");
                  setSearchQuery("");
                }}
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      <p>{filteredExercises.length} exercises found</p>

      {/* Grouped Exercises */}
      {sortedTypes.map((type) => (
        <div key={type} style={{ marginBottom: 32 }}>
          <Title level={4}>{type}</Title>
          <Divider style={{ margin: "8px 0 16px" }} />
          <Space wrap size="large">
            {grouped[type].map((exercise, index) => (
            <ListCard
  key={`${type}-${index}`}
  name={exercise.name}
  description={"test"}
  type={exercise.type}
  completed={completedExercises.includes(exercise.id)} // ✅ ✅
  onClick={() =>
    navigate("view-exercise", { state: { exerciseId: exercise.id } })
  }
/>

            ))}
          </Space>
        </div>
      ))}
    </div>
  );
}
