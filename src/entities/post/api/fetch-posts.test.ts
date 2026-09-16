import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api'

import { fetchPostById, fetchPosts } from './fetch-posts'

describe('fetchPosts', () => {
  it('拆掉列表信封并映射为领域类型', async () => {
    const posts = await fetchPosts()

    expect(posts).toHaveLength(4)
    expect(posts[0]).toEqual({
      id: 'post-001',
      title: '为什么选择 Feature-Sliced Design',
      body: expect.any(String),
      authorName: '模板作者',
      publishedAt: '2026-09-15T09:00:00.000Z',
      likeCount: 12,
    })
    expect(Object.keys(posts[0])).toEqual([
      'id',
      'title',
      'body',
      'authorName',
      'publishedAt',
      'likeCount',
    ])
  })
})

describe('fetchPostById', () => {
  it('映射单篇领域类型', async () => {
    const post = await fetchPostById('post-002')

    expect(post.id).toBe('post-002')
    expect(post.authorName).toBe('模板作者')
  })

  it('不存在的 id 抛出 ApiError（404）', async () => {
    let error: unknown
    try {
      await fetchPostById('post-none')
    } catch (e) {
      error = e
    }

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(404)
    expect((error as ApiError).message).toBe('文章不存在')
  })
})
