import { PROFILE_PIC_URL } from "../../../../../data/data";
import { getToken } from "../../../../../contexts/AuthProvider";
export default function UserRow({
  avatar,
  name,
  role,
  completedAt,
  onView,
  canViewResponse,
}: {
  avatar?: string;
  name: string;
  role?: string;
  completedAt: {
  date: string;
  time: string;
};
canViewResponse?: boolean;

  onView: () => void;
}) {
  const token = getToken();
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-4">
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
