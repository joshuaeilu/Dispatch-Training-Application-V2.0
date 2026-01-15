import { PageHeader } from "../../../../Shared/PageHeader";
import { PageBreadcrumbs } from "../../../../Shared/Breadcrumbs";
import { getUsers } from "../../../../../contexts/UniversalHelpers";
import UserCard from "../../../../Shared/UserCard";
import UserCardSkeleton from "./UserCardSkeleton";
import { Row, Col } from "antd";
import { useEffect, useState } from "react";
import { api } from "../../../../../utils/api";
import type { GetUser } from "../../../../../types/index.types";
import { useNavigate } from "react-router-dom";
import { toTitleCase } from "../../../../../utils/tools";

type Props = {
  role: "dispatcher" | "trainee";
  title: string;
  subtitle: string;
  navigateTo: string;
};

export default function UserProgressSection({
  role,
  title,
  subtitle,
  navigateTo,
}: Props) {
  const { users } = getUsers();
  const navigate = useNavigate();

  const [exerciseTotals, setExerciseTotals] = useState(0);
  const [scenarioTotals, setScenarioTotals] = useState(0);
  const [filteredUsers, setFilteredUsers] = useState<GetUser[]>([]);
  const [completedProgress, setCompletedProgress] = useState<
    Record<string, { completedExercises: number; completedScenarios: number }>
  >({});
  const [loading, setLoading] = useState(true);

  // Fetch totals for role
  useEffect(() => {
    async function fetchTotals() {
      try {
        const res = await api.get("/progress/totals", { params: { role } });
        setExerciseTotals(res.data.totalExercises);
        setScenarioTotals(res.data.totalScenarios);
      } catch (err) {
        console.error("❌ Failed to fetch totals:", err);
      }
    }

    const roleUsers = users.filter((u) => u.role === role);
    setFilteredUsers(roleUsers);
    fetchTotals();
  }, [users, role]);

  // Fetch completed progress
  useEffect(() => {
    async function fetchCompleted() {
      try {
        const res = await api.get("/progress/completed", {
          params: { userIds: filteredUsers.map((u) => u.id).join(",") },
        });
        setCompletedProgress(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch completed progress:", err);
      } finally {
        setLoading(false);
      }
    }

    if (filteredUsers.length) {
      fetchCompleted();
    } else {
      setLoading(false);
    }
  }, [filteredUsers]);

  return (
    <div >
      <PageHeader title={title} subtitle={subtitle} />
      <PageBreadcrumbs items={[{ name: title, current: true }]} />


      <div className="px-6">
        <Row gutter={[24, 24]}>
          {/* Loading */}
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <Col key={i} xs={24} sm={12} md={8} lg={6}>
                <UserCardSkeleton />
              </Col>
            ))}

          {/* Empty State */}
       {!loading && filteredUsers.length === 0 && (
  <div className="flex min-h-[60vh] w-full items-center justify-center px-6">
    <div className="w-full max-w-lg rounded-lg border  border-gray-300 bg-white py-16 px-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900">
        No {toTitleCase(title)} yet
      </h3>

      <p className="mt-2 text-sm text-gray-600">
        There are currently no {toTitleCase(title)} in the system.
        Once users are added, their training progress will appear here.
      </p>

      <button
        onClick={() => navigate("/dashboard/create-user")}
        className="mt-6 rounded-md bg-brand-maroon px-4 py-2 text-sm font-semibold text-white hover:bg-brand-maroon-dark transition-colors"
      >
        Create user
      </button>
    </div>
  </div>
)}


          {/* Users */}
          {!loading &&
            filteredUsers.map((user) => {
              const progress = completedProgress[user.id];
              const completed = progress
                ? progress.completedExercises + progress.completedScenarios
                : 0;

              return (
                <Col key={user.id} xs={24} sm={12} md={8} lg={6}>
                  <UserCard
                    name={user.name}
                    imageUrl={user.avatar}
                    completed={completed}
                    totalAssignments={exerciseTotals + scenarioTotals}
                    onClick={() =>
                      navigate(navigateTo, {
                        state: {
                          user: {
                            id: user.id,
                            name: user.name,
                            role: user.role,
                            avatar: user.avatar,
                          },
                        },
                      })
                    }
                  />
                </Col>
              );
            })}
        </Row>
      </div>
    </div>
  );
}
