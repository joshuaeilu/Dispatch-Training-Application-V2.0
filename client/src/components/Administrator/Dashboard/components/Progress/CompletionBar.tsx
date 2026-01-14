type CompletionBarProps = {
  completed: number;
  total: number;
};

export default function CompletionBar({ completed, total }: CompletionBarProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  let color = "bg-green-500";
  if (percent < 80) color = "bg-yellow-500";
  if (percent < 50) color = "bg-red-500";

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>
          {completed}/{total} completed
        </span>
        <span>{percent}%</span>
      </div>

      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
