import CompletionBar from "./CompletionBar";

type ProgressCardProps = {
  title: string;
  meta?: React.ReactNode;
  completed: number;
  total: number;
  status?: "completed" | "not_started";
  onClick?: () => void;
};

export default function ProgressCard({
  title,
  meta,
  completed,
  total,
  status,
  onClick,
}: ProgressCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer rounded-xl bg-white p-5
        border transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md
        ${status === "completed" ? "border-green-500" : "border-gray-200"}
      `}
    >
      <h3 className="text-base font-semibold text-gray-900 truncate">
        {title}
      </h3>

      {meta && (
        <div className="mt-2 text-xs text-gray-600 flex gap-2">
          {meta}
        </div>
      )}

      <CompletionBar completed={completed} total={total} />

      <div className="mt-3">
        {status === "completed" ? (
          <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-md">
            Completed
          </span>
        ) : (
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
            Not started
          </span>
        )}
      </div>
    </div>
  );
}
