// components/Shared/PageHeader.tsx
import React from "react";
import { Button, Typography } from "antd";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onAdd?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showAddButton = false,
  addButtonText = "Add",
  onAdd,
  showBackButton = false,
  onBack,
}) => {
  return (
   <div style={{ marginBottom: 24 }}>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
    }}
  >
    
    {/* Left side (Title + Subtitle + optional Back Btn) */}
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {showBackButton && (
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            marginRight: 4,
          }}
        />
      )}


      <div>
        <Title
          level={3}
          style={{ marginBottom: subtitle ? 4 : 0, color: "#8C2131" }}
        >
          {title}
        </Title>
        {subtitle && (
          <Text
            style={{
              fontSize: "16px",
              color: "var(--color-heading)",
              fontWeight: 400,
              margin: 0,
            }}
          >
            {subtitle}
          </Text>
        )}
      </div>
    </div>

    {/* Right side (optional Add Btn) */}
    {showAddButton && (
      <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
        {addButtonText}
      </Button>
    )}
  </div>
</div>

  );
};
