import { http } from '@/shared/api'

export interface Post {
  id: string
  title: string
  body: string
  authorName: string
  publishedAt: string
  likeCount: number
}

// 后端 DTO 只允许出现在本文件
interface PostDto {
  id: string
  title: string
  body: string
  author_name: string
  published_at: string
  like_count: number
}

interface PostListDto {
  post_list: PostDto[]
  total: number
}

function mapPost(dto: PostDto): Post {
  return {
    id: dto.id,
    title: dto.title,
    body: dto.body,
    authorName: dto.author_name,
    publishedAt: dto.published_at,
    likeCount: dto.like_count,
  }
}

export async function fetchPosts(): Promise<Post[]> {
  const { data } = await http.get<PostListDto>('/api/posts')
  return data.post_list.map(mapPost)
}

export async function fetchPostById(postId: string): Promise<Post> {
  const { data } = await http.get<PostDto>(`/api/posts/${postId}`)
  return mapPost(data)
}
