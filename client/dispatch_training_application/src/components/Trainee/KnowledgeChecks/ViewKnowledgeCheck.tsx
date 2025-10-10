import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  Card,
  Typography,
  Radio,
  Input,
  Progress,
  Space,
  Divider,
} from "antd";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";

import type { Exercise } from "../../../types/index.types";
import { api } from "../../../utils/api";
import { AuthContext } from "../../../contexts/AuthProvider";
import { getToken } from "../../../contexts/AuthProvider";
import toast from "react-hot-toast";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function ViewKnowledgeCheck() {
  const location = useLocation();
  const { exerciseId } = location.state;

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = exercise?.questions[currentIndex];
  const token = getToken();
  const { user } = useContext(AuthContext);

  const progress =
    ((currentIndex + 1) / (exercise?.questions.length || 1)) * 100;
  const isLast = currentIndex === (exercise?.questions.length || 0) - 1;

  // Fetch exercise on mount
  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const res = await api.get(`/exercises/${exerciseId}`);
        setExercise(res.data);
      } catch (err) {
        console.error("Failed to load exercise:", err);
      }
    };
    fetchExercise();
  }, [exerciseId]);

  const handleNext = async() => {
    if (isLast) {
  await submitResults(); // record only the answers
  setShowResults(true);
}

    else setCurrentIndex((i) => i + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleChange = (val: string | number) => {
    if (!currentQuestion?.id) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  const submitResults = async () => {
  if (!exercise) return;

  try {
    await api.post("/submissions", {
      exercise_id: exercise.id,
      user_id: user?.id,
      submitted_at: new Date().toISOString(),
      answers,
    });
    console.log("✅ Submission saved");
    toast.success("Exercise submitted successfully!");
  } catch (err) {
    console.error("❌ Failed to submit:", err);
  }
};


  if (showResults) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Card className="mb-4">
          <Title level={3}>Results</Title>
        </Card>

        {exercise?.questions.map((q, i) => {
          const userAnswer = answers[q.id];
          const correctOptionIds = q.options
            .filter((o) => o.isCorrect)
            .map((o) => o.id.toString());

          const isCorrect =
            q.answerType === "multiple-choice" &&
            correctOptionIds.includes(userAnswer?.toString() || "");

          return (
            <Card key={q.id} className="mb-3">
              <Text strong>{`Q${i + 1}: ${q.question}`}</Text>
              <Divider />

              <Text>Your Answer: </Text>
              <Paragraph>
                {q.answerType === "multiple-choice"
                  ? q.options.find((o) => o.id.toString() === userAnswer?.toString())?.text ||
                    "Not answered"
                  : userAnswer || "Not answered"}
              </Paragraph>

              {q.answerType === "multiple-choice" && (
                <>
                  <Text>Correct Answer: </Text>
                  <Paragraph>
                    {q.options
                      .filter((o) => o.isCorrect)
                      .map((o) => o.text)
                      .join(", ") || "No correct answer set"}
                  </Paragraph>

                  <Text type={isCorrect ? "success" : "danger"}>
                    {isCorrect ? "Correct ✅" : "Incorrect ❌"}
                  </Text>
                </>
              )}
            </Card>
          );
        })}

        <div className="text-center mt-6">
          <Button type="primary" onClick={() => window.history.back()}>
            Finish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Card className="mb-4">
        <Title level={4}>{exercise?.name}</Title>
        <Text type="secondary">
          Question {currentIndex + 1} of {exercise?.questions.length || 0}
        </Text>
        <Progress percent={Math.round(progress)} size="small" className="my-2" />
      </Card>

      <Card>
        <Title level={5}>{currentQuestion?.question}</Title>

        {/* Resource Display */}
        {currentQuestion?.resource && (
          <div className="my-4 p-4 border rounded bg-gray-50 space-y-2">
            <Text strong>Resource:</Text> {currentQuestion.resource.name}

            {currentQuestion.resource.mimeType.startsWith("image/") && (
              <img
                src={`http://localhost:5000/data${currentQuestion.resource.url}?token=${token}`}
                alt={currentQuestion.resource.name}
                className="w-full max-w-md rounded border"
              />
            )}

            {currentQuestion.resource.mimeType.startsWith("video/") && (
              <video
                controls
                src={`http://localhost:5000/data${currentQuestion.resource.url}?token=${token}`}
                className="w-full max-w-md rounded border"
              />
            )}

            {currentQuestion.resource.mimeType.startsWith("audio/") && (
              <audio
                controls
                src={`http://localhost:5000/data${currentQuestion.resource.url}?token=${token}`}
                className="w-full"
              />
            )}

            {currentQuestion.resource.mimeType === "application/pdf" && (
              <iframe
                src={`http://localhost:5000/data${currentQuestion.resource.url}?token=${token}`}
                className="w-full h-96 border rounded"
                title="PDF Resource"
              />
            )}

            {/* Fallback */}
            {![
              "image/",
              "video/",
              "audio/",
              "application/pdf",
            ].some((type) => currentQuestion.resource?.mimeType.startsWith(type)) && (
              <a
                href={`http://localhost:5000/data${currentQuestion.resource.url}?token=${token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Open Resource
              </a>
            )}
          </div>
        )}

        {/* Multiple Choice */}
        {currentQuestion?.answerType === "multiple-choice" && (
          <Radio.Group
            onChange={(e) => handleChange(e.target.value)}
            value={answers[currentQuestion.id]}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {currentQuestion.options.map((o) => (
              <Radio key={o.id} value={o.id.toString()}>
                {o.text}
              </Radio>
            ))}
          </Radio.Group>
        )}

        {/* Text Input */}
        {currentQuestion?.answerType === "text-area" && (
          <TextArea
            rows={6}
            className="mt-3"
            placeholder="Write your answer..."
            value={answers[currentQuestion.id]?.toString() || ""}
            onChange={(e) => handleChange(e.target.value)}
          />
        )}

        <Space className="mt-6">
          <Button onClick={handlePrevious} disabled={currentIndex === 0}>
            Previous
          </Button>
          <Button type="primary" onClick={handleNext}>
            {isLast ? "Submit" : "Next"}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
