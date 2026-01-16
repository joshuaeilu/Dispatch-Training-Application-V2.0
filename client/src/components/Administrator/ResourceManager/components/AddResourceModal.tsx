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
import { removeS } from "../../../../utils/tools";

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
};

export default function AddResourceModal({
  open,
  onCancel,
  onSubmit,
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
        type: removeS(values.type),
        description: values.description,
        size: file.size,
        mime_type: file.type,
        file,
        visibility: true,
      };

      onSubmit(resourcePayload);
      form.resetFields();
    } catch {
      /* validation handled by Form */
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      centered
      closeIcon={null}
      onCancel={handleCancel}
      maskClosable={false}
      destroyOnClose
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md border border-gray-300 bg-white px-3 cursor-pointer py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:translate-y-px"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleOk}
            className="rounded-md bg-brand-maroon-light cursor-pointer px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-maroon active:translate-y-px"
          >
            Add Resource
          </button>
        </div>
      }
      title={
        <div className="flex items-center gap-3 py-2">
          <div className="text-2xl text-[#8C2131]">
            <FileTextOutlined />
          </div>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Add New Resource
            </Typography.Title>
            <Typography.Text type="secondary">
              Upload a new resource to the dispatch system.
            </Typography.Text>
          </div>
        </div>
      }
      styles={{
        content: { borderRadius: 14, paddingTop: 12, paddingBottom: 16 },
        header: { borderBottom: "none", paddingBottom: 0 },
        body: { paddingTop: 12 },
      }}
    >
      <Form form={form} layout="vertical">
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
          help="Select the type of resource you are uploading."
        >
          <Select
            placeholder="Select type"
            optionLabelProp="label"
            options={RESOURCE_OPTIONS.map((o) => ({
              value: o.value,
              label: (
                <span className="inline-flex items-center gap-2">
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
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            listType="text"
          >
            <Button icon={<UploadOutlined />}>Choose File</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
