import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api'

import { submitFeedback } from './submit-feedback'

describe('submitFeedback', () => {
  it('成功提交并映射返回值', async () => {
    const result = await submitFeedback({ name: '张三', message: '这是一条测试反馈，长度足够。' })

    expect(result).toEqual({ success: true, receivedMessage: '这是一条测试反馈，长度足够。' })
  })

  it('包含 fail 关键字时抛出 ApiError', async () => {
    let error: unknown
    try {
      await submitFeedback({ name: '张三', message: '这条会 fail 的反馈，长度足够。' })
    } catch (e) {
      error = e
    }

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(500)
    expect((error as ApiError).message).toContain('拒绝')
  })
})
