export default function UserRow({
  avatar,
  name,
  role,
  completedAt,
  onView,
  canViewResponse,
}: {
  avatar?: string;
  name?: string;
  role?: string;
  completedAt: {
  date: string;
  time: string;
};
canViewResponse?: boolean;

  onView: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-4">
        <img
          src={avatar}
          alt={name}
          className="h-9 w-9 rounded-full object-cover"
        />

        <div className="flex flex-col">
          <span className="text-base font-medium text-gray-900">
            {name}
          </span>

          <span className="text-sm text-gray-500">
            {role}
          </span>

          <span className="mt-0.5 text-xs text-gray-400">
  Completed on{" "}
  <span className="text-gray-500">
    {completedAt.date}
  </span>{" "}
  at{" "}
  <span className="font-medium text-brand-maroon-light">
    {completedAt.time}
  </span>
</span>

        </div>
      </div>

{canViewResponse &&
      <button
        onClick={onView}
        className="
          inline-flex items-center gap-1.5
          rounded-md
          bg-brand-maroon/10 px-3 py-1.5
          text-xs font-medium text-brand-maroon
          hover:bg-brand-maroon/15
          transition cursor-pointer
        "
      >
        View Response →
      </button>}
    </div>
  );
}
