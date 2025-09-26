import { Button, Card, Divider, Empty, Input, Popover, Select, Space, Tabs, Typography } from "antd";
import { useState } from "react";
import SceneEditorPage from "./components/SceneEditorPage";
import ScenarioDetails from "./components/ScenarioDetails";
import type { Scenario, SceneEditorProps } from "../../../../../types/index.types";



export default function SceneEditor({ scenario, setScenario, currentIndex, setCurrentIndex, scrollHighlight }: SceneEditorProps) {
    const [activeTab, setActiveTab] = useState('2');
    
    
   
    
    return (

        <div style={{ width: '35%', height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Tabs

type="card"
activeKey={activeTab}
onChange={key => setActiveTab(key)}
        tabBarStyle={{ marginBottom: 0  }}
    items={[
  {
    label: 'Scenario Details',
    key: '1',
    children: null
  },
  {
    label: 'Scene Editor',
    key: '2',
    children: null
  }
]}
  
  />



{activeTab === '1' && (
        <ScenarioDetails scenario={scenario} setScenario={setScenario} />
)}

{activeTab === '2' && (
        <SceneEditorPage scenario={scenario} setScenario={setScenario} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} scrollHighlight={scrollHighlight} />
)}

        </div>
    )
}