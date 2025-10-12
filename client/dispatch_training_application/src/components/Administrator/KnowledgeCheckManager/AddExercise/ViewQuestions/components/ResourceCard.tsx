import {
  Card, Tag, Typography, Space,
  Button
} from "antd";

import type { ResourceKey } from "../../../../../../types/index.types";
import { TYPE_META } from "../../../../../../data/data";

const { Title, Text } = Typography;


type ResourceCardProps = {
  type: ResourceKey;
  title: string;
  description?: string;
  onClick?: () => void;
};



export function ResourceCard({
  type, title, description, onClick,
}: ResourceCardProps) {
  const meta = TYPE_META[type];

  return (
    <Card
      onClick={onClick}
      hoverable
    style={{
        borderRadius: 12,
        border: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
      }}
      bodyStyle={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Type pill */}
    <div >
<Tag color={meta.color} icon={meta.icon} style={{ fontWeight: 600 }}>
            {meta.label}
          </Tag></div>

      {/* Title */}
      <Title level={5} style={{ marginTop: 8, marginBottom: 8 }}>
        {title}
      </Title>

      {/* Description */}
      {description && (
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          {description}
        </Text>
      )}

    </Card>
  );
}
