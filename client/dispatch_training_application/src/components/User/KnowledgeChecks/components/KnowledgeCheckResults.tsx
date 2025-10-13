import { Card,  Typography, Space, Tag,  Grid, List } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import type { Question } from "../../../../types/index.types";
import type { JSX } from "react";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type Props = {
  name?: string;
  questions: Question[];
  userAnswers: Record<string, any>;
};

export default function KnowledgeCheckResults({ name, questions, userAnswers}: Props) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;


const getStatusTag = (q: Question): JSX.Element | null => {
  if (q.answerType === "text-area") return null; // Don't show any tag

  const user = userAnswers[q.id];
  const baseTagStyle = {
    borderRadius: 999,
    fontWeight: 600,
    padding: isMobile ? "2px 8px" : "4px 12px",
    fontSize: isMobile ? 12 : 14,
  } as React.CSSProperties;

  if (!user || (Array.isArray(user) && user.length === 0)) {
    return (
      <Tag
        style={{
          ...baseTagStyle,
          backgroundColor: "#EDEDED",
          border: "1px solid #BFBFBF",
          color: "#595959",
        }}
        icon={<MinusCircleOutlined />}
      >
        Not Answered
      </Tag>
    );
  }

  const isCorrect =
    q.correctOptions.sort().join(",") ===
    (Array.isArray(user) ? user.sort().join(",") : user);

  if (isCorrect) {
    return (
      <Tag
        style={{
          ...baseTagStyle,
          backgroundColor: "#F6FFF8",
          border: "1px solid #A2D683",
          color: "#146B2E",
        }}
        icon={<CheckCircleOutlined />}
      >
        Correct
      </Tag>
    );
  }

  return (
    <Tag
      style={{
        ...baseTagStyle,
        backgroundColor: "#FDF7F8",
        border: "1px solid #C2002F",
        color: "#8C2131",
      }}
      icon={<CloseCircleOutlined />}
    >
      Incorrect
    </Tag>
  );
};


  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: isMobile ? "0px" : " 1rem",
      }}
    >
      {/* Header */}
      <Card
        style={{
          backgroundColor: "#8C2131",
          color: "white",
          borderRadius: 10,
          textAlign: "center",
          marginBottom: 32,
          boxShadow: "var(--shadow)",
        }}
        bodyStyle={{
          padding: isMobile ? "20px 16px" : "32px 24px",
        }}
      >
        <Title
          level={isMobile ? 4 : 3}
          style={{
            color: "white",
            marginBottom: 4,
            fontFamily: "Urbanist, sans-serif",
          }}
        >
          {name} Results
        </Title>
      </Card>

      {/* Question Results */}
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {questions.map((q, i) => {
          const user = userAnswers[q.id];
          const userList = Array.isArray(user)
            ? user
            : user
            ? [user]
            : [];

          const correctList =
            q.answerType === "multiple-choice"
              ? q.correctOptions
              : q.correctAnswer
              ? [q.correctAnswer]
              : [];

          return (
            <Card
              key={q.id}
              style={{
                borderRadius: 10,
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                border: "1px solid #E5E5E5",
                backgroundColor: "#fff",
              }}
              bodyStyle={{ padding: isMobile ? 14 : 20 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "center",
                  flexDirection: isMobile ? "column" : "row",
                  gap: isMobile ? 6 : 0,
                }}
              >
                <Text strong style={{ color: "#8C2131" }}>
                  Question {i + 1}
                </Text>
                {getStatusTag(q)}
              </div>

              <Title
                level={isMobile ? 5 : 4}
                style={{
                  marginTop: 8,
                  marginBottom: 12,
                  fontFamily: "Urbanist, sans-serif",
                  color: "#1E1E1E",
                  fontSize: isMobile ? 15 : 17,
                }}
              >
                {q.question}
              </Title>

              {/* User Answers */}
              <div style={{ marginBottom: 10 }}>
                <Text strong>Your Answer{userList.length > 1 ? "s" : ""}:</Text>
                <List
                  size="small"
                  dataSource={
                    userList.length > 0
                      ? userList
                      : ["No answer provided"]
                  }
                  renderItem={(ans) => (
                    <List.Item
                      style={{
                        background: "#FDF7F8",
                        borderRadius: 10,
                        padding: isMobile ? "6px 10px" : "8px 14px",
                        color: "#8C2131",
                        fontSize: isMobile ? 14 : 15,
                        marginTop: 6,
                        border: "1px solid #F2C2C2",
                      }}
                    >
                      {ans}
                    </List.Item>
                  )}
                />
              </div>

              {/* Correct Answers */}
              <div>
                <Text strong>Correct Answer{correctList.length > 1 ? "s" : ""}:</Text>
                <List
                  size="small"
                  dataSource={correctList}
                  renderItem={(ans) => (
                    <List.Item
                      style={{
                        background: "#F6FFF8",
                        borderRadius: 10,
                        padding: isMobile ? "6px 10px" : "8px 14px",
                        color: "#146B2E",
                        fontSize: isMobile ? 14 : 15,
                        marginTop: 6,
                        border: "1px solid #A2D683",
                      }}
                    >
                      {ans}
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          );
        })}
      </Space>


     
    </div>
  );
}
