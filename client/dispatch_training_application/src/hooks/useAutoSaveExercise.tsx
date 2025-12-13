import { useEffect, useState, useRef } from "react";
import { debounce } from "lodash";
import { api } from "../utils/api";
import type { Exercise } from "../types/index.types";

export function useAutosaveExercise(
  exercise: Exercise | null,
  setLastSavedExercise: React.Dispatch<React.SetStateAction<Exercise | null>>
) {
  const [autosaving, setAutosaving] = useState(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);

  const saveToServer = async (exercise: Exercise, snapshot: string) => {
    try {
      setAutosaving(true);
      await api.put(`/exercises/${exercise.id}`, exercise);
      setLastSavedExercise(exercise);
      lastSavedSnapshotRef.current = snapshot; // ✅ snapshot, not object
    } catch (err) {
      console.error("❌ Autosave failed:", err);
    } finally {
      setAutosaving(false);
    }
  };

  const debouncedSave = useRef(
    debounce((exercise: Exercise, snapshot: string) => {
      saveToServer(exercise, snapshot);
    }, 3000)
  ).current;

  useEffect(() => {
    if (!exercise?.id) return;

    const snapshot = JSON.stringify(exercise);

    if (snapshot !== lastSavedSnapshotRef.current) {
      debouncedSave(exercise, snapshot);
    }
  }, [exercise]);

  const manualSave = async () => {
    if (!exercise?.id) return;
    const snapshot = JSON.stringify(exercise);
    await saveToServer(exercise, snapshot);
  };

  return { autosaving, manualSave };
}

