import {  useState } from "react";
import AddExerciseModal from "./components/AddExerciseModal";
import AddQuestionsSections from "./components/AddQuestions";
import type { Exercise, } from "../../../../types/index.types"
import ViewQuestions from "./components/ViewQuestions";
import { v4 as uuid } from "uuid";
import {  Modal, type RadioChangeEvent, Typography, Radio, Skeleton, Space, Button, Popconfirm, Tooltip, } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import { api } from "../../../../utils/api";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;


export default function AddExercise() {

  const [setupOpen, setSetupOpen] = useState(true);       // initial modal
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [saveModal, setSaveModal] = useState(false);
  const navigate = useNavigate();

  const [currentExercise, setCurrentExercise] = useState<Exercise>(() => {

    // Fallback to default initial exercise
    return {
      id: '',
      name: '',
      type: '',
      difficulty: 'Easy',
      audience: 'All',
      status: 'Draft',
      createdBy: 'Admin',
      questions: [{
        id: uuid(),
        question: '',
        answerType: "text-area",
        questionCategory: '',
        resource: null,
        options: [],
        correctOptions: [],
        tip: '',
      }],
    };
  });



  async function handleSaveExercise(exercise: Exercise) {
    const saveExercise = {
      id: exercise.id,
      name: exercise.name,
      type: exercise.type,
      difficulty: exercise.difficulty,
      audience: exercise.audience,
      visibility: exercise.visibility,
      status: exercise.status,
      questions: exercise.questions,
      createdBy: (() => {
        if (!exercise.createdBy) return null;          // nothing provided
        if (typeof exercise.createdBy === "string") {
          return exercise.createdBy;                   // already a UUID
        }
        if (typeof exercise.createdBy === "object" && "id" in exercise.createdBy) {
          return exercise.createdBy.id;                // pick id from object
        }
        return null;                                   // fallback
      })(),
    }
 try {
      const { data } = await api.put(`/exercises/${exercise.id}`, saveExercise)
      navigate(`/knowledge-checks`, { replace: true });
      

    } catch (error) {
      console.error("Failed to save draft:", error);
    }
   
  }



  function handleRadioChange(e: RadioChangeEvent) {
    setCurrentExercise({ ...currentExercise, status: e.target.value });
  }




  return (
    <>

      {/* --- Setup Modal (cannot be closed except Cancel & Exit) --- */}
      <AddExerciseModal exercise={currentExercise} setExercise={setCurrentExercise} setupOpen={setupOpen} setSetupOpen={setSetupOpen} />
      {/* Save Modal */}
      <Modal
        title={
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Save Exercise
          </span>
        }
        open={saveModal}
        onCancel={() => setSaveModal(false)}
        okButtonProps={{ className: 'regular-btn' }}
        onOk={() => handleSaveExercise(currentExercise)}
        okText="Save Exercise"
        cancelText="Cancel"
        cancelButtonProps={{ className: 'border-btn' }}
      >
        <Typography.Text>Would you like to save this exercise as a draft or published? </Typography.Text>
        <Radio.Group onChange={handleRadioChange} value={currentExercise.status} className="calvin-radio">
          <div className="flex flex-col px-4 py-2">
            <Radio value="draft">Draft</Radio>
            <Radio value="published">Published</Radio>
          </div>
        </Radio.Group>
      </Modal>


      



{setupOpen ? <Skeleton active className="py-4" paragraph={{ rows: 25 }} /> : <div >
    {/* Header */}
   <div className="px-2 py-4"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: "var(--color-bg-base)",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: '10vh'
          }}
        >
       {/* Left: Back + Page Title */}
  <div style={{ display: 'flex', alignItems: 'center', }}>
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

          {/* Right: Actions */}
          <Space>
            <Popconfirm
              title="Are you sure you want to delete this scenario? This action cannot be undone."
              onConfirm={() => {
                // handleDeleteScenario();
              }}
            >
              <Tooltip title="Delete exercise" placement="left">
                <Button icon={<DeleteOutlined />}
                  danger>
                  Delete
                </Button>
              </Tooltip>
            </Popconfirm>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => setSaveModal(true)} >
              Save
            </Button>
          </Space>
        </div>


     <div className="flex flex-row h-[90vh] overflow-hidden flex-wrap">
  {/* Left Half */}
  <div className="w-full md:w-1/2 h-full p-2 overflow-auto">
    <AddQuestionsSections
      selectedIndex={selectedIndex}
      setSelectedIndex={setSelectedIndex}
      exercise={currentExercise}
      setExercise={setCurrentExercise}
    />
  </div>

  {/* Right Half */}
  <div className="w-full md:w-1/2 h-full p-2 overflow-auto">
    <ViewQuestions
      selectedIndex={selectedIndex}
      setSelectedIndex={setSelectedIndex}
      exercise={currentExercise}
      setExercise={setCurrentExercise}
    />
  </div>
</div>

      </div>}

    </>
  );
}
