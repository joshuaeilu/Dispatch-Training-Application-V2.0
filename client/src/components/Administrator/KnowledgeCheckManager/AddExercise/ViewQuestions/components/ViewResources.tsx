import {
  Typography,
  Input,
  Select,
  Col,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { RESOURCE_CATEGORIES, RESOURCE_URL } from "../../../../../../data/data";
import { ResourceCard } from "./ResourceCard";
import { api } from "../../../../../../utils/api";
import { type Exercise, type ResourcePreview, type ResourceTableType } from "../../../../../../types/index.types";
import ResourcePreviewModal from "../../../../../Shared/Resources/ResourcePreviewModal";
import { AuthContext } from "../../../../../../contexts/AuthProvider";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ViewResourcesPage({
  selectedIndex,
  exercise,
  setExercise,
}: {
  selectedIndex: number;
  exercise: Exercise;
  setExercise: (exercise: Exercise) => void;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [resourceFiles, setResourceFiles] = useState<ResourceTableType[]>([]);
  const [showResource, setShowResource] = useState(false);
  const [previewResource, setPreviewResource] = useState<ResourcePreview>({
    id: "",
    name: "",
    description: "",
    type: "",
    url: "",
    mimeType: "",
  });
  const { token } = useContext(AuthContext);

  useEffect(() => {
    async function fetchResources() {
      try {
        const { data } = await api.get("/resources");
        setResourceFiles(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    }

    fetchResources();
  }, []);

  const filteredResources = resourceFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || typeFilter === "all" || file.type === typeFilter;
    return matchesSearch && matchesType;
  });

  function handleResourcePreview(
    id: string,
    name: string,
    description: string,
    type: string,
    mimeType: string,
    url: string
  ) {
    setPreviewResource({ id, name, description, type, mimeType, url });
    setShowResource(true);
  }

  return (
    <>
      <div
        style={{
          padding: "0 1.5rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="w-full flex flex-wrap justify-between items-center  mt-4">
          <Col lg={11}>
            <Title level={4} style={{ margin: 0 }}>
              Resource Library
            </Title>
            <Text type="secondary">Browse, preview and manage uploaded resources</Text>
          </Col>

          <Col xs={24} lg={7}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>

          <Col xs={24} lg={5}>
            <Select
              allowClear
              placeholder="Filter by type"
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-full"
            >
              {RESOURCE_CATEGORIES.map((category) => (
                <Option key={category.key} value={category.key}>
                  {category.label}
                </Option>
              ))}
            </Select>
          </Col>
        </div>

        <div className="flex flex-wrap -mx-2 my-4 overflow-y-auto" style={{ height: "100%" }}>
          {filteredResources.length > 0 ? (
            filteredResources.map((file) => (
              <div key={file.id} className="w-full md:w-1/2 px-2 mb-4">
                <div className="h-full">
                  <ResourceCard
                    type={file.type}
                    title={file.name}
                    description={file.description}
                    // onClick={() =>
                    //   handleResourcePreview(
                    //     file.id,
                    //     file.name,
                    //     file.description,
                    //     file.type,
                    //     file.mime_type,
                    //     file.url
                    //   )
                    // }
                  />
                </div>
              </div>
            ))
          ) : (
            <Text>No resources found</Text>
          )}
        </div>
      </div>

      <ResourcePreviewModal
        open={showResource}
        onClose={() => setShowResource(false)}
        isExercise={true}
        useResource={() => {
          setExercise({
            ...exercise,
            questions: exercise.questions.map((question, index) =>
              index === selectedIndex
                ? {
                    ...question,
                    resource: {
                      id: previewResource.id,
                      name: previewResource.name,
                      description: previewResource.description,
                      type: previewResource.type,
                      mimeType: previewResource.mimeType,
                      url: previewResource.url,
                    },
                  }
                : question
            ),
          });
          setShowResource(false);
        }}
        resource={{
          name: previewResource.name,
          description: previewResource.description,
          type: previewResource.mimeType,
          url: RESOURCE_URL + previewResource.url + "?token=" + token,
        }}
      />
    </>
  );
}
