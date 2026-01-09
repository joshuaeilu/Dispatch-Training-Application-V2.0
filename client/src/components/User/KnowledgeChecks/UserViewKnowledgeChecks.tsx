import {
  Button,
  Col,
  Row,
  Select,
  Form,
  Input,
  Typography,
  Modal,
  Skeleton,
  Empty,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import { AuthContext } from "../../../contexts/AuthProvider";
import { UniversalContext } from "../../../contexts/UniversalHelpers";
import UserPageHeader from "../../Shared/UserPageHeader";
import KnowledgeCheckCard from "../../Shared/ListCard";
import dayjs from "dayjs";

import type { Exercise } from "../../../types/index.types";
import KnowledgeCheckResults from "./components/KnowledgeCheckResults";

const { Title, Text } = Typography;
type Submission = {
  id: string;
  exerciseId: string;
  userId: string;
  answers: Record<string, unknown>;
  createdAt: string;
};

export default function UserViewKnowledgeChecks() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { preferences } = useContext(UniversalContext);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);

  const [selectedExerciseType, setSelectedExerciseType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [submittedMap, setSubmittedMap] = useState<Record<string, boolean>>({});

  const exerciseTypes = preferences?.exercise_types || ["No types found"];

  // Fetch exercises + completed
  useEffect(() => {
    if (!user) return;

    const fetchExercises = async () => {
      setLoadingExercises(true);
      try {
        const res = await api.get("/exercises");
        const exercisesData: Exercise[] = res.data;
        setExercises(exercisesData);

        const userId = user.id;
        const submissionRes = await api.get(`/submissions/exercises/${userId}`);
        const completedMap = submissionRes.data?.exerciseIds.reduce(
          (acc: Record<string, boolean>, id: string) => {
            acc[id] = true;
            return acc;
          },
          {}
        );
        setSubmittedMap(completedMap || {});
      } catch (err) {
        console.error("❌ Error fetching exercises or submission statuses:", err);
      } finally {
        setLoadingExercises(false);
      }
    };

    fetchExercises();
  }, [user]);

  // Filter + group exercises
  const userRole = user?.role?.toLowerCase() + "s";

  const filteredExercises = exercises.filter((e) => {
    const isVisible = e.visibility === true;
    const matchesAudience =
      e.audience === "All" ||
      (userRole && e.audience?.toLowerCase() === userRole);
    const matchesType =
      selectedExerciseType === "All" || e.type === selectedExerciseType;
    const matchesSearch =
      searchQuery.trim() === "" ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase());

    return isVisible && matchesAudience && matchesType && matchesSearch;
  });

  const grouped = filteredExercises.reduce(
    (acc: Record<string, Exercise[]>, exercise) => {
      if (!acc[exercise.type]) acc[exercise.type] = [];
      acc[exercise.type].push(exercise);
      return acc;
    },
    {}
  );
  const sortedTypes = Object.keys(grouped).sort();

  // Handle Card Click
  const handleCardClick = async (exercise: Exercise) => {
    if (submittedMap[exercise.id]) {
      setLoadingSubmission(true);
      try {
        const res = await api.get(`/submissions/${exercise.id}`, {
          params: { userId: user?.id },
        });
        setSelectedSubmission({
          ...res.data,
        });
        setSelectedExercise(exercise);
        setShowResultModal(true);
      } catch (err) {
        console.error("❌ Failed to fetch previous submission:", err);
      } finally {
        setLoadingSubmission(false);
      }
    } else {
      navigate("view-exercise", { state: { exerciseId: exercise.id } });
    }
  };

  // Skeleton for exercise cards
  const renderExerciseSkeletons = () => (
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
        height: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <UserPageHeader
        title="Knowledge Checks"
        subtitle="Complete knowledge checks to test your understanding."
      />
      <div
        style={{
          overflowY: "auto",
        }}
      >
        {/* Filter section (sticky) */}
        <div
          style={{
            padding: "1rem 1.5rem",
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
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
                    placeholder="Select Exercise type"
                    options={[
                      { label: "All", value: "All" },
                      ...exerciseTypes.map((type) => ({
                        label: type,
                        value: type,
                      })),
                    ]}
                    value={selectedExerciseType}
                    onChange={(value) => setSelectedExerciseType(value)}
                    disabled={loadingExercises}
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
                    disabled={loadingExercises}
                  />
                </Form.Item>
              </Col>

              {/* {!checkIsMobile() && (
                <Col xs={24} md={4}>
                  <Button
                    size="large"
                    className="border-btn"
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      form.resetFields();
                      setSelectedExerciseType("All");
                      setSearchQuery("");
                    }}
                    disabled={loadingExercises}
                  >
                    Reset
                  </Button>
                </Col>
              )} */}
            </Row>
          </Form>

          {loadingExercises ? (
            <Skeleton.Input
              active
              size="small"
              style={{ width: 150, marginTop: 8 }}
            />
          ) : (
            <Text type="secondary">
              {filteredExercises.length} exercises found
            </Text>
          )}
        </div>

        {/* Scrollable grouped exercises */}
        <div
          style={{
            flex: 1,
            padding: "1rem 1.5rem",
          }}
        >
          {loadingExercises ? (
            <>
              {renderExerciseSkeletons()}
              {renderExerciseSkeletons()}
            </>
          ) : sortedTypes.length === 0 ? (
            <Empty
              description="No exercises found"
              style={{ padding: "60px 0" }}
            />
          ) : (
            sortedTypes.map((type) => (
              <div key={type} style={{ marginBottom: "1.5rem" }}>
                <Title level={4} style={{ marginBottom: 16 }}>
                  {type}
                </Title>
                <Row gutter={[16, 16]}>
                  {grouped[type].map((exercise) => (
                    <KnowledgeCheckCard
                      key={exercise.id}
                      type={"exercise"}
                      name={exercise.name}
                      date={dayjs(exercise.created_at).format("MMM D, YYYY")}
                      completed={submittedMap[exercise.id]}
                      questionCount={exercise.questions?.length || 0}
                      onClick={() => handleCardClick(exercise)}
                    />
                  ))}
                </Row>
              </div>
            ))
          )}
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
          setSelectedExercise(null);
        }}
        footer={
          <div style={{ textAlign: "right", marginTop: 16, marginBottom: 16 }}>
            <Button
              type="default"
              size="large"
              onClick={() => {
                setShowResultModal(false);
                setSelectedSubmission(null);
                setSelectedExercise(null);
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
            <Skeleton active paragraph={{ rows: 6 }} style={{ marginTop: 24 }} />
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