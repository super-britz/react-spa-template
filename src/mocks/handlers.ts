import { delay, HttpResponse, http } from 'msw'

interface PostSeed {
  id: string
  title: string
  body: string
  author_name: string
  published_at: string
  like_count: number
}

// 模块级可变数据：点赞在本会话内持久，模拟真实服务端状态
const posts: PostSeed[] = [
  {
    id: 'post-001',
    title: '为什么选择 Feature-Sliced Design',
    body: 'FSD 用 Layer、Slice、Segment 三级结构约束依赖方向，让业务代码按领域聚合，而不是按技术类型散落在 components/hooks/utils 里。这个 example 分支就是它的完整七层示范。',
    author_name: '模板作者',
    published_at: '2026-09-15T09:00:00.000Z',
    like_count: 12,
  },
  {
    id: 'post-002',
    title: 'DTO 映射应该放在哪里',
    body: '后端 DTO 只允许出现在 Slice 的 api Segment：请求函数拿到 snake_case 的 DTO 后立刻映射为领域类型，model 和 ui 永远不知道后端长什么样。',
    author_name: '模板作者',
    published_at: '2026-09-15T10:30:00.000Z',
    like_count: 8,
  },
  {
    id: 'post-003',
    title: '乐观更新三步走',
    body: 'onMutate 先取消进行中的请求并写入乐观值，onError 回滚快照，onSettled 失效缓存让服务端数据校正本地。见 features/like-post。',
    author_name: '模板作者',
    published_at: '2026-09-15T13:00:00.000Z',
    like_count: 5,
  },
  {
    id: 'post-004',
    title: 'widget 和 feature 的区别',
    body: 'feature 是一个用户动作（点赞、取消订单），widget 是跨页面复用的组合区块。widget 组合 entities 和 features，但不含业务决策。',
    author_name: '模板作者',
    published_at: '2026-09-16T08:00:00.000Z',
    like_count: 3,
  },
]

export const handlers = [
  http.get('/api/posts', async () => {
    await delay(600)
    return HttpResponse.json({ post_list: posts, total: posts.length })
  }),

  http.get('/api/posts/:postId', async ({ params }) => {
    await delay(600)
    const post = posts.find((item) => item.id === params.postId)
    if (!post) {
      return HttpResponse.json(
        { error_code: 'POST_NOT_FOUND', error_message: '文章不存在' },
        { status: 404 },
      )
    }
    return HttpResponse.json(post)
  }),

  http.post('/api/posts/:postId/like', async ({ params }) => {
    await delay(400)
    const post = posts.find((item) => item.id === params.postId)
    if (!post) {
      return HttpResponse.json(
        { error_code: 'POST_NOT_FOUND', error_message: '文章不存在' },
        { status: 404 },
      )
    }
    post.like_count += 1
    return HttpResponse.json({ like_count: post.like_count })
  }),

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
