
import { useEffect, useState } from "react";
import AddResourceModal from "./components/AddResourceModal";
import { type ResourcePayload, type ResourceTableType } from "../../../types/index.types";
import { api } from "../../../utils/api"
import { message } from "antd";
import { PageHeader } from "../../Shared/PageHeader";
import { TableViewer } from "../../Shared/TableViewer";
import { resourceColumns, resourceFilterOptions } from "../../../data/data";
export default function Resources() {
const [resourceModalOpen, setResourceModalOpen] = useState(false);

const [resourceFiles, setResourceFiles] = useState<ResourceTableType[]>([]);

  async function fetchResources() {
    try {
      const { data } = await api.get('/resources');
      setResourceFiles(data);
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
         <div >
         {/* Fixed Page Header */}
            <PageHeader title="Resource Management" subtitle="Manage dispatch resources, documents and materials" />

            <TableViewer tableType="Resource" columnDefinitions={resourceColumns} columnData={resourceFiles} filterOptions={resourceFilterOptions} />










{/* <div style={{ flex: '1 1 auto', overflowY: 'auto', paddingBottom: 24 }}>
      <ResourceSection resources={resourceFiles} fetchResources={fetchResources} />
</div>   */}

      {/* <AddResourceModal
        open={resourceModalOpen}
        onCancel={() => setResourceModalOpen(false)}
        onSubmit={async (values) => {
          await handleResourceUpload(values);
          setResourceModalOpen(false);
          fetchResources();
        }}
      /> */}





      {contextHolder}
    </div>

    );
}
