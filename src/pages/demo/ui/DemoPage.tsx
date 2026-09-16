import { useDocumentTitle } from '@/shared/lib'

import { type Density, useDemoStore } from '../model/demo-store'
import { useDemoData } from '../model/use-demo-data'
import { FeedbackForm } from './FeedbackForm'

const densityOptions: { value: Density; label: string }[] = [
  { value: 'comfortable', label: '舒适' },
  { value: 'compact', label: '紧凑' },
]

export function DemoPage() {
  useDocumentTitle('Demo - React SPA Template')
  const { data, isPending, error, refetch } = useDemoData()
  const density = useDemoStore((state) => state.density)
  const toggleDensity = useDemoStore((state) => state.toggleDensity)

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-6 text-left">
      <header className="flex flex-col gap-2">
        <span className="w-fit rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-accent text-xs">
          GET /api/demo/data · MSW · 800ms
        </span>
        <h1 className="font-medium text-3xl text-gray-900 dark:text-gray-100">请求链路 Demo</h1>
        <p className="text-gray-500 text-sm dark:text-gray-400">
          数据经 axios → TanStack Query → DTO 映射到达本组件，错误由拦截器归一为 ApiError。
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-gray-500 text-sm dark:text-gray-400">技术栈清单</h2>
          <fieldset
            className="m-0 flex w-fit rounded-lg border-none bg-gray-100 p-0.5 dark:bg-gray-800"
            aria-label="列表密度"
          >
            {densityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={density === option.value}
                onClick={() => {
                  if (density !== option.value) {
                    toggleDensity()
                  }
                }}
                className={`rounded-md px-3 py-1 text-sm transition-colors ${
                  density === option.value
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-600 dark:text-gray-100'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </fieldset>
        </div>

        {isPending ? (
          <div className="flex flex-col gap-2" role="status">
            <span className="sr-only">加载中</span>
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="h-11 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm dark:border-red-900 dark:bg-red-950/60 dark:text-red-300"
          >
            <p>加载失败：{error.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="w-fit rounded-md border border-red-300 px-3 py-1 text-xs transition-colors hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900"
            >
              重试
            </button>
          </div>
        ) : (
          <ul
            className={`flex list-none flex-col p-0 ${density === 'comfortable' ? 'gap-3' : 'gap-1.5'}`}
          >
            {data?.items.map((item) => (
              <li
                key={item.name}
                className={`flex items-center justify-between rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60 ${
                  density === 'comfortable' ? 'px-4 py-3' : 'px-3 py-1.5'
                }`}
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500 text-xs dark:bg-gray-700 dark:text-gray-300">
                  {item.kind}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="text-gray-400 text-xs">
          数据生成时间（DTO 字段 generated_at 映射而来）：{data?.generatedAt ?? '—'}
        </p>
      </section>

      <FeedbackForm />
    </main>
  )
}
