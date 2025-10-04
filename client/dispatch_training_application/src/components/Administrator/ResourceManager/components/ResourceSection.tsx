

import { Select, Input, Button, Card, Typography, Row, Col,  Tag, Segmented, Space, type TableColumnType, Table, Tooltip, Popconfirm, message, Switch } from "antd";
import {  useState } from "react";
import { DeleteOutlined,FileTextOutlined, SearchOutlined, SnippetsOutlined } from "@ant-design/icons";
import type { ResourceCategory, ResourceKey, ResourceTableType } from "../../../../types/index.types";
import { AuthContext } from "../../../../contexts/AuthProvider";
import { useContext } from "react";
const { Option } = Select;
import { api } from "../../../../utils/api";
import ResourcePreviewModal from "./ResourcePreviewModal";
import { PROFILE_PIC_URL, RESOURCE_CATEGORIES } from "../../../../data/data";
import { formatFileSize, formatDateOnly, toTitleCase } from "../../../../utils/tools";
import { RESOURCE_URL } from "../../../../data/data";


export default function ResourceSection({ resources, fetchResources }: { resources: ResourceTableType[]; fetchResources: () => void }) {
    const [selectedResource, setSelectedResource] = useState<ResourceCategory>({
        key: "all",
        label: "All Resources",
        icon: <FileTextOutlined />,
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
                color: "green",
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
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            sorter: (a, b) => a.type.localeCompare(b.type),
            render: (type: ResourceKey) => {
                const category = RESOURCE_CATEGORIES.find(cat => cat.key === type);
                return (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        {category?.icon}
                        <span>{category?.label}</span>
                    </span>
                );
            },
        },
        {
            title: "Size",
            dataIndex: "size",
            key: "size",
            align: "left",
            render: (bytes) => (
                <span style={{ whiteSpace: "nowrap" }}>
                    {formatFileSize(bytes)}
                </span>
            )
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            sorter: (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            render: (date: string) => formatDateOnly(date),
        },
        {
            title: "Created By",
            dataIndex: "created_by",
            key: "created_by",
            render: (created_by: { id: string; name: string; avatar_url: string }) => (
                <Space>
                    <img
                        // src={created_by.avatar_url}
                        src={PROFILE_PIC_URL + created_by.avatar_url + "?token=" + token}
                        alt={created_by.name}
                        style={{ width: 32, height: 32, borderRadius: "50%" }}
                    />
                    <span>{toTitleCase(created_by.name)}</span>
                </Space>
            ),
        },
        {
            title: "Actions",
            dataIndex: "actions",
            key: "actions",
            align: "center",
            render: (actions: { label: string; color: string; resourceId: string; resourcePreview: { name: string; description: string; type: string; url: string; }; }[]) => (
                <Space>
                    <Button
                        key="view"
                        color="geekblue"
                        variant="filled"
                        icon={<SnippetsOutlined />}
                        onClick={() => {
                            handleResourcePreview({
                                id: actions[0].resourceId,
                                ...actions[0].resourcePreview
                            });
                        }}
                    />
                    <Popconfirm
                        title="Delete this exercise?"
                        description="This action cannot be undone."
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleResourceDelete(actions[1].resourceId)}
                    >
                        <Tooltip title="Delete">
                            <Button
                                key="delete"
                                variant="filled"
                                color="red"
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),

        },
        {
            title: "Toggle Visibility",
            dataIndex: "visibility",
            key: "visibility",
            align: "center",
            showSorterTooltip: true,
            render: (visibility: boolean, record) => (
                <Switch
                    size="small"
                    checked={visibility}
                    onChange={async (checked) => {
                        try {
                            const response = await api.patch(`/resources/${record.id}`, { visibility: checked });
                            messageApi.open({
                                type: 'success',
                                content: `Resource visibility updated to ${checked ? 'visible' : 'hidden'}.`,
                            });
                            fetchResources(); // Refresh the resource list
                        } catch (error) {
                            messageApi.open({
                                type: 'error',
                                content: error instanceof Error ? error.message : 'Failed to update visibility',
                            });
                        }
                    }}
                />
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
        <div>
            <Card>

                <h3 >Search & Filter</h3 >
                <Row gutter={[8, 8]} align="middle" className="mt-4">
                    {/* Input - full width on mobile, 70% on desktop */}
                    <Col xs={24} sm={16} lg={20} >
                        <Input
                            placeholder="Search for resources..."
                            prefix={<SearchOutlined />}
                            allowClear
                            size="middle"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onPressEnter={(e) => setQuery((e.target as HTMLInputElement).value)}
                        />

                    </Col>

                    {/* Select - full width on mobile, 30% on desktop */}
                    <Col xs={24} sm={8} lg={4}>
                        <Select
                            defaultValue="all"
                            value={selectedResource.key}
                            size="middle"
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
            <div className="scrollable-x"
                style={{
                    width: "100%",
                    overflowX: "auto",
                }}
            >
                <div
                    style={{
                        width: "100%",
                        minWidth: "max-content", // allows scrolling if buttons overflow
                    }}
                >
                    <Segmented
                        block
                        value={selectedResource.key}
                        onChange={(newValue) =>
                            setSelectedResource(
                                RESOURCE_CATEGORIES.find((cat) => cat.key === newValue) || RESOURCE_CATEGORIES[0]
                            )
                        }
                        style={{
                            marginTop: 16,
                            marginBottom: 16,
                            width: "100%",
                            backgroundColor: "var(--color-bg-muted)",
                            borderRadius: "var(--border-radius)",
                            boxShadow: "var(--shadow)",
                            padding: 4,
                            border: `1px solid var(--color-border)`,
                        }}
                        options={RESOURCE_CATEGORIES.map(({ key, label, icon }) => ({
                            value: key,
                            label: (
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        whiteSpace: "nowrap",
                                        fontWeight: 500,
                                        color: "var(--color-text)",
                                    }}
                                >
                                    {icon}
                                    {!isMobile && <span>{label}</span>}
                                    {!isMobile && (
                                        <Tag
                                            style={{
                                                backgroundColor: "var(--color-primary)",
                                                color: "var(--color-white)",
                                                fontWeight: 600,
                                                border: "none",
                                                borderRadius: 6,
                                                height: 20,
                                                lineHeight: "20px",
                                            }}
                                        >
                                            {counts[key] || 0}
                                        </Tag>
                                    )}
                                </div>
                            ),
                        }))}
                    />

                </div>
            </div>
            <Card
                style={{
                    width: "100%",

                }}
                bodyStyle={{ padding: 16 }}
            >
                <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    <Space align="center" size={8}>
                        <FileTextOutlined style={{ fontSize: 20, color: "var(--color-primary)" }} />
                        <Typography.Title
                            level={4}
                            style={{ margin: 0, }}
                        >
                            {selectedResource.label}
                        </Typography.Title>
                    </Space>

                    <Typography.Text type="secondary">
                        {filteredData.length || 0} {filteredData.length === 1 ? "resource" : "resources"} found
                    </Typography.Text>
                </Space>
                <div className="overflow-auto mt-2" style={{ maxHeight: "60vh" }}>
                    <Table

                        columns={columns}
                        dataSource={filteredData}
                        pagination={false}
                        rowKey="name"
                    />
                </div>
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
