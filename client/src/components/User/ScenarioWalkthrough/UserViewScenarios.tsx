import {
  Tag,
} from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { api } from "../../../utils/api";
import type { Scenario, TableColumnDef } from "../../../types/index.types";
import { useNavigate } from "react-router-dom";
import UserPageHeader from "../../Shared/UserPageHeader";
import { AuthContext } from "../../../contexts/AuthProvider";
import { TableViewer } from "../../Shared/TableViewer";

interface ScenarioTableData extends Scenario {
  completed: boolean;
  sceneCount: number;
}

export default function UserViewScenarios() {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch scenarios
  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true);
      try {
        const response = await api.get("/scenarios");
        const data = response.data.scenarios.map((s: any) => ({
          ...s.scenario_data,
        }));

        setScenarios(data);

        // Fetch completed scenarios
        const submissionRes = await api.get(`/submissions/scenarios/${user?.id}`);
        const completedMap = submissionRes.data?.scenarioIds.reduce(
          (acc: Record<string, boolean>, id: string) => {
            acc[id] = true;
            return acc;
          },
          {}
        );
        setCompletedMap(completedMap);
      } catch (err) {
        console.error("Failed to fetch scenarios", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, [user?.id]);

  // Apply filters
  const filteredScenarios = scenarios;

  // Prepare table data
  const tableData: ScenarioTableData[] = filteredScenarios.map((s) => ({
    ...s,
    completed: completedMap[s.id] || false,
    sceneCount: s.scenes?.length || 0,
  }));

  // Handle Row Click
  const handleRowClick = (scenario: ScenarioTableData) => {
    navigate("view-scenario", { state: { scenario } });
  };

  // Get unique scenario types
  const scenarioTypes = Array.from(
    new Set(tableData.map((s) => s.type).filter(Boolean))
  );

  const filterOptions = {
    type: scenarioTypes,
  };

  // Define table columns
  const scenarioColumns: TableColumnDef<ScenarioTableData>[] = [
    {
      key: "name",
      header: "Name",
      align: "text-left",
      render: (s: ScenarioTableData) => (
        <span className="font-medium text-gray-900 text-base">{s.name}</span>
      ),
      searchable: true,
      filterable: false,
    },
    {
      key: "type",
      header: "Type",
      align: "text-left",
      render: (s: ScenarioTableData) => <span className="text-base">{s.type}</span>,
      searchable: false,
      filterable: true,
    },
    {
      key: "sceneCount",
      header: "Scenes",
      align: "text-center",
      render: (s: ScenarioTableData) => (
        <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-0.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
          {s.sceneCount} {s.sceneCount === 1 ? "scene" : "scenes"}
        </span>
      ),
      searchable: false,
      filterable: false,
    },
    {
      key: "difficulty",
      header: "Difficulty",
      align: "text-center",
      render: (s: ScenarioTableData) => (
        <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-0.5 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
          {s.difficulty}
        </span>
      ),
      searchable: false,
      filterable: false,
    },
    {
      key: "completed",
      header: "Status",
      align: "text-center",
      render: (s: ScenarioTableData) =>
        s.completed ? (
          <Tag
            icon={<CheckCircleOutlined />}
            style={{
              borderRadius: "999px",
              padding: "4px 12px",
              fontSize: 13,
              height: "auto",
              lineHeight: "20px",
              backgroundColor: "#F0FDF4",
              color: "#15803D",
              border: "1px solid #4ADE80",
              fontWeight: 500,
            }}
          >
            Completed
          </Tag>
        ) : (
          <Tag
            icon={<ClockCircleOutlined />}
            style={{
              borderRadius: "999px",
              padding: "4px 12px",
              fontSize: 13,
              height: "auto",
              lineHeight: "20px",
              backgroundColor: "#FEF3C7",
              color: "#92400E",
              border: "1px solid #FBBF24",
              fontWeight: 500,
            }}
          >
            In Progress
          </Tag>
        ),
      searchable: false,
      filterable: false,
    },
    {
      header: "Action",
      align: "text-center",
      render: (s: ScenarioTableData) => (
        <button
          onClick={() => handleRowClick(s)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-base font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
          style={{
            backgroundColor: s.completed ? "#FED7AA" : "#EFF6FF",
            color: s.completed ? "#92400E" : "#0369A1",
            border: `1.5px solid ${s.completed ? "#F59E0B" : "#0EA5E9"}`,
          }}
        >
          {s.completed ? (
            <>
              See Results
            </>
          ) : (
            <>
              <PlayCircleOutlined style={{ fontSize: 16 }} />
              Start
            </>
          )}
        </button>
      ),
      searchable: false,
      filterable: false,
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <UserPageHeader
        title="Scenarios"
        subtitle="Explore and complete available training scenarios."
      />

      <TableViewer
        columnDefinitions={scenarioColumns}
        columnData={tableData}
        filterOptions={filterOptions}
        loading={loading}
      />
    </div>
  );
}