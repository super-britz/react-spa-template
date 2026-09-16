import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { PostListWidget } from './PostListWidget'

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('PostListWidget', () => {
  it('渲染 MSW mock 的文章卡片与点赞按钮', async () => {
    renderWithProviders(<PostListWidget />)

    const firstPost = await screen.findByText('为什么选择 Feature-Sliced Design')
    expect(firstPost).toBeInTheDocument()

    // 每张卡片都有点赞按钮（4 篇文章）
    const likeButtons = screen.getAllByRole('button', { name: /点赞/ })
    expect(likeButtons).toHaveLength(4)
  })
})
