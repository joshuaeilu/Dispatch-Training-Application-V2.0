import {
  Card, Tag, Typography, Space,
  Button
} from "antd";

import type { ResourceKey } from "../../../../../types/index.types";
import { TYPE_META } from "../../../../../data/data";

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
      className="resource-card shadow-soft h-full flex flex-col"
      bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Type pill */}
    <div className="resource-type">
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
