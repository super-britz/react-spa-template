import { delay, HttpResponse, http } from 'msw'

export const handlers = [
  http.get('/api/demo/data', async () => {
    await delay(800)
    return HttpResponse.json({
      id: 'demo-001',
      generated_at: new Date().toISOString(),
      framework_list: [
        { name: 'React', type: 'UI library' },
        { name: 'Vite', type: 'build tool' },
        { name: 'TypeScript', type: 'language' },
        { name: 'Tailwind CSS', type: 'style engine' },
        { name: 'TanStack Query', type: 'server state' },
      ],
    })
  }),

  http.post('/api/demo/feedback', async ({ request }) => {
    await delay(800)
    const body = (await request.json()) as { name?: string; message?: string }
    if (body.message?.toLowerCase().includes('fail')) {
      return HttpResponse.json(
        {
          error_code: 'FEEDBACK_REJECTED',
          error_message: '演示错误：这条反馈被服务端拒绝',
        },
        { status: 500 },
      )
    }
    return HttpResponse.json({ success: true, received_message: body.message ?? '' })
  }),
]
