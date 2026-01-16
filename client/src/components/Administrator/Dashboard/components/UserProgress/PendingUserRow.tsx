import { PROFILE_PIC_URL } from "../../../../../data/data";
import { getToken } from "../../../../../contexts/AuthProvider";
export function PendingUserRow({
  avatar,
  name,
  role,
}: {
  avatar?: string;
  name: string;
  role?: string;
}) {
  const token = getToken();
  return (
    <div
      className="
        flex items-center justify-between
        rounded-xl border border-dashed border-gray-200
        bg-gray-50 px-4 py-3
      "
    >
      <div className="flex items-center gap-4 min-w-0">
        {
                  avatar ?  <img
                  src={`${PROFILE_PIC_URL}${avatar}?token=${token}`}
                  alt={name}
                  className="h-12 w-12 rounded-full object-cover"
                />
         : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-maroon-light/10 border border-brand-maroon-light/30">
              <span className="text-lg sm:text-xl font-semibold text-brand-maroon">
                {name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
                }

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
