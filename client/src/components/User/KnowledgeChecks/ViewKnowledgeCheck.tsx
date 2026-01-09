import { useState, useEffect } from "react";
import { Button } from "antd";
import { motion, AnimatePresence } from "framer-motion";

import type { Exercise } from "../../../types/index.types";
import KnowledgeCheckHeader from "./components/KnowledgeCheckHeader";
import QuestionSection from "./components/QuestionSection";
import QuestionNavigation from "./components/QuestionNavigation";
import KnowledgeCheckResults from "./components/KnowledgeCheckResults";
import { useLocation } from "react-router-dom";
import { api } from "../../../utils/api";

export default function KnowledgeCheckPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [exercise, setExercise] = useState<Exercise>();

  const currentQuestion = exercise?.questions[currentIndex];
  const isAnswered = currentQuestion ? !!userAnswers[currentQuestion.id] : false;

  // get exercise ID from URL params
  const location = useLocation();
  const { exerciseId } = location.state || {};

  // fetch questions based on exerciseId
  useEffect(() => {
    if (exerciseId) {
      const fetchQuestions = async () => {
        try {
          const res = await api.get(`/exercises/${exerciseId}`);
          setExercise(res.data);
        } catch (err) {
          console.error("❌ Error fetching questions:", err);
        }
      };

      fetchQuestions();
    }
  }, [exerciseId]);

  const handleAnswer = (value: any) => {
    if (currentQuestion) {
      setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    }
  };

  const handleNext = () => {
    if (currentIndex < (exercise?.questions.length || 0) - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  // Submit answers
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/submissions`, { exerciseId, answers: userAnswers });
      setShowResults(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    // go to the knowledge checks list page
    window.history.back();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f7fa",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 750,
          margin: "0 auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                paddingBottom: "1.5rem",
              }}
            >
              <KnowledgeCheckHeader
                current={currentIndex + 1}
                total={exercise?.questions.length}
                answeredCount={Object.keys(userAnswers).length}
              />

              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <QuestionSection
                  question={currentQuestion}
                  index={currentIndex}
                  total={exercise?.questions.length}
                  userAnswer={
                    currentQuestion ? userAnswers[currentQuestion.id] : undefined
                  }
                  setUserAnswer={handleAnswer}
                />
              </div>

              <QuestionNavigation
                currentIndex={currentIndex}
                total={exercise?.questions.length}
                isAnswered={isAnswered}
                onNext={handleNext}
                onPrev={handlePrev}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                paddingBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                }}
              >
                <KnowledgeCheckResults
                  name={exercise?.name}
                  questions={exercise?.questions || []}
                  userAnswers={userAnswers}
                />
              </div>

              <div
                style={{
                  textAlign: "center",
                }}
              >
                <Button
                  size="large"
                  type="primary"
                  className="regular-btn"
                  style={{
                    borderRadius: 10,
                    padding: "0 2.5rem",
                    fontWeight: 500,
                    boxShadow: "0 4px 12px rgba(24, 144, 255, 0.25)",
                  }}
                  onClick={() => handleFinish()}
                >
                  Finish
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .ant-btn-lg {
            width: 100%;
            max-width: 280px;
          }
        }

        @media (max-width: 480px) {
          .ant-btn-lg {
            max-width: 100%;
          }
        }

        /* Smooth transitions for all interactive elements */
        .regular-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .regular-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(24, 144, 255, 0.35) !important;
        }

        .regular-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}