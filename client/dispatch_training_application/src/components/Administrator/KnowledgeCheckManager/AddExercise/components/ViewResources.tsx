import {
  Typography,
  Input,
  Select,
  Row,
  Col,
  Card,
} from 'antd';
import {
  SearchOutlined,
} from '@ant-design/icons';
import { useContext, useEffect, useState } from 'react';
import { RESOURCE_CATEGORIES, RESOURCE_URL } from '../../../../../data/data';
import { ResourceCard } from './ResourceCard';
import { api } from '../../../../../utils/api';
import { type Exercise, type ResourcePreview, type ResourceTableType } from '../../../../../types/index.types';
import ResourcePreviewModal from '../../../ResourceManager/components/ResourcePreviewModal';
import { AuthContext } from '../../../../../contexts/AuthProvider';

const { Title, Text } = Typography;
const { Option } = Select;




export default function ViewResourcesPage({selectedIndex, exercise, setExercise }: { selectedIndex: number; exercise: Exercise; setExercise: (exercise: Exercise) => void }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
const [resourceFiles, setResourceFiles] = useState<ResourceTableType[]>([]);
    const [previewResource, setPreviewResource] = useState<ResourcePreview>({
        id: "",
        name: "",
        description: "",
        type: "",
        url: "",
        mimeType: ""
    });
    const { token } = useContext(AuthContext);
const [showResource, setShowResource] = useState<boolean>(false);
  // Get resources
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
  
const filteredResources = resourceFiles.filter((file) => {
  const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
const matchesType = !typeFilter || typeFilter === "all" || file.type === typeFilter;
  return matchesSearch && matchesType;
});

async function handleResourcePreview(id: string, name: string, description: string, type: string, mimeType: string, url: string) {
    try {
      
        setPreviewResource({
            id: id,
            name: name,
            description: description,
            type: type,
            mimeType: mimeType,
            url: url,
        });
        setShowResource(true);
    } catch (error) {
        console.error('Error fetching resource:', error);
    }
}

  return (
     <>
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }} >
           <Card
  style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
  bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', }}
>
        <div className="w-full flex flex-wrap justify-between items-center">
          <Col lg={11} >
          <Title level={4} style={{ margin: 0 }}>Resource Library</Title>
          <Text type="secondary">Browse, preview and manage uploaded resources</Text>
        </Col>
  <Col xs={24}  lg={8}>
    <Input
      allowClear
      prefix={<SearchOutlined />}
      placeholder="Search by name"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </Col>

  <Col xs={24}  lg={4}>
    <Select
      allowClear
      placeholder="Filter by type"
      value={typeFilter}
      onChange={setTypeFilter}
      className="w-full"
    >
      {RESOURCE_CATEGORIES.map(category => (
        <Option key={category.key} value={category.key}>
          {category.label}
        </Option>
      ))}
    </Select>
  </Col>
        </div>


    <div className="flex flex-wrap -mx-2 my-4">
      {filteredResources.length > 0 ? (
        filteredResources.map((file) => (
            <div className="w-full md:w-1/2 px-2 mb-4">
          <div className="h-full">
          <ResourceCard
            key={file.id}
            type={file.type}
            title={file.name}
            description={file.description}
            onClick={() => handleResourcePreview(file.id, file.name, file.description, file.type, file.mime_type, file.url)}
            />
            </div>
          </div>
        ))
      ) : (
        <p>No resources found</p>
      )}
  </div>
  
      </Card>
       </div>

  <ResourcePreviewModal
    open={showResource}
    onClose={() => setShowResource(false)}
    isExercise = { true}
    useResource={() => {
      // Logic for resource usage
      setExercise({
        ...exercise,
        questions: exercise.questions.map((question, index) => {
          if (index === selectedIndex) {
            return {
              ...question,
              resource: {
                id: previewResource.id,
                name: previewResource.name,
                description: previewResource.description,
                type: previewResource.type,
                mimeType: previewResource.mimeType,
                url: previewResource.url,
              }
            };
          }
          return question;
        }),
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
