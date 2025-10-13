import { useEffect, useState, useRef } from "react";
import { debounce } from "lodash";
import { api } from "../utils/api";
import type { Scenario } from "../types/index.types";
import { getUser } from "../contexts/AuthProvider";

export function useAutosaveScenario(
  scenario: Scenario | null,
  setLastSavedScenario: (s: Scenario) => void
) {
  const [autosaving, setAutosaving] = useState(false);
  const lastScenarioRef = useRef<Scenario | null>(null);
  const authorId = getUser()?.id || "";

    const saveToServer = async (scenario: Scenario) => {
    try {
      setAutosaving(true);
      await api.post('/scenarios', {scenario, authorId, status: 'draft' });

      setLastSavedScenario(scenario);
      lastScenarioRef.current = scenario;
    } catch (err) {
      console.error("❌ Autosave failed:", err);
    } finally {
      setAutosaving(false);
    }
  };

  const debouncedSave = useRef(
    debounce((scenario: Scenario) => {
      saveToServer(scenario);
    }, 3000) // 3 seconds of inactivity
  ).current;

  useEffect(() => {
    if (!scenario?.name) return;
    
    const prev = lastScenarioRef.current;

    const hasChanged =
      JSON.stringify(scenario) !== JSON.stringify(prev);

    if (hasChanged) {
      debouncedSave(scenario);
    }
  }, [scenario]);



  return { autosaving };
}