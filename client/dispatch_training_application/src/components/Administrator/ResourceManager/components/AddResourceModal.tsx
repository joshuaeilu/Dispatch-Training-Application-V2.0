import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  Typography,
} from "antd";
import {
  FileTextOutlined,
  PlaySquareOutlined,
  AudioOutlined,
  PictureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { ResourcePayload } from "../../../../types/index.types";
import { v4 as uuidv4 } from "uuid";

const RESOURCE_OPTIONS = [
  { value: "documents", label: "Documents", icon: <FileTextOutlined /> },
  { value: "videos", label: "Videos", icon: <PlaySquareOutlined /> },
  { value: "audio", label: "Audio", icon: <AudioOutlined /> },
  { value: "images", label: "Images", icon: <PictureOutlined /> },
];

type AddResourceValues = {
  name: string;
  type: string;
  description?: string;
  file: any[];
};

type AddResourceModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: ResourcePayload) => void;
  defaultType?: string;
};

export default function AddResourceModal({
  open,
  onCancel,
  onSubmit,
  defaultType = "images",
}: AddResourceModalProps) {
  const [form] = Form.useForm<AddResourceValues>();

  const normFile = (e: any) => (Array.isArray(e) ? e : e?.fileList);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const file = values.file[0]?.originFileObj;
      const resourcePayload: ResourcePayload = {
        id: uuidv4(),
        name: values.name,
        type: values.type,
        description: values.description,
        size: file.size,
        mime_type: file.type,
        file: values.file[0]?.originFileObj,
        visibility: true // Default visibility to false
      };
      onSubmit(resourcePayload);
      form.resetFields();
    } catch {
      /* validation errors shown by Form */
    }
  };

  return (
    <Modal
      open={open}
      centered
      closeIcon={null}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
  title={
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "8px 0",
    }}
  >
    <div style={{ fontSize: 24, color: "#8C2131" }}>
      <FileTextOutlined />
    </div>
    <div>
      <Typography.Title
        level={4}
        style={{
          margin: 0,
          fontWeight: 600,
          color: "#1f1f1f",
        }}
      >
        Add New Resource
      </Typography.Title>
      <Typography.Text type="secondary">
        Upload a new resource to the dispatch system.
      </Typography.Text>
    </div>
  </div>
}

      maskClosable={false}
      destroyOnClose
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button className="border-btn"  onClick={() => { form.resetFields(); onCancel(); }}>
            Cancel
          </Button>
          <Button
            className="regular-btn"
            onClick={handleOk}
          >
            Add Resource
          </Button>
        </div>
      }
      styles={{
        content: { borderRadius: 14, paddingTop: 12, paddingBottom: 16 },
        header: { borderBottom: "none", paddingBottom: 0 },
        body: { paddingTop: 12 },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ type: defaultType }}
      >
        <Form.Item
          label="Resource Name"
          name="name"
          rules={[{ required: true, message: "Enter resource name" }]}
        >
          <Input placeholder="Enter resource name" />
        </Form.Item>

        <Form.Item
          label="Resource Type"
          name="type"
          rules={[{ required: true, message: "Choose a resource type" }]}
        >
          <Select
            placeholder="Select type"
            optionLabelProp="label"
            options={RESOURCE_OPTIONS.map((o) => ({
              value: o.value,
              label: (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {o.icon}
                  <span>{o.label}</span>
                </span>
              ),
            }))}
          />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea
            placeholder="Enter resource description"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>

        <Form.Item
          label="File Upload"
          name="file"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "Please choose a file" }]}
        >
          <Upload beforeUpload={() => false} maxCount={1} listType="text">
            <Button icon={<UploadOutlined />}>Choose File</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
