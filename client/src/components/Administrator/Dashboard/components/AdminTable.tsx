import type { AdminTableProps } from "../../../../types/index.types";

function AdminTable<T>({ columns, data }: AdminTableProps<T>) {
  const isEmpty = data.length === 0;

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`
                  px-6 py-3.5
                  text-sm font-semibold text-gray-900
                  ${col.align ?? "text-left"}
                `}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 bg-white">
          {isEmpty ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-16 text-center"
              >
                <div className="flex flex-col items-center gap-4">
                  {/* Icon */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-10 w-10 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l5 5v9a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>

                  {/* Text */}
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      No records found
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      There’s nothing to display here yet.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`
                      px-6 py-4
                      text-sm
                      ${col.align ?? "text-left"}
                    `}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { AdminTable };
