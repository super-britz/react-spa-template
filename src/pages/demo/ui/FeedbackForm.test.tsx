import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { FeedbackForm } from './FeedbackForm'

describe('FeedbackForm', () => {
  it('空提交显示 zod 校验错误', async () => {
    const user = userEvent.setup()
    render(<FeedbackForm />)

    await user.click(screen.getByRole('button', { name: '提交反馈' }))

    expect(await screen.findByText('昵称至少 2 个字符')).toBeInTheDocument()
    expect(screen.getByText('反馈内容至少 10 个字符')).toBeInTheDocument()
  })

  it('提交含 fail 的内容显示服务端错误回填', async () => {
    const user = userEvent.setup()
    render(<FeedbackForm />)

    await user.type(screen.getByLabelText('昵称'), '张三')
    await user.type(screen.getByLabelText('反馈内容'), '这条会 fail 的反馈，长度足够。')
    await user.click(screen.getByRole('button', { name: '提交反馈' }))

    expect(await screen.findByText(/被服务端拒绝/)).toBeInTheDocument()
  })

  it('正常提交显示成功提示', async () => {
    const user = userEvent.setup()
    render(<FeedbackForm />)

    await user.type(screen.getByLabelText('昵称'), '张三')
    await user.type(screen.getByLabelText('反馈内容'), '这是一条测试反馈，长度足够。')
    await user.click(screen.getByRole('button', { name: '提交反馈' }))

    expect(await screen.findByText('提交成功，感谢反馈！')).toBeInTheDocument()
  })
})
