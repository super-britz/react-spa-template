import { PostCard, usePosts } from '@/entities/post'
import { LikePostButton } from '@/features/like-post'

export function PostListWidget() {
  const { data, isPending, error, refetch } = usePosts()

  if (isPending) {
    return (
      <div className="flex flex-col gap-4" role="status">
        <span className="sr-only">加载中</span>
        {[1, 2, 3].map((row) => (
          <div key={row} className="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm dark:border-red-900 dark:bg-red-950/60 dark:text-red-300"
      >
        <p>文章加载失败：{error.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="w-fit rounded-md border border-red-300 px-3 py-1 text-xs transition-colors hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900"
        >
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {data?.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          footer={
            <div className="mt-1 flex justify-end">
              <LikePostButton postId={post.id} likeCount={post.likeCount} />
            </div>
          }
        />
      ))}
    </div>
  )
}
