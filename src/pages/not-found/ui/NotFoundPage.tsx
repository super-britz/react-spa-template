import { useDocumentTitle } from '@/shared/lib'

export function NotFoundPage() {
  useDocumentTitle('页面不存在 - React SPA Template')

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-gray-900/20 shadow-lg">
        <div className="flex items-center gap-1.5 border-gray-700/80 border-b px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-red-400/90" />
          <span className="size-2.5 rounded-full bg-yellow-400/90" />
          <span className="size-2.5 rounded-full bg-green-400/90" />
          <span className="ml-2 font-mono text-gray-400 text-xs">react-spa-template</span>
        </div>
        <div className="flex flex-col gap-1.5 px-4 py-4 font-mono text-sm">
          <p className="text-gray-300">
            <span className="text-accent-strong">$</span>{' '}
            <span className="text-gray-400">curl /unknown-page</span>
          </p>
          <p className="text-red-400">404 Not Found</p>
          <p className="text-gray-300">
            <span className="text-accent-strong">$</span>{' '}
            <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-accent-strong" />
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-medium text-2xl text-gray-900 dark:text-gray-100">页面不在这儿</h1>
        <p className="max-w-sm text-gray-500 text-sm dark:text-gray-400">
          你访问的地址不存在或已被移动，检查一下链接或回首页重新出发。
        </p>
        <div className="mt-2 flex items-center gap-3">
          <a
            href="/"
            className="rounded-md bg-accent px-4 py-2 font-medium text-sm text-white no-underline transition-opacity hover:opacity-85"
          >
            返回首页
          </a>
          <a
            href="/demo"
            className="rounded-md px-4 py-2 text-gray-500 text-sm no-underline transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            去 Demo 页
          </a>
        </div>
      </div>
    </main>
  )
}
