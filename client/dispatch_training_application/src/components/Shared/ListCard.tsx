import { Card, Tag, Typography, Row, Col, Space } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  ProfileOutlined,
  CalendarOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
  name: string;
  completed: boolean;
  questionCount: number;
  date?: string; // ISO or formatted date
  onClick: () => void;
}

export default function KnowledgeCheckCard({
  name,
  completed,
  questionCount,
  date,
  onClick,
}: Props) {
  return (
    <Col xs={24} sm={12} md={8} >
      <Card
        hoverable
        onClick={onClick}
        style={{
          background: "#fff",
          border: "1px solid #eaeaea",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          opacity: completed ? 0.6 : 1,
        }}
        bodyStyle={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* --- Top: Title + Tag --- */}
        <Row justify="space-between" align="top">
          <Col>
            <Title
              level={5}
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: "#262626",
              }}
            >
              {name}
            </Title>
          </Col>
          <Col>
            {completed ? (
              <Tag
                icon={<CheckCircleOutlined />}
                color="green"
                style={{
                  borderRadius: "999px",
                  padding: "2px 10px",
                  fontSize: 13,
                  height: "auto",
                  lineHeight: "20px",
                }}
              >
                Completed
              </Tag>
            ) : (
              <Tag
                icon={<ClockCircleOutlined />}
                color="default"
                style={{
                  borderRadius: "999px",
                  padding: "2px 10px",
                  fontSize: 13,
                  height: "auto",
                  lineHeight: "20px",
                }}
              >
                Incomplete
              </Tag>
            )}
          </Col>
        </Row>

        {/* --- Middle: Question Count --- */}
        <div
          style={{
            marginTop: 12,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 500,
              color: "#4A4A4A",
            }}
          >
            <ProfileOutlined />
            {questionCount} Question{questionCount !== 1 ? "s" : ""}
          </Text>
        </div>

        {/* --- Bottom: Date + CTA --- */}
        <Row justify="space-between" align="middle" style={{ marginTop: 8 }}>
          <Col>
            {date && (
              <Text
                type="secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "#8c8c8c",
                }}
              >
                {new Date(date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            )}
          </Col>

          <Col>
            {completed ? (
              <Space size={12}>
                <Text
                  style={{
                    fontWeight: 500,
                    color: "#8C2131",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // optional: onView handler
                  }}
                >
                  View Response <HistoryOutlined />
                </Text>
           
              </Space>
            ) : (
              <Text
                style={{
                  fontWeight: 600,
                  color: "#8C2131",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s",
                }}
              >
                Start <ArrowRightOutlined />
              </Text>
            )}
          </Col>
        </Row>
      </Card>
    </Col>
  );
}
