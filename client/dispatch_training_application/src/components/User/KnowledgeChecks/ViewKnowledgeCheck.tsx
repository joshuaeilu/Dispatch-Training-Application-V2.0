import { useState, useEffect } from "react";
import { Button, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";

import type { Exercise, Question } from "../../../types/index.types";
import KnowledgeCheckHeader from "./components/KnowledgeCheckHeader";
import QuestionSection from "./components/QuestionSection";
import QuestionNavigation from "./components/QuestionNavigation";
import KnowledgeCheckResults from "./components/KnowledgeCheckResults";
import { checkIsMobile } from "../../../contexts/AuthProvider";
import { useLocation } from "react-router-dom";
import { api } from "../../../utils/api";

// 💡 Sample data (replace with real API data later)
const dummayQuestions: Question[] = [
  {
    id: "q1",
    question: "What should a dispatcher do when receiving a distress call?",
    answerType: "multiple-choice",
    options: [
      { id: 1, text: "Stay silent and listen" },
      { id: 2, text: "Ask for the caller’s name and location" },
      { id: 3, text: "End the call" },
    ],
    correctOptions: ["b", "c"],
    tip: "Always collect caller identification and location first.",
    questionCategory: "Emergency Protocols",
  },
  {
    id: "q2",
    question: "Describe how you would prioritize calls in a multi-incident scenario.",
    answerType: "text-area",
    options: [],
    correctOptions: [],
    questionCategory: "Call Management",
    resource: {
      id: "res1",
      description: "Video on Multi-Incident Call Flow",
      mimeType: "video/mp4",
      name: "Multi-Incident Call Flow",
      type: "video/mp4",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
  },
];

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
    try{
      await api.post(`/submissions`, { exerciseId, answers: userAnswers });
      setShowResults(true);
      setIsSubmitting(false);
    }
    catch(err){
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
        maxWidth: 800,
        margin: checkIsMobile() ? "1rem" : "1rem auto",
        paddingBottom: 64,
        overflowX: "hidden",
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
          >
            <KnowledgeCheckHeader
              current={currentIndex + 1}
              total={exercise?.questions.length}
            />

            <QuestionSection
              question={currentQuestion}
              index={currentIndex}
              total={exercise?.questions.length}
              userAnswer={currentQuestion ? userAnswers[currentQuestion.id] : undefined}
              setUserAnswer={handleAnswer}
            />

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
          >
            <KnowledgeCheckResults
              name={exercise?.name}
              questions={exercise?.questions || []}
              userAnswers={userAnswers}
            />
             <div
        style={{
          textAlign: "center",
          marginTop: 32,
        }}
      >
        <Button
        size="large"
          type="primary"
          className="regular-btn"
          style={{
            fontSize: 16,
            borderRadius: 10,
          }}
          onClick={()=> handleFinish()}
        >
          Finish
        </Button>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
