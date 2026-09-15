import { useDocumentTitle } from '@/shared/lib'

export function NotFoundPage() {
  useDocumentTitle('页面不存在 - React SPA Template')

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-medium text-5xl text-gray-900 dark:text-gray-100">404</h1>
      <p>页面不存在或已被移动。</p>
      <a
        href="/"
        className="rounded-md border-2 border-transparent bg-accent-soft px-3 py-1.5 text-accent transition-colors hover:border-accent-strong"
      >
        返回首页
      </a>
    </main>
  )
}
