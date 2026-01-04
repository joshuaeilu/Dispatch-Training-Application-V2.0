import { useEffect, useRef, useState } from "react";
import { api } from "../utils/api";
import deepEqual from "fast-deep-equal"; // if you use it. Else remove.

export function useAutosaveScenario(
  scenario: any,
  setLastSavedScenario: (s: any) => void,
  autosaveEnabled: boolean,
  intervalMs: number = 3000 // 3 seconds default
) {
  const [autosaving, setAutosaving] = useState(false);
  const lastSavedRef = useRef(scenario);

  useEffect(() => {
    if (!autosaveEnabled) return;       // ⛔ Autosave paused
    if (!scenario) return;

    const timer = setTimeout(async () => {
      // Prevent saving if unchanged
      if (deepEqual(scenario, lastSavedRef.current)) return;

      try {
        setAutosaving(true);

        const response = await api.post("/scenarios/autosave", {
          scenario,
        });

        if (response.status === 200) {
          lastSavedRef.current = scenario;
          setLastSavedScenario(scenario);
        }

      } catch (err) {
        console.error("Autosave error:", err);
      } finally {
        setAutosaving(false);
      }
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [scenario, autosaveEnabled]);

  return { autosaving };
}
