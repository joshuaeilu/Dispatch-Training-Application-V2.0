import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useState } from "react";
import dayjs from "dayjs";

import HeaderSummaryCard from "./HeaderSummaryCard";
import UserRow from "./UserRow";
import { PendingUserRow } from "./PendingUserRow";
import KnowledgeCheckResults from "../../../../User/KnowledgeChecks/components/KnowledgeCheckResults";

import { getUsers } from "../../../../../contexts/UniversalHelpers";
import { toTitleCase } from "../../../../../utils/tools";
import { api } from "../../../../../utils/api";

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */

type CompletedAttempt = {
    user_id: string;
    answers: Record<string, any>;
    submitted_at: string;
};

export interface AssignmentDrawerData {
    id: string;
    name: string;
    audience: string;
    completedUsers?: CompletedAttempt[];
}

export interface AssignmentDrawerProps {
    drawerData?: AssignmentDrawerData;
    open: boolean;
    setOpen: (open: boolean) => void;
    kind: "scenario" | "exercise";
}

type DrawerView = "overview" | "response";

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

function matchesAudience(role: string, audience: AssignmentDrawerData["audience"]) {
    if (audience === "All") return true;
    if (audience === "Trainees") return role === "trainee";
    if (audience === "Dispatchers") return role === "dispatcher";
    return false;
}

/* ---------------------------------- */
/* Component                          */
/* ---------------------------------- */

export default function AssignmentDrawer({
    drawerData,
    open,
    kind,
    setOpen,
}: AssignmentDrawerProps) {
    const { users } = getUsers();
    const [view, setView] = useState<DrawerView>("overview");
    const [selectedExercise, setSelectedExercise] = useState<any>(null);
    const [answers, setAnswers] = useState<any>(null);
    const [loadingResponse, setLoadingResponse] = useState(false);

    if (!drawerData) return null;

    /* ---------------------------------- */
    /* Audience filtering                 */
    /* ---------------------------------- */

    const eligibleUsers = users.filter(
  u =>
    u.role !== "admin" &&
    matchesAudience(u.role, drawerData.audience)
);


    const completedUsers = (drawerData.completedUsers ?? [])
        .map(attempt => {
            const user = eligibleUsers.find(u => u.id === attempt.user_id);
            if (!user) return null;

            return {
                id: user.id,
                avatar: user.avatar,
                name: user.name,
                role: user.role,
                submittedAt: attempt.submitted_at,
                answers: attempt.answers,
            };
        })
        .filter(Boolean) as any[];

    const pendingUsers = eligibleUsers.filter(
        u => !completedUsers.some(c => c.id === u.id)
    );

    const completedCount = completedUsers.length;
    const totalEligible = eligibleUsers.length;

    const completionRate =
        totalEligible > 0
            ? `${Math.round((completedCount / totalEligible) * 100)}%`
            : "0%";

    /* ---------------------------------- */
    /* View response handler              */
    /* ---------------------------------- */

    async function handleViewResponse(userId: string) {
        setLoadingResponse(true);

        try {
            const exerciseRes = await api.get(`/exercises/${drawerData?.id}`);
            const completed = (drawerData?.completedUsers ?? []).find(u => u.user_id === userId);

            setSelectedExercise(exerciseRes.data);
            setAnswers(completed?.answers ?? null);

            // ✅ slide ONLY after data is ready
            setView("response");
        } finally {
            setLoadingResponse(false);
        }
    }

    function backToOverview() {
        setView("overview");
        setSelectedExercise(null);
        setAnswers(null);
    }

    /* ---------------------------------- */
    /* Render                             */
    /* ---------------------------------- */

    return (
        <Dialog open={open} onClose={setOpen} className="relative z-10">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-700/75 transition-opacity duration-300 ease-in-out data-closed:opacity-0"
            />

            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
                        <DialogPanel
                            transition
                            className="
    pointer-events-auto
    w-screen
    sm:max-w-[360px]
    lg:max-w-[640px]

    transform transition duration-300 ease-in-out
    data-closed:translate-x-full
  "
                        >

                            <div className="flex h-full flex-col bg-white shadow-xl">

                                {/* Header */}
                                <HeaderSummaryCard
                                    title={drawerData.name}
                                    subtitle={`Assigned to ${drawerData.audience}`}
                                    isDrawer={true}
                                    stats={[
                                        { label: "Completed", value: completedCount },
                                        { label: "Assigned", value: totalEligible },
                                        {
                                            label: "Completion Rate",
                                            value: completionRate,
                                            highlight: true,
                                        },
                                    ]}
                                />

                                {/* Sliding container */}
                                <div className="relative flex-1 overflow-hidden">
                                    <div
                                        className={`
                      absolute inset-0 flex w-[200%]
                      transition-transform duration-300 ease-in-out
                      ${view === "response" ? "-translate-x-1/2" : "translate-x-0"}
                    `}
                                    >
                                        {/* ---------------- Overview ---------------- */}
                                        <div className="w-1/2 overflow-y-auto px-6 pb-6">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-semibold text-gray-900">
                                                    {completedCount}
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-semibold text-brand-maroon">
                                                    {totalEligible}
                                                </span>{" "}
                                                learners have completed this assignment.
                                            </p>

                                            <section className="mt-5">
                                                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                                                    Completed learners
                                                </h3>

                                                {completedUsers.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {completedUsers.map(user => (
                                                            <UserRow
                                                                key={user.id}
                                                                avatar={user.avatar}
                                                                name={toTitleCase(user.name)}
                                                                role={toTitleCase(user.role)}
                                                                completedAt={{
                                                                    date: dayjs(user.submittedAt).format("MMM D, YYYY"),
                                                                    time: dayjs(user.submittedAt).format("h:mm A"),
                                                                }}
                                                                onView={() => handleViewResponse(user.id)}
                                                                canViewResponse={kind === "exercise"}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                                                        No learners have completed this assignment yet.
                                                    </div>
                                                )}
                                            </section>

                                            {pendingUsers.length > 0 && (
                                                <section className="mt-6">
                                                    <h3 className="mb-2 text-sm font-semibold text-gray-900">
                                                        Not yet completed
                                                    </h3>

                                                    <div className="space-y-2">
                                                        {pendingUsers.map(user => (
                                                            <PendingUserRow
                                                                key={user.id}
                                                                avatar={user.avatar}
                                                                name={toTitleCase(user.name)}
                                                                role={toTitleCase(user.role)}
                                                            />
                                                        ))}
                                                    </div>
                                                </section>
                                            )}
                                        </div>

                                        {/* ---------------- Response ---------------- */}
                                        <div className="w-1/2 overflow-y-auto px-6 pb-6">
                                            <button
                                                onClick={backToOverview}
                                                className="mb-4 text-sm font-medium text-brand-maroon hover:underline"
                                            >
                                                ← Back to assignment
                                            </button>

                                            {loadingResponse ? (
                                                <div className="text-sm text-gray-500">Loading response…</div>
                                            ) : selectedExercise && answers ? (
                                                <KnowledgeCheckResults
                                                    name={drawerData.name}
                                                    questions={selectedExercise.questions}
                                                    userAnswers={answers}
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-500">
                                                    No response available.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
