import { ArrowRightOutlined } from '@ant-design/icons'
import Title from 'antd/es/typography/Title'

const exercises = [
  { id: 1, name: 'Emergency Call Handling – Level 2', completed: 18, total: 24 },
  { id: 2, name: 'Radio Protocols – Basics', completed: 24, total: 24 },
  { id: 3, name: 'Highway Incident Simulation', completed: 9, total: 24 },
]

const scenarios = [
  { id: 1, name: 'Multi-Vehicle Accident', completed: 14, total: 20 },
  { id: 2, name: 'Domestic Disturbance', completed: 20, total: 20 },
]

export function RecentActivitySection() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-xl font-semibold text-[#891B2F]">Training Overview</h2>
        <p className="mt-1 text-sm text-gray-500">
          Monitor progress across exercises and scenarios at a glance.
        </p>
      </div>

      <Section title="Exercises" description="Completion status for recent training exercises." items={exercises} />
      <Section title="Scenarios" description="Progress across active training scenarios." items={scenarios} />
    </div>
  )
}

function Section({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: { id: number; name: string; completed: number; total: number }[]
}) {
  return (
    <div className="border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div>
          <Title level={5} style={{ margin: 0, fontWeight: 600, color: '#891B2F' }}>
            {title}
          </Title>
          <p className="mt-0.5 text-xs text-gray-600">{description}</p>
        </div>

        <button className="text-xs font-semibold text-[#891B2F] hover:text-[#6F1A27] transition-colors duration-150">
          View all
        </button>
      </div>

      <div className="overflow-hidden">
        <table className="w-full border-collapse text-left">
          <tbody className="divide-y divide-gray-100">
            {items.map(({ id, name, completed, total }) => (
              <tr key={id} className="group hover:bg-[#F8EDEE] transition-colors cursor-pointer">
                <td className="px-4 py-2 text-sm text-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{name}</span>
                      <span className="text-xs text-gray-600">
                        <span className="font-semibold">{completed}</span>
                        <span className="mx-0.5 text-[#A32E41]">/</span>
                        <span className="text-[#891B2F]">{total}</span>
                        <span className="ml-1">completed</span>
                      </span>
                    </div>

                    <div className="inline-flex items-center justify-center">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F1D8DC] transition-all duration-200 group-hover:bg-[#EAD0D5] group-hover:translate-x-0.5">
                        <ArrowRightOutlined className="text-[11px]" style={{ color: '#8C2131' }} />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
