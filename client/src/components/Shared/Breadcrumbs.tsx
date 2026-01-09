import { HomeIcon, ArrowLongLeftIcon } from '@heroicons/react/20/solid'

type Breadcrumb = {
  name: string
  href?: string
  current?: boolean
}

export function PageBreadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <div className="mx-6 mb-6">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 py-3 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex">
            {/* Mobile back */}
            <div className="flex sm:hidden">
              <a
                href={items[items.length - 2]?.href || '#'}
                className="group inline-flex items-center gap-2 text-sm font-medium text-brand-maroon-light hover:text-brand-maroon-light"
              >
                <ArrowLongLeftIcon
                  className="h-5 w-5 text-brand-maroon-light"
                />
                <span>{items[items.length - 2]?.name || 'Back'}</span>
              </a>
            </div>

            {/* Desktop breadcrumbs */}
            <div className="hidden sm:block">
              <ol role="list" className="flex items-center space-x-4">
                <li>
                  <a href="/" className="text-brand-maroon-light hover:text-brand-maroon-light">
                     <div className="flex items-center gap-1.5 text-sm font-medium text-brand-maroon-light">
  <HomeIcon className="h-4.5 w-4.5" />
  <span>Dashboard</span>
</div>

                  </a>
                </li>

                {items.map((item) => (
                  <li key={item.name}>
                    <div className="flex items-center">
                      <svg
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="h-5 w-5 text-gray-300"
                      >
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>

                      {item.href && !item.current ? (
                        <a
                          href={item.href}
                          className="ml-4 text-sm font-medium text-gray-500 hover:text-brand-maroon"
                        >
                          {item.name}
                        </a>
                      ) : (
                        <span className="ml-4 text-sm font-medium text-gray-700">
                          {item.name}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}
