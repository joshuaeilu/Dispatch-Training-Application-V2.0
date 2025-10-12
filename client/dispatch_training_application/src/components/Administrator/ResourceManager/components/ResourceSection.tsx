

import { Select, Input, Button, Card, Typography, Row, Col,  Tag, Segmented, Space, type TableColumnType, Table, Tooltip, Popconfirm, message, Switch } from "antd";
import {  useState } from "react";
import { DeleteOutlined,FileTextOutlined, SearchOutlined, SnippetsOutlined } from "@ant-design/icons";
import type { ResourceCategory, ResourceKey, ResourceTableType } from "../../../../types/index.types";
import { AuthContext } from "../../../../contexts/AuthProvider";
import { useContext } from "react";
const { Option } = Select;
import { api } from "../../../../utils/api";
import ResourcePreviewModal from "../../../Shared/Resources/ResourcePreviewModal";
import { PROFILE_PIC_URL, RESOURCE_CATEGORIES } from "../../../../data/data";
import { formatFileSize, formatDateOnly, toTitleCase } from "../../../../utils/tools";
import { RESOURCE_URL } from "../../../../data/data";

const { Title } = Typography;

export default function ResourceSection({ resources, fetchResources }: { resources: ResourceTableType[]; fetchResources: () => void }) {
    const [selectedResource, setSelectedResource] = useState<ResourceCategory>({
        key: "all",
        label: "All Resources",
        icon: <FileTextOutlined  style={{ fontSize: 18 }} />,
    });
    const { isMobile } = useContext(AuthContext);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewResource, setPreviewResource] = useState({
        id: "",
        name: "",
        description: "",
        type: "",
        url: "",
    });
    const data: ResourceTableType[] = resources.map(resource => ({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        mime_type: resource.mime_type,
        url: resource.url,
        size: resource.size,
        description: resource.description,
        created_at: (resource.created_at),
        visibility: resource.visibility,
        created_by: {
            id: resource.created_by.id,
            name: resource.created_by.name,
            avatar_url: resource.created_by.avatar_url
        },
        actions: [
            {
                label: "View",
                resourceId: resource.id,
                resourcePreview: {
                    name: resource.name,
                    description: resource.description,
                    type: resource.mime_type,
                    url: resource.url,
                },
            },
            {
                label: "Delete",
                color: "red",
                resourceId: resource.id,

            },
        ],
    }));

    const [messageApi, contextHolder] = message.useMessage();



