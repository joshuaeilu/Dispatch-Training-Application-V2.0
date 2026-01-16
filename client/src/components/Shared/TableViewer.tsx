
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
import { Dialog, DialogPanel } from "@headlessui/react"

import type { TableViewerProps } from '../../types/index.types'

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th
                key={i}
                scope="col"
                className="px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {Array.from({ length: 5 }).map((_, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-gray-50">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} className="px-6 py-4 text-sm">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


export function TableViewer<T>({
  tableType,
  columnDefinitions,
  columnData,
  filterOptions = {},
  onButtonPress,
  loading = false,
}: TableViewerProps<T>) {
  const ITEMS_PER_PAGE = 5

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)


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
     { tableType && (
       <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-brand-maroon">
            {addS(tableType ?? "")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{totalItems}</span>{' '}
            {addS(tableType ?? "")} found
          </p>
        </div>

        <button className="inline-flex items-center gap-1 rounded-md bg-brand-maroon-light px-3 py-2 text-sm font-semibold text-white hover:bg-brand-maroon-hover" onClick={onButtonPress}>
          <PlusCircleIcon className="size-5" />
          Add {tableType ?? ""}
        </button>
      </div> )}

      {/* Search + Filters */}
<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  {/* Search */}
  <div className="relative flex-1 max-w-md">
    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
    <input
      type="search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Type to search..."
      className="w-full rounded-md bg-white py-1.5 pl-10 pr-3 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-brand-maroon-light"
    />
  </div>

  {/* Desktop Filters */}
  <div className="hidden sm:flex items-center gap-4">
    {Object.entries(filterOptions).map(([key, options]) => {
      const count = filters[key]?.length ?? 0

      return (
        <Menu key={key} as="div" className="relative">
          <MenuButton className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            {toTitleCase(key)}
            {count > 0 && (
              <span className="rounded bg-brand-maroon-very-light px-1.5 text-xs text-brand-maroon">
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
                      toggleFilter(key, option)
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${
                      active ? "bg-gray-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={filters[key]?.includes(option) ?? false}
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

  {/* Mobile Filters Button */}
  <button
    type="button"
    onClick={() => setMobileFiltersOpen(true)}
    className="sm:hidden inline-flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 px-3 py-2 text-sm text-gray-700"
  >
    Filters
  </button>
</div>

{/* Mobile Filters Drawer (Dialog) */}
<Dialog
  open={mobileFiltersOpen}
  onClose={setMobileFiltersOpen}
  className="relative z-50 sm:hidden"
>
  {/* Backdrop */}
  <div className="fixed inset-0 bg-black/30" />

  {/* Slide-over */}
  <div className="fixed inset-0 flex justify-end">
    <DialogPanel className="h-full w-full max-w-sm bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
        <h2 className="text-base font-semibold text-gray-900">Filters</h2>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(false)}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-50"
        >
          <XMarkIcon className="size-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <div className="space-y-3">
          {Object.entries(filterOptions).map(([key, options]) => (
            <details key={key} className="group rounded-md border hover:shadow-sm border-gray-200">
              <summary className="flex cursor-pointer items-center justify-between px-3 py-3 text-sm font-medium text-gray-900">
                {toTitleCase(key)}
                <ChevronDownIcon className="size-4 text-gray-500 transition group-open:rotate-180" />
              </summary>

              <div className="border-t border-gray-200 px-3 py-3">
                <div className="space-y-2">
                  {options.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters[key]?.includes(option) ?? false}
                        onChange={() => toggleFilter(key, option)}
                        className="rounded border-gray-300"
                      />
                      {toTitleCase(option)}
                    </label>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </DialogPanel>
  </div>
</Dialog>




      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <span className="text-base text-brand-maroon-light">Filters</span>
          <span className="text-gray-400">|</span>
          {Object.entries(filters).flatMap(([key, values]) =>
            values.map((value) => (
              <span
                key={`${key}-${value}`}
                className="flex items-center gap-1 rounded-full bg-brand-maroon-very-light px-3 py-1 text-xs text-brand-maroon-light"
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
      {loading ? (
        <TableSkeleton columns={columnDefinitions.length} />
      ) : (
        <AdminTable columns={columnDefinitions} data={paginatedData} />
      )}

      {/* Pagination */}
      
      {totalPages > 1 && (
  <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
    {/* Range info */}
    <p className="text-sm text-gray-600">
      Showing{" "}
      <span className="font-medium text-gray-900">
        {(page - 1) * ITEMS_PER_PAGE + 1}
      </span>{" "}
      to{" "}
      <span className="font-medium text-gray-900">
        {Math.min(page * ITEMS_PER_PAGE, totalItems)}
      </span>{" "}
      of{" "}
      <span className="font-medium text-gray-900">{totalItems}</span>
    </p>

    {/* Controls */}
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">
        Page <span className="font-medium text-gray-900">{page}</span> of{" "}
        <span className="font-medium text-gray-900">{totalPages}</span>
      </span>

      <div className="flex overflow-hidden rounded-md border border-gray-300">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-2 py-1 text-gray-400 hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeftIcon className="size-5" />
        </button>

        {/* Center divider */}
        <div className="w-px bg-gray-300" />

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-2 py-1 text-brand-maroon hover:bg-brand-maroon-very-light disabled:opacity-40"
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
