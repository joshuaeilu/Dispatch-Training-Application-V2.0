// 🧩 File: SettingsMopSection.tsx
import {
  Card,
  Upload,
  Button,
  Table,
  Space,
  message,
  Popconfirm,
  Modal,
} from "antd";
import { 
  UploadOutlined, 
  DeleteOutlined, 
  StarOutlined, 
  StarFilled,
  EyeOutlined 
} from "@ant-design/icons";
import { useEffect, useState, useRef } from "react";
import { api } from "../../../../utils/api";
import { getToken } from "../../../../contexts/AuthProvider";
import PdfViewer from "../../../Shared/PdfViewer"; // Update with actual path

const SettingsMopSection = () => {
  const [files, setFiles] = useState([]);
  const [defaultMop, setDefaultMop] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Refs for PDF viewer
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const fetchMops = async () => {
    try {
      const data = await api.get("/mop/list");
      setFiles(data.data);
      const def = await api.get("/mop/default");
      setDefaultMop(def.data.filename);
    } catch (err) {
      message.error("Failed to load MOP files");
    }
  };

  useEffect(() => {
    fetchMops();
  }, []);

  const uploadProps = {
    beforeUpload: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        await api.patch("/mop/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        message.success("Uploaded successfully");
        fetchMops();
      } catch (err) {
        message.error("Upload failed");
      }
      return false;
    },
    maxCount: 1,
    accept: ".pdf",
    showUploadList: false,
  };

  const handleDelete = async (filename: string) => {
    try {
      await api.delete(`/mop/${filename}`);
      message.success("Deleted successfully");
      fetchMops();
    } catch (err) {
      message.error("Failed to delete file");
    }
  };

  const handleSetDefault = async (filename: string) => {
    try {
      await api.patch("/mop/default", { filename });
      setDefaultMop(filename);
      message.success("Default MOP updated");
    } catch (err) {
      message.error("Failed to set default");
    }
  };

  const handleViewFile = (filename: string) => {
    setSelectedFile(filename);
    setViewModalOpen(true);
    // Reset refs when opening a new file
    pageRefs.current = [];
  };

  const columns = [
    {
      title: "File",
      dataIndex: "filename",
      key: "filename",
    },
    {
      title: "Size (KB)",
      dataIndex: "size",
      key: "size",
      render: (bytes: number) => (bytes / 1024).toFixed(1),
    },
    {
      title: "Uploaded",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewFile(record.filename)}
          >
            View
          </Button>

          <Button
            type="text"
            icon={record.filename === defaultMop ? <StarFilled /> : <StarOutlined />}
            onClick={() => handleSetDefault(record.filename)}
          >
            {record.filename === defaultMop ? "Default" : "Make Default"}
          </Button>

          <Popconfirm
            title={`Delete ${record.filename}?`}
            onConfirm={() => handleDelete(record.filename)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger type="text" icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card title="Manuals of Procedure (MOP)">
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Upload New MOP (PDF)</Button>
        </Upload>

        <Table
          dataSource={files}
          rowKey="filename"
          columns={columns}
          pagination={false}
          style={{ marginTop: 16 }}
        />
      </Card>

      <Modal
        title={selectedFile}
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedFile(null);
        }}
        footer={null}
        width="90vw"
        style={{ top: 20 }}
        bodyStyle={{ height: "85vh", padding: 0 }}
      >
        {selectedFile && (
          <PdfViewer
            fileUrl={`http://localhost:5000/data/mop/${selectedFile}?token=${getToken()}`}
            highlights={[]}
            scrollContainerRef={scrollContainerRef}
            pageRefs={pageRefs}
          />
        )}
      </Modal>
    </>
  );
};

export default SettingsMopSection;