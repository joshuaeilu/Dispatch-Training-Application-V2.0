import { useEffect, useState, useRef } from "react";
import { debounce } from "lodash";
import { api } from "../utils/api";
import type { Exercise } from "../types/index.types";

export function useAutosaveExercise(
  exercise: Exercise | null,
  setLastSavedExercise: (e: Exercise) => void
) {
  const [autosaving, setAutosaving] = useState(false);
  const lastExerciseRef = useRef<Exercise | null>(null);

  const saveToServer = async (exercise: Exercise) => {
    try {
      setAutosaving(true);
      await api.put(`/exercises/${exercise.id}`, exercise);
      setLastSavedExercise(exercise);
      lastExerciseRef.current = exercise;
    } catch (err) {
      console.error("❌ Autosave failed:", err);
    } finally {
      setAutosaving(false);
    }
  };

  const debouncedSave = useRef(
    debounce((exercise: Exercise) => {
      saveToServer(exercise);
    }, 3000) // 3 seconds of inactivity
  ).current;

  useEffect(() => {
    if (!exercise?.name) return;
    
    const prev = lastExerciseRef.current;

    const hasChanged =
      JSON.stringify(exercise) !== JSON.stringify(prev);

    if (hasChanged) {
      debouncedSave(exercise);
    }
  }, [exercise]);

  const manualSave = async () => {
    if (exercise?.id) {
      await saveToServer(exercise);
    }
  };

  return { autosaving, manualSave };
}
