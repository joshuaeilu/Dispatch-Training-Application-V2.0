import { useEffect, useState } from "react";
import { api } from "../utils/api";

export function useUsersProgress(userIds: string[] = []) {
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!userIds || userIds.length === 0) return;

    async function fetchProgress() {
      try {
        const { data } = await api.get('/progress', { params: { user_ids: userIds } });
        setProgressMap(data);
      } catch (err) {
        console.error("❌ Error fetching users progress:", err);
      }
    }

    fetchProgress();
  }, [userIds]);

  return { progress: progressMap };
}
