// components/Shared/PageHeader.tsx
import React from "react";
import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onAdd?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showAddButton = false,
  addButtonText = "Add",
  onAdd,
}) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: 'center',
          flexWrap: "wrap",
        }}
      >
        <div>
          <Title level={3} style={{ marginBottom: subtitle ? 4 : 0 , color: "#8C2131" }}>
            {title}
          </Title>
{subtitle && (
  <Text
    style={{
      fontSize: "16px",              // Bigger font
      color: "var(--color-heading)", // Darker text (Calvin heading color)
      fontWeight: 400,
      margin: 0,
    }}
  >
    {subtitle}
  </Text>
)}        </div>

        {showAddButton && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  );
};
