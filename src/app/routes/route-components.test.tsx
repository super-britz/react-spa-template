import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { NotFoundPage } from '@/pages/not-found'

import { RouteError } from './route-error'

describe('错误兜底页面', () => {
  it('404 页面渲染提示与返回首页链接', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('返回首页')).toBeInTheDocument()
  })

  it('路由抛错时 RouteError 渲染错误信息与返回链接', () => {
    function ThrowingPage(): ReactNode {
      throw new Error('测试崩溃')
    }

    const router = createMemoryRouter([
      {
        path: '/',
        element: <ThrowingPage />,
        errorElement: <RouteError />,
      },
    ])

    render(<RouterProvider router={router} />)

    expect(screen.getByText('页面出错了')).toBeInTheDocument()
    expect(screen.getByText('测试崩溃')).toBeInTheDocument()
    expect(screen.getByText('返回首页')).toBeInTheDocument()
  })
})
