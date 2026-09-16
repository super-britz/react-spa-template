import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export function RouteError() {
  const error = useRouteError()

  const title = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : '页面出错了'
  const detail = getDetail(error)

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="font-mono text-accent text-xs uppercase tracking-widest">Route Error</p>
      <h1 className="font-medium text-3xl text-gray-900 dark:text-gray-100">{title}</h1>
      <p className="max-w-md text-gray-500 text-sm dark:text-gray-400">{detail}</p>
      <Link
        to="/"
        className="mt-2 rounded-md bg-accent px-4 py-2 font-medium text-sm text-white no-underline transition-opacity hover:opacity-85"
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
