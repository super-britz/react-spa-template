import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export function RouteError() {
  const error = useRouteError()

  const title = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : '页面出错了'
  const detail = getDetail(error)

  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-medium text-4xl text-gray-900 dark:text-gray-100">{title}</h1>
      <p className="text-sm">{detail}</p>
      <Link
        to="/"
        className="rounded-md border-2 border-transparent bg-accent-soft px-3 py-1.5 text-accent transition-colors hover:border-accent-strong"
      >
        返回首页
      </Link>
    </main>
  )
}

function getDetail(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (isRouteErrorResponse(error)) {
    return error.statusText || '路由加载失败'
  }
  return '发生未知错误'
}
