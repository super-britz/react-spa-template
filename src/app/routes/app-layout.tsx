import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router'

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-gray-200 border-b px-6 py-3 dark:border-gray-700">
        <span className="font-mono text-gray-900 text-sm dark:text-gray-100">
          react-spa-template
        </span>
        <nav className="flex gap-2">
          {[
            { to: '/', label: '首页' },
            { to: '/demo', label: 'Demo' },
            { to: '/posts', label: '文章' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 no-underline ${
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Suspense fallback={<div className="p-8 text-center">页面加载中…</div>}>
        <Outlet />
      </Suspense>
    </div>
  )
}
