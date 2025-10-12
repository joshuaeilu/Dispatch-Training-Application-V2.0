import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface NoQuestionSelectedProps {
  onCreateFirstQuestion: () => void;
}

export default function NoQuestionSelected({ onCreateFirstQuestion }: NoQuestionSelectedProps) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAFAFA",
        padding: "2rem",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "3rem 2.5rem",
          borderRadius: 16,
          border: "1px solid #F0F0F0",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.05)",
          maxWidth: 500,
          width: "100%",
        }}
      >
        {/* Icon Circle */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "#FFF4F4",
            margin: "0 auto 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PlusOutlined style={{ fontSize: 28, color: "#8C2131" }} />
        </div>

        {/* Heading */}
        <Typography.Title level={3} style={{ marginBottom: 4, fontWeight: 600 }}>
          No Question Selected
        </Typography.Title>

        {/* Subtext */}
        <Typography.Text type="secondary" style={{ fontSize: 16 }}>
          Add a new question or choose one from the panel on the side.
        </Typography.Text>

        {/* Button */}
        <div style={{ marginTop: 32 }}>
 <Button
    type="default"
  icon={<PlusOutlined />}
  onClick={onCreateFirstQuestion}
  style={{
    height: 44,
    padding: "0 24px",
    fontWeight: 600,
    borderRadius: 8,
    fontSize: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  }}
>
  Create First Question
</Button>


        </div>
      </div>
    </div>
  );
}
