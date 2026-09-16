import { useLikePost } from '../model/use-like-post'

export function LikePostButton({ postId, likeCount }: { postId: string; likeCount: number }) {
  const { isPending, mutate } = useLikePost(postId)

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => mutate()}
      className="flex w-fit items-center gap-1.5 rounded-md border-2 border-transparent bg-accent-soft px-2.5 py-1 text-accent text-sm transition-colors hover:border-accent-strong disabled:opacity-50"
    >
      <span aria-hidden>♥</span>
      {likeCount}
      <span className="sr-only">点赞</span>
    </button>
  )
}
