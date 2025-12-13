import { Card, Typography, Space, Tag, Grid, List } from "antd";
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
  userAnswers: Record<string, unknown>;
};

type Status = "not_answered" | "correct" | "partial" | "incorrect";

export default function KnowledgeCheckResults({ name, questions, userAnswers }: Props) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // ---------- Helpers (safe, non-mutating) ----------
  const normalize = (v: unknown) => String(v ?? "").trim();

  const toArray = (v: unknown): string[] => {
    if (v == null) return [];
    if (Array.isArray(v)) return v.map(normalize).filter(Boolean);
    const one = normalize(v);
    return one ? [one] : [];
  };

  const sameSet = (a: string[], b: string[]) => {
    const A = new Set(a);
    const B = new Set(b);
    if (A.size !== B.size) return false;
    for (const x of A) if (!B.has(x)) return false;
    return true;
  };

  const getCorrectList = (q: Question): string[] => {
    if (q.answerType === "multiple-choice") return q.correctOptions ?? [];
    if (q.correctAnswer) return [q.correctAnswer];
    return [];
  };

  const getStatus = (q: Question): { status: Status; correctChosen: number; totalCorrect: number } => {
    if (q.answerType === "text-area") {
      // you said you don't want tags for text-area; treat as "not answered/correct" elsewhere if needed
      return { status: "not_answered", correctChosen: 0, totalCorrect: 0 };
    }

    const userList = toArray(userAnswers[q.id]);
    const correctList = getCorrectList(q);

    if (userList.length === 0) {
      return { status: "not_answered", correctChosen: 0, totalCorrect: correctList.length };
    }

    const correctSet = new Set(correctList);
    const correctChosen = userList.filter((u) => correctSet.has(u)).length;

    const fullyCorrect = sameSet(userList, correctList);

    if (fullyCorrect) {
      return { status: "correct", correctChosen, totalCorrect: correctList.length };
    }

    if (correctChosen > 0) {
      // got at least one right, but not all (or included wrong picks)
      return { status: "partial", correctChosen, totalCorrect: correctList.length };
    }

    return { status: "incorrect", correctChosen: 0, totalCorrect: correctList.length };
  };

  const getStatusTag = (q: Question): JSX.Element | null => {
    if (q.answerType === "text-area") return null;

    const { status, correctChosen, totalCorrect } = getStatus(q);

    const baseTagStyle: React.CSSProperties = {
      borderRadius: 999,
      fontWeight: 600,
      padding: isMobile ? "2px 8px" : "4px 12px",
      fontSize: isMobile ? 12 : 14,
    };

    if (status === "not_answered") {
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

    if (status === "correct") {
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

    if (status === "partial") {
      return (
        <Tag
          style={{
            ...baseTagStyle,
            backgroundColor: "#FFF7E6",
            border: "1px solid #FFA940",
            color: "#AD4E00",
          }}
          icon={<MinusCircleOutlined />}
        >
          Partially Correct ({correctChosen}/{totalCorrect})
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

  // ---------- UI ----------
  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: isMobile ? "0px" : "1rem",
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
          const userList = toArray(userAnswers[q.id]);
          const correctList = getCorrectList(q);

          const correctSet = new Set(correctList);
          const missed = correctList.filter((c) => !userList.includes(c));

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

              {/* Your Answers */}
              <div style={{ marginBottom: 10 }}>
                <Text strong>
                  Your Answer{userList.length > 1 ? "s" : ""}:
                </Text>

                <List
                  size="small"
                  dataSource={userList.length > 0 ? userList : ["No answer provided"]}
                  renderItem={(ans) => {
                    const isNoAnswer = ans === "No answer provided";
                    const isCorrectPick = !isNoAnswer && correctSet.has(ans);

                    return (
                      <List.Item
                        style={{
                          background: isNoAnswer ? "#F5F5F5" : isCorrectPick ? "#F6FFF8" : "#FDF7F8",
                          borderRadius: 10,
                          padding: isMobile ? "6px 10px" : "8px 14px",
                          color: isNoAnswer ? "#595959" : isCorrectPick ? "#146B2E" : "#8C2131",
                          fontSize: isMobile ? 14 : 15,
                          marginTop: 6,
                          border: isNoAnswer
                            ? "1px solid #D9D9D9"
                            : isCorrectPick
                            ? "1px solid #A2D683"
                            : "1px solid #F2C2C2",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span>{ans}</span>
                        {!isNoAnswer && (
                          <Tag
                            color={isCorrectPick ? "green" : "red"}
                            style={{ borderRadius: 999, fontWeight: 600 }}
                          >
                            {isCorrectPick ? "Correct pick" : "Wrong pick"}
                          </Tag>
                        )}
                      </List.Item>
                    );
                  }}
                />
              </div>

              {/* Correct Answers */}
              <div>
                <Text strong>
                  Correct Answer{correctList.length > 1 ? "s" : ""}:
                </Text>

                <List
                  size="small"
                  dataSource={correctList.length > 0 ? correctList : ["No correct answer set"]}
                  renderItem={(ans) => {
                    const isMissing = missed.includes(ans);
                    const noCorrect = ans === "No correct answer set";

                    return (
                      <List.Item
                        style={{
                          background: noCorrect ? "#F5F5F5" : "#F6FFF8",
                          borderRadius: 10,
                          padding: isMobile ? "6px 10px" : "8px 14px",
                          color: noCorrect ? "#595959" : "#146B2E",
                          fontSize: isMobile ? 14 : 15,
                          marginTop: 6,
                          border: noCorrect ? "1px solid #D9D9D9" : "1px solid #A2D683",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span>{ans}</span>

                        {!noCorrect && isMissing && (
                          <Tag color="orange" style={{ borderRadius: 999, fontWeight: 600 }}>
                            You missed this
                          </Tag>
                        )}
                      </List.Item>
                    );
                  }}
                />
              </div>
            </Card>
          );
        })}
      </Space>
    </div>
  );
}
