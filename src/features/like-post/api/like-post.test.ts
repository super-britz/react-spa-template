import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api'

import { likePost } from './like-post'

describe('likePost', () => {
  it('点赞成功并返回新的点赞数', async () => {
    const result = await likePost('post-001')

    expect(result).toEqual({ likeCount: 13 })
  })

  it('不存在的文章抛出 ApiError（404）', async () => {
    let error: unknown
    try {
      await likePost('post-none')
    } catch (e) {
      error = e
    }

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(404)
  })
})
