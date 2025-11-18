// components/KnowledgeCheckHeader.tsx
import { Card, Col, Progress, Row, Typography } from "antd";

const { Title, Text } = Typography;

type KnowledgeCheckHeaderProps = {
  current: number;
  total: number | undefined;
  answeredCount: number;
};

export default function KnowledgeCheckHeader({ current, total, answeredCount }: KnowledgeCheckHeaderProps) {
  const percent = Math.round((answeredCount / (total || 1)) * 100);

  return (
    <div>
      <Card
        style={{
          backgroundColor: "#8C2131",
          borderRadius: 12,
          color: "white",
          boxShadow: "0 4px 12px rgba(140, 33, 49, 0.2)",
          border: "none",
        }}
        bodyStyle={{ padding: "28px 24px" }}
      >
        <div style={{ textAlign: "center" }}>
          <Title 
            level={2} 
            style={{ 
              color: "white", 
              marginBottom: 8,
              marginTop: 0,
              fontFamily: "Urbanist, sans-serif",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Dispatch Training Knowledge Check
          </Title>
          <Text 
            style={{ 
              color: "rgba(255, 255, 255, 0.95)", 
              fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
              fontFamily: "Inter, sans-serif",
              display: "block",
              lineHeight: 1.5,
            }}
          >
            Test your understanding of emergency dispatch protocols
          </Text>
        </div>
      </Card>

      <Row 
        justify="space-between" 
        align="middle" 
        style={{ 
          marginTop: "1rem", 
          marginBottom: 8,
          padding: "0 4px",
        }}
      >
        <Col>
          <Text 
            strong 
            style={{ 
              fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
              color: "#333",
            }}
          >
            Question {current} of {total}
          </Text>
        </Col>
        <Col>
          <Text 
            strong 
            style={{ 
              fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
              color: "#8C2131",
            }}
          >
            {percent}% Complete
          </Text>
        </Col>
      </Row>

      <Progress
        percent={percent}
        showInfo={false}
        strokeColor="#8C2131"
        trailColor="#e8e8e8"
        strokeWidth={12}
        style={{
          lineHeight: 0,
        }}
      />
    </div>
  );
}