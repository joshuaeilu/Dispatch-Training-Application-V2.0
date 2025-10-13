import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Space,
  Skeleton,
  Modal,
  Radio,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import AddExerciseModal from "./AddQuestions/components/AddExerciseModal";
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
    height: "9vh",
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
<div className="flex flex-col md:flex-row h-[87vh] overflow-hidden gap-4" style={{ padding: 16 }}>
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
    <div
      className="flex items-center text-xs font-normal text-[#595959] bg-white"
      style={{
        padding: "0 16px",
        height: "4vh",
        gap: 6,
      }}
    >
      <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 14 }} />
      <span>{autosaving ? "Autosaving..." : "All changes saved"}</span>
    </div>
      
      
      
      </>)
     }
    </div>
  );
}
