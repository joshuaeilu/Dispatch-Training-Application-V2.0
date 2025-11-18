import { Space, Button, Typography, Radio, Modal} from "antd";
import { ArrowLeftOutlined,  CheckCircleOutlined, SaveOutlined } from "@ant-design/icons";
import SceneEditor from "./SceneEditor";
import 'antd/dist/reset.css'; // AntD v5

import { useState, useRef, useEffect } from "react";
import type { Scenario } from "../../../../../types/index.types";
import { useLocation } from "react-router-dom";
import SceneOverview from "./SceneOverview";
import { api } from "../../../../../utils/api";
import { useContext } from "react";
import { AuthContext } from "../../../../../contexts/AuthProvider";
import {  toast } from 'react-hot-toast';
import { useScenarioManager } from "../../../../../hooks/useScenarioManager";
import { useAutosaveScenario } from "../../../../../hooks/useAutoSaveScenario";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../../../contexts/AuthProvider";

const { Text} = Typography;
export default function ScenarioEditor() {
  const { Title } = Typography;
  const location = useLocation();
  const {scenarioId} = location.state || {};
  const { scenarioDetails } = location.state || {};

  const { scenario, setScenario} = useScenarioManager({ scenarioId, scenarioDetails });

  const [__, setLastSavedScenario] = useState<Scenario | undefined>(scenario);

  const [isPublishing, setIsPublishing] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const { user } = useContext(AuthContext);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Audio playback ref
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playing, setPlaying] = useState(false);

    const navigate = useNavigate();


  const stopAudio = () => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current = null;
    setPlaying(false);
  }
};





  const [saveStatus, setSaveStatus] = useState<'draft' | 'published'>('published');


const {autosaving} = useAutosaveScenario(scenario ?? null, setLastSavedScenario);



  async function saveScenario() {
    setIsPublishing(true);
    try {
      const response = await api.post("/scenarios", {
        scenario,
        authorId: user?.id,
        status: saveStatus, // ✅ explicit
      });

      if(saveStatus === 'published') {
        // generate TTS for each scene
      const audioResponse = await api.post(`/scenarios/${scenario?.id}/generate-audio`, {
        scenes: scenario?.scenes,
        speakers: scenario?.speakers
      });
      if (audioResponse.status === 200) {
        console.log("Audio generated successfully!");
      } else {
        console.log(`Audio generation failed. Status: ${audioResponse.status}`);
      }
      setIsPublishing(false);
      }


      if ((response.status  === 200) || (response.status  === 201)) {
        toast.success("Scenario saved successfully!");
        setIsPublishing(false);
        window.history.back();
      } else {
        toast.error(`Failed to save scenario. Status: ${response.status}`);
      }
    } catch (err: any) {
      console.error("Error saving scenario:", err);
      toast.error("An error occurred while saving the scenario. Check console.");
    }
  }







  return (

    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: 10 }}>

          <div
  style={{
    position: "sticky",
    top: 0,
    zIndex: 1000,
    borderBottom: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1rem",
    height: "9vh",
    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
  }}
>
  {/* Left: Back + Title */}
  <Space align="center" size="middle">
    <Button
      type="primary"
      icon={<ArrowLeftOutlined />}
      size="large"
      onClick={() => navigate("/scenario-manager")}
      
    />
    <div>
      <Title level={4} style={{ margin: 0, color: "#1F1F1F" }}>
        {scenario?.name || "Untitled Exercise"}
      </Title>
      <Text type="secondary" style={{ fontSize: 14 }}>
        Editing scenario
      </Text>
    </div>
  </Space>



    <Button
      type="primary"
      icon={<SaveOutlined />}
      size="large"
      onClick={() => setIsSaveModalOpen(true)}
      className="regular-btn"
    >
      Save
    </Button>
</div>

        {/* Main Content Area */}
<div className="flex flex-col md:flex-row h-[87vh] overflow-hidden gap-4" style={{ padding: 16 }}>
        <div className="w-full md:w-1/2 h-full ">
          <SceneEditor scenario={scenario} setScenario={setScenario} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex}
           playing={playing} setPlaying={setPlaying} audioRef={audioRef} />

</div>



   
                  <div className="w-full md:w-1/2 h-full ">

          <SceneOverview scenario={scenario} setScenario={setScenario} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} stopAudio={stopAudio} />
        </div>
        
        </div>
         <div
      className="flex items-center text-xs font-normal text-[#595959] bg-white"
      style={{
        padding: "8px 16px",
        height: "4vh",
        gap: 6,
      }}
    >
      <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 14 }} />
      <span>{autosaving ? "Autosaving..." : "All changes saved"}</span>
    </div>

  
<Modal
  open={isSaveModalOpen}
  title="Save Scenario"
  onCancel={() => setIsSaveModalOpen(false)}
  footer={[
    <Button
      key="cancel"
      onClick={() => setIsSaveModalOpen(false)}
      disabled={isPublishing}
      className="border-btn" // Calvin theme (outlined)
    >
      Cancel
    </Button>,
    <Button
  key="save"
  type="primary"
  loading={isPublishing}
  onClick={saveScenario}
  className="regular-btn"
>
  {isPublishing
    ? (saveStatus === 'published' ? 'Publishing Scenario...' : 'Saving Draft...')
    : (saveStatus === 'published' ? 'Publish Scenario' : 'Save as Draft')}
</Button>,

  ]}
>
  <p>Would you like to save this scenario as:</p>
  <Radio.Group
    value={saveStatus}
    onChange={(e) => setSaveStatus(e.target.value)}
    disabled={isPublishing}
  >
    <Radio value="draft">Draft</Radio>
    <Radio value="published">Published</Radio>
  </Radio.Group>
</Modal>


    </div>

  )
}
