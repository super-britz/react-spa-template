import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/mocks/server'

import { ApiError, http as httpClient } from './http-client'

async function expectApiError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    return error as ApiError
  }
  throw new Error('预期请求会失败，但它成功了')
}

describe('http-client 响应拦截器', () => {
  it('非 2xx 响应归一为 ApiError 并保留服务端错误信息', async () => {
    server.use(
      http.get('/api/error', () =>
        HttpResponse.json({ error_code: 'X', error_message: '服务端错误信息' }, { status: 500 }),
      ),
    )

    const error = await expectApiError(httpClient.get('/api/error'))

    expect(error.status).toBe(500)
    expect(error.message).toBe('服务端错误信息')
  })

  it('网络错误归一为 ApiError（status 0）', async () => {
    server.use(http.get('/api/network-error', () => HttpResponse.error()))

    const error = await expectApiError(httpClient.get('/api/network-error'))

    expect(error.status).toBe(0)
  })

  it('成功请求返回解析后的 JSON', async () => {
    server.use(http.get('/api/ok', () => HttpResponse.json({ ok: true })))

    await expect(httpClient.get('/api/ok')).resolves.toMatchObject({ data: { ok: true } })
  })
})
