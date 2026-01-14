import { Modal, Typography, Button, Skeleton, } from "antd";
import { useEffect, useRef, useState } from "react";
import {
  CloseOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";
import { Image } from "antd";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const { Title, Text } = Typography;



interface ResourcePreviewModalProps {
  open: boolean;
  onClose: () => void;
  isExercise?: boolean;
  useResource?: () => void;
  resource?: {
    name: string;
    description: string;
    type: string;
    url: string;
  };
}

export default function ResourcePreviewModal({
  open,
  onClose,
  isExercise,
  useResource,
  resource,
}: ResourcePreviewModalProps) {
  const [numPages, setNumPages] = useState<number>(0);


  // Refs to control media
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      // Pause video and reset to start
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }

      // Pause audio and reset
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

    }
  }, [open]);

  // Early return if no resource
  if (!resource) {
    return open ? (
      <Modal open={open} onCancel={onClose} footer={null} centered>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Modal>
    ) : null;
  }

  const { name, description, type, url } = resource;
  const [resourceType] = type.split("/");

  const isImage = resourceType === "image";
  const isVideo = resourceType === "video";
  const isAudio = resourceType === "audio";
  const isPdf = type === "application/pdf";
 


  // Determine modal width based on screen size
  const getModalWidth = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) return "95vw"; // Mobile
      if (window.innerWidth < 1024) return "90vw"; // Tablet
      return "85vw"; // Desktop
    }
    return "85vw";
  };

  return (
    <Modal
      title={null}
      open={open}
      destroyOnClose
      onCancel={onClose}
      closeIcon={null}
      okButtonProps={{ style: { display: "none" } }}
      cancelButtonProps={{ style: { display: "none" } }}
      centered
      width={getModalWidth()}
      styles={{
        body: {
          backgroundColor: "#fafafa",
          borderRadius: 8,
          padding: 0,
          height: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Custom Header - Fixed */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "16px 20px",
          flexShrink: 0,
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title 
            level={3} 
            style={{ 
              color: "#8C2131", 
              marginBottom: 4,
              fontSize: "clamp(18px, 3vw, 24px)",
            }}
            ellipsis={{ rows: 1 }}
          >
            {name}
          </Title>
          {description && (
            <Text 
              type="secondary" 
              style={{ 
                display: "block", 
                fontSize: "clamp(13px, 2vw, 15px)",
              }}
            >
              {description}
            </Text>
          )}
        </div>

        <div style={{ marginLeft: 16, flexShrink: 0 }}>
          {isExercise ? (
            <Button
              onClick={useResource}
              size="large"
              icon={<PlusCircleFilled />}
              className="regular-btn"
              type="primary"
            >
              Use Resource
            </Button>
          ) : (
            <Button
              type="primary"
              aria-label="Close"
              onClick={onClose}
              icon={<CloseOutlined />}
              size="large"
              style={{
                color: "#fff",
                backgroundColor: "#8C2131",
              }}
            />
          )}
        </div>
      </div>

      {/* Content Area - Full Coverage */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* IMAGE PREVIEW */}
        {isImage && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}>
            <Image
              src={url}
              alt={name}
        
            />
          </div>
        )}

        {/* VIDEO PREVIEW */}
        {isVideo && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            height: "100%",
            width: "100%",
            background: "#000",
            padding: "20px",
          }}>
            <video
              ref={videoRef}
              controls
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            >
              <source src={url} type={type} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* AUDIO PREVIEW */}
        
        {/* AUDIO PREVIEW */}
        {isAudio && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "2rem",
              background: "linear-gradient(135deg, #8C2131 0%, #B4975A 100%)",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "2rem",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                width: "100%",
                maxWidth: 600,
              }}
            >
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: "1rem",
                  fontSize: 18,
                  textAlign: "center",
                }}
              >
                🎵 Audio Player
              </Text>
              <audio
                ref={audioRef}
                controls
                controlsList="nodownload"
                style={{ width: "100%" }}
              >
                <source src={url} type={type} />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )}

        {/* PDF PREVIEW */}
        {isPdf && (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            height: "100%",
            gap: 0,
          }}>
            <iframe
              src={url + "#toolbar=0&navpanes=0&scrollbar=0"}
              title={name}
              style={{
                flex: 1,
                border: "none",
                width: "100%",
              }}
            />
          
          </div>
        )}

      
      </div>
    </Modal>
  );
}