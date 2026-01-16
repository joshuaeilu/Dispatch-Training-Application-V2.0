
import { useEffect, useState } from "react";
import AddResourceModal from "./components/AddResourceModal";
import { type ResourcePayload, type ResourceTableType, type TableColumnDef } from "../../../types/index.types";
import { api } from "../../../utils/api"
import { PageHeader } from "../../Shared/PageHeader";
import { TableViewer } from "../../Shared/TableViewer";
import { toTitleCase, removeS } from "../../../utils/tools";
import { TableActionButton } from "../../Shared/TableActionButton";
import ArrowTopRightOnSquareIcon from "@heroicons/react/20/solid/ArrowTopRightOnSquareIcon";
import TrashIcon from "@heroicons/react/20/solid/TrashIcon";
import ResourcePreviewModal from "../../Shared/Resources/ResourcePreviewModal";
import { useToast } from "../../../contexts/ToastContext";
import { getUser, getToken } from "../../../contexts/AuthProvider";
import { Switch } from "antd";

export const resourceFilterOptions = {
  type: ["documents", "videos", "audios", "images"],
};


export default function Resources() {
  const [resourceModalOpen, setResourceModalOpen] = useState(false);

  const [resourceFiles, setResourceFiles] = useState<ResourceTableType[]>([]);

  const user = getUser();
  const token = getToken();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<{
    id: string;
    name: string;
    description: string;
    type: string;
    url: string;
  }>({
    id: "",
    name: "",
    description: "",
    type: "",
    url: "",
  });


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



  const toast = useToast();


  
const resourceColumns: TableColumnDef<ResourceTableType>[] = [
  {
    key: 'name',
    header: 'Name',
    align: 'text-left',
    render: (e: ResourceTableType) => <span className="font-medium text-gray-900">{e.name}</span>,
    searchable: true,
    filterable: true,
  },
  {
    key: 'description',
    header: 'Description',
    align: 'text-left',
    render: (e: ResourceTableType) => <span className="text-gray-600">{e.description}</span>,
    searchable: true,
    filterable: false,
  },
  {
    key: 'type',
    header: 'Type',
    align: 'text-left',
    render: (e: ResourceTableType) => <span className="text-gray-600">{toTitleCase(removeS(e.type))}</span>,
    searchable: false,
    filterable: true,
  },
  {
  key: "visibility",
  header: "Visibility",
  align: "text-center",
  render: (record: ResourceTableType) => (
    <Switch
      size="small"
      checked={record.visibility}
      onChange={async (checked) => {
        try {
          await api.patch(`/resources/${record.id}`, {
            visibility: checked,
          });

          toast.success(
            `Resource is now ${checked ? "visible" : "hidden"}.`
          );

          fetchResources();
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to update visibility"
          );
        }
      }}
    />
  ),

  },
  {
    header: 'Actions',
    align: 'text-center',
    render: (e: ResourceTableType) => (
      <div className="flex justify-center gap-2">
        <TableActionButton
          title="View"
          icon={ArrowTopRightOnSquareIcon}
          color="blue"
          onPress={() => handleResourcePreview(
            {
              id: e.id,
              name: e.name,
              description: e.description,
              type: e.mime_type,
              url: "/data" + e.url + "?token=" + token,
            }
          )}
        />

        <TableActionButton
          title="Delete"
          icon={TrashIcon}
          color="red"
          onPress={() => handleResourceDelete(e.id)}
        />

      </div>
    ),
  },
]


  async function handleResourceDelete(resourceId: string) {
    try {
      await api.post('/trash', { item_name: resourceFiles.find(r => r.id === resourceId)?.name, trash_item_id: resourceId, who_deleted: user?.id, item_type: 'resource' });
      toast.success('Resource moved to trash successfully');
      fetchResources(); // Refresh the resource list
    } catch (error) {
      console.error('Error moving resource to trash:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to move resource to trash');
    }

  }

  async function handleResourcePreview(resource: {
    id: string;
    name: string;
    description: string;
    type: string;
    url: string;
  }) {
    // Step 1: Clear modal state first (optional but useful if previewing same resource again)
    setPreviewOpen(false);
    setPreviewResource({
      id: resource.id,
      name: resource.name,
      description: resource.description,
      type: resource.type,
      url: resource.url,
    });

    // Step 2: Fetch resource  and update state
    try {
      setPreviewOpen(true);
    } catch (error) {
      toast.error("Failed to load resource preview.");
    }
  }





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
      toast.success('Resource uploaded successfully!');
    } catch (error) {
      console.log('Error uploading resource:', error);
      toast.error('Failed to upload resource.');
    }
  }



  return (
    <div >
      {/* Fixed Page Header */}
      <PageHeader title="Resource Management" subtitle="Manage dispatch resources, documents and materials" />

      <TableViewer tableType="Resource" columnDefinitions={resourceColumns} columnData={resourceFiles} filterOptions={resourceFilterOptions} onButtonPress={() => setResourceModalOpen(true)} />







      <AddResourceModal
        open={resourceModalOpen}
        onCancel={() => setResourceModalOpen(false)}
        onSubmit={async (values) => {
          await handleResourceUpload(values);
          setResourceModalOpen(false);
          fetchResources();
        }}
      />
      <ResourcePreviewModal
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
        }}
        resource={previewResource}
      />




    </div>

  );
}
