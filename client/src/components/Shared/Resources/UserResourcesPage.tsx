import { useState, useMemo, useEffect, type JSX } from "react";
import {
  Input,
  Button,
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
  ArrowRightOutlined,
} from "@ant-design/icons";
import type { ResourceTableType } from "../../../types/index.types";
import UserPageHeader from "../UserPageHeader";
import { api } from "../../../utils/api";
import { getToken} from "../../../contexts/AuthProvider";
import ResourcePreviewModal from "./ResourcePreviewModal";
import { singularize } from "../../../utils/tools";

const { Title, Paragraph, Text } = Typography;

type ResourceCategory = "all" | "audio" | "videos" | "documents" | "images";
const BRAND_MAROON = "#8C2131";
const BRAND_MAROON_LIGHT = "rgba(140, 33, 49, 0.08)";

const resourceTypeColors: Record<string, { bg: string; text: string }> = {
  images: { bg: "#FFF7E6", text: "#FF7A45" },
  audio: { bg: "#E6F7FF", text: "#1890FF" },
  videos: { bg: "#F6E7FF", text: "#722ED1" },
  documents: { bg: "#F0F5FF", text: "#1DA1F2" },
  default: { bg: BRAND_MAROON_LIGHT, text: BRAND_MAROON },
};

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
    videos: <VideoCameraOutlined style={{ fontSize: 36, color: BRAND_MAROON }} />,
    audio: <AudioOutlined style={{ fontSize: 48, color: BRAND_MAROON }} />,
    documents: <FileTextOutlined style={{ fontSize: 48, color: BRAND_MAROON }} />,
    images: <FileImageOutlined style={{ fontSize: 48, color: BRAND_MAROON }} />,
    default: <FolderOpenOutlined style={{ fontSize: 48, color: BRAND_MAROON }} />,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BRAND_MAROON_LIGHT,
        borderRadius: 8,
        width: "100%",
        minHeight: 150,
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
    <div className="bg-white min-h-screen">
      <UserPageHeader
        title="Campus Safety Resources"
        subtitle="Your guide to staying safe and informed on the Calvin University campus"
      />

      {/* Controls Section */}
      <div className="px-6 py-6 border-b border-gray-100">
        <Row gutter={[16, 16]} align="middle" justify="space-between" style={{ marginBottom: 16 }}>
          <Col xs={24} md={18}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search resources..."
              value={searchQuery}
              size="large"
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                borderRadius: 8,
              }}
            />
          </Col>
          <Col xs={24} md={6} style={{ display: "flex", justifyContent: "flex-end" }}>
            <Segmented
              value={viewMode}
              onChange={(value) => setViewMode(value as "grid" | "list")}
              options={[
                { label: "Grid", value: "grid", icon: <AppstoreOutlined /> },
                { label: "List", value: "list", icon: <UnorderedListOutlined /> },
              ]}
            />
          </Col>
        </Row>

        {/* Category Filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <Space style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                type={selectedCategory === cat.id ? "primary" : "default"}
                icon={cat.icon}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  borderRadius: 6,
                  backgroundColor: selectedCategory === cat.id ? BRAND_MAROON : undefined,
                  borderColor: selectedCategory === cat.id ? BRAND_MAROON : "#d9d9d9",
                  color: selectedCategory === cat.id ? "white" : undefined,
                }}
              >
                {cat.label}
              </Button>
            ))}
          </Space>
          <Text type="secondary" style={{ fontSize: 14, marginLeft: 16 }}>
            {filteredResources.length}{" "}
            {filteredResources.length === 1 ? "resource" : "resources"} found
          </Text>
        </div>
      </div>
      {/* Content Section */}
      <div className="px-6 py-6">
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
                <div
                  className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
                  onClick={() => {
                    setPreviewResource({
                      name: resource.name,
                      description: resource.description,
                      type: resource.mime_type,
                      url:
                        "/data" +
                        resource.url +
                        "?token=" +
                        token,
                    });
                    setPreviewOpen(true);
                  }}
                  style={{ height: "100%", display: "flex", flexDirection: "column" }}
                >
                  {/* Cover Image */}
                  <div style={{ backgroundColor: BRAND_MAROON_LIGHT, minHeight: 150, overflow: "hidden" }}>
                    {["audio", "videos", "documents"].includes(resource.type) ? (
                      <ResourcePlaceholder type={resource.type} />
                    ) : (
                      <img
                        alt={resource.name}
                        src={
                          "/data" +
                          resource.url +
                          "?token=" +
                          token
                        }
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <Title level={5} style={{ margin: 0, marginBottom: 8, fontWeight: 600, color: "#262626" }}>
                      {resource.name}
                    </Title>
                    {resource.description && (
                      <Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 12, flex: 1, fontSize: 14, color: "#666" }}
                      >
                        {resource.description}
                      </Paragraph>
                    )}
                    <div>
                      <Tag
                        style={{
                          backgroundColor: resourceTypeColors[resource.type]?.bg || resourceTypeColors.default.bg,
                          color: resourceTypeColors[resource.type]?.text || resourceTypeColors.default.text,
                          border: "none",
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          textTransform: "uppercase",
                          padding: "4px 8px",
                        }}
                      >
                        {singularize(resource.type)}
                      </Tag>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 ease-out hover:shadow-lg"
                onClick={() => {
                  setPreviewResource({
                    name: resource.name,
                    description: resource.description,
                    type: resource.mime_type,
                    url:
                      "/data" +
                      resource.url +
                      "?token=" +
                      token,
                  });
                  setPreviewOpen(true);
                }}
              >
                <Row gutter={16} align="middle" style={{ padding: 16 }}>
                  <Col xs={10} md={4}>
                    {["audio", "videos", "documents"].includes(resource.type) ? (
                      <div style={{ backgroundColor: BRAND_MAROON_LIGHT, borderRadius: 6, overflow: "hidden" }}>
                        <ResourcePlaceholder type={resource.type} />
                      </div>
                    ) : (
                      <img
                        alt={resource.name}
                        src={
                          "/data" +
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
                    <Row justify="space-between" align="top">
                      <Col style={{ flex: 1 }}>
                        <Title level={5} style={{ margin: 0, marginBottom: 6, fontWeight: 600, color: "#262626" }}>
                          {resource.name}
                        </Title>
                        {resource.description && (
                          <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: 0, marginBottom: 10, fontSize: 14, color: "#666" }}>
                            {resource.description}
                          </Paragraph>
                        )}
                        <Tag
                          style={{
                            backgroundColor: resourceTypeColors[resource.type]?.bg || resourceTypeColors.default.bg,
                            color: resourceTypeColors[resource.type]?.text || resourceTypeColors.default.text,
                            border: "none",
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 500,
                            textTransform: "uppercase",
                            padding: "4px 8px",
                          }}
                        >
                          {singularize(resource.type)}
                        </Tag>
                      </Col>
                      <Col style={{ marginLeft: 16 }}>
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 group-hover:translate-x-0.5"
                          style={{
                            backgroundColor: BRAND_MAROON_LIGHT,
                          }}
                        >
                          <ArrowRightOutlined
                            className="text-[12px] transition-colors duration-200"
                            style={{
                              color: BRAND_MAROON,
                            }}
                          />
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
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
