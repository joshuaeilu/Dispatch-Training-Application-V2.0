import { Card, Tag, Typography } from "antd";
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
  type,
  title,
  description,
  onClick,
}: ResourceCardProps) {
  const meta = TYPE_META[type];

  if (!meta) return null;

  return (
    <Card
      hoverable
      onClick={onClick}
      className="
        rounded-lg
        border border-gray-200
        shadow-sm
        transition-all
        duration-200
        hover:shadow-md
        hover:border-gray-300
        cursor-pointer
      "
      bodyStyle={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Type pill */}
      <div>
        <Tag
          color={meta.color}
          className="font-medium"
        >
          <span className="inline-flex items-center gap-1.5">
            {meta.icon}
            <span>{meta.label}</span>
          </span>
        </Tag>
      </div>


      {/* Title */}
      <Title
        level={5}
        style={{
          margin: 0,
          fontWeight: 600,
          color: "#1f2937", // gray-800
        }}
      >
        {title}
      </Title>

      {/* Description */}
      {description && (
        <Text
          type="secondary"
          style={{
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >
          {description}
        </Text>
      )}
    </Card>
  );
}
