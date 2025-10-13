import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import type { Scenario } from "../types/index.types";

type UseScenarioManagerProps = {
  scenarioId?: string;
  scenarioDetails?: Scenario;
};

export function useScenarioManager({ scenarioId, scenarioDetails }: UseScenarioManagerProps) {
  const navigate = useNavigate();
    const [scenario, setScenario] = useState<Scenario | undefined>(undefined);


    useEffect(() => {
      async function init() {
        if (scenarioId) {
            try {
                const { data } = await api.get(`/scenarios/${scenarioId}`);
                
                const loaded: Scenario = {
                    id: data.scenario_data.id,
                    name: data.scenario_data.name,
                    description: data.scenario_data.description,
                    difficulty: data.scenario_data.difficulty,
                    type: data.scenario_data.type,
                    audience: data.scenario_data.audience,
                    timing: data.scenario_data.timing,
                    speakers: data.scenario_data.speakers,
                    scenes: data.scenario_data.scenes,
                    status: data.scenario_data.status,
                };
                setScenario(loaded);
            } catch (err) {
                console.error("Failed to load scenario", err);
                navigate("/scenario-manager");
            } 
         }else if (scenarioDetails) {
                setScenario(scenarioDetails);
            }
        }
        init();
    }, [scenarioId, scenarioDetails, navigate]);

    return { scenario, setScenario };
}