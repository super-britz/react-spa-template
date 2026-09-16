import { Link, useParams } from 'react-router'
import { usePost } from '@/entities/post'
import { LikePostButton } from '@/features/like-post'
import { useDocumentTitle } from '@/shared/lib'

export function PostDetailsPage() {
  useDocumentTitle('文章详情 - React SPA Template')
  const { postId } = useParams()
  const { data: post, isPending, error } = usePost(postId ?? '')

  if (isPending) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-6" role="status">
        <span className="sr-only">加载中</span>
        <div className="h-10 w-2/3 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-40 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 p-8 text-center">
        <h1 className="font-medium text-2xl text-gray-900 dark:text-gray-100">文章加载失败</h1>
        <p className="text-gray-500 text-sm dark:text-gray-400">{error?.message ?? '文章不存在'}</p>
        <Link
          to="/posts"
          className="mt-2 rounded-md bg-accent px-4 py-2 font-medium text-sm text-white no-underline transition-opacity hover:opacity-85"
        >
          返回列表
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6 text-left">
      <header className="flex flex-col gap-2">
        <span className="text-gray-400 text-xs">
          路由参数 postId = {post.id}（DTO 映射后字段：authorName / publishedAt / likeCount）
        </span>
        <h1 className="font-medium text-3xl text-gray-900 dark:text-gray-100">{post.title}</h1>
        <p className="text-gray-500 text-sm dark:text-gray-400">
          {post.authorName} · {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
        </p>
      </header>

      <p className="text-gray-700 leading-relaxed dark:text-gray-300">{post.body}</p>

      <div className="flex items-center justify-between border-gray-200 border-t pt-4 dark:border-gray-700">
        <LikePostButton postId={post.id} likeCount={post.likeCount} />
        <Link
          to="/posts"
          className="text-gray-500 text-sm no-underline transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          ← 返回列表
        </Link>
      </div>
    </main>
  )
}
