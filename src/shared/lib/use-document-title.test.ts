import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useDocumentTitle } from './use-document-title'

describe('useDocumentTitle', () => {
  it('将 document.title 设置为传入值', () => {
    renderHook(() => useDocumentTitle('测试标题'))

    expect(document.title).toBe('测试标题')
  })
})
