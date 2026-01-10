import { ShieldCheckIcon } from "@heroicons/react/20/solid";
import { toTitleCase } from "../../../../utils/tools";
import { getToken } from "../../../../contexts/AuthProvider";
import { DATA_URL } from "../../../../data/data";

type UserProgressHeaderCardProps = {
  avatarUrl?: string;
  name?: string;
  role?: string;
  completed?: number;
  totalAssigned?: number;
};

export default function UserProgressHeaderCard({
  avatarUrl,
  name,
  role,
  completed,
  totalAssigned,
}: UserProgressHeaderCardProps) {
  const token = getToken();

  const hasStats =
    typeof completed === "number" &&
    typeof totalAssigned === "number";

  const progress =
    hasStats && totalAssigned > 0
      ? Math.round((completed / totalAssigned) * 100)
      : null;

  return (
    <section className="mx-6 mt-6  bg-white px-6 py-6 sm:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT: Identity */}
        {(avatarUrl || name || role) && (
          <div className="flex items-center gap-5">
            {avatarUrl && (
              <img
                src={`${DATA_URL}${avatarUrl}?token=${token}`}
                alt={name ? `${name} avatar` : "User avatar"}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover"
              />
            )}

            <div className="flex min-w-0 flex-col">
              {name && (
                <span className="whitespace-nowrap text-2xl font-semibold text-brand-maroon">
                  {toTitleCase(name)}
                </span>
              )}

              {(role || hasStats) && (
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  {role && (
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheckIcon className="h-4 w-4 text-brand-maroon-light" />
                      {toTitleCase(role)}
                    </span>
                  )}

            
                </div>
              )}
            </div>
          </div>
        )}

        {/* RIGHT: Progress Stats */}
        {hasStats && (
          <dl className="flex w-full justify-between gap-4 sm:justify-end sm:gap-0 sm:divide-x sm:divide-gray-200">
            <Stat label="Completed" value={completed} />
            <Stat label="Assigned" value={totalAssigned} />
            {progress !== null && (
              <Stat
                label="Overall Progress"
                value={`${progress}%`}
                highlight
              />
            )}
          </dl>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------- */
/* Status helpers                     */
/* ---------------------------------- */

function StatusBadge({ completed }: { completed: boolean }) {
  const config = completed
    ? {
        label: "Completed",
        bg: "bg-green-50",
        text: "text-green-700",
        dot: "fill-green-500",
      }
    : {
        label: "In progress",
        bg: "bg-orange-50",
        text: "text-orange-700",
        dot: "fill-orange-400",
      };

  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <svg
        viewBox="0 0 6 6"
        aria-hidden="true"
        className={`size-1.5 ${config.dot}`}
      >
        <circle r={3} cx={3} cy={3} />
      </svg>
      {config.label}
    </span>
  );
}

/* ---------------------------------- */
/* Stat component                     */
/* ---------------------------------- */

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div className="px-4 sm:px-6 text-center">
      <dt className="truncate text-sm font-medium text-gray-500">
        {label}
      </dt>
      <dd
        className={`mt-1 text-2xl sm:text-3xl font-semibold tracking-tight ${
          highlight ? "text-brand-maroon" : "text-brand-maroon-light"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
