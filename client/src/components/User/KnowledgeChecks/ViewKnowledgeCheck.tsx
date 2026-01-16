import { useState, useEffect } from "react";
import { Button } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

import type { Exercise } from "../../../types/index.types";
import KnowledgeCheckHeader from "./components/KnowledgeCheckHeader";
import QuestionSection from "./components/QuestionSection";
import QuestionNavigation from "./components/QuestionNavigation";
import KnowledgeCheckResults from "./components/KnowledgeCheckResults";
import { api } from "../../../utils/api";

export default function KnowledgeCheckPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [exercise, setExercise] = useState<Exercise>();

  const location = useLocation();
  const { exerciseId } = location.state || {};

  const currentQuestion = exercise?.questions[currentIndex];
  const isAnswered = currentQuestion ? !!userAnswers[currentQuestion.id] : false;

  useEffect(() => {
    if (!exerciseId) return;

    const fetchExercise = async () => {
      try {
        const res = await api.get(`/exercises/${exerciseId}`);
        setExercise(res.data);
      } catch (err) {
        console.error("Error fetching exercise:", err);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  const handleAnswer = (value: any) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentIndex < (exercise?.questions.length ?? 0) - 1) {
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/submissions`, {
        exerciseId,
        answers: userAnswers,
      });
      setShowResults(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.section
              key="questions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col gap-6"
            >
              <KnowledgeCheckHeader
                current={currentIndex + 1}
                total={exercise?.questions.length}
                answeredCount={Object.keys(userAnswers).length}
              />

              {/* Question Card */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <QuestionSection
                  question={currentQuestion}
                  index={currentIndex}
                  total={exercise?.questions.length}
                  userAnswer={
                    currentQuestion
                      ? userAnswers[currentQuestion.id]
                      : undefined
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
            </motion.section>
          ) : (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex flex-col gap-8"
            >
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <KnowledgeCheckResults
                  name={exercise?.name}
                  questions={exercise?.questions || []}
                  userAnswers={userAnswers}
                />
              </div>

              <div className="flex justify-center">
                <Button
                  size="large"
                  className="
                    regular-btn
                    px-12
                    py-2.5
                    text-base
                    rounded-lg
                    shadow-sm
                    hover:shadow-md
                  "
                  onClick={() => window.history.back()}
                >
                  Finish
                </Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
