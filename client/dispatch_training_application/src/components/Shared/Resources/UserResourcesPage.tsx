import { useState, useMemo, useEffect, type JSX } from "react";
import {
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Space,
  Segmented,
  Tag,
  Empty,
  Spin,
} from "antd";
import {
  SearchOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  AppstoreOutlined,
  FolderOpenOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import type { ResourceTableType } from "../../../types/index.types";
import UserPageHeader from "../UserPageHeader";
import { api } from "../../../utils/api";
import { getToken, checkIsMobile } from "../../../contexts/AuthProvider";
import ResourcePreviewModal from "./ResourcePreviewModal";
import { singularize } from "../../../utils/tools";

const { Title, Paragraph, Text } = Typography;

type ResourceCategory = "all" | "audio" | "videos" | "documents" | "images";

const categories = [
  { id: "all" as const, label: "All Resources", icon: <AppstoreOutlined /> },
  { id: "images" as const, label: "Images", icon: <FileImageOutlined /> },
  { id: "audio" as const, label: "Audio", icon: <AudioOutlined /> },
  { id: "videos" as const, label: "Videos", icon: <VideoCameraOutlined /> },
  { id: "documents" as const, label: "Documents", icon: <FolderOpenOutlined /> },
];

interface ResourcePreview {
  name: string;
  description: string;
  type: string;
  url: string;
}

const ResourcePlaceholder: React.FC<{ type: string }> = ({ type }) => {
  const iconMap: Record<string, JSX.Element> = {
    videos: <VideoCameraOutlined style={{ fontSize: 36, color: "#8C2131" }} />,
    audio: <AudioOutlined style={{ fontSize: 48, color: "#8C2131" }} />,
    documents: <FileTextOutlined style={{ fontSize: 48, color: "#8C2131" }} />,
    images: <FileImageOutlined style={{ fontSize: 48, color: "#8C2131" }} />,
    default: <FolderOpenOutlined style={{ fontSize: 48, color: "#8C2131" }} />,
  };

  return (
    <div
      style={{
        height: checkIsMobile() ? 120 : 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
      }}
    >
      {iconMap[type] || iconMap.default}
    </div>
  );
};

export default function UserResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [resources, setResources] = useState<ResourceTableType[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<ResourcePreview>();
  const [loading, setLoading] = useState(true);

  const token = getToken();
  const isMobile = checkIsMobile();

  useEffect(() => {
    async function fetchResources() {
      try {
        const { data } = await api.get("/resources");
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources
      .filter((r) => r.visibility === true)
      .filter((r) => {
        const matchesCategory = selectedCategory === "all" || r.type === selectedCategory;
        const matchesSearch =
          searchQuery === "" ||
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
  }, [resources, selectedCategory, searchQuery]);

  return (
    <div className="bg-white" style={isMobile
    ? { height: "auto", overflowY: "visible" } // phone: scroll entire page
    : { height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <UserPageHeader
        title="Campus Safety Resources"
        subtitle="Your guide to staying safe and informed on the Calvin University campus"
      />

      {/* Top Section (Sticky on desktop, normal on mobile) */}
      <div
        style={{
          flexShrink: 0,
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "1.5rem",
          position: isMobile ? "relative" : "sticky",
          top: isMobile ? "auto" : 0,
        }}
      >
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col xs={24} md={18}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search resources..."
                value={searchQuery}
                size="large"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Col>
            <Col xs={24} md={6}>
              <Space wrap style={{ justifyContent: "flex-end", width: "100%" }}>
                <Segmented
                  value={viewMode}
                  onChange={(value) => setViewMode(value as "grid" | "list")}
                  options={[
                    { label: "Grid", value: "grid", icon: <AppstoreOutlined /> },
                    { label: "List", value: "list", icon: <UnorderedListOutlined /> },
                  ]}
                />
              </Space>
            </Col>
          </Row>

          {/* Filter Buttons */}
          <div style={{ overflowX: "auto", marginTop: 24 }}>
            <Space style={{ display: "inline-flex", gap: 8, paddingBottom: 4 }}>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  type={selectedCategory === cat.id ? "primary" : "default"}
                  icon={cat.icon}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </Button>
              ))}
            </Space>

          {/* Count */}
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              {filteredResources.length}{" "}
              {filteredResources.length === 1 ? "resource" : "resources"} found
            </Text>
          </div>
        </div>
      </div>

      {/* Scrollable Resource Area */}
      <div
        style={{
          flex: 1,
          overflowY: isMobile ? "visible" : "auto",
          padding: "1.5rem",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", marginTop: 64 }}>
            <Spin tip="Loading resources..." size="large" />
          </div>
        ) : filteredResources.length === 0 ? (
          <Empty
            description="No resources found matching your criteria."
            style={{ marginTop: 48 }}
          />
        ) : viewMode === "grid" ? (
          <Row gutter={[24, 24]}>
            {filteredResources.map((resource) => (
              <Col key={resource.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  onClick={() => {
                    setPreviewResource({
                      name: resource.name,
                      description: resource.description,
                      type: resource.mime_type,
                      url:
                        "http://localhost:5000/data" +
                        resource.url +
                        "?token=" +
                        token,
                    });
                    setPreviewOpen(true);
                  }}
                  cover={
                    ["audio", "videos", "documents"].includes(resource.type) ? (
                      <ResourcePlaceholder type={resource.type} />
                    ) : (
                      <img
                        alt={resource.name}
                        src={
                          "http://localhost:5000/data" +
                          resource.url +
                          "?token=" +
                          token
                        }
                        style={{
                          height: checkIsMobile() ? 120 : 160,
                          objectFit: "cover",
                          borderRadius: "8px 8px 0 0",
                        }}
                      />
                    )
                  }
                >
                  <Title level={5} style={{ marginBottom: 6 }}>
                    {resource.name}
                  </Title>
                  {resource.description && (
                    <Paragraph
                      type="secondary"
                      ellipsis={{ rows: 2 }}
                      style={{ marginBottom: 8 }}
                    >
                      {resource.description}
                    </Paragraph>
                  )}
                  <Tag color="geekblue" style={{ fontSize: 11, textTransform: "uppercase" }}>
                    {singularize(resource.type)}
                  </Tag>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {filteredResources.map((resource) => (
              <Card
                key={resource.id}
                hoverable
                onClick={() => {
                  setPreviewResource({
                    name: resource.name,
                    description: resource.description,
                    type: resource.mime_type,
                    url:
                      "http://localhost:5000/data" +
                      resource.url +
                      "?token=" +
                      token,
                  });
                  setPreviewOpen(true);
                }}
                bodyStyle={{ padding: 12 }}
              >
                <Row gutter={16} align="middle">
                  <Col xs={10} md={4}>
                    {["audio", "videos", "documents"].includes(resource.type) ? (
                      <ResourcePlaceholder type={resource.type} />
                    ) : (
                      <img
                        alt={resource.name}
                        src={
                          "http://localhost:5000/data" +
                          resource.url +
                          "?token=" +
                          token
                        }
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                    )}
                  </Col>
                  <Col xs={14} md={20}>
                    <Title level={5} style={{ marginBottom: 4 }}>
                      {resource.name}
                    </Title>
                    {resource.description && (
                      <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                        {resource.description}
                      </Paragraph>
                    )}
                    <Tag color="geekblue" style={{ textTransform: "uppercase" }}>
                      {resource.type}
                    </Tag>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        )}
      </div>

      {/* Modal */}
      {previewResource && (
        <ResourcePreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          resource={previewResource}
          isExercise={false}
          useResource={() => {}}
        />
      )}
    </div>
  );
}
