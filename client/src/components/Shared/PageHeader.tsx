import React from "react";
import { Button, Divider, Typography } from "antd";
import {
  ArrowLeftOutlined,
  HistoryOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { checkIsMobile } from "../../contexts/AuthProvider";

const { Title, Paragraph } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showButton?: boolean;
  buttonText?: string;
  onButtonPress?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  buttonText = "Add",
  showButton,
  onButtonPress,
  showBackButton = false,
  onBack,
}) => {
  const isMobile = checkIsMobile();

  return (
    <div style={{ padding: isMobile ? "1rem": "1.5rem"}}>
      <div
        style={{
          display: "flex",
          justifyContent: isMobile ? "flex-start" : "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          flexWrap: "wrap",
          rowGap: 12,
        }}
      >
        {/* Left side (Back + Title [+ Subtitle]) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: 1,
            flexWrap: "wrap",
          }}
        >
          {showBackButton && (
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              style={{
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: isMobile ? 40 : undefined,
                height: isMobile ? 40 : undefined,
              }}
            />
          )}

          <div>
            <Title
              level={isMobile ? 3 : 2}
              style={{
                marginBottom: subtitle && !isMobile ? 4 : 0,
                color: !isMobile ? "#8C2131" : "#000",
              }}
            >
              {title}
            </Title>

            {!isMobile && subtitle && (
              <Paragraph
                style={{
                  fontSize: 16,
                  color: "rgba(60, 60, 60, 0.75)",
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                {subtitle}
              </Paragraph>
            )}
          </div>
        </div>

        {/* Desktop: Button on right */}
        {showButton && !isMobile && (
          <Button
            type="primary"
            size="large"
            icon={buttonText === "History" ? <HistoryOutlined /> : <PlusOutlined />}
            onClick={onButtonPress}
          >
            {buttonText}
          </Button>
        )}
      </div>
<Divider
  style={{
    marginBottom: 0,
    marginTop: 12,
    borderColor: '#8C2131', // Calvin maroon (or any theme highlight color)
    borderWidth: 2,
    borderStyle: 'solid',
    opacity: 0.9,
  }}
>
  {/* Optional centered label */}
</Divider>

      {/* Mobile: Button below title */}
      {isMobile && showButton && (
        <Button
          type="primary"
          block
          size="large"
          icon={buttonText === "History" ? <HistoryOutlined /> : <PlusOutlined />}
          onClick={onButtonPress}
          style={{ marginTop: 12 }}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};
