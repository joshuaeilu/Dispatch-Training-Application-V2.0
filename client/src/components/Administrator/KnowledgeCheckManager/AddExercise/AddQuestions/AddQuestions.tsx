import type { AddQuestionsSectionsProps, Question } from "../../../../../types/index.types";
import ActiveTabs from "../AddQuestions/components/ActiveTabs";
import { useState } from "react";
import ExerciseDetails from "./components/ExerciseDetails";
import ExerciseEditor from "./components/ExerciseEditor";
import NoQuestionSelected from "./components/NoQuestionsSelected";
import { v4 as uuid } from "uuid";


export default function AddQuestionsSections({
  selectedIndex,
  setSelectedIndex,
  exercise,
  setExercise,
}: AddQuestionsSectionsProps){

    const [activeTab, setActiveTab] = useState("2");

    return (
        <div style={{       
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)", }}>
<ActiveTabs
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  tabs={[
    { label: "Exercise Details", value: "1" },
    { label: "Exercise Editor", value: "2" },
  ]}
/>
       <div style={{ flex: 1,overflow: "hidden" }}>
         {activeTab === "1" && (
        <ExerciseDetails exercise={exercise} setExercise={setExercise} />
        )}
        {activeTab === "2" && (
  exercise.questions.length === 0 ? (
    <NoQuestionSelected
      onCreateFirstQuestion={() => {
        const newQuestion: Question = {
          id: uuid(),
          question: "",
          resource: undefined,
          questionCategory: "",
          correctAnswer: "",
          answerType: "text-area",
          options: [],
          correctOptions: [],
          tip: "",
        };
        setExercise({
          ...exercise,
          questions: [newQuestion],
        });
        setSelectedIndex(0);
      }}
    />
  ) : (
    <ExerciseEditor
      exercise={exercise}
      setExercise={setExercise}
      selectedIndex={selectedIndex}
      setSelectedIndex={setSelectedIndex}
    />
  )
)}

       </div>
        </div>
    )
}