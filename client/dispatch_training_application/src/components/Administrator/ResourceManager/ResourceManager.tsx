import { Button } from "antd";
import {PlusOutlined} from "@ant-design/icons";
import ResourceSection from "./components/ResourceSection";
import { useEffect, useState } from "react";
import AddResourceModal from "./components/AddResourceModal";
import { type ResourcePayload, type ResourceTableType } from "../../../types/index.types";
import { api } from "../../../utils/api"
import { message } from "antd";
import { PageHeader } from "../../Shared/PageHeader";
export default function Resources() {
const [resourceModalOpen, setResourceModalOpen] = useState(false);

const [resourceFiles, setResourceFiles] = useState<ResourceTableType[]>([]);

  async function fetchResources() {
    try {
      const { data } = await api.get('/resources');
      setResourceFiles(data);
      console.log('Fetched resources:', data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }

  useEffect(() => {
    fetchResources();
  }, []);



  async function handleResourceUpload(resourcePayload: ResourcePayload) {
    const formData = new FormData();
  formData.append("id", resourcePayload.id);
  formData.append("name", resourcePayload.name);
  formData.append("type", resourcePayload.type);
  formData.append("description", resourcePayload.description || "");
  formData.append("size", resourcePayload.size.toString());
  formData.append("mime_type", resourcePayload.mime_type);
  formData.append("file", resourcePayload.file); // 👈 File object
  formData.append("visibility", resourcePayload.visibility.toString());

  try {
    const response = await api.post('/resources', formData);
    console.log('Resource uploaded successfully:', response.data);
    messageApi.open({
      type: 'success',
      content: 'Resource uploaded successfully!',
    });
  } catch (error) {
    console.error('Error uploading resource:', error);
    messageApi.open({
      type: 'error',
      content: 'Failed to upload resource.',
    });
  }
}
    const [messageApi, contextHolder] = message.useMessage();


    return (
        <div style={{ padding: '20px', overflow: 'auto', height: '100%' }}>
      {/* Page Header */}
      
      <PageHeader title="Resource Management" subtitle="Manage dispatch resources, documents and materials" showAddButton onAdd={() => setResourceModalOpen(true)} addButtonText="Add Resource"/>

      <ResourceSection resources={resourceFiles} fetchResources={fetchResources} />

      <AddResourceModal
        open={resourceModalOpen}
        onCancel={() => setResourceModalOpen(false)}
        onSubmit={async (values) => {
          await handleResourceUpload(values);
          setResourceModalOpen(false);
          fetchResources();
        }}
      />
      {contextHolder}
    </div>

    );
}
