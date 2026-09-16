import { useQuery } from '@tanstack/react-query'

import { fetchPostById, fetchPosts } from '../api/fetch-posts'

// query key 集中定义：features 层做缓存操作时引用，避免魔法字符串
export const postKeys = {
  all: ['posts'] as const,
  list: () => [...postKeys.all, 'list'] as const,
  detail: (postId: string) => [...postKeys.all, 'detail', postId] as const,
}

export function usePosts() {
  return useQuery({
    queryKey: postKeys.list(),
    queryFn: fetchPosts,
  })
}

export function usePost(postId: string) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => fetchPostById(postId),
    enabled: postId.length > 0,
  })
}
