import { PageHeader } from "../../../Shared/PageHeader";
import { getUsers } from "../../../../contexts/UniversalHelpers";
import UserCard from "../../../Shared/UserCard";
import { PROFILE_PIC_URL } from "../../../../data/data";
import { getToken } from "../../../../contexts/AuthProvider";
import { Row, Col } from "antd";
import { useEffect, useState } from "react";
import { api } from "../../../../utils/api";
import type { GetUser } from "../../../../types/index.types";
import { useNavigate } from "react-router-dom";
import UserCardSkeleton from "../components/UserCardSkeleton";

export default function DispatchersSection() {
  const { users } = getUsers();
  const token = getToken();
  const navigate = useNavigate();
  const [exerciseTotals, setExerciseTotals] = useState(0);
  const [scenarioTotals, setScenarioTotals] = useState(0);
  const [dispatchers, setDispatchers] = useState<GetUser[]>([]);
  const [completedProgress, setCompletedProgress] = useState<Record<string, { completedExercises: number; completedScenarios: number }>>({});
  const [loading, setLoading] = useState(true);
  const fetchTotals = async () => {
    try {
      const response = await api.get('/progress/totals', { params: { role: 'Dispatchers' } });
      setExerciseTotals(response.data.totalExercises);
      setScenarioTotals(response.data.totalScenarios);
    } catch (error) {
      console.error("❌ Failed to fetch dispatcher totals:", error);
    }
  };

  const fetchCompleted = async () => {
    try {
      const userIds = dispatchers.map((user) => user.id);
      if (!userIds.length) return;

      const response = await api.get('/progress/completed', {
        params: { userIds: userIds.join(',') },
      });
      setCompletedProgress(response.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Failed to fetch completed progress:", error);
    }
  };

  useEffect(() => {
    const dispatcherUsers = users.filter((user) => user.role === 'dispatcher');
    setDispatchers(dispatcherUsers);
    fetchTotals();
  }, [users]);

  useEffect(() => {
    if (dispatchers.length > 0) {
      fetchCompleted();
      
    }
  }, [dispatchers]);

  return (
    <div style={{ overflow: "auto" }}>
      <PageHeader
        title="Dispatchers"
        subtitle="Assess Dispatchers Progress"
        onBack={() => window.history.back()}
        showBackButton
      />

      <div style={{ padding: "0 1.5rem" }}>
        <Row gutter={[24, 24]}>
          {loading ? Array.from({ length: dispatchers.length }).map((_, i) => (
             <Col key={i} xs={24} sm={12} md={8} lg={6}>
        <UserCardSkeleton />
    </Col>
          )) :
          dispatchers.map((user) => {
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
