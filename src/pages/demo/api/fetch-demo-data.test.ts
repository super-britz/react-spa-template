import { describe, expect, it } from 'vitest'

import { fetchDemoData } from './fetch-demo-data'

describe('fetchDemoData', () => {
  it('将后端 DTO 映射为领域类型', async () => {
    const data = await fetchDemoData()

    expect(data.id).toBe('demo-001')
    expect(data.generatedAt).toBeTypeOf('string')
    expect(data.items[0]).toEqual({ name: 'React', kind: 'UI library' })
    expect(Object.keys(data)).toEqual(['id', 'generatedAt', 'items'])
  })
})
