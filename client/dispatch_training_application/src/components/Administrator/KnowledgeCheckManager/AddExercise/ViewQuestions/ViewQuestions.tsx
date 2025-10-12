
import { useState } from "react";
import ActiveTabs from "../AddQuestions/components/ActiveTabs"
import type { Exercise } from "../../../../../types/index.types";
import ViewResourcesPage from "../ViewQuestions/components/ViewResources";
import ListQuestions from "./components/ListQuestions";

interface ViewQuestionsProps {
    selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
    exercise: any;
    setExercise: (exercise: Exercise) => void;
}

export default function ViewQuestions(
    {selectedIndex,
    setSelectedIndex,
    exercise,
    setExercise,
}: ViewQuestionsProps
){
        const [activeTab, setActiveTab] = useState("1");
    
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
    { label: "View Questions", value: "1" },
    { label: "Resources", value: "2" },
  ]}
/>

{activeTab === "1" && (
  <ListQuestions exercise={exercise} setExercise={setExercise} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} />
)}

 {activeTab === "2" && (
        <div
          style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
          <ViewResourcesPage
            selectedIndex={selectedIndex}
            exercise={exercise}
            setExercise={setExercise}
          />
        </div>
      )}



                </div>
    )
}