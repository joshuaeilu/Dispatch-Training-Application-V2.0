import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Popconfirm,
  message,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { UniversalContext } from "../../../../../../contexts/UniversalHelpers";
import { AuthContext } from "../../../../../../contexts/AuthProvider";
import type { Exercise } from "../../../../../../types/index.types";
import { api } from "../../../../../../utils/api";
import { FileAddOutlined } from "@ant-design/icons";


interface AddExerciseModalProps {
  exercise: Exercise;
  setExercise: (exercise: Exercise) => void;
  setupOpen: boolean;
  setSetupOpen: (open: boolean) => void;
}

const difficultyOptions = ["Easy", "Medium", "Hard"].map((d) => ({ label: d, value: d }));
const audienceOptions = ["All", "Trainees", "Dispatchers"].map((a) => ({ label: a, value: a }));

export default function AddExerciseModal({
  exercise,
  setExercise,
  setupOpen,
  setSetupOpen,
}: AddExerciseModalProps) {
  const [form] = Form.useForm();
  const { preferences, setPreferences } = useContext(UniversalContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();
  const [customTypeVisible, setCustomTypeVisible] = useState(false);
  const [customType, setCustomType] = useState("");

  useEffect(() => {
    if (setupOpen) form.resetFields();
  }, [setupOpen]);

  const onContinue = async () => {
    try {
      const values = await form.validateFields();
      const newExercise: Exercise = {
        ...exercise,
        id: uuidv4(),
        name: values.name,
        type: values.type,
        difficulty: values.difficulty,
        audience: values.audience,
        status: "draft",
        createdBy: user?.id || "Unknown",
      };
      setExercise(newExercise);
      setSetupOpen(false);
    } catch (err) {
      // Validation errors handled by AntD
    }
  };

  const handleAddCustomType = async () => {
    const newType = customType.trim();
    if (!newType) return messageApi.warning("Enter a valid type");

    const currentTypes = preferences?.exercise_types ?? [];
    if (currentTypes.includes(newType)) return messageApi.warning("Type already exists");

    const updatedTypes = [...currentTypes, newType];
    try {
      await api.patch(`/preferences/exercise_types`, { value: updatedTypes });
      setPreferences({ ...preferences, exercise_types: updatedTypes });
      form.setFieldValue("type", newType);
      setCustomTypeVisible(false);
      setCustomType("");
      messageApi.success("Type added");
    } catch (err: any) {
      messageApi.error("Failed to save custom type");
    }
  };

  return (
    <Modal
 title={
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      minHeight: 48,
    }}
  >
    <FileAddOutlined style={{ fontSize: 36, color: "#8C2131" }} />
    <div style={{ lineHeight: 1.3 }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        Create Exercise
      </Typography.Title>
      <Typography.Text type="secondary">
        Fill in the form below to continue
      </Typography.Text>
    </div>
  </div>
}

centered
      open={setupOpen}
      closable={false}
      keyboard={false}
      maskClosable={false}
      footer={
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Popconfirm
            title="Cancel exercise creation?"
            description="All progress will be discarded."
            okText="Cancel and Exit"
            cancelText="Back"
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              setSetupOpen(false);
              navigate("/knowledge-checks");
            }}
          >
            <Button className="border-btn">Cancel</Button>
          </Popconfirm>

          <Button className="regular-btn" type="primary" onClick={onContinue}>
            Continue
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="name"
          label="Exercise Name"
          rules={[{ required: true, message: "Please enter a name" }]}
        >
          <Input placeholder="e.g. CPR Protocol Review" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Exercise Type"
          rules={[{ required: true, message: "Please select a type" }]}
        >
          <Select
            placeholder="Select type"
            options={[
              ...(preferences?.exercise_types ?? []).map((t) => ({ label: t, value: t })),
              { label: "+ Custom Type", value: "Custom" },
            ]}
            onChange={(val) => {
              if (val === "Custom") {
                setCustomTypeVisible(true);
                form.setFieldValue("type", undefined);
              } else {
                setCustomTypeVisible(false);
              }
            }}
          />
        </Form.Item>

        {customTypeVisible && (
          <div className="flex gap-3 mb-3">
            <Input
              placeholder="Enter new type"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              onPressEnter={handleAddCustomType}
            />
            <Button type="primary" onClick={handleAddCustomType}>
              Save
            </Button>
          </div>
        )}

        <Form.Item
          name="difficulty"
          label="Difficulty"
          rules={[{ required: true, message: "Please select a difficulty" }]}
        >
          <Select placeholder="Select difficulty" options={difficultyOptions} />
        </Form.Item>

        <Form.Item
          name="audience"
          label="Target Audience"
          rules={[{ required: true, message: "Please select an audience" }]}
        >
          <Select placeholder="Select audience" options={audienceOptions} />
        </Form.Item>
      </Form>
      {contextHolder}
    </Modal>
  );
}
