import { useMutation, useQueryClient } from '@tanstack/react-query'

import { type Post, postKeys } from '@/entities/post'

import { likePost } from '../api/like-post'

interface LikeContext {
  previousList?: Post[]
  previousPost?: Post
}

/**
 * 点赞的乐观更新三步走（教学示例）：
 * 1. onMutate：取消进行中的请求 → 快照缓存 → 写入乐观值（列表 + 详情都更新）
 * 2. onError：用快照回滚
 * 3. onSettled：失效缓存，让服务端数据校正本地
 */
export function useLikePost(postId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => likePost(postId),
    onMutate: async (): Promise<LikeContext> => {
      await queryClient.cancelQueries({ queryKey: postKeys.all })

      const previousList = queryClient.getQueryData<Post[]>(postKeys.list())
      const previousPost = queryClient.getQueryData<Post>(postKeys.detail(postId))

      if (previousList) {
        queryClient.setQueryData<Post[]>(
          postKeys.list(),
          previousList.map((post) =>
            post.id === postId ? { ...post, likeCount: post.likeCount + 1 } : post,
          ),
        )
      }
      if (previousPost) {
        queryClient.setQueryData<Post>(postKeys.detail(postId), {
          ...previousPost,
          likeCount: previousPost.likeCount + 1,
        })
      }

      return { previousList, previousPost }
    },
    onError: (_error, _postId_, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(postKeys.list(), context.previousList)
      }
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}
