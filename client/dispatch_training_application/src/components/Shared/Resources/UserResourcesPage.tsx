import { useState, useMemo, useEffect } from "react"
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
} from "antd"
import {
  SearchOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  AppstoreOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons"
import { type ResourceTableType } from "../../../types/index.types"
import UserPageHeader from "../UserPageHeader"
import { api } from "../../../utils/api"
import { getToken } from "../../../contexts/AuthProvider"
import { RESOURCE_URL } from "../../../data/data"

const { Title, Paragraph } = Typography

type ResourceCategory = "all" | "audio" | "maps" | "videos" | "documents" 



const categories = [
  { id: "all" as const, label: "All Resources", icon: <AppstoreOutlined /> },
  { id: "audio" as const, label: "Audio", icon: <AudioOutlined /> },
  { id: "maps" as const, label: "Maps", icon: <FileSearchOutlined /> },
  { id: "videos" as const, label: "Videos", icon: <VideoCameraOutlined /> },
  { id: "documents" as const, label: "Documents", icon: <FolderOpenOutlined /> },
]

export default function UserResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [resources, setResources] = useState<ResourceTableType[]>([]);

  const token = getToken();
  useEffect(() => {
    async function fetchResources() {
      try {
        const { data } = await api.get('/resources');
        setResources(data);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    }
    fetchResources();
  }, [resources])

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesCategory = selectedCategory === "all" || resource.type === selectedCategory
      const matchesSearch =
        searchQuery === "" ||
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  return (
    <div className="min-h-screen bg-white">
      <UserPageHeader
        title="Campus Safety Resources"
        subtitle="Your guide to staying safe and informed on the Calvin University campus"
      />

      <div style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        {/* Top Controls */}
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={18} >
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

        {/* Filter buttons */}
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
            {filteredResources.length} {filteredResources.length === 1 ? "resource" : "resources"} found
          </Typography.Text>
        </div>

        {/* No Results */}
        {filteredResources.length === 0 ? (
          <Empty description="No resources found matching your criteria." style={{ marginTop: 48 }} />
        ) : viewMode === "grid" ? (
          <Row gutter={[24, 24]}>
            {filteredResources.map((resource) => (
              <Col key={resource.id} xs={24} sm={12} lg={8}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={resource.name}
                      src={RESOURCE_URL + resource.url + "?token=" + token}
                      style={{ height: 180, objectFit: "cover" }}
                    />
                  }
                  bodyStyle={{ minHeight: 150 }}
                >
                  <Title level={5}>{resource.name}</Title>
                  {resource.description && <Paragraph type="secondary">{resource.description}</Paragraph>}
                  <Tag color="geekblue" style={{ textTransform: "uppercase" }}>
                    {resource.type}
                  </Tag>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {filteredResources.map((resource) => (
              <Card key={resource.id} hoverable>
                <Row gutter={16}>
                  <Col xs={24} md={6}>
                    <img
                      alt={resource.name}
                      src={RESOURCE_URL + resource.url + "?token=" + token}
                      style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 4 }}
                    />
                  </Col>
                  <Col xs={24} md={18}>
                    <Title level={5}>{resource.name}</Title>
                    {resource.description && <Paragraph type="secondary">{resource.description}</Paragraph>}
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
    </div>
  )
}
