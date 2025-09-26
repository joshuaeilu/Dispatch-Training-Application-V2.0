import { Space, Button, Typography, Radio, Modal, Tooltip, Popconfirm } from "antd";
import { ArrowLeftOutlined, CloseOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import SceneEditor from "./SceneEditor";
import 'antd/dist/reset.css'; // AntD v5
import { Skeleton } from "antd";
import { debounce } from "lodash"; // install with npm i lodash
import MOP2025 from "../../../../assets/MOP2025.pdf";
import { v4 as uuidv4 } from 'uuid';

import { useState, useRef, useEffect } from "react";
import type { HighlightData, Scenario } from "../../../../../types/index.types";
import PdfViewer from "./PdfViewer";
import { useLocation } from "react-router-dom";
import { toTitleCase } from "../../../../../utils/tools";
import SceneOverview from "./SceneOverview";
import { api } from "../../../../../utils/api";
import { useContext } from "react";
import { AuthContext } from "../../../../../contexts/AuthProvider";
import { Toaster, toast } from 'react-hot-toast';
export default function ScenarioEditor() {
  const { Title } = Typography;
  const location = useLocation();
const scenarioDetails = location.state?.scenario || location.state?.scenarioDetails;

if (!scenarioDetails) {
  toast.error("No scenario loaded.");
  window.history.back();
}

  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useContext(AuthContext);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [loading, setLoading] = useState(false);

  const [scenario, setScenario] = useState<Scenario>({
  id: scenarioDetails.id || uuidv4(),
  name: toTitleCase(scenarioDetails.name || "Untitled"),
  description: scenarioDetails.description || "",
  difficulty: scenarioDetails.difficulty || "",
  type: scenarioDetails.type || "",
  audience: scenarioDetails.audience || "",
  timing: scenarioDetails.timing || { time: "", day: "", season: "" },
  speakers: scenarioDetails.speakers || [],
  scenes: scenarioDetails.scenes?.length > 0
    ? scenarioDetails.scenes
    : [
        {
          id: uuidv4(),
          speaker: "",
          sceneDescription: "",
          options: [],
          correctOption: null,
          tip: "",
          highlights: [],
        },
      ],
});
  const [lastSavedScenario, setLastSavedScenario] = useState<Scenario | null>(scenario);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);


  const scrollToHighlight = (h: HighlightData) => {
    const container = scrollContainerRef.current;
    const pageEl = pageRefs.current[h.page - 1];
    if (!container || !pageEl || !h.rects?.length) return;


    const pageTop = pageEl.offsetTop;
    const pageLeft = pageEl.offsetLeft;

    const r = h.rects[0]; // First highlight rect

    // Calculate the position of the highlight inside the scroll container
    const highlightTop = pageTop + r.y * pageEl.offsetHeight;
    const highlightLeft = pageLeft + r.x * pageEl.offsetWidth;

    const highlightHeight = r.height * pageEl.offsetHeight;
    const highlightWidth = r.width * pageEl.offsetWidth;

    // Center the highlight vertically and horizontally
    const targetTop = highlightTop - (container.clientHeight / 2) + (highlightHeight / 2);
    const targetLeft = highlightLeft - (container.clientWidth / 2) + (highlightWidth / 2);

    container.scrollTo({
      top: targetTop,
      left: targetLeft,
      behavior: 'smooth',
    });
  };
  const [saveStatus, setSaveStatus] = useState<'draft' | 'published'>('published');






  // Debounced save function (prevents spamming requests)
  const debouncedSave = useRef(
    debounce(async (scenario, userId, setLastSavedScenario) => {
      try {
        await api.post("/scenarios", {
          scenario,
          authorId: userId,
          status: "draft",
        });
        setLastSavedScenario(scenario);
        console.log("✅ Autosaved while typing.");
      } catch (err) {
        console.error("❌ Autosave failed:", err);
      }
    }, 5000) // save 2s after last change
  ).current;

  useEffect(() => {
    if (!user?.id) return;
    const hasChanged =
      JSON.stringify(lastSavedScenario) !== JSON.stringify(scenario);

    if (!hasChanged) return;

    debouncedSave(scenario, user.id, setLastSavedScenario);
  }, [scenario, user, lastSavedScenario, debouncedSave]);

  async function saveScenario() {
    try {

      const response = await api.post("/scenarios", {
        scenario,
        authorId: user?.id,
        status: saveStatus, // ✅ explicit
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Scenario saved successfully!");
        window.history.back();
      } else {
        toast.error(`Failed to save scenario. Status: ${response.status}`);
      }
    } catch (err: any) {
      console.error("Error saving scenario:", err);
      toast.error("An error occurred while saving the scenario. Check console.");
    }
  }


  useEffect(() => {
    const fetchLatestScenario = async () => {
      const id = scenarioDetails?.id;
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get(`/scenarios/${id}`);
        if (res.status === 200) {
          setScenario(res.data.scenario_data);
          setLastSavedScenario(res.data.scenario_data);
          console.log("✅ Loaded latest scenario from DB.");
        }
      } catch (err) {
        console.error("❌ Failed to load latest scenario:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestScenario();
  }, []);


  const handleDeleteScenario = async () => {
    if (!scenario.id || !user?.id) return;

    try {
      const res = await api.delete(`/scenarios/${scenario.id}`, {
        data: { authorId: user.id }, // optional: verify ownership
      });

      if (res.status === 200) {
        toast.success("Scenario deleted successfully.");
        window.history.back(); // or navigate to dashboard
      } else {
        toast.error(`Failed to delete scenario. Status: ${res.status}`);
      }
    } catch (err) {
      console.error("❌ Failed to delete scenario:", err);
      toast.error("An error occurred while deleting.");
    }
  };





  return (

    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: 10 }}>
      <Skeleton
        loading={loading}
        active
        title={{ width: 300 }}
        paragraph={{ rows: 25 }}
        style={{ padding: 15 }}
      >

        {/* Header Section */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            background: "var(--color-bg-base)",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: '10%'
          }}
        >
       {/* Left: Back + Page Title */}
  <div style={{ display: 'flex', alignItems: 'center', }}>
    <Button
      type="primary"
      size="middle"
      icon={<ArrowLeftOutlined />}
      style={{ marginRight: 12 }}
      onClick={() => window.history.back()}
    />
    <Title level={4} style={{ margin: 0 }}>
      {scenario.name}
    </Title>
  </div>

          {/* Right: Actions */}
          <Space>
            <Popconfirm
              title="Are you sure you want to delete this scenario? This action cannot be undone."
              onConfirm={() => {
                handleDeleteScenario();
              }}
            >
              <Tooltip title="Delete scenario" placement="left">
                <Button icon={<DeleteOutlined />}
                  danger>
                  Delete
                </Button>
              </Tooltip>
            </Popconfirm>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => setIsSaveModalOpen(true)}>
              Save
            </Button>
          </Space>
        </div>

        {/* Main Content Area */}
        <div style={{ height: '90%', display: 'flex', flexDirection: 'row' }}>
          <SceneEditor scenario={scenario} setScenario={setScenario} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} scrollHighlight={(highlight: HighlightData) => scrollToHighlight(highlight)} />
          <PdfViewer highlights={scenario.scenes[currentIndex]?.highlights || []} setHighlights={(highlights) => {
            setScenario((prev) => ({
              ...prev,
              scenes: prev.scenes.map((scene, index) =>
                index === currentIndex ? { ...scene, highlights } : scene
              ),
            }));
          }}
            scrollContainerRef={scrollContainerRef} pageRefs={pageRefs} />
          <SceneOverview scenario={scenario} setScenario={setScenario} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
        </div>
      </Skeleton>

      <Modal
        open={isSaveModalOpen}
        title="Save Scenario"
        onCancel={() => setIsSaveModalOpen(false)}
        onOk={saveScenario}
        okText="Save"
      >
        <p>Would you like to save this scenario as:</p>
        <Radio.Group
          value={saveStatus}
          onChange={(e) => setSaveStatus(e.target.value)}
        >
          <Radio value="draft">Draft</Radio>
          <Radio value="published">Published</Radio>
        </Radio.Group>
      </Modal>

    </div>

  )
}
