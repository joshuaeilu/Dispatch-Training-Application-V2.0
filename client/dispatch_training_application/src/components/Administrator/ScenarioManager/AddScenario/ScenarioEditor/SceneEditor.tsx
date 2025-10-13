import { Button, Card, Divider, Empty, Input, Popover, Select, Space, Tabs, Typography } from "antd";
import { useState } from "react";
import SceneEditorPage from "./components/SceneEditorPage";
import ScenarioDetails from "./components/ScenarioDetails";
import type { Scenario, SceneEditorProps } from "../../../../../types/index.types";
import ActiveTabs from "../../../KnowledgeCheckManager/AddExercise/AddQuestions/components/ActiveTabs";



export default function SceneEditor({ scenario, setScenario, currentIndex, setCurrentIndex, scrollHighlight, playing, setPlaying, audioRef }: SceneEditorProps) {
    const [activeTab, setActiveTab] = useState('2');
    
    
   
    
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
           { label: "Scenario Details", value: "1" },
           { label: "Scenario Editor", value: "2" },
         ]}
       />


{activeTab === '1' && (
        <ScenarioDetails scenario={scenario} setScenario={setScenario} />
)}

{activeTab === '2' && (
        <SceneEditorPage scenario={scenario} setScenario={setScenario} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} scrollHighlight={scrollHighlight} playing={playing} setPlaying={setPlaying} audioRef={audioRef} />
)}

        </div>
    )
}