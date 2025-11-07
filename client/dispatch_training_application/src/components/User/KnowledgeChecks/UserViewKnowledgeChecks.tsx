import {
  Button,
  Col,
  Row,
  Select,
  Form,
  Input,
  Typography,
  Modal,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import { checkIsMobile } from "../../../contexts/AuthProvider";
import { AuthContext } from "../../../contexts/AuthProvider";
import { UniversalContext } from "../../../contexts/UniversalHelpers";
import UserPageHeader from "../../Shared/UserPageHeader";
import KnowledgeCheckCard from "../../Shared/ListCard"; // your updated card
import dayjs from "dayjs";



import type { Exercise } from "../../../types/index.types";
import KnowledgeCheckResults from "./components/KnowledgeCheckResults";

const { Title, Text } = Typography;

export default function UserViewKnowledgeChecks() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { preferences } = useContext(UniversalContext);
  const [showResultModal, setShowResultModal] = useState(false);
const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);


  const [selectedExerciseType, setSelectedExerciseType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [submittedMap, setSubmittedMap] = useState<Record<string, boolean>>({});


  const exerciseTypes = preferences?.exercise_types || ["No types found"];

  // Fetch exercises + completed
  useEffect(() => {
    if (!user) return;

   const fetchExercises = async () => {
  try {
    const res = await api.get("/exercises");
    const exercisesData: Exercise[] = res.data;
    setExercises(exercisesData);

    const userId = user.id;
    const submissionRes = await api.get(`/submissions/exercises/${userId}`);
    const completedMap = submissionRes.data?.exerciseIds.reduce((acc: Record<string, boolean>, id: string) => {
      acc[id] = true;
      return acc;
    }, {});
    setSubmittedMap(completedMap || {});

  } catch (err) {
    console.error("❌ Error fetching exercises or submission statuses:", err);
  }
};


    fetchExercises();
  }, [user]);

  // Filter + group exercises
const userRole = user?.role?.toLowerCase() + "s"; // e.g. "trainee" or "dispatcher"



const filteredExercises = exercises.filter((e) => {
  // must be visible
  const isVisible = e.visibility === true;

  // must match audience (or 'all')
  const matchesAudience =
    e.audience === "All" ||
    (userRole && e.audience?.toLowerCase() === userRole);

  // must match selected type
  const matchesType =
    selectedExerciseType === "All" || e.type === selectedExerciseType;

  // must match search term
  const matchesSearch =
    searchQuery.trim() === "" ||
    e.name.toLowerCase().includes(searchQuery.toLowerCase());

  return isVisible && matchesAudience && matchesType && matchesSearch;
});

  const grouped = filteredExercises.reduce((acc: Record<string, Exercise[]>, exercise) => {
    if (!acc[exercise.type]) acc[exercise.type] = [];
    acc[exercise.type].push(exercise);
    return acc;
  }, {});
  const sortedTypes = Object.keys(grouped).sort();

  // Handle Card Click
  const handleCardClick = async (exercise: Exercise) => {
  if (submittedMap[exercise.id]) {
    try {
      const res = await api.get(`/submissions/${exercise.id}`);
      setSelectedSubmission({
        ...res.data,
      });
      setSelectedExercise(exercise);
      setShowResultModal(true);
    } catch (err) {
      console.error("❌ Failed to fetch previous submission:", err);
    }
  } else {
    navigate("view-exercise", { state: { exerciseId: exercise.id } });
  }
};


  return (
    <div style={{ height: "100vh", background: "#fff", display: "flex", flexDirection: "column" }}>
      <UserPageHeader
        title="Knowledge Checks"
        subtitle="Complete knowledge checks to test your understanding."
      />
<div style={{ 
          overflowY: "auto",}}>
      {/* Filter section (sticky) */}
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
                    ...exerciseTypes.map((type) => ({
                      label: type,
                      value: type,
                    })),
                  ]}
                  value={selectedExerciseType}
                  onChange={(value) => setSelectedExerciseType(value)}
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
                  setSelectedExerciseType("All");
                  setSearchQuery("");
                }}
              >
                Reset
              </Button>
            </Col>
            )}
          </Row>
        </Form>

        <Text type="secondary">{filteredExercises.length} exercises found</Text>
      </div>


      {/* Scrollable grouped exercises */}
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
              {grouped[type].map((exercise) => (
                <>

                <KnowledgeCheckCard
  key={exercise.id}
  type={"exercise"}
  name={exercise.name}
  date={dayjs(exercise.created_at).format("MMM D, YYYY")}
  completed={submittedMap[exercise.id] }
  questionCount={exercise.questions?.length || 0}
  onClick={() =>
    handleCardClick(exercise)
  }
/>
</>
              ))}
            </Row>
          </div>
        ))}
      </div>
      </div>


    {/* Result Modal */}
     <Modal
  open={showResultModal}
  centered
  width={800}
  closable={false}
  footer={
    <div style={{ textAlign: "right", marginTop: 16, marginBottom: 16 }}>
      <Button
        type="default"
        size="large"
        onClick={() => setShowResultModal(false)}
        style={{
          borderRadius: 8,
          fontWeight: 500,
        }}
      >
        Close
      </Button>
    </div>
  }
  modalRender={(node) => (
    <div style={{ maxHeight: "80vh", overflow: "auto" }}>{node}</div>
  )}
>
  {selectedSubmission ? (
    <KnowledgeCheckResults
      name={selectedExercise?.name}
      questions={selectedExercise?.questions || []}
      userAnswers={selectedSubmission?.answers || {}}
    />
  ) : (
    <Text type="secondary">Loading submission...</Text>
  )}
</Modal>


    </div>
  );
}

