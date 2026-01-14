import { useEffect, useRef, useState } from "react";
import { api } from "../utils/api";
import type { Scenario } from "../types/index.types";
import { debounce } from "lodash";
import { getUser } from "../contexts/AuthProvider";

export function useAutosaveScenario(
  scenario: Scenario,
  setLastSavedScenario: (s: Scenario) => void,
  
) {
  const [autosaving, setAutosaving] = useState(false);
  const lastSavedSnapShotRef = useRef<Scenario | null>(null);
  const user = getUser();


  const saveToServer = async (scenario: Scenario, snapshot: Scenario) => {
    try {
      setAutosaving(true);
      await api.put(`/scenarios/${scenario.id}`, { scenario, authorId: user?.id });
      setLastSavedScenario(scenario);
      lastSavedSnapShotRef.current = snapshot; 
    } catch (err) {
      console.error("Autosave failed:", err);
    } finally {
      setAutosaving(false);
    }
  };

  const debouncedSave = useRef(
    debounce((scenario: Scenario, snapshot: Scenario) => {
      saveToServer(scenario, snapshot);
    }, 3000)
  ).current;


  useEffect(() => {
    if (!scenario?.id) return;

    const snapshot = scenario;

    if(snapshot !== lastSavedSnapShotRef.current) {
      debouncedSave(scenario, snapshot);
    }
  }, [scenario]);

  const manualSave = async () => {
    if (!scenario?.id) return;
    const snapshot = scenario;
    await saveToServer(scenario, snapshot);
  };

  // useEffect(() => {

  //   const timer = setTimeout(async () => {
  //     // Prevent saving if unchanged
  //     if (deepEqual(scenario, lastSavedRef.current)) return;

  //     try {
  //       setAutosaving(true);

  //       const response = await api.post("/scenarios/autosave", {
  //         scenario,
  //       });

  //       if (response.status === 200) {
  //         lastSavedRef.current = scenario;
  //         setLastSavedScenario(scenario);
  //       }

  //     } catch (err) {
  //       console.error("Autosave error:", err);
  //     } finally {
  //       setAutosaving(false);
  //     }
  //   }, intervalMs);

  //   return () => clearTimeout(timer);
  // }, [scenario, autosaveEnabled]);

  return { autosaving, manualSave };
}
