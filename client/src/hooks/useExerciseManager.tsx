import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import type { Exercise } from "../types/index.types";

type UseExerciseManagerProps = {
  exerciseId?: string;
};

export function useExerciseManager({ exerciseId }: UseExerciseManagerProps) {
  const navigate = useNavigate();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);

  useEffect(() => {
    async function init() {
      if (exerciseId) {
        try {
          const { data } = await api.get(`/exercises/${exerciseId}`);
          const loaded: Exercise = {
            id: data.id,
            name: data.name,
            type: data.type,
            difficulty: data.difficulty,
            audience: data.audience,
            status: data.status,
            createdBy: data.created_by?.id ?? "Admin",
            questions: data.questions ?? [],
          };
          setExercise(loaded);
          setSetupOpen(false);
        } catch (err) {
          console.error("Failed to load exercise:", err);
          navigate("/knowledge-checks");
        } finally {
          setLoading(false);
        }
      } else {
        // Create a new draft
        const draft: Exercise = {
          id: uuid(),
          name: "",
          type: "",
          difficulty: "Easy",
          audience: "All",
          status: "draft",
          createdBy: "Admin",
          questions: [],
   
        };
        setExercise(draft);
        setSetupOpen(true);
        setLoading(false);
      }
    }

    init();
  }, [exerciseId]);

  return {
    exercise,
    setExercise,
    loading,
    setupOpen,
    setSetupOpen,
  };
}
