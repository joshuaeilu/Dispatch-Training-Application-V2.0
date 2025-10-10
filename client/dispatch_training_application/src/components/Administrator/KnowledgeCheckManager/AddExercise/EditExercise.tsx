import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { debounce } from "lodash";
import toast from "react-hot-toast";
import {
  Modal,
  Typography,
  Radio,
  type RadioChangeEvent,
  Skeleton,
  Space,
  Button,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import AddExerciseModal from "./components/AddExerciseModal";
import AddQuestionsSections from "./components/AddQuestions";
import ViewQuestions from "./components/ViewQuestions";

import { api } from "../../../../utils/api";
import type { Exercise } from "../../../../types/index.types";

const { Title, Text } = Typography;

export default function EditExercise() {
  const navigate = useNavigate();
  const location = useLocation();
  const { exerciseId } = location.state || {};

  // State declarations
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [lastSavedExercise, setLastSavedExercise] = useState<Exercise | null>(null);
  const [setupOpen, setSetupOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saveModal, setSaveModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autosaving, setAutosaving] = useState(false);

  // Debounced autosave function
  const debouncedSave = useRef(
    debounce(async (exercise, setLastSaved) => {
      try {
        setAutosaving(true);
        await api.put(`/exercises/${exercise.id}`, exercise);
        setLastSaved(exercise);
      } catch (err) {
        toast.error("Autosave failed", { id: "autosave" });
        console.error("❌ Autosave failed:", err);
      } finally {
        setAutosaving(false);
      }
    }, 7000)
  ).current;

  // Load initial exercise if editing, else initialize new
  useEffect(() => {
    async function loadExercise() {
      if (exerciseId) {
        try {
          const res = await api.get(`/exercises/${exerciseId}`);
          if (res.status === 200) {
            const exerciseData: Exercise = {
              id: res.data.id,
              name: res.data.name,
              type: res.data.type,
              difficulty: res.data.difficulty,
              audience: res.data.audience,
              status: res.data.status,
              createdBy: res.data.created_by.id,
              questions: res.data.questions,
            };
            setCurrentExercise(exerciseData);
            setLastSavedExercise(exerciseData);
            setSetupOpen(false);
            console.log("✅ Loaded existing exercise.");
          }
        } catch (err) {
          console.error("❌ Failed to load exercise:", err);
          toast.error("Failed to load exercise.");
          navigate("/knowledge-checks");
        } finally {
          setLoading(false);
        }
      } else {
        // Create a new empty exercise
        const newExercise: Exercise = {
          id: uuid(),
          name: "",
          type: "",
          difficulty: "Easy",
          audience: "All",
          status: "draft",
          createdBy: "Admin",
          questions: [
            {
              id: uuid(),
              question: "",
              answerType: "text-area",
              questionCategory: "",
              resource: null,
              options: [],
              correctOptions: [],
              tip: "",
            },
          ],
        };
        setCurrentExercise(newExercise);
        setLastSavedExercise(newExercise);
        setSetupOpen(true);
        setLoading(false);
      }
    }
    loadExercise();
  }, [exerciseId, navigate]);

  // Fetch the latest synced copy if needed
  useEffect(() => {
    async function fetchLatestExercise() {
      if (!currentExercise?.id) return;
      try {
        const res = await api.get(`/exercises/${exerciseId}`);
        if (res.status === 200) {
          const exerciseData: Exercise = {
            id: res.data.id,
            name: res.data.name,
            type: res.data.type,
            difficulty: res.data.difficulty,
            audience: res.data.audience,
            status: res.data.status,
            createdBy: res.data.created_by.id,
            questions: res.data.questions,
          };
          setCurrentExercise(exerciseData);
          setLastSavedExercise(exerciseData);
          console.log("🔄 Synced latest scenario from DB.");
        }
      } catch (err) {
        console.error("❌ Failed to fetch scenario sync:", err);
      }
    }
    if (exerciseId) fetchLatestExercise();
  }, [currentExercise?.id, exerciseId]);

  // Trigger autosave on state changes
  useEffect(() => {
    if (!currentExercise?.id || !lastSavedExercise) return;
    const hasChanged = JSON.stringify(currentExercise) !== JSON.stringify(lastSavedExercise);
    if (hasChanged) {
      setAutosaving(true);
      debouncedSave(currentExercise, setLastSavedExercise);
    }
  }, [currentExercise]);

  // Manual save handler
  async function handleSaveExercise() {
    if (!currentExercise?.id) return;
    try {
      await api.put(`/exercises/${currentExercise.id}`, currentExercise);
      toast.success("Exercise saved");
      navigate("/knowledge-checks", { replace: true });
    } catch (error) {
      console.error("Failed to save exercise:", error);
      toast.error("Save failed");
    }
  }

  // Toggle draft/published status
  function handleRadioChange(e: RadioChangeEvent) {
    if (currentExercise)
      setCurrentExercise({ ...currentExercise, status: e.target.value });
  }

  return (
    <>
      {/* Setup modal for new exercise */}
      {currentExercise && (
        <AddExerciseModal
          exercise={currentExercise}
          setExercise={setCurrentExercise}
          setupOpen={setupOpen}
          setSetupOpen={setSetupOpen}
        />
      )}

      {/* Save confirmation modal */}
      <Modal
        title={<span className="text-primary font-semibold">Save Exercise</span>}
        open={saveModal}
        onCancel={() => setSaveModal(false)}
        okButtonProps={{ className: "regular-btn" }}
        cancelButtonProps={{ className: "border-btn" }}
        onOk={handleSaveExercise}
        okText="Save Exercise"
        cancelText="Cancel"
      >
        <Text>Would you like to save this exercise as a draft or published?</Text>
        <Radio.Group
          onChange={handleRadioChange}
          value={currentExercise?.status}
          className="calvin-radio"
        >
          <div className="flex flex-col px-4 py-2">
            <Radio value="draft">Draft</Radio>
            <Radio value="published">Published</Radio>
          </div>
        </Radio.Group>
      </Modal>

      {/* Main editor layout */}
      {!currentExercise || loading ? (
        <Skeleton active className="py-4" paragraph={{ rows: 25 }} />
      ) : (
        <div>
          {/* Page header with title and actions */}
          <div
            className="px-2 py-4"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1000,
              background: "var(--color-bg-base)",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "10vh",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                type="primary"
                size="middle"
                icon={<ArrowLeftOutlined />}
                style={{ marginRight: 12 }}
                onClick={() => window.history.back()}
              />
              <Title level={4} style={{ margin: 0 }}>
                {currentExercise.name}
              </Title>
            </div>

            <Space>
              <Popconfirm
                title="Are you sure you want to delete this exercise?"
                onConfirm={() => {
                  // TODO: Add delete logic
                }}
              >
                <Tooltip title="Delete exercise" placement="left">
                  <Button icon={<DeleteOutlined />} danger>
                    Delete
                  </Button>
                </Tooltip>
              </Popconfirm>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => setSaveModal(true)}
              >
                Save
              </Button>
            </Space>
          </div>

          {/* Split layout for add and view */}
          <div className="flex flex-row h-[88vh] overflow-hidden flex-wrap">
            <div className="w-full md:w-1/2 h-full p-2 overflow-auto">
              <AddQuestionsSections
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                exercise={currentExercise}
                setExercise={setCurrentExercise}
              />
            </div>
            <div className="w-full md:w-1/2 h-full p-2 overflow-auto">
              <ViewQuestions
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                exercise={currentExercise}
                setExercise={setCurrentExercise}
              />
            </div>
          </div>

          {/* Status bar at bottom */}
          <div
            className="h-[2vh] flex items-center px-3 mx-2 text-xs text-white font-medium border rounded"
            style={{ backgroundColor: "#8C2131", marginBottom: 32, gap: 8 }}
          >
            <span
              style={{
                height: 8,
                width: 8,
                borderRadius: "50%",
                backgroundColor: "#F3CD00",
                animation: autosaving ? "pulse 1s ease-in-out infinite" : "none",
              }}
            />
            <span>{autosaving ? "Autosaving..." : "All changes saved."}</span>

            <style>
              {`
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.5); opacity: 0.5; }
                }
              `}
            </style>
          </div>
        </div>
      )}
    </>
  );
}
