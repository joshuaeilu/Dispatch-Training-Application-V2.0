import { useContext, useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
  
} from "antd";
import { useNavigate } from "react-router-dom";
import type { Exercise } from "../../../../../types/index.types";
import { UniversalContext } from "../../../../../contexts/UniversalHelpers";
import { v4 as uuidv4 } from "uuid";
import { api } from "../../../../../utils/api";
import { AuthContext } from "../../../../../contexts/AuthProvider";



interface AddExerciseModalProps {
  exercise: Exercise;
  setExercise: (exercise: Exercise) => void;
  setupOpen: boolean;
  setSetupOpen: (open: boolean) => void;
}



const difficultyOptions = [
    { label: "Easy", value: "Easy" },
    { label: "Medium", value: "Medium" },
    { label: "Hard", value: "Hard" },
  ];

const audienceOptions = [
    { label: "All", value: "All" },
    { label: "Trainees", value: "Trainees" },
    { label: "Dispatchers", value: "Dispatchers" },
  ];


export default function AddExerciseModal({ exercise, setExercise, setupOpen, setSetupOpen }: AddExerciseModalProps) {
  const [setupForm] = Form.useForm();
  const navigate = useNavigate();
  const { preferences, setPreferences } = useContext(UniversalContext);
  const { user } = useContext(AuthContext);

  const [messageApi, contextHolder] = message.useMessage();

  const [customInputVisible, setCustomInputVisible] = useState(false);
  const [customType, setCustomType] = useState("");
  const submitSetupForm = async () => {
    const values = await setupForm.validateFields();
    setExercise({
      id: uuidv4(),
      name: values.name,
      type: values.type,
      difficulty: values.difficulty,
      audience: values.audience,
      status: "draft",
      createdBy: user?.id || "Unknown",
      questions: [{
        id: uuidv4(),
        question: "",
        resource: undefined,
        questionCategory: "",
        answerType: "text-area",
        options: [],
        correctOptions: [],
        tip: "",
      }],
    });
    setSetupOpen(false);
    // Proceed with form submission logic
  };
  async function handleCustomTypeSave() {
    const newType = customType.trim();
    if (!newType) {
      messageApi.warning("Please enter a valid type");
      return;
    }

    if (!(preferences?.exercise_types ?? []).includes(newType)) {
      setPreferences({
        ...preferences,
        exercise_types: [...(preferences?.exercise_types ?? []), newType],
      });
    }

    const field = 'exercise_types' as const;

    try {
      const current = preferences?.[field] ?? [];

      if (current.includes(newType)) {
        messageApi.warning("Exercise type already exists");
        return;
      }

      const payload = { value: [...current, newType] };

      const { data } = await api.patch(`/preferences/${field}`, payload);

      // assuming `setPreferences` updates your local AdminPreferences state
      if (data) {
        messageApi.success("Custom exercise type added successfully");
      }
    } catch (error: any) {
      messageApi.error(`Failed to add custom exercise type: ${error?.message ?? String(error)}`);
    }


    setupForm.setFieldsValue({ type: newType });
    setCustomInputVisible(false);
    setCustomType("");
  }

  return (
    <>



      {/* --- Setup Modal (cannot be closed except Cancel & Exit) --- */}
      <Modal
        title={
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h3>Create Exercise</h3>
            <Typography.Text type="secondary" >
              Fill in the form below to create a new exercise.
            </Typography.Text>
          </div>
        }
        open={setupOpen}
        onCancel={() => null}       // block default close
        closable={false}            // no X
        maskClosable={false}        // click outside won’t close
        keyboard={false}            // ESC won’t close
        footer={
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Popconfirm
              title="Cancel exercise creation?"
              description="All progress will be discarded."
              okText="Cancel and Exit"
              onConfirm={() => {
                setSetupOpen(false);
                navigate("/knowledge-check");
              }}
              okButtonProps={{ danger: true }}
              cancelText="Back"
            >
              <Button className="border-btn">Cancel</Button>
            </Popconfirm>

            <Space>
              <Button className="regular-btn" onClick={submitSetupForm} type="primary" >
                Continue
              </Button>
            </Space>
          </Space>
        }
      >
        <Form
          layout="vertical"
          form={setupForm}
          initialValues={{ type: undefined, difficulty: undefined }}
          requiredMark={false}
        >



          <Form.Item
            label="Exercise Name"
            name="name"
            rules={[{ required: true, message: "Please enter exercise name" }]}
          >
            <Input placeholder="Enter exercise name" />
          </Form.Item>


          <Form.Item
            label="Exercise Type"
            name="type"
            rules={[{ required: true, message: "Please select exercise type" }]}
          >
            <Select
              placeholder="Select type"
              onChange={(value) => {
                if (value === "Custom") {
                  setCustomInputVisible(true);
                  setupForm.setFieldsValue({ type: undefined }); // reset type until custom is saved
                } else {
                  setCustomInputVisible(false);
                }
              }}
options={
  [...(preferences?.exercise_types ?? []).map((type) => ({
    value: type,
    label: type,
  })), { value: "Custom", label: "+ Custom Type" }]
}
            />
          </Form.Item>

          {customInputVisible && (
            <div className="flex gap-4 mb-2">
              <Input
                placeholder="Enter new custom exercise type"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                onPressEnter={() => handleCustomTypeSave()}
                style={{ marginBottom: 8 }}
              />
              <Button
                className="regular-btn"
                type="primary"
                onClick={() => handleCustomTypeSave()}
              >
                Save
              </Button>
            </div>
          )}

          <Form.Item
            label="Difficulty"
            name="difficulty"
            rules={[{ required: true, message: "Please select difficulty" }]}
          >
            <Select
              placeholder="Select difficulty"
              options={difficultyOptions}
            />
          </Form.Item>

          <Form.Item
            label="Audience"
            name="audience"
            rules={[{ required: true, message: "Please select audience" }]}
          >
            <Select
              placeholder="Select audience"
              options={audienceOptions }
            />
          </Form.Item>
        </Form>
        {contextHolder}
      </Modal>


    </>
  );
}
