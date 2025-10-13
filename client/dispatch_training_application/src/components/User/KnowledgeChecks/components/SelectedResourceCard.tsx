// components/SelectedResourceCard.tsx
import { Card, Typography, Image } from "antd";
import {
  FileTextOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  AudioOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { RESOURCE_URL } from "../../../../data/data";
import { getToken } from "../../../../contexts/AuthProvider";
import { useEffect } from "react";

const { Title, Text } = Typography;

type Props = {
  resource: {
    name: string;
    description?: string;
    mimeType: string; // e.g. "video/mp4"
    url: string;
  };
};

export default function SelectedResourceCard({ resource }: Props) {
  const { name, description, mimeType, url } = resource;
  const token = getToken();
  const resourceUrl = RESOURCE_URL + url+ "?token=" + token;
  useEffect (() => {
    console.log("Resource URL:", resource);
  }, [resourceUrl]);
  const [typeMain] = mimeType.split("/");

  const iconMap: Record<string, React.ReactNode> = {
    image: <FileImageOutlined />,
    video: <VideoCameraOutlined />,
    audio: <AudioOutlined />,
    pdf: <FilePdfOutlined />,
    document: <FileTextOutlined />,
  };

  const renderPreview = () => {
    switch (typeMain) {
      case "image":
        return (
          <Image
            src={resourceUrl}
            alt={name}
            width="100%"
            style={{ borderRadius: 10, maxHeight: 400, objectFit: "contain" }}
            preview
          />
        );
      case "video":
        return (
          <video
            controls
            src={resourceUrl}
            style={{ width: "100%", borderRadius: 10 }}
          />
        );
      case "audio":
        return (
          <audio
            controls
            src={resourceUrl}
            style={{ width: "100%" }}
          />
        );
      case "application":
        if (typeMain.includes("pdf")) {
          return (
            <div style={{ padding: 12 }}>
              <FilePdfOutlined style={{ fontSize: 24, color: "#C2002F" }} />{" "}
              <a href={resourceUrl} target="_blank" rel="noopener noreferrer">
                Open PDF
              </a>
            </div>
          );
        }
        break;
      default:
        return (
          <Text type="secondary">Unsupported resource type: {typeMain}</Text>
        );
    }
  };

  return (
    <Card
      bordered
      style={{
        borderRadius: 10,
        boxShadow: "var(--shadow)",
        background: "#fff",
      }}
      bodyStyle={{ padding: 20 }}
    >
      <div style={{ marginBottom: 12 }}>
        <Title level={5} style={{ marginBottom: 4 }}>
          {iconMap[typeMain] || <FileTextOutlined />}{" "}
          <span style={{ marginLeft: 8 }}>{name}</span>
        </Title>
        {description && <Text type="secondary">{description}</Text>}
      </div>

      {renderPreview()}
    </Card>
  );
}
