export function PendingUserRow({
  avatar,
  name,
  role,
}: {
  avatar?: string;
  name?: string;
  role?: string;
}) {
  return (
    <div
      className="
        flex items-center justify-between
        rounded-xl border border-dashed border-gray-200
        bg-gray-50 px-4 py-3
      "
    >
      <div className="flex items-center gap-4 min-w-0">
        <img
          src={avatar}
          alt={name}
          className="h-9 w-9 rounded-full object-cover opacity-80"
        />

        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-gray-800">
            {name}
          </span>

          {role && (
            <span className="text-xs text-gray-500">
              {role}
            </span>
          )}
        </div>
      </div>

      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
        Not completed
      </span>
    </div>
  );
}
