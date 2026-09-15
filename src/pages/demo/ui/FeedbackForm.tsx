import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ApiError } from '@/shared/api'
import { Button, ErrorText, Input } from '@/shared/ui'

import { submitFeedback } from '../api/submit-feedback'

const feedbackSchema = z.object({
  name: z.string().min(2, '昵称至少 2 个字符'),
  message: z.string().min(10, '反馈内容至少 10 个字符').max(200, '反馈内容最多 200 个字符'),
})

export type FeedbackFormValues = z.infer<typeof feedbackSchema>

export function FeedbackForm() {
  const [succeeded, setSucceeded] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { name: '', message: '' },
  })

  const onSubmit = async (values: FeedbackFormValues) => {
    try {
      await submitFeedback(values)
      setSucceeded(true)
      reset()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '提交失败，请稍后重试'
      setError('root', { message })
    }
  }

  return (
    <section className="flex w-full max-w-md flex-col gap-4 text-left">
      <h2 className="font-medium text-gray-900 text-xl dark:text-gray-100">
        提交反馈（表单 Demo）
      </h2>
      <p className="text-gray-400 text-xs">
        内容包含 "fail" 关键字可触发服务端 500，观察错误回填。
      </p>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="昵称" error={errors.name?.message} {...register('name')} />
        <Input label="反馈内容" error={errors.message?.message} {...register('message')} />

        {errors.root ? <ErrorText>{errors.root.message}</ErrorText> : null}
        {succeeded ? (
          <p className="text-green-600 text-sm dark:text-green-400">提交成功，感谢反馈！</p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? '提交中…' : '提交反馈'}
        </Button>
      </form>
    </section>
  )
}
