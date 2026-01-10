
import { useEffect, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import { AdminTable } from '../Administrator/Dashboard/components/AdminTable'
import { addS, toTitleCase } from '../../utils/tools'
import type { TableColumnDef, TableViewerProps } from '../../types/index.types'



export function TableViewer<T>({
  tableType,
  columnDefinitions,
  columnData,
  filterOptions = {},
}: TableViewerProps<T>) {
  const ITEMS_PER_PAGE = 10

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, string[]>>({})

  /* Reset pagination when inputs change */
  useEffect(() => {
    setPage(1)
  }, [search, filters])

  function toggleFilter(columnKey: string, value: string) {
    setFilters((prev) => {
      const current = prev[columnKey] ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]

      if (next.length === 0) {
        const { [columnKey]: _, ...rest } = prev
        return rest
      }

      return { ...prev, [columnKey]: next }
    })
  }

  /* Search + Filter */
  const filteredData = columnData.filter((row) => {
    const matchesSearch =
      search.trim() === '' ||
      columnDefinitions.some((col) => {
        if (!col.searchable || !col.key) return false
        const value = row[col.key as keyof T]
        return (
          value != null &&
          String(value).toLowerCase().includes(search.toLowerCase())
        )
      })

    if (!matchesSearch) return false

    return Object.entries(filters).every(([columnKey, values]) => {
      const value = row[columnKey as keyof T]
      return value != null && values.includes(String(value))
    })
  })

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  return (
    <div className="m-6 rounded-lg bg-white px-6 py-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-brand-maroon">
            {addS(tableType)}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{totalItems}</span>{' '}
            {addS(tableType)} found
          </p>
        </div>

        <button className="inline-flex items-center gap-1 rounded-md bg-brand-maroon-light px-3 py-2 text-sm font-semibold text-white hover:bg-brand-maroon-hover">
          <PlusCircleIcon className="size-5" />
          Add {tableType}
        </button>
      </div>

      {/* Search + Filters */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search..."
            className="block w-full rounded-md bg-white py-1.5 pl-10 pr-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-brand-maroon-light"
          />
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="lg:flex items-center gap-4">
          {Object.entries(filterOptions).map(([columnKey, options]) => {
            const count = filters[columnKey]?.length ?? 0

            return (
              <Menu key={columnKey} as="div" className="relative">
                <MenuButton className="flex items-center gap-1 text-base text-gray-600 hover:text-gray-900">
                  {toTitleCase(columnKey)}
                  {count > 0 && (
                    <span className="ml-1 rounded bg-brand-maroon-very-light px-1.5 text-xs text-brand-maroon">
                      {count}
                    </span>
                  )}
                  <ChevronDownIcon className="size-4" />
                </MenuButton>

                <MenuItems className="absolute right-0 z-10 mt-2 w-44 rounded-md bg-white shadow ring-1 ring-black/5">
                  {options.map((option) => (
                    <MenuItem key={option}>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFilter(columnKey, option)
                          }}
                          className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${
                            active ? 'bg-gray-50' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            readOnly
                            checked={filters[columnKey]?.includes(option) ?? false}
                            className="rounded border-gray-300"
                          />
                          {toTitleCase(option)}
                        </button>
                      )}
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            )
          })}
        </div>
      </div>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <span className="text-base text-brand-maroon-light">Filters</span>
          {Object.entries(filters).flatMap(([key, values]) =>
            values.map((value) => (
              <span
                key={`${key}-${value}`}
                className="flex items-center gap-1 rounded-full bg-brand-maroon-very-light px-3 py-1 text-sm text-brand-maroon-light"
              >
                {toTitleCase(value)}
                <button onClick={() => toggleFilter(key, value)}>
                  <XMarkIcon className="size-4 text-gray-600 hover:text-brand-maroon" />
                </button>
              </span>
            ))
          )}
        </div>
      )}

      {/* Table */}
      <AdminTable columns={columnDefinitions} data={paginatedData} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-700">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(page * ITEMS_PER_PAGE, totalItems)} of {totalItems}
          </p>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <div className="flex">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="rounded-l-md border px-2 py-2 text-gray-400 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeftIcon className="size-5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="rounded-r-md border px-2 py-2 text-gray-400 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRightIcon className="size-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
