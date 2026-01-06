import { ShieldCheckIcon } from '@heroicons/react/20/solid'
const user = {
  name: 'Rebecca Nicholas',
  role: 'Administrator',
  imageUrl:
    'https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}

const stats = [
  { label: 'Dispatchers', value: 24 },
  { label: 'Trainees', value: 68 },
  { label: 'Administrators', value: 3 },
]

export default function AdminSnapshotSection() {
  return (
    <section className="mx-6 flex items-center flex-wrap justify-between rounded-xl border border-gray-200 bg-white px-8 py-7">
      {/* LEFT: Admin context */}
      <div className="flex items-center gap-5 ">
        <img
          src={user.imageUrl}
          alt=""
          className="h-14 w-14 rounded-full object-cover"
        />

        <div className="flex flex-col">
          <span className="text-lg text-brand-maroon ">
            Welcome back,
          </span>

          <span className="mt-0.5 text-xl font-semibold text-gray-900">
            {user.name}
          </span>

          <span className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-gray-600">
  <ShieldCheckIcon  className="h-4 w-4 text-brand-maroon-light" />
  Administrator
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
