import { useDocumentTitle } from '@/shared/lib'

import { useDemoStore } from '../model/demo-store'
import { useDemoData } from '../model/use-demo-data'

export function DemoPage() {
  useDocumentTitle('Demo - React SPA Template')
  const { data, isPending, error } = useDemoData()
  const density = useDemoStore((state) => state.density)
  const toggleDensity = useDemoStore((state) => state.toggleDensity)

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6 text-left">
      <h1 className="font-medium text-3xl text-gray-900 dark:text-gray-100">请求链路 Demo</h1>
      <p className="text-sm">
        数据由 MSW mock 提供（含 800ms 人为延迟），经 axios → TanStack Query → DTO 映射到达本组件。
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleDensity}
          className="rounded-md border-2 border-transparent bg-accent-soft px-3 py-1.5 text-accent transition-colors hover:border-accent-strong"
        >
          列表密度：{density === 'comfortable' ? '舒适' : '紧凑'}（Zustand）
        </button>
      </div>

      {isPending ? (
        <p className="animate-pulse text-gray-500">加载中…</p>
      ) : error ? (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700 text-sm dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          加载失败：{error.message}
        </div>
      ) : (
        <ul className={`list-none p-0 ${density === 'comfortable' ? 'space-y-3' : 'space-y-1'}`}>
          {data?.items.map((item) => (
            <li
              key={item.name}
              className={`rounded-md border border-gray-200 dark:border-gray-700 ${
                density === 'comfortable' ? 'px-4 py-3' : 'px-2 py-1'
              }`}
            >
              <span className="text-gray-900 dark:text-gray-100">{item.name}</span>
              <span className="ml-2 text-gray-500 text-sm">{item.kind}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-gray-400 text-xs">
        数据生成时间（DTO 字段 generated_at 映射而来）：{data?.generatedAt ?? '—'}
      </p>
    </main>
  )
}
