import { useDocumentTitle } from '@/shared/lib'

import { PostListWidget } from '@/widgets/post-list'

export function PostsPage() {
  useDocumentTitle('文章 - React SPA Template')

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-6">
      <header className="flex flex-col gap-2 text-left">
        <span className="w-fit rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-accent text-xs">
          pages → widgets → features → entities
        </span>
        <h1 className="font-medium text-3xl text-gray-900 dark:text-gray-100">文章列表</h1>
        <p className="text-gray-500 text-sm dark:text-gray-400">
          本页只做标题与装配：数据来自 entities/post，点赞来自 features/like-post，组合发生在
          widgets/post-list。
        </p>
      </header>

      <PostListWidget />
    </main>
  )
}
