import { Switch } from "antd";
import { PageHeader } from "../../Shared/PageHeader"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "../../../utils/api";
import type { ScenarioTableType, TableColumnDef } from "../../../types/index.types";
import ViewScenarioModal from "./components/ViewScenarioModal";
import { getUser } from "../../../contexts/AuthProvider";
import { TableViewer } from "../../Shared/TableViewer";
import { AUDIENCE_STYLES, DIFFICULTY_STYLES, STATUS_STYLES } from "../../../data/data";
import { toTitleCase } from "../../../utils/tools";
import { TableActionButton } from "../../Shared/TableActionButton";
import ArrowTopRightOnSquareIcon from "@heroicons/react/20/solid/ArrowTopRightOnSquareIcon";
import PencilSquareIcon from "@heroicons/react/20/solid/PencilSquareIcon";
import TrashIcon from "@heroicons/react/20/solid/TrashIcon";


export default function ViewScenarios() {
  const navigate = useNavigate();
  const user = getUser();
  const [scenarioFiles, setScenarioFiles] = useState<ScenarioTableType[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioTableType | undefined>(undefined);
  const [loading, setLoading] = useState(true);




  // Get all scenarios from the database
  useEffect(() => {
    async function fetchScenarios() {
      try {
        
        const { data } = await api.get('/scenarios');
        setScenarioFiles(data.scenarios.map((scenario: any) => ({
          id: scenario.id,
          authorId: scenario.author_id,
          name: scenario.scenario_data?.name || "Untitled",
          type: scenario.scenario_data?.type || "Unknown",
          difficulty: scenario.scenario_data?.difficulty || "N/A",
          questionCount: scenario.scenario_data?.scenes?.length || 0,
          status: scenario.scenario_data?.status || "draft",
          audience: scenario.scenario_data?.audience || "N/A",
          scenes: scenario.scenario_data?.scenes || [],
          visibility: scenario.visibility || false,
          created_by: {
            name: scenario.author_name || "Unknown",
            avatar_url: scenario.author_avatar || "/assets/avatars/avatar1.svg",
          },
        })));

        console.log("✅ Fetched scenarios from DB.");
      } catch (error) {
        console.error("❌ Failed to fetch scenarios:", error);
        toast.error("Failed to load scenarios");
      } finally {
        setLoading(false);
      }
    }

    fetchScenarios();
  }, []);


  async function handleDeleteScenario(scenarioId: string) {
    try {
      await api.post('/trash', { item_name: scenarioFiles.find(s => s.id === scenarioId)?.name, trash_item_id: scenarioId, who_deleted: user?.id, item_type: 'scenario' });

      toast.success("Scenario moved to trash");
      setScenarioFiles((prev) =>
        prev.filter((file) => file.id !== scenarioId)
      );
    } catch (error) {
      console.error("Error moving scenario to trash:", error);
      toast.error("Failed to move scenario to trash");
    }
  }

  const scenarioTypes = [

    ...Array.from(new Set(scenarioFiles.map(s => s.type).filter(Boolean)))
  ];


  const scenarioData: ScenarioTableType[] = scenarioFiles.map(file => ({
    id: file.id,
    authorId: file.authorId,
    name: file.name,
    type: file.type,
    difficulty: file.difficulty,
    questionCount: file.questionCount,
    status: file.status,
    audience: file.audience,
    scenes: file.scenes,
    visibility: file.visibility,
    created_by: file.created_by
  }));

  const scenarioFilterOptions = {
    type: [...scenarioTypes],
    status: ["draft", "published"],
    difficulty: ["Easy", "Medium", "Hard"],
    audience: ["All", "Trainees", "Dispatchers"],
  }

  const scenarioTableColumns: TableColumnDef<ScenarioTableType>[] = [
    {
      key: 'name',
      header: 'Name',
      align: 'text-left',
      render: (e: ScenarioTableType) => <span className="font-medium text-gray-900">{e.name}</span>,
      searchable: true,
      filterable: true,
    },
    {
      key: 'type',
      header: 'Type',
      align: 'text-left',
      render: (e: ScenarioTableType) => <span className="text-gray-600">{toTitleCase(e.type)}</span>,
      searchable: false,
      filterable: true,
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      align: 'text-left',
      render: (e: ScenarioTableType) => <span
        className={`
    inline-flex items-center
    rounded-md
    px-2.5 py-0.5
    text-xs font-medium
    ring-1 ring-inset
    ${DIFFICULTY_STYLES[e.difficulty]}
  `}
      >
        {e.difficulty}
      </span>,
      searchable: false,
      filterable: true,
    },
    {
      header: "Count",
      align: 'text-left',
      render: (e: ScenarioTableType) => (<span
        className="
          inline-flex items-center
          rounded-md
          bg-gray-50
          px-2.5 py-0.5
          text-xs font-medium
          text-gray-700
          ring-1 ring-inset ring-gray-600/20
        "
      >
        {e.questionCount}{" "}
        {e.questionCount === 1 ? "question" : "questions"}

      </span>),
      searchable: false,
      filterable: false
    },
    {
      key: 'status',
      header: 'Status',
      align: 'text-left',
      render: (e: ScenarioTableType) => <span
        className={`
    inline-flex items-center
    rounded-md
    px-2.5 py-0.5
    text-xs font-medium
    ring-1 ring-inset
    ${STATUS_STYLES[e.status]}
  `}>{toTitleCase(e.status)}</span>,
      filterable: false,
      searchable: false
    },
    {
      key: 'audience',
      header: 'Audience',
      align: 'text-left',
      render: (e: ScenarioTableType) => <span
        className={`
    inline-flex items-center
    rounded-md
    px-2.5 py-0.5
    text-xs font-medium
    ring-1 ring-inset
    ${AUDIENCE_STYLES[e.audience]}
  `}>{e.audience}</span>,
      searchable: true,
      filterable: true,
    },
    {
      key: 'visibility',
      header: 'Visibility',
      align: 'text-left',
      render: (e: ScenarioTableType) => <><Switch
        size="small"
        checked={e.visibility}
        onChange={async (checked) => {
          try {
            const response = await api.patch(`/scenarios/${e.id}`, { visibility: checked });
            if (response.status === 200) {
              setScenarioFiles((prev) => prev.map((file) => file.id === e.id ? { ...file, visibility: checked } : file
              )
              );
              toast.success("Visibility updated");
            }
          } catch (error) {
            toast.error("Failed to update visibility");
          }
        }} /><span>{e.visibility}</span></>
    },
    {
      header: 'Actions',
      align: 'text-center',
      render: (e: ScenarioTableType) => (
        <div className="flex justify-end gap-2">

          <TableActionButton
            icon={ArrowTopRightOnSquareIcon}
            title="View"
            color="green"
            onPress={() => {
              setSelectedScenario(e);
              setViewModalOpen(true);
            }
            }
          />

          <TableActionButton
            icon={PencilSquareIcon}
            title="Edit"
            color="blue"
            onPress={() => {
              navigate(`/scenario-manager/edit-scenario/`, {
                state: { scenarioId: e.id },
              });
            }
            }
          />

          <TableActionButton
            icon={TrashIcon}
            title="Delete"
            color="red"
            onPress={() => handleDeleteScenario(e.id)}
          />
        </div>
      )
    }


  ];
  return (
    <div>
      {/* Fixed Page Header */}
      <PageHeader title="View Scenarios" subtitle="Filter, search and manager scenarios"  />

      <TableViewer tableType="Scenario" loading={loading} columnDefinitions={scenarioTableColumns} columnData={scenarioData} filterOptions={scenarioFilterOptions} onButtonPress={() => navigate("/scenario-manager/add-scenario")} />

      <ViewScenarioModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        scenario={selectedScenario}
        />

    </div>
  )
}