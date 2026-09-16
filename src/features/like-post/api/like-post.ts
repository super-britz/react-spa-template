import { http } from '@/shared/api'

export interface LikeResult {
  likeCount: number
}

interface LikeResultDto {
  like_count: number
}

export async function likePost(postId: string): Promise<LikeResult> {
  const { data } = await http.post<LikeResultDto>(`/api/posts/${postId}/like`)
  return { likeCount: data.like_count }
}
