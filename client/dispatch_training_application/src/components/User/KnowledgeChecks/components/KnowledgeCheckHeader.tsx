// components/KnowledgeCheckHeader.tsx
import { Card, Col, Progress, Row, Typography } from "antd";

const { Title, Text } = Typography;

type KnowledgeCheckHeaderProps = {
  current: number;
  total: number | undefined;

};

export default function KnowledgeCheckHeader({ current, total }: KnowledgeCheckHeaderProps) {
  const percent = Math.round((current / (total || 1)) * 100);

  return (
    <div>
      <Card
        style={{
          backgroundColor: "#8C2131", // Calvin maroon
          borderRadius: 10,
          color: "white",
          boxShadow: "var(--shadow)",
        }}
        bodyStyle={{ padding: "24px", textAlign: "center" }}
      >
        <Title level={3} style={{ color: "white", marginBottom: 4, fontFamily: "Urbanist, sans-serif" }}>
          Dispatch Training Knowledge Check
        </Title>
        <Text style={{ color: "white", fontSize: 16, fontFamily: "Inter, sans-serif" }}>
          Test your understanding of emergency dispatch protocols
        </Text>
      </Card>

      <Row justify="space-between" align="middle" style={{ marginTop: "1rem", marginBottom: 4 }}>
        <Col>
          <Text style={{ fontSize: 14 }}>Question {current} of {total}</Text>
        </Col>
        <Col>
          <Text style={{ fontSize: 14 }}>{percent}% Complete</Text>
        </Col>
      </Row>

      <Progress
        percent={percent}
        showInfo={false}
        strokeColor="#8C2131"
        trailColor="#f4f4f4"
        strokeWidth={10}
      />
    </div>
  );
}
