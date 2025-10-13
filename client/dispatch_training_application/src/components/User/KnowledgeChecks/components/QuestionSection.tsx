import { Typography, Space, Tag, Card } from "antd";
import type { Question } from "../../../../types/index.types";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import TextAreaQuestion from "./TextAreaQuestion";
import SelectedResourceCard from "./SelectedResourceCard";
import { BulbOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

type Props = {
  question: Question | undefined;
  index: number;
  total: number | undefined;
  userAnswer: any;
  setUserAnswer: (val: any) => void;
};

export default function QuestionSection({
  question,
  userAnswer,
  setUserAnswer,
}: Props) {
  const renderAnswerInput = () => {
    if (question?.answerType === "multiple-choice") {
      return (
        <MultipleChoiceQuestion
          options={question.options}
          selected={userAnswer}
        allowMultiple={question.correctOptions.length > 1}
          setSelected={setUserAnswer}
        />
      );
    } else {
      return (
        <TextAreaQuestion
          value={userAnswer}
          onChange={setUserAnswer}
        />
      );
    }
  };

  return (
    <Card style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {question?.questionCategory && (
      <Tag
  style={{
    borderRadius: 999,
    backgroundColor: "#FDF7F8", // light maroon shade
    border: "1px solid #8C2131", // Calvin maroon border
    color: "#8C2131", // Calvin maroon text
    fontWeight: 600,
    fontFamily: "Urbanist, sans-serif",
    padding: "4px 16px",
    fontSize: 14,
  }}
>
  {question.questionCategory}
</Tag>



        )}

      

        <Title
          level={3}
          style={{
            fontFamily: "Urbanist, sans-serif",
            color: "#1E1E1E",
            marginBottom: 0,
          }}
        >
          {question?.question}
        </Title>
          {question?.resource && (
          <>
            <SelectedResourceCard resource={question.resource} />
          </>
        )}

        {renderAnswerInput()}

        {question?.tip && (
          <div
            style={{
              borderRadius: 10,
              background: "#E6F7FF",
              padding: "16px 20px",
              border: "1px solid #91D5FF",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <BulbOutlined style={{ color: "#1890FF", fontSize: 20, marginTop: 4 }} />
            <div>
              <Text strong style={{ color: "#1890FF" }}>
                Helpful Tip
              </Text>
              <div>
                <Text style={{ display: "block", marginTop: 4 }}>{question.tip}</Text>
              </div>
            </div>
          </div>
        )}

        
      </Space>
    </Card>
  );
}
