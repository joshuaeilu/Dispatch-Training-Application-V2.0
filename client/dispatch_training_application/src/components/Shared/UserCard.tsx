import { Card, Avatar, Typography, Progress, Tag, Row, Col, Divider, Space } from "antd";
import {
  BookOutlined,
  EnvironmentOutlined,
  CheckCircleFilled,
  UserOutlined,
} from "@ant-design/icons";
import { toTitleCase } from "../../utils/tools";

const { Text, Title } = Typography;

type Props = {
  name: string;
  imageUrl?: string;
  completed: number;
  totalAssignments: number;
  knowledgeChecks: { completed: number; total: number };
  scenarios: { completed: number; total: number };
};

export default function UserCard({
  name,
  imageUrl,
  completed,
  totalAssignments,
  knowledgeChecks,
  scenarios,
}: Props) {
  const percentage = Math.round((completed / totalAssignments) * 100);
  const isComplete = percentage === 100;

  return (
    <Card
      hoverable
      className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl"

      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        background: "#fff",
        height: "100%", // Ensures equal height within a grid column
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header: Avatar + Name + Status */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
  <Col >
    <Space size={16} align="start">
      <Avatar
        size={56}
        src={imageUrl}
        icon={!imageUrl && <UserOutlined />}
        style={{
          backgroundColor: "#f0f0f0",
        }}
      />
      <div>
       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
         <Title level={3} style={{ margin: 0, fontSize: 18 }}>
          {toTitleCase(name)}
        </Title>
          {isComplete && (
        <Tag
          icon={<CheckCircleFilled style={{ fontSize: 14 }} />}
          color="#52c41a"
          style={{
            height: 28,
            display: "flex",
            margin: 0,
            alignItems: "center",
            fontSize: 13,
            borderRadius: 8,
            background: "rgba(82, 196, 26, 0.1)",
            border: "1px solid rgba(82, 196, 26, 0.25)",
            color: "#389e0d",
          }}
        >
          Complete
        </Tag>
  )}
       </div>
        <Text style={{ fontSize: 13, color: "#8c8c8c", fontWeight: 500 }}>
          {completed} of {totalAssignments} assignments completed
        </Text>
      </div>
    </Space>
  </Col>


</Row>



      {/* Overall Progress */}
      <div style={{ marginTop: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#595959",
              }}
            >
              Overall Progress
            </Text>
          </Col>
          <Col>
            <Text strong style={{ fontSize: 14 }}>
              {percentage}%
            </Text>
          </Col>
        </Row>

        <Progress
          percent={percentage}
          strokeColor="#8C2131"
          trailColor="#f0f0f0"
          showInfo={false}
          size="small"
          style={{ marginTop: 6 }}
        />
      </div>

      {/* Inline Stats */}
      <div style={{ marginTop: 16 }}>
        <Row >
          <Col>
            <Space size={6}>
              <BookOutlined style={{ color: "#8C2131", fontSize: 15 }} />
              <Text strong style={{ fontSize: 13 }}>
                {knowledgeChecks.completed}/{knowledgeChecks.total}
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Checks
              </Text>
            </Space>
          </Col>

            <Divider type="vertical" style={{ height: 16, margin: "0 8px" }} />

          <Col>
            <Space size={6}>
              <EnvironmentOutlined style={{ color: "#1B6F9B", fontSize: 15 }} />
              <Text strong style={{ fontSize: 13 }}>
                {scenarios.completed}/{scenarios.total}
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Scenarios
              </Text>
            </Space>
          </Col>
        </Row>
      </div>
    </Card>
  );
}
