import { ShieldCheckIcon } from '@heroicons/react/20/solid';
import { toTitleCase } from '../../../../utils/tools';
import type { AdminWelcomeSectionProps } from '../../../../types/index.types';
import { getToken } from '../../../../contexts/AuthProvider';
import { DATA_URL } from '../../../../data/data';


export default function AdminWelcomeSection({ avatarUrl, name, role, stats }: AdminWelcomeSectionProps) {
  const token = getToken();
  return (
    <section className="m-6  flex items-center flex-wrap justify-between rounded-xl  bg-white px-8 py-7">
      {/* LEFT: Admin context */}
      <div className="flex items-center gap-5 ">
        <img
          src={DATA_URL + avatarUrl + '?token=' + token}
          alt="Administrator Avatar"
          className="h-16 w-16 rounded-full object-cover"
        />

        <div className="flex flex-col">
          <span className="text-lg text-brand-maroon ">
            Welcome back,
          </span>

          <span className="mt-0.5 text-xl font-semibold text-gray-900">
            {toTitleCase(name || 'Admin')}
          </span>

          <span className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-gray-600">
            <ShieldCheckIcon className="h-4 w-4 text-brand-maroon-light" />
            {toTitleCase(role || 'Admin')}
          </span>
        </div>
      </div>

      {/* RIGHT: System KPIs */}
      <div className="flex items-center divide-x divide-gray-200 mt-6 md:mt-0">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="px-7 text-center"
          >
            <p className="text-sm font-medium text-gray-500">
              {stat.label}
            </p>

            <p className="mt-1 text-3xl font-semibold text-brand-maroon-light">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
