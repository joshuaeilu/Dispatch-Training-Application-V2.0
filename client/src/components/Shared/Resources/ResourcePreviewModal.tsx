import { Modal, Typography, Button, Skeleton, Slider, Space } from "antd";
import { useEffect, useRef, useState } from "react";
import {
  CloseOutlined,
  PlusCircleFilled,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Image } from "antd";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const { Title, Text } = Typography;

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

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
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(800);

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

      // Reset PDF state when modal closes
      setPageNumber(1);
      setNumPages(0);
      setScale(1.0);
    }
  }, [open]);

  // Calculate container width for PDF
  useEffect(() => {
    const updateWidth = () => {
      if (pdfContainerRef.current && open) {
        const width = pdfContainerRef.current.offsetWidth - 40;
        setContainerWidth(width);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
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
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const handleFullscreen = () => {
    if (pdfContainerRef.current) {
      if (pdfContainerRef.current.requestFullscreen) {
        pdfContainerRef.current.requestFullscreen();
      }
    }
  };

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
            {/* PDF Controls - Fixed */}
            <div
              style={{
                background: "#fff",
                padding: "10px 16px",
                borderBottom: "1px solid #e8e8e8",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* Page Navigation */}
                <Space size="small">
                  <Button
                    icon={<LeftOutlined />}
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    size="middle"
                  >
                    Prev
                  </Button>
                  <div
                    style={{
                      padding: "6px 12px",
                      background: "#fafafa",
                      borderRadius: 6,
                      border: "1px solid #e8e8e8",
                      minWidth: 100,
                      textAlign: "center",
                    }}
                  >
                    <Text strong style={{ fontSize: 13 }}>
                      {pageNumber} / {numPages || "?"}
                    </Text>
                  </div>
                  <Button
                    icon={<RightOutlined />}
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    size="middle"
                  >
                    Next
                  </Button>
                </Space>

                {/* Zoom Controls */}
                <Space align="center" size="small">
                  <Button
                    icon={<ZoomOutOutlined />}
                    onClick={zoomOut}
                    disabled={scale <= 0.5}
                    size="middle"
                  />
                  <Slider
                    min={50}
                    max={300}
                    step={25}
                    value={scale * 100}
                    onChange={(value) => setScale(value / 100)}
                    style={{ width: 120, margin: "0 8px" }}
                    tooltip={{ formatter: (value) => `${value}%` }}
                  />
                  <div
                    style={{
                      minWidth: 50,
                      textAlign: "center",
                      padding: "4px 8px",
                      background: "#fafafa",
                      borderRadius: 6,
                      border: "1px solid #e8e8e8",
                    }}
                  >
                    <Text strong style={{ fontSize: 12 }}>
                      {Math.round(scale * 100)}%
                    </Text>
                  </div>
                  <Button
                    icon={<ZoomInOutlined />}
                    onClick={zoomIn}
                    disabled={scale >= 3.0}
                    size="middle"
                  />
                  <Button onClick={resetZoom} size="middle">
                    Reset
                  </Button>
                </Space>

                {/* Additional Controls */}
                <Space size="small">
                  <Button
                    icon={<FullscreenOutlined />}
                    onClick={handleFullscreen}
                    size="middle"
                    title="Fullscreen"
                  />
                  <Button
                    icon={<DownloadOutlined />}
                    href={url}
                    target="_blank"
                    size="middle"
                    title="Download PDF"
                  >
                    Download
                  </Button>
                </Space>
              </div>
            </div>

            {/* PDF Viewer - Full Coverage */}
            <div
              ref={pdfContainerRef}
              style={{
                flex: 1,
                overflow: "auto",
                background: "#525659",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <Document
                file={{ url }}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div style={{ padding: "3rem", textAlign: "center", background: "#fff", borderRadius: 8 }}>
                    <Skeleton active paragraph={{ rows: 8 }} />
                    <Text
                      type="secondary"
                      style={{ display: "block", marginTop: "1rem" }}
                    >
                      Loading PDF...
                    </Text>
                  </div>
                }
              >
                <div
                  style={{
                    display: "inline-block",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    background: "#fff",
                  }}
                >
                  <Page
                    pageNumber={pageNumber}
                    width={containerWidth}
                    scale={scale}
                    renderAnnotationLayer={true}
                    renderTextLayer={true}
                    loading={
                      <div style={{ padding: "3rem", textAlign: "center", background: "#fff" }}>
                        <Skeleton active paragraph={{ rows: 6 }} />
                      </div>
                    }
                  />
                </div>
              </Document>
            </div>
          </div>
        )}

      
      </div>
    </Modal>
  );
}