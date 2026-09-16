import type { ReactNode } from 'react'
import { Link } from 'react-router'

import type { Post } from '../api/fetch-posts'

// footer 是组合插槽：上层（如 widget）可以塞入 feature 按钮，entity 自身不依赖任何 feature
export function PostCard({ post, footer }: { post: Post; footer?: ReactNode }) {
  return (
    <article className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 text-left transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60">
      <Link to={`/posts/${post.id}`} className="no-underline">
        <h3 className="font-medium text-gray-900 text-lg hover:text-accent dark:text-gray-100">
          {post.title}
        </h3>
      </Link>
      <p className="line-clamp-2 text-gray-500 text-sm dark:text-gray-400">{post.body}</p>
      <p className="text-gray-400 text-xs">
        {post.authorName} · {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
      </p>
      {footer}
    </article>
  )
}
