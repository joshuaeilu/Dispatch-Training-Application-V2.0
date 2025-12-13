import { Space, Button, Typography, Radio, Modal } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined, SaveOutlined } from "@ant-design/icons";
import SceneEditor from "./SceneEditor";
import SceneOverview from "./SceneOverview";

import { useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "../../../../../contexts/AuthProvider";
import { api } from "../../../../../utils/api";
import { toast } from "react-hot-toast";

import { useScenarioManager } from "../../../../../hooks/useScenarioManager";
import { useAutosaveScenario } from "../../../../../hooks/useAutoSaveScenario";

import type { Scenario } from "../../../../../types/index.types";

const { Text } = Typography;

export default function ScenarioEditor() {
  const { Title } = Typography;
  const location = useLocation();
  const navigate = useNavigate();

  const { scenarioId, scenarioDetails } = location.state || {};
  const { scenario, setScenario } = useScenarioManager({
    scenarioId,
    scenarioDetails,
  });

  const { user } = useContext(AuthContext);

  // Autosave control
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [, setLastSavedScenario] = useState<Scenario | undefined>(scenario);

  // UI state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"draft" | "published">("draft");

  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  // STOP AUDIO PLAYBACK
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
    }
  };

  // AUTOSAVE HOOK — now accepts autosaveEnabled flag
  const { autosaving } = useAutosaveScenario(
    scenario ?? null,
    setLastSavedScenario,
    autosaveEnabled,
    10000 // 10 seconds
  );

  /**
   * SAVE SCENARIO
   * Full-proof, autosave-proof, clean.
   */
  async function saveScenario() {
    setAutosaveEnabled(false); // ⛔ STOP AUTOSAVE
    setIsPublishing(true);

    try {
      const updated: Scenario = {
  ...(scenario as Scenario),
  status: saveStatus,
};

      setScenario(updated);

      // SAVE MAIN SCENARIO
      const response = await api.post("/scenarios", {
        scenario: updated,
        authorId: user?.id,
      });

      if (saveStatus === "published") {
        // PUBLISH: Generate audio
        const audioResponse = await api.post(
          `/scenarios/${updated.id}/generate-audio`,
          {
            scenes: updated.scenes,
            speakers: updated.speakers,
          }
        );

        if (audioResponse.status !== 200) {
          console.error("Audio generation failed.");
        }
      }

      if (response.status === 200 || response.status === 201) {
        toast.success("Scenario saved successfully!");
        navigate("/scenario-manager", { replace: true });
      } else {
        toast.error("Failed to save scenario.");
      }
    } catch (err) {
      console.error("Error saving scenario:", err);
      toast.error("An error occurred while saving.");
    } finally {
      setIsPublishing(false);
      setAutosaveEnabled(true); // ✅ RE-ENABLE AUTOSAVE AFTER COMPLETION
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: 10 }}>
      {/* HEADER */}
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
        <Space align="center" size="middle">
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            size="large"
            onClick={() => navigate("/scenario-manager")}
          />

          <div>
            <Title level={4} style={{ margin: 0 }}>
              {scenario?.name || "Untitled Scenario"}
            </Title>
            <Text type="secondary">Editing scenario</Text>
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

      {/* EDITOR */}
      <div className="flex flex-col md:flex-row h-[87vh] overflow-hidden gap-4" style={{ padding: 16 }}>
        <div className="w-full md:w-1/2 h-full">
          <SceneEditor
            scenario={scenario}
            setScenario={setScenario}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            playing={playing}
            setPlaying={setPlaying}
            audioRef={audioRef}
          />
        </div>

        <div className="w-full md:w-1/2 h-full">
          <SceneOverview
            scenario={scenario}
            setScenario={setScenario}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            stopAudio={stopAudio}
          />
        </div>
      </div>

      {/* AUTOSAVE FOOTER */}
      <div
        className="flex items-center text-xs font-normal text-[#595959] bg-white"
        style={{ padding: "8px 16px", height: "4vh", gap: 6 }}
      >
        <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 14 }} />
        <span>{autosaving ? "Autosaving..." : "All changes saved"}</span>
      </div>

      {/* SAVE MODAL */}
      <Modal
        open={isSaveModalOpen}
        title="Save Scenario"
        onCancel={() => setIsSaveModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsSaveModalOpen(false)}
            disabled={isPublishing}
            className="border-btn"
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
              ? saveStatus === "published"
                ? "Publishing..."
                : "Saving..."
              : saveStatus === "published"
                ? "Publish Scenario"
                : "Save as Draft"}
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
  );
}
