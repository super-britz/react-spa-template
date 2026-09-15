import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { DemoPage } from './DemoPage'

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('DemoPage', () => {
  it('先展示加载态，随后渲染 MSW mock 数据', async () => {
    renderWithProviders(<DemoPage />)

    expect(screen.getByText(/加载中/)).toBeInTheDocument()

    const firstItem = await screen.findByText('React')
    expect(firstItem).toBeInTheDocument()
    expect(screen.getByText('Vite')).toBeInTheDocument()
  })
})
