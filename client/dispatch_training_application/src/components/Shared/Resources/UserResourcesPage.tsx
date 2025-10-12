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
  FileSearchOutlined,
  FolderOpenOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { type ResourceTableType } from "../../../types/index.types";
import UserPageHeader from "../UserPageHeader";
import { api } from "../../../utils/api";
import { getToken } from "../../../contexts/AuthProvider";
import { checkIsMobile } from "../../../contexts/AuthProvider";
import  ResourcePreviewModal  from "./ResourcePreviewModal";
const { Title, Paragraph } = Typography;

type ResourceCategory = "all" | "audio" | "maps" | "videos" | "documents" | "images";

const categories = [
  { id: "all" as const, label: "All Resources", icon: <AppstoreOutlined /> },
  { id: "images" as const, label: "Images", icon: <FileImageOutlined /> },
  { id: "audio" as const, label: "Audio", icon: <AudioOutlined /> },
  { id: "maps" as const, label: "Maps", icon: <FileSearchOutlined /> },
  { id: "videos" as const, label: "Videos", icon: <VideoCameraOutlined /> },
  { id: "documents" as const, label: "Documents", icon: <FolderOpenOutlined /> },
];

interface ResourcePreview{
  name: string;
  description: string;
  type: string; // e.g. "video/mp4"
  url: string;
}

const ResourcePlaceholder: React.FC<{ type: string }> = ({ type }) => {
  const iconMap: Record<string, JSX.Element> = {
    videos: <VideoCameraOutlined style={{ fontSize: 36, color: "#8C2131" }} />,
    audio: <AudioOutlined style={{ fontSize: 48, color: "#8C2131" }} />,
    documents: <FileTextOutlined style={{ fontSize: 48, color: "#8C2131" }} />,
    maps: <FileSearchOutlined style={{ fontSize: 48, color: "#8C2131" }} />,
    images: <FileImageOutlined style={{ fontSize: 48, color: "#8C2131" }} />,
    default: <FolderOpenOutlined style={{ fontSize: 48, color: "#8C2131" }} />,
  };

  return (
    <div
      style={{
        height: checkIsMobile() ? 120 : 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
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
  const [previewResource, setPreviewResource] = useState<ResourcePreview | undefined>(undefined);
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
    return resources.filter((resource) => {
      const matchesCategory = selectedCategory === "all" || resource.type === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [resources, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      <UserPageHeader
        title="Campus Safety Resources"
        subtitle="Your guide to staying safe and informed on the Calvin University campus"
      />

      <div style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        {/* Top Controls */}
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
          <div style={{ display: "inline-flex", gap: 8, paddingBottom: 4, minWidth: "100%" }}>
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
          </div>
        </div>

        {/* Count */}
        <div style={{ marginTop: 24, marginBottom: 16 }}>
          <Typography.Text type="secondary">
            {filteredResources.length}{" "}
            {filteredResources.length === 1 ? "resource" : "resources"} found
          </Typography.Text>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: "center", marginTop: 64 }}>
            <Spin tip="Loading resources..." size="large" />
          </div>
        ) : filteredResources.length === 0 ? (
          <Empty description="No resources found matching your criteria." style={{ marginTop: 48 }} />
        ) : viewMode === "grid" ? (
          <Row gutter={[24, 24]}>
            {filteredResources.map((resource) => (
              <Col key={resource.id} xs={24} sm={12} lg={8}>
                <Card
                  onClick={() => {
                    setPreviewResource({
                      name: resource.name,
                      description: resource.description,
                      type: resource.mime_type,
                      url: "http://10.24.9.15:5000/data" + resource.url + "?token=" + token,
                    });
                    setPreviewOpen(true);
                  }}
                  hoverable
                  cover={
                    resource.type === "audio" ||
                    resource.type === "videos" ||
                    resource.type === "documents" ? (
                      <ResourcePlaceholder type={resource.type} />
                    ) : (
                      <img
                        alt={resource.name}
                        src={"http://10.24.9.15:5000/data" + resource.url + "?token=" + token}
                        style={{ height: checkIsMobile() ? 120 : 180, objectFit: "cover" }}
                      />
                    )
                  }
                >
              <Title  style={{ fontSize: 17, marginBottom: 6 }}>
  {resource.name}
</Title>

{resource.description && (
  <Paragraph
    type="secondary"
    ellipsis={{ rows: 2 }}
    style={{
      fontSize: 15,
      lineHeight: 1.5,
      marginBottom: 8,
    }}
  >
    {resource.description}
  </Paragraph>
)}

<Tag color="geekblue" style={{ fontSize: 11, textTransform: "uppercase" }}>
  {resource.type}
</Tag>

                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {filteredResources.map((resource) => (
              <Card key={resource.id} hoverable 
              bodyStyle={{ margin: 0, padding:12}}>
                <Row gutter={16} style={{ height: 120}}>
                  <Col xs={10}  md={6} >
                    {resource.type === "audio" ||
                    resource.type === "maps" ||
                    resource.type === "videos" ||
                    resource.type === "documents" ? (
                      <ResourcePlaceholder type={resource.type} />
                    ) : (
                      <img
                        alt={resource.name}
                        src={"http://10.24.9.15:5000/data" + resource.url + "?token=" + token}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    )}
                  </Col>
                  <Col xs={10} md={18}>
                    <Title level={5}>{resource.name}</Title>
                    {resource.description && (
                      <Paragraph type="secondary">{resource.description}</Paragraph>
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


   {   previewResource && (
      <ResourcePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        resource={previewResource}
        isExercise={false}
        useResource={() => {}}
      />
   ) }
    </div>
  );
}
