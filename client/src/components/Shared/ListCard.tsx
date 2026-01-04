import { Card, Tag, Typography, Row, Col, Space } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  ProfileOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
  name: string;
  type: string;
  completed: boolean;
  questionCount: number;
  date?: string; // ISO or formatted date
  description?: string;
  onClick: () => void;
}

export default function KnowledgeCheckCard({
  name,
  type,
  completed,
  questionCount,
  description,
  date,
  onClick,
}: Props) {
  return (
    <Col xs={24} sm={12} md={8} >
      <Card
        hoverable
        onClick={onClick}
        style={{
          background: "#f9f9f9",
          border: "1px solid #eaeaea",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
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

        {/* --- Middle: Question Count or Description --- */}
        <div
        style={{
          marginTop: 12,
        }}
      >
        {type === "exercise" && (
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
       )}
       { type === "scenario" && (
<Text
  style={{
    fontSize: 15,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontWeight: 500,
    color: "#4A4A4A",
    lineHeight: "1.4em",
    maxHeight: "2.8em", // 2 lines × line-height
  }}
  title={description} // optional: full text on hover
>
  {description}
</Text>


        )}
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
              { type === "exercise" ? (
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
                </Text>) : (  <Text
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
                  Replay <HistoryOutlined />
                </Text>)}
           
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
