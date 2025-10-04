import { Card, Typography, Button, Space, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ResourceKey, ResourcePreview } from "../../../../../types/index.types";
import { TYPE_META } from "../../../../../data/data";
const { Text, Title } = Typography;

export function SelectedResourceCard({ resource, onRemove }: {
  resource:ResourcePreview
  onRemove: () => void;
}) {
  const meta = TYPE_META[resource.type as ResourceKey];

  

  return (
    <Card
      size="small"
      bordered
      className="mb-4 shadow-sm"
      bodyStyle={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: '12px',
      }}
    >
      <div style={{ flex: 1 }}>
        <Space size="small" style={{ marginBottom: 4 }}>
          <Tag color={meta.color} icon={meta.icon} style={{ fontWeight: 600 }}>
            {meta.label}
          </Tag>
        </Space>
        <Title level={5} style={{ margin: 0 }}>{resource.name}</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {resource.description}
        </Text>
      </div>

      <Button
        type="text"
        danger
        size="small"
        icon={<DeleteOutlined />}
        onClick={onRemove}
      />
    </Card>
  );
}
