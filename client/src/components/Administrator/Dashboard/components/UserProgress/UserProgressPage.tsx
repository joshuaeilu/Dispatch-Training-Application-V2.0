import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Tabs,
  Collapse,
  Row,
  Col,
  Empty,
  Modal,
  Skeleton,
  Tag,
} from "antd";
import {
  FileTextOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { api } from "../../../../../utils/api";
import { addS, toTitleCase } from "../../../../../utils/tools";
import KnowledgeCheckResults from "../../../../User/KnowledgeChecks/components/KnowledgeCheckResults";
import { PageBreadcrumbs } from "../../../../Shared/Breadcrumbs";
import HeaderSummaryCard from "./HeaderSummaryCard";

const { Panel } = Collapse;

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

function groupByDate(items: any[]) {
  const grouped = items.reduce((acc, item) => {
    const key = dayjs(item.created_at).format("MMMM D, YYYY");
    acc[key] ??= [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return Object.entries(grouped)
    .map(([date, items]) => ({ date, items }))
    .sort(
      (a, b) =>
        dayjs(b.date, "MMMM D, YYYY").unix() -
        dayjs(a.date, "MMMM D, YYYY").unix()
    );
}

function calculateStats(exercises: any[], scenarios: any[]) {
  const totalExercises = exercises.flatMap(s => s.items).length;
  const completedExercises = exercises
    .flatMap(s => s.items)
    .filter(i => i.completed).length;

  const totalScenarios = scenarios.flatMap(s => s.items).length;
  const completedScenarios = scenarios
    .flatMap(s => s.items)
    .filter(i => i.completed).length;

  return {
    totalExercises,
    completedExercises,
    totalScenarios,
    completedScenarios,
  };
}

/* -------------------------------------------------- */
/* Skeleton Card                                      */
/* -------------------------------------------------- */

function ProgressCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <Skeleton
        active
        title={{ width: "70%" }}
        paragraph={{ rows: 2 }}
      />
    </div>
  );
}

/* -------------------------------------------------- */
/* Progress Card                                      */
/* -------------------------------------------------- */

function ProgressCard({
  item,
  isScenario = false,
  onClick,
}: {
  item: any;
  isScenario?: boolean;
  onClick?: () => void;
}) {
  const title = isScenario
    ? item.scenario_data?.name
    : item.name;

  const description = isScenario
    ? item.scenario_data?.description
    : null;

  const clickable = !isScenario && item.completed;

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`
        group relative cursor-pointer rounded-xl bg-white p-5
        border-2 transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-md
        ${item.completed ? "border-green-500" : "border-gray-200"}
      `}
    >
      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 truncate">
        {title}
      </h3>

      {/* Meta */}
      <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
        {!isScenario && (
          <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium">
            {item.type || "General"}
          </span>
        )}

        {!isScenario && item.questions?.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs">
            <FileTextOutlined className="text-gray-400" />
            {item.questions.length} questions
          </span>
        )}

        {isScenario && (
          <span className="text-xs text-gray-600 truncate">
            {description || "No description"}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        {item.completed ? (
          <span className="inline-flex items-center gap-x-1.5 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            Completed
          </span>
        ) : (
          <span className="inline-flex items-center gap-x-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />
            Not started
          </span>
        )}

        {clickable && (
          <div
            className="
              flex h-7 w-7 items-center justify-center rounded-full
              bg-green-50 text-green-600
              opacity-0 translate-x-1
              transition-all duration-200
              group-hover:opacity-100 group-hover:translate-x-0
            "
          >
            <ArrowRightOutlined className="text-xs" />
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Page                                               */
/* -------------------------------------------------- */

export default function UserProgressPage() {
  const { state } = useLocation();
  const user = state?.user;

  const [activeTab, setActiveTab] = useState<"exercises" | "scenarios">(
    "exercises"
  );

  const [exercises, setExercises] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [loadingScenarios, setLoadingScenarios] = useState(true);

  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  /* ---------------- Fetch Exercises ---------------- */

  useEffect(() => {
    if (!user) return;

    async function fetchExercises() {
      setLoadingExercises(true);
      try {
        const [{ data }, submissions] = await Promise.all([
          api.get("/exercises"),
          api.get(`/submissions/exercises/${user.id}`),
        ]);

        const completedIds = new Set(submissions.data?.exerciseIds || []);

        const filtered = data
          .filter(
            (ex: any) =>
              ["All", `${toTitleCase(user.role)}s`].includes(ex.audience) &&
              ex.status === "published"
          )
          .map((ex: any) => ({
            ...ex,
            completed: completedIds.has(ex.id),
          }));

        setExercises(groupByDate(filtered));
      } catch (e) {
        console.error("❌ Failed to fetch exercises", e);
      } finally {
        setLoadingExercises(false);
      }
    }

    fetchExercises();
  }, [user]);

  /* ---------------- Fetch Scenarios ---------------- */

  useEffect(() => {
    if (!user) return;

    async function fetchScenarios() {
      setLoadingScenarios(true);
      try {
        const [{ data }, submissions] = await Promise.all([
          api.get("/scenarios"),
          api.get(`/submissions/scenarios/${user.id}`),
        ]);

        const completedIds = new Set(submissions.data?.scenarioIds || []);

        const filtered = data.scenarios
          .filter((sc: any) => {
            const aud = sc?.scenario_data?.audience ?? "All";
            return (
              ["All", `${toTitleCase(user.role)}s`].includes(aud) &&
              sc.scenario_data.status === "published"
            );
          })
          .map((sc: any) => ({
            ...sc,
            completed: completedIds.has(sc.id),
          }));

        setScenarios(groupByDate(filtered));
      } catch (e) {
        console.error("❌ Failed to fetch scenarios", e);
      } finally {
        setLoadingScenarios(false);
      }
    }

    fetchScenarios();
  }, [user]);

  const stats = useMemo(
    () => calculateStats(exercises, scenarios),
    [exercises, scenarios]
  );

  /* ---------------- Submission ---------------- */

  async function openSubmission(exercise: any) {
    if (!exercise.completed) return;

    setSelectedExercise(exercise);
    setLoadingSubmission(true);

    try {
      const res = await api.get(`/submissions/${exercise.id}`, {
        params: { userId: user.id },
      });
      setSelectedSubmission(res.data);
    } catch {
      setSelectedSubmission(null);
    } finally {
      setLoadingSubmission(false);
    }
  }

  /* ---------------- Render ---------------- */

  return (
    <div>
      <div className="mx-6 mt-6">
        <HeaderSummaryCard
          imageUrl={user.avatar}
          title={user.name}
          subtitle={user.role}
          stats={[
    { label: "Completed", value: stats.completedExercises + stats.completedScenarios },
    { label: "Assigned", value: stats.totalExercises + stats.totalScenarios },
    {
      label: "Overall Progress",
      value: `${(stats.completedExercises + stats.completedScenarios) / (stats.totalExercises + stats.totalScenarios) * 100}%`,
      highlight: true,
    },
  ]}
        />
      </div>

      <PageBreadcrumbs
        items={[
          {
            name: toTitleCase(addS(user.role)),
            href: `/dashboard/${addS(user.role)}`,
          },
          { name: "User Progress", current: true },
        ]}
      />

      <div className="mx-6">
        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key as any)}
          className="bg-white"
          style={{ padding: 24, borderRadius: 8 }}
          items={[
            {
              key: "exercises",
              label: `Exercises (${stats.completedExercises}/${stats.totalExercises})`,
              children: loadingExercises && exercises.length === 0 ? (
                <Row gutter={[16, 16]}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={i}>
                      <ProgressCardSkeleton />
                    </Col>
                  ))}
                </Row>
              ) : exercises.length === 0 ? (
                <Empty description="No exercises assigned" />
              ) : (
                <Collapse bordered={false}>
                  {exercises.map((sec, i) => (
                    <Panel
                      key={i}
                      header={
                        <div className="flex justify-between">
                          <span className="font-semibold text-brand-maroon">
                            {sec.date}
                          </span>
                          <Tag
                            style={{
                              backgroundColor: "#F1D8DC",
                              color: "#891B2F",
                              borderColor: "#E6BFC6",
                            }}
                          >
                            {sec.items.length}
                          </Tag>
                        </div>
                      }
                    >
                      <Row gutter={[16, 16]}>
                        {sec.items.map((ex: any) => (
                          <Col xs={24} sm={12} md={8} lg={6} key={ex.id}>
                            <ProgressCard
                              item={ex}
                              onClick={() => openSubmission(ex)}
                            />
                          </Col>
                        ))}
                      </Row>
                    </Panel>
                  ))}
                </Collapse>
              ),
            },
            {
              key: "scenarios",
              label: `Scenarios (${stats.completedScenarios}/${stats.totalScenarios})`,
              children: loadingScenarios && scenarios.length === 0 ? (
                <Row gutter={[16, 16]}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={i}>
                      <ProgressCardSkeleton />
                    </Col>
                  ))}
                </Row>
              ) : scenarios.length === 0 ? (
                <Empty description="No scenarios assigned" />
              ) : (
                <Collapse bordered={false}>
                  {scenarios.map((sec, i) => (
                    <Panel
                      key={i}
                      header={
                        <div className="flex justify-between">
                          <span className="font-semibold text-brand-maroon">
                            {sec.date}
                          </span>
                          <Tag
                            style={{
                              backgroundColor: "#F1D8DC",
                              color: "#891B2F",
                              borderColor: "#E6BFC6",
                            }}
                          >
                            {sec.items.length}
                          </Tag>
                        </div>
                      }
                    >
                      <Row gutter={[16, 16]}>
                        {sec.items.map((sc: any) => (
                          <Col xs={24} sm={12} md={8} lg={6} key={sc.id}>
                            <ProgressCard item={sc} isScenario />
                          </Col>
                        ))}
                      </Row>
                    </Panel>
                  ))}
                </Collapse>
              ),
            },
          ]}
        />
      </div>

      <Modal
        open={!!selectedExercise}
        footer={null}
        onCancel={() => {
          setSelectedExercise(null);
          setSelectedSubmission(null);
        }}
        width={800}
      >
        {loadingSubmission ? (
          <Skeleton active />
        ) : selectedSubmission ? (
          <KnowledgeCheckResults
            name={selectedExercise?.name}
            questions={selectedExercise?.questions}
            userAnswers={selectedSubmission.answers}
          />
        ) : (
          <Empty />
        )}
      </Modal>
    </div>
  );
}
