import {
  Button,
  Modal,
  Skeleton,
  Empty,
  Tag,
} from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import { AuthContext } from "../../../contexts/AuthProvider";
import UserPageHeader from "../../Shared/UserPageHeader";
import { TableViewer } from "../../Shared/TableViewer";
import dayjs from "dayjs";

import type { Exercise, TableColumnDef } from "../../../types/index.types";
import KnowledgeCheckResults from "./components/KnowledgeCheckResults";

type Submission = {
  id: string;
  exerciseId: string;
  userId: string;
  answers: Record<string, unknown>;
  createdAt: string;
};

interface ExerciseTableData extends Exercise {
  completed: boolean;
  questionCount: number;
}

export default function UserViewKnowledgeChecks() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [submittedMap, setSubmittedMap] = useState<Record<string, boolean>>({});

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

  // Filter exercises
  const userRole = user?.role?.toLowerCase() + "s";

  const filteredExercises = exercises.filter((e) => {
    const isVisible = e.visibility === true;
    const matchesAudience =
      e.audience === "All" ||
      (userRole && e.audience?.toLowerCase() === userRole);

    return isVisible && matchesAudience;
  });

  // Prepare table data
  const tableData: ExerciseTableData[] = filteredExercises.map((e) => ({
    ...e,
    completed: submittedMap[e.id] || false,
    questionCount: e.questions?.length || 0,
  }));

  // Handle Row Click
  const handleRowClick = async (exercise: ExerciseTableData) => {
    if (exercise.completed) {
      setLoadingSubmission(true);
      try {
        const res = await api.get(`/submissions/${exercise.id}`, {
          params: { userId: user?.id },
        });
        setSelectedSubmission({
          ...res.data,
        });
        setSelectedExercise(exercise as Exercise);
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

  // Get unique exercise types
  const exerciseTypes = Array.from(
    new Set(tableData.map((e) => e.type).filter(Boolean))
  );

  const filterOptions = {
    type: exerciseTypes,
  };

  // Define table columns
  const knowledgeCheckColumns: TableColumnDef<ExerciseTableData>[] = [
    {
      key: "name",
      header: "Name",
      align: "text-left",
      render: (e: ExerciseTableData) => (
        <span className="font-medium text-gray-900 text-base">{e.name}</span>
      ),
      searchable: true,
      filterable: false,
    },
    {
      key: "type",
      header: "Type",
      align: "text-left",
      render: (e: ExerciseTableData) => <span className="text-base">{e.type}</span>,
      searchable: false,
      filterable: true,
    },
    {
      key: "questionCount",
      header: "Questions",
      align: "text-center",
      render: (e: ExerciseTableData) => (
        <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-0.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
          {e.questionCount} {e.questionCount === 1 ? "question" : "questions"}
        </span>
      ),
      searchable: false,
      filterable: false,
    },
    {
      key: "completed",
      header: "Status",
      align: "text-center",
      render: (e: ExerciseTableData) =>
        e.completed ? (
          <Tag
            icon={<CheckCircleOutlined />}
            style={{
              borderRadius: "999px",
              padding: "4px 12px",
              fontSize: 13,
              height: "auto",
              lineHeight: "20px",
              backgroundColor: "#F0FDF4",
              color: "#15803D",
              border: "1px solid #4ADE80",
              fontWeight: 500,
            }}
          >
            Completed
          </Tag>
        ) : (
          <Tag
            icon={<ClockCircleOutlined />}
            style={{
              borderRadius: "999px",
              padding: "4px 12px",
              fontSize: 13,
              height: "auto",
              lineHeight: "20px",
              backgroundColor: "#FEF3C7",
              color: "#92400E",
              border: "1px solid #FBBF24",
              fontWeight: 500,
            }}
          >
            Not Started
          </Tag>
        ),
      searchable: false,
      filterable: false,
    },
    {
      key: "created_at",
      header: "Created",
      align: "text-center",
      render: (e: ExerciseTableData) => (
        <span className="text-base text-gray-600">
          {dayjs(e.created_at).format("MMM D, YYYY")}
        </span>
      ),
      searchable: false,
      filterable: false,
    },
    {
      header: "Action",
      align: "text-center",
      render: (e: ExerciseTableData) => (
        <button
          onClick={() => handleRowClick(e)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-base font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
          style={{
            backgroundColor: e.completed ? "#FED7AA" : "#EFF6FF",
            color: e.completed ? "#92400E" : "#0369A1",
            border: `1.5px solid ${e.completed ? "#F59E0B" : "#0EA5E9"}`,
          }}
        >
          {e.completed ? (
            <>
              See Results
            </>
          ) : (
            <>
              <PlayCircleOutlined style={{ fontSize: 16 }} />
              Start
            </>
          )}
        </button>
      ),
      searchable: false,
      filterable: false,
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <UserPageHeader
        title="Knowledge Checks"
        subtitle="Complete knowledge checks to test your understanding."
      />
      <TableViewer
        columnDefinitions={knowledgeCheckColumns}
        columnData={tableData}
        filterOptions={filterOptions}
        loading={loadingExercises}
      />

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