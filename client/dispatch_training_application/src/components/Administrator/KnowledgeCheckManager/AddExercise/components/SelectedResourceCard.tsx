import { Card, Typography, Button, Space, Tag, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ResourceKey, ResourcePreview } from "../../../../../types/index.types";
import { TYPE_META } from "../../../../../data/data";

const { Text, Title } = Typography;

export function SelectedResourceCard({
  resource,
  onRemove,
}: {
  resource: ResourcePreview;
  onRemove: () => void;
}) {
  const meta = TYPE_META[resource.type as ResourceKey];

  return (
    <Card
      bordered={false}
      size="small"
      style={{
        borderRadius: 10,
        border: "1px solid #e0e0e0",
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        backgroundColor: "#FAFAFA",
        marginBottom: 12,
        padding: 0,
      }}
      bodyStyle={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "16px 18px",
      }}
    >
      <div style={{ flex: 1, paddingRight: 16 }}>
        <Space size="small" style={{ marginBottom: 6 }}>
          <Tag
            color={meta.color}
            icon={meta.icon}
            style={{
              fontWeight: 600,
              borderRadius: 4,
              padding: "2px 8px",
            }}
          >
            {meta.label}
          </Tag>
        </Space>

        <Title
          level={5}
          style={{
            margin: 0,
            marginBottom: 2,
            fontSize: 16,
            fontWeight: 600,
            color: "#1F1F1F",
          }}
        >
          {resource.name}
        </Title>

        {resource.description && (
          <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.5 }}>
            {resource.description}
          </Text>
        )}
      </div>

      <Tooltip title="Remove resource">
        <Button
        type="default"
          icon={<DeleteOutlined />}
          onClick={onRemove}
          style={{
            color: "#8C2131",
            fontWeight: 500,
            padding: "2px 6px",
            height: "auto",
            border: " 1px solid #8C2131",
          }}
        >
          Remove
        </Button>
      </Tooltip>
    </Card>
  );
}
