import { PageHeader } from "../../../Shared/PageHeader";
import { getUsers } from "../../../../contexts/UniversalHelpers";
import UserCard from "../../../Shared/UserCard";
import { PROFILE_PIC_URL } from "../../../../data/data";
import { getToken } from "../../../../contexts/AuthProvider";
import { Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { api } from "../../../../utils/api";
import { useEffect, useState } from "react";
import type { GetUser } from "../../../../types/index.types";

export default function TraineesSection() {
  const { users } = getUsers();
  const token = getToken();
  const navigate = useNavigate();
  const [exerciseTotals, setExerciseTotals] = useState(0);
    const [scenarioTotals, setScenarioTotals] = useState(0);
    const [trainees, setTrainees] = useState<GetUser[]>([]);
    const [completedProgress, setCompletedProgress] = useState<Record<string, { completedExercises: number; completedScenarios: number }>>({});
  

  const fetchCompleted = async () => {
    try {
      const userIds = trainees.map((user) => user.id);
      if (!userIds.length) return;

      const response = await api.get('/progress/completed', {
        params: { userIds: userIds.join(',') },
      });
      setCompletedProgress(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch completed progress:", error);
    }
  };

    const fetchTotals = async () => {
    try {
      const response = await api.get('/progress/totals', { params: { role: 'Trainees' } });
      setExerciseTotals(response.data.totalExercises);
      setScenarioTotals(response.data.totalScenarios);
    } catch (error) {
      console.error("❌ Failed to fetch trainee totals:", error);
    }
  };

  useEffect(() => {
    const traineeUsers = users.filter((user) => user.role === 'trainee');
    setTrainees(traineeUsers);
    fetchTotals();
  }, [users]);

  useEffect(() => {
    if (trainees.length > 0) {
      fetchCompleted();
    }
  }, [trainees]);

  return (
   <div style={{ overflow: "auto" }}>
      <PageHeader
        title="Trainees"
        subtitle="Assess Trainees Progress"
        onBack={() => window.history.back()}
        showBackButton
      />

      <div style={{ padding: "0 1.5rem" }}>
        <Row gutter={[24, 24]}>
          {trainees.map((user) => {
            const progress = completedProgress[user.id];
            const completed =
              progress
                ? progress.completedExercises + progress.completedScenarios
                : 0;

            return (
              <Col key={user.id} xs={24} sm={12} md={8} lg={6}>
                <UserCard
                  name={user.name}
                  imageUrl={`${PROFILE_PIC_URL}${user.avatar}?token=${token}`}
                  completed={completed}
                  totalAssignments={exerciseTotals + scenarioTotals}
                  onClick={() => navigate('/dashboard/user-progress', { state: { user: { id: user.id, name: user.name, role: user.role, avatar: user.avatar } } })}
                />
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
}

