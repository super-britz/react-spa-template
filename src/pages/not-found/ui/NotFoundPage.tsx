import { useDocumentTitle } from '@/shared/lib'

export function NotFoundPage() {
  useDocumentTitle('页面不存在 - React SPA Template')

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-8">
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none bg-accent-soft font-bold text-[10rem] text-accent/25 leading-none tracking-tighter md:text-[16rem] dark:bg-transparent dark:text-accent-strong/15"
      >
        404
      </span>

      <div className="relative flex flex-col items-center gap-3 text-center">
        <p className="font-mono text-accent text-xs uppercase tracking-widest">Error 404</p>
        <h1 className="font-medium text-3xl text-gray-900 dark:text-gray-100">页面不在这儿</h1>
        <p className="max-w-sm text-gray-500 text-sm dark:text-gray-400">
          你访问的地址不存在或已被移动。检查一下链接，或者回首页重新出发。
        </p>
        <a
          href="/"
          className="mt-2 rounded-md bg-accent px-4 py-2 font-medium text-sm text-white no-underline transition-opacity hover:opacity-85"
        >
          返回首页
        </a>
      </div>
    </main>
  )
}