const columns: TableColumnType<ResourceTableType>[] = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (name: string) => (
      <Typography.Text style={{ fontSize: 14, color: "#262626", whiteSpace: "nowrap"  }}>
        {name}
      </Typography.Text>
    ),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    render: (description: string) => (
      <Typography.Paragraph
        ellipsis={{ rows: 2 }}
        style={{
          marginBottom: 0,
          color: "#595959",
          fontSize: 13,
        }}
      >
        {description}
      </Typography.Paragraph>
    ),
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    sorter: (a, b) => a.type.localeCompare(b.type),
    render: (type: ResourceKey) => {
      const category = RESOURCE_CATEGORIES.find((cat) => cat.key === type);
      return (
        <Space size={6}>
          {category?.icon}
          <Typography.Text style={{ fontSize: 13, color: "#434343", whiteSpace: "nowrap" }}>
            {category?.label}
          </Typography.Text>
        </Space>
      );
    },
  },

  {
    title: "Actions",
    dataIndex: "actions",
    key: "actions",
    align: "center",
    render: (
      actions: {
        label: string;
        color: string;
        resourceId: string;
        resourcePreview: {
          name: string;
          description: string;
          type: string;
          url: string;
        };
      }[]
    ) => (
      <Space>
        <Tooltip title="View resource">
          <Button
            variant="filled"
            color="geekblue"
            icon={<SnippetsOutlined />}
            onClick={() =>
              handleResourcePreview({
                id: actions[0].resourceId,
                ...actions[0].resourcePreview,
              })
            }
          >
            View
          </Button>
        </Tooltip>
        <Popconfirm
          title="Delete this resource?"
          description="This action cannot be undone."
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleResourceDelete(actions[1].resourceId)}
        >
          <Tooltip title="Delete resource">
            <Button variant="filled" color="red" icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Tooltip>
        </Popconfirm>
      </Space>
    ),
  },
  {
    title: "Visibility",
    dataIndex: "visibility",
    key: "visibility",
    align: "center",
    render: (visibility: boolean, record) => (
      <Switch
        size="small"
        checked={visibility}
        onChange={async (checked) => {
          try {
            await api.patch(`/resources/${record.id}`, { visibility: checked });
            messageApi.success(
              `Resource visibility updated to ${checked ? "visible" : "hidden"}.`
            );
            fetchResources();
          } catch (error) {
            messageApi.error(
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
    title: "Created At",
    dataIndex: "created_at",
    key: "created_at",
    sorter: (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    render: (date: string) => (
      <Typography.Text style={{ fontSize: 13, color: "#8c8c8c", whiteSpace: "nowrap" }}>
        {formatDateOnly(date)}
      </Typography.Text>
    ),
  },
];


    async function handleResourceDelete(resourceId: string) {
        try {
            const { data } = await api.delete(`/resources/${resourceId}`);
            messageApi.open({
                type: 'success',
                content: 'Resource deleted successfully',
            });
            fetchResources(); // Refresh the resource list
        } catch (error) {
            messageApi.open({
                type: 'error',
                content: error instanceof Error ? error.message : 'Failed to delete resource',
            });
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
            url: RESOURCE_URL + resource.url + "?token=" + token, 
        });

        // Step 2: Fetch resource  and update state
        try {
            setPreviewOpen(true);
        } catch (error) {
            console.error("Error fetching resource:", error);
            message.error("Failed to load resource preview.");
        }
    }


    const [query, setQuery] = useState("");
    // Normalize query
    const normalizedQuery = query.trim().toLowerCase();

    // Helper to match name or description
    const matchesQuery = (item: ResourceTableType) => {
        if (!normalizedQuery) return true;
        const name = item.name?.toLowerCase() ?? "";
        const desc = item.description?.toLowerCase() ?? "";
        return name.includes(normalizedQuery) || desc.includes(normalizedQuery);
    };

    // First, apply search across all data
    const searchFiltered = data.filter(matchesQuery);

    // Build counts from the search-filtered set so badges update as you type
    const counts = searchFiltered.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        acc["all"] = (acc["all"] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Then apply the category filter for the table
    const filteredData =
        selectedResource.key === "all"
            ? searchFiltered
            : searchFiltered.filter((item) => item.type === selectedResource.key);

    const { token } = useContext(AuthContext);

    return (
        <div style={{ padding: isMobile ? "0 1rem": "0 1.5rem", overflow: "auto" }}> 
            <Card>

 <Title
    level={4}
    style={{
      marginBottom: 16,
      fontWeight: 600,
      color: "#1f1f1f",
      fontSize: 18,
    }}
  >
    Search & Filter Resources
  </Title>                <Row gutter={[8, 8]} align="middle" className="mt-4">
                    {/* Input - full width on mobile, 70% on desktop */}
                    <Col xs={24} sm={16} lg={20} >
                        <Input
                            placeholder="Search for resources..."
                            prefix={<SearchOutlined />}
                            allowClear
                            size="large"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onPressEnter={(e) => setQuery((e.target as HTMLInputElement).value)}
                        />

                    </Col>

                    {/* Select - full width on mobile, 30% on desktop */}
                    <Col xs={24} sm={8} lg={4}>
                        <Select
                            value={selectedResource.key}
                            size="large"
                            style={{ width: "100%" }} // always full width in its column
                            onChange={(newValue) => setSelectedResource(RESOURCE_CATEGORIES.find(category => category.key === newValue) || RESOURCE_CATEGORIES[0])}
                        >
                            {RESOURCE_CATEGORIES.map(({ key, label, icon }) => (
                                <Option key={key} value={key} >
                                    {icon} <span style={{ marginLeft: 6 }}>{label}</span>
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </Card>
           
         

           <Card
  style={{ marginTop: "1.5rem", overflowX: "auto" }}
  bodyStyle={{ padding: 16 }}
>
  <div style={{ marginBottom: 12 }}>
    <Space align="center" size="small">
      <FileTextOutlined style={{ fontSize: 26, color: "#8C2131" }} />
      <Typography.Title
        level={4}
        style={{
          margin: 0,
          fontWeight: 600,
          fontSize: "20px",
          color: " #1f1f1f)",
        }}
      >
        {selectedResource.key === "all"
          ? "All Resources"
          : selectedResource.label}
      </Typography.Title>
    </Space>
    <Typography.Text
      type="secondary"
      style={{
        display: "block",
        marginTop: 4,
        fontSize: "14px",
        color: "var(--color-text-secondary, #888)",
      }}
    >
      {filteredData.length}{" "}
      {filteredData.length === 1 ? "exercise" : "exercises"} found
    </Typography.Text>
  </div>

  <Table
    rowKey="id"
    columns={columns}
    dataSource={filteredData}
    pagination={{
      pageSize: 10,
      showQuickJumper: true,
      showTotal: (total) => `Total ${total} resources`,
    }}
    scroll={{
      y: 400,
      x: "max-content",
    }}
    sticky
    bordered
  />
</Card>

            <ResourcePreviewModal
                open={previewOpen}
                onClose={() => {

                    setPreviewOpen(false);
                }}
                resource={previewResource}
            />



            {contextHolder}
        </div>
    );
}
