import { ShieldCheckIcon } from "@heroicons/react/20/solid";
import { toTitleCase } from "../../../../../utils/tools";
import { getToken } from "../../../../../contexts/AuthProvider";
import { DATA_URL } from "../../../../../data/data";

type HeaderStat = {
  label: string;
  value: string | number;
  highlight?: boolean;
};

type HeaderSummaryCardProps = {
  imageUrl?: string;
  imageAlt?: string;
  isDrawer?: boolean;

  title: string;
  subtitle?: string;

  stats?: HeaderStat[];
};

export default function HeaderSummaryCard({
  imageUrl,
  imageAlt,
  title,
  subtitle,
  stats = [],
  isDrawer = false
}: HeaderSummaryCardProps) {
  const token = getToken();

  return (
      <div className={`${!isDrawer && " flex flex-col"} gap-6 lg:flex-row lg:items-center lg:justify-between bg-white px-6 py-6 sm:px-8`}>
        {/* LEFT */}
        <div className="flex items-center gap-5">
        {!isDrawer && (
  imageUrl ? (
    <img
      src={`${DATA_URL}${imageUrl}?token=${token}`}
      alt={imageAlt ?? `${title} avatar`}
      className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border border-gray-200"
    />
  ) : (
    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-brand-maroon-light/10 border border-brand-maroon-light/30">
      <span className="text-lg sm:text-xl font-semibold text-brand-maroon">
        {title
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </span>
    </div>
  )
)}



          <div className="flex min-w-0 flex-col">
            <span className="whitespace-nowrap text-2xl font-semibold text-brand-maroon">
              {toTitleCase(title)}
            </span>

            {subtitle && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
               {isDrawer && ( <ShieldCheckIcon className="h-4 w-4 text-brand-maroon-light" /> )}
                {toTitleCase(subtitle)}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        {stats.length > 0 && (
          <dl className={`${!isDrawer && " sm:justify-end mt-0 border-none "} flex w-full mt-4 border-y border-gray-200 py-4 justify-between gap-4 sm:gap-0 sm:divide-x sm:divide-gray-200`}>
            {stats.map((stat, idx) => (
              <Stat
                key={idx}
                label={stat.label}
                value={stat.value}
                highlight={stat.highlight}
              />
            ))}
          </dl>
        )}
      </div>
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
