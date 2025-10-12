import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Space,
  Skeleton,
  Modal,
  Popconfirm,
  Tooltip,
  Radio,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import AddExerciseModal from "./components/AddExerciseModal";
import AddQuestionsSections from "./AddQuestions/AddQuestions";
import ViewQuestions from "./ViewQuestions/ViewQuestions";
import { useExerciseManager } from "../../../../hooks/useExerciseManager";
import { useAutosaveExercise } from "../../../../hooks/useAutoSaveExercise";
import type { Exercise } from "../../../../types/index.types";

const { Title, Text } = Typography;

export default function EditExercisePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { exerciseId } = location.state || {};

  const {
    exercise,
    setExercise,
    loading,
    setupOpen,
    setSetupOpen,
  } = useExerciseManager({ exerciseId });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lastSavedExercise, setLastSavedExercise] = useState<Exercise | null>(
    exercise
  );
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const { autosaving, manualSave } = useAutosaveExercise(
    exercise,
    setLastSavedExercise
  );

  const handleSaveConfirm = async () => {
    await manualSave();
    navigate("/knowledge-checks", { replace: true });
  };

  const handleStatusChange = (e: any) => {
    if (exercise) {
      setExercise({ ...exercise, status: e.target.value });
    }
  };

  if (loading || !exercise) {
    return <Skeleton active paragraph={{ rows: 25 }} className="py-4" />;
  }

  return (
    
    <div>
      {/* Setup Modal */}
      <AddExerciseModal
        exercise={exercise}
        setExercise={setExercise}
        setupOpen={setupOpen}
        setSetupOpen={setSetupOpen}
      />

      {/* Save Status Modal */}
      <Modal
        open={saveModalOpen}
        onCancel={() => setSaveModalOpen(false)}
        onOk={handleSaveConfirm}
        okText="Save Exercise"
        cancelText="Cancel"
        title={<span className="text-primary font-semibold">Save Exercise</span>}
        okButtonProps={{ className: "regular-btn" }}
        cancelButtonProps={{ className: "border-btn" }}
      >
        <Text>Would you like to save this exercise as a draft or published?</Text>
        <Radio.Group
          onChange={handleStatusChange}
          value={exercise.status}
          className="calvin-radio"
        >
          <div className="flex flex-col px-4 py-2">
            <Radio value="draft">Draft</Radio>
            <Radio value="published">Published</Radio>
          </div>
        </Radio.Group>
      </Modal>

     {
      setupOpen ? (<Skeleton active paragraph={{ rows: 20 }} className="m-4 overflow-hidden" />) : (<> {/* Sticky Header */}
   <div
  style={{
    position: "sticky",
    top: 0,
    zIndex: 1000,
    borderBottom: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1rem",
    height: "12vh",
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
  }}
>
  {/* Left: Back + Title */}
  <Space align="center" size="middle">
    <Button
      type="primary"
      icon={<ArrowLeftOutlined />}
      size="large"
      onClick={() => navigate("/knowledge-checks")}
      
    />
    <div>
      <Title level={4} style={{ margin: 0, color: "#1F1F1F" }}>
        {exercise.name || "Untitled Exercise"}
      </Title>
      <Text type="secondary" style={{ fontSize: 14 }}>
        Editing knowledge check
      </Text>
    </div>
  </Space>



    <Button
      type="primary"
      icon={<SaveOutlined />}
      size="large"
      onClick={() => setSaveModalOpen(true)}
      className="regular-btn"
    >
      Save
    </Button>
</div>


      {/* Main Layout */}
<div className="flex flex-col md:flex-row h-[88vh] overflow-hidden p-4 gap-4">
        <div className="w-full md:w-1/2 h-full ">
          <AddQuestionsSections
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            exercise={exercise}
            setExercise={setExercise}
          />
        </div>
        <div className="w-full md:w-1/2 h-full  overflow-auto">
          <ViewQuestions
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            exercise={exercise}
            setExercise={setExercise}
          />
        </div>
      </div>

      {/* Autosave Indicator */}
      {/* <div
        className="h-[2vh] flex items-center px-3 mx-2 text-xs text-white font-medium border rounded"
        style={{
          backgroundColor: "#8C2131",
          marginBottom: 32,
          gap: 8,
        }}
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
       */}
      
      
      </>)
     }
    </div>
  );
}
