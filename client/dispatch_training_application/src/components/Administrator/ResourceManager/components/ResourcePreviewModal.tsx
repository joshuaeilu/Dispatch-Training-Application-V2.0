import { Modal, Typography, Divider, Button, Skeleton } from "antd";
import { useEffect, useRef } from "react";
import { CloseOutlined, PlusCircleFilled } from "@ant-design/icons";

const { Title, Text } = Typography;

interface ResourcePreviewModalProps {
  open: boolean;
  onClose: () => void;
  isExercise?: boolean;
  useResource?: () => void;
  resource: {
    name: string;
    description: string;
    type: string; // e.g. "video/mp4"
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
  if (!resource) return <Skeleton active />;

  const { name, description, type, url } = resource;
  const [resourceType, subtype] = type.split("/");

  const isImage = resourceType === "image";
  const isVideo = resourceType === "video";
  const isAudio = resourceType === "audio";
  const isPdf = type === "application/pdf";
  const isPreviewable = isImage || isVideo || isAudio || isPdf;

  // Refs to control media
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);




  useEffect(() => {
    console.log(url);
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

  return (
    <Modal
  title={null}
  open={open}
  
  destroyOnClose
  onCancel={onClose}
  closeIcon={null} // hide default close button
  okButtonProps={{ style: { display: "none" } }}
  cancelButtonProps={{ style: { display: "none" } }}
  centered
  width="80vw"
  bodyStyle={{
    backgroundColor: "var(--color-bg)",
    borderRadius: 8,
    maxHeight: "80vh",
  }}
>
  {/* Custom Header */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
    <div>
      <Title level={4} style={{ color: "var(--color-primary)" }}>
        {name}
      </Title>
      {description && (
        <Text type="secondary" style={{ display: "block" }}>
          {description}
        </Text>
      )}
    </div>

  {isExercise ? (
    <Button onClick={useResource} size="large" icon={<PlusCircleFilled />} className="regular-btn" type="primary">
      Use Resource
    </Button>
  ): (
    <Button
    type="primary"
  aria-label="Close"
  onClick={onClose}
  icon={<CloseOutlined />}
  variant="filled"
  size="large"
  style={{
    color: "#fff",
    backgroundColor: "#8C2131",
  }}
>
</Button>
  )}
  </div>

  <Divider style={{ margin: "12px 0" }} />

      {isImage && (
        <img
          src={url}
          alt={name}
          style={{
            width: "100%",
            maxHeight: "70vh",
            objectFit: "contain",
            borderRadius: 8,
          }}
        />
      )}

      {isVideo && (
        <video ref={videoRef} controls   style={{
            width: "100%",
            maxHeight: "70vh",
            objectFit: "contain",
            borderRadius: 8,
          }}>
          <source src={url} type={type} />
          Your browser does not support the video tag.
        </video>
      )}

      {isAudio && (
        <audio ref={audioRef} controls style={{ width: "100%" }}>
          <source src={url} type={type} />
          Your browser does not support the audio element.
        </audio>
      )}

      {isPdf && (
        <iframe
          src={url}
          title="PDF Viewer"
          width="100%"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            backgroundColor: "white",
            height: "70vh",
          }}
        />
      )}

      {!isPreviewable && (
        <div style={{ padding: "1rem", textAlign: "center" }}>
          <Text>
            This file type is not previewable.{" "}
            <a href={url} target="_blank" rel="noopener noreferrer">
              Download it instead.
            </a>
          </Text>
        </div>
      )}

  
    </Modal>
  );
}
