# 模板丰富计划设计文档

日期：2026-09-15
状态：已确认

## 背景与定位

模板当前是最小 FSD 结构（仅 `app`、`pages` 两层），工程底盘有 Oxlint、Steiger、TypeScript 和 CI，但没有路由、请求、测试和格式化能力。本次丰富的目标定位是四个方向的组合：

1. **开箱即用的项目起点**：预装一套克制的默认技术栈，新项目 clone 下来即可开发。
2. **保持极简、强化工程化**：每个依赖都有明确职责和真实使用者，不预装投机性依赖（如 i18n、监控）。
3. **FSD 教学示范**：以文档「生长指南」承载，主分支不放纯教学演示代码。
4. **新技术试验场**：作为后续用法，不在本次实施范围内。

原 README「不预装路由、状态库和请求库」的立场调整为「预装经过挑选的最小基线」。

## 决策记录

| 决策点 | 结论 |
|---|---|
| 运行时能力 | 路由、请求 + 服务端状态、样式方案、Mock 全部预装 |
| 全局客户端状态（Zustand） | 预装 zustand；store 归属各业务 Slice 的 `model`，不建全局 `src/store` 目录；服务端数据仍归 TanStack Query |
| 路由库 | React Router v7（声明式模式），放弃 TanStack Router（生成步骤与学习成本高） |
| HTTP 客户端 | axios 实例 + 拦截器，错误统一为 `ApiError` |
| 错误处理 | 全局 ErrorBoundary + 路由 errorElement + 404 页，三层兜底 |
| 路径别名 | 预配置 `@/`（tsconfig paths + Vite alias + Oxlint/Steiger 同步） |
| DX 基线 | React Query Devtools（dev-only）、路由级懒加载、`useDocumentTitle` hook |
| 表单 | react-hook-form + zod + @hookform/resolvers 预装，demo 页 FeedbackForm 为示例 |
| 认证骨架 | 不预装；`entities/session`、ProtectedRoute、token 拦截器注入的扩展路径写入 growth-guide |
| E2E（Playwright）、监控（Sentry） | 不预装，扩展路径写入 growth-guide |

### 代做取舍（已确认）

1. **`src/mocks/` 作为顶层开发目录**：MSW handlers 是 dev-only 基础设施，定位同 `public/`（非 FSD 层），集中放置便于接真实后端时整体删除。需在 Steiger 配置中忽略该目录。
2. **不装 commitlint**：Conventional Commits 由 AGENTS.md 约定约束，钩子只做 lint + format。
3. **不加预览部署**：无部署目标，README 留扩展说明。

## 技术栈

| 能力 | 选型 | 版本基线 |
|---|---|---|
| 路由 | react-router | v7 声明式模式 |
| 服务端状态 | @tanstack/react-query | v5 |
| HTTP | axios（`shared/api` 统一实例与拦截器） | v1 |
| 客户端状态 | zustand | v5 |
| 样式 | tailwindcss + @tailwindcss/vite + prettier-plugin-tailwindcss | v4 |
| 表单 | react-hook-form + zod + @hookform/resolvers | 最新稳定 / v4 |
| Mock | msw | v2 |
| 测试 | vitest + @testing-library/react + @testing-library/jest-dom + jsdom | 最新稳定 |
| 覆盖率 | @vitest/coverage-v8 | 与 vitest 配套 |
| 格式化 | prettier | 最新稳定 |
| Git 钩子 | simple-git-hooks + lint-staged | 最新稳定 |
| Bundle 分析 | rollup-plugin-visualizer（本地脚本用） | 最新稳定 |

## 目录结构（主分支最终形态）

```text
src/
├── app/
│   ├── entrypoint/
│   │   ├── main.tsx            # 挂载；DEV 且未禁用 mock 时启用 MSW
│   │   └── App.tsx             # 组合 Providers、全局 ErrorBoundary 与 Router
│   ├── providers/
│   │   └── query-client.ts     # QueryClient 实例与默认配置；Dev-only 挂 Query Devtools
│   ├── routes/
│   │   └── index.tsx           # 集中路由表：懒加载、errorElement、404
│   ├── ui/
│   │   ├── error-boundary.tsx  # 全局渲染错误兜底
│   │   └── route-error.tsx     # 路由 errorElement 展示
│   └── styles/
│       └── global.css          # @import "tailwindcss" + @theme 变量
├── pages/
│   ├── home/                   # 首页（站内导航入口）
│   │   ├── index.ts            # Public API: HomePage
│   │   └── ui/HomePage.tsx
│   ├── demo/                   # 完整演示 请求→Query→MSW→Zustand→表单 链路
│   │   ├── index.ts            # Public API: DemoPage
│   │   ├── api/
│   │   │   ├── fetch-demo-data.ts
│   │   │   └── submit-feedback.ts
│   │   ├── model/
│   │   │   ├── use-demo-data.ts   # useQuery 封装
│   │   │   └── demo-store.ts      # Zustand store（页面级客户端状态示例）
│   │   └── ui/
│   │       ├── DemoPage.tsx    # loading / error / success 完整状态展示
│   │       └── FeedbackForm.tsx   # RHF + zod 表单示例
│   └── not-found/
│       ├── index.ts            # Public API: NotFoundPage
│       └── ui/NotFoundPage.tsx
├── shared/
│   ├── api/
│   │   ├── http-client.ts      # axios 实例：baseURL、拦截器、统一 ApiError
│   │   └── index.ts
│   ├── lib/
│   │   └── use-document-title.ts   # 页面 title 设置
│   └── ui/                     # Button、Input、ErrorText 等（Tailwind，真实被用到）
└── mocks/                      # 开发基础设施，非 FSD 层
    ├── browser.ts              # setupWorker
    └── handlers.ts             # 拦截 /api/*（demo 数据与 feedback 端点，DTO 形状，人为延迟）
```

根目录新增：`.env.example`（`VITE_API_BASE_URL`、`VITE_DISABLE_MOCK`）、`.prettierrc`、`.editorconfig`。

跨层 import 统一使用 `@/` 别名（如 `@/pages/home`、`@/shared/api`）；Slice 内部使用相对路径。

## 模块设计

### 路由

- 路由表集中在 `app/routes`，页面 Slice 不感知自己被谁引用，符合依赖方向。
- 页面组件经 `React.lazy` + 动态 `import()` 懒加载（经 Slice Public API 导入），路由级代码分割开箱即用。
- `App.tsx` 组合 QueryClientProvider 与 RouterProvider；Provider 装配统一放 `app/providers`。
- 每个页面用 `useDocumentTitle('...')`（`shared/lib`）设置标题。

### 错误处理（三层兜底）

1. **全局 ErrorBoundary**（`app/ui/error-boundary.tsx`）：包裹 RouterProvider，兜住任何渲染崩溃，避免白屏。
2. **路由 errorElement**（`app/ui/route-error.tsx`）：挂在根路由，兜住路由加载与页面内 throw 的错误，展示错误信息与「返回首页」。
3. **404 页**（`pages/not-found`）：路由表通配路由。

请求层错误已由拦截器归一为 `ApiError`，demo 页面展示 error 态；ErrorBoundary 与 errorElement 是渲染层兜底，两者互补。

### 请求链路

- `shared/api/http-client.ts`：导出统一 axios 实例——baseURL 读 `VITE_API_BASE_URL`、设置超时；响应拦截器把非 2xx 响应与网络错误归一为 `ApiError`（含 status、message、原始错误）。JSON 序列化与解析由 axios 处理。
- 页面请求函数放各自 Slice 的 `api` Segment，`useQuery` hook 放 `model` Segment，queryKey 以 Slice 名为前缀。
- MSW handler 拦截 `/api/*` 并加人为延迟（约 800ms），使 demo 页面可观察 loading 与错误态。

### 前后端数据映射

- **职责分界**：axios 拦截器只做协议级、全局的转换（错误归一 `ApiError`、后端统一信封的拆包）；DTO → 领域类型的映射显式写在各 Slice `api` Segment 请求函数的函数体内。
- 后端 DTO（命名风格、时间戳字符串、分页信封等）只允许出现在 Slice 的 `api` Segment；`model`、`ui` 与 Public API 只使用领域类型。后端契约变化时，影响面收敛在单个请求函数文件内。
- 不使用自定义 `transformResponse` 做映射：共享实例上的 transform 无法按 Slice 区分、会让 `shared` 认识业务 DTO；且替换默认行为后需自行 `JSON.parse`，可读性与可调试性差。
- demo 页面的请求函数按此模式实现作为示例；MSW handler 返回的 mock 数据采用后端 DTO 形状（如 snake_case），让映射逻辑真实生效。

### 表单

- 预装 react-hook-form + zod + @hookform/resolvers，不额外封装。
- demo 页面的 `FeedbackForm` 即表单示例：zod schema 校验（必填、长度、格式）、字段级错误展示、提交 loading、失败经 `setError('root', …)` 回填表单顶部、成功态展示。
- 表单基础件（Input、Button、ErrorText）放 `shared/ui`，用 Tailwind 实现。
- 提交调用 `pages/demo/api/submit-feedback.ts`，MSW 提供对应端点；特定演示输入（如包含关键字 `fail`）触发失败响应，便于展示 API 错误回填。
- 登录、多步表单等更复杂场景的扩展路径写入 growth-guide。

### 客户端状态（Zustand）

- 预装 zustand，但**不建全局 `src/store` 目录**：store 属于拥有该状态的 Slice，放在该 Slice 的 `model` Segment，由各组件用 selector 订阅。
- 示例：`pages/demo/model/demo-store.ts`（页面级展示偏好），路由切换后保留，体现客户端状态与服务端缓存（Query）的分工。
- 服务端数据一律走 TanStack Query，不复制进 store；跨页面状态与会话的持有方式（含认证场景）写入 growth-guide。

### 样式

- Tailwind v4 经由 Vite 插件接入，无需 `tailwind.config`；主题定制（品牌色等）写在 `global.css` 的 `@theme`。
- 现有 `home-page.css` 及内联样式迁移为 Tailwind class；prettier-plugin-tailwindcss 负责 class 排序。
- 静态资源归属规则不变（页面专属资源留在页面 Slice）。

### 测试

- Vitest（jsdom）+ Testing Library，配置与 `vite.config.ts` 共享 plugins。
- 示例测试三类：`http-client` 单元测试（拦截器错误归一）；demo 页面组件测试（RTL 渲染 + MSW 拦截，验证 loading → success 与 error 态）；FeedbackForm 表单测试（zod 校验错误展示与提交失败回填）。
- 命令：`npm run test`（本地 watch 之外的 CI 模式用 `test:run`）、`npm run test:coverage`。

### 格式化与钩子

- Prettier 管格式，Oxlint 管质量，职责不重叠。
- simple-git-hooks 配 pre-commit：lint-staged 对暂存文件执行 `oxlint --fix` 与 `prettier --write`。typecheck 与 build 不进钩子，留给 CI。

### CI

- `npm run check` 升级为 `lint && lint:fsd && typecheck && test:run && build`。
- CI 增加 `test:coverage`，覆盖率报告上传为 artifact。
- `npm run build:analyze` 使用 rollup-plugin-visualizer，仅本地脚本，不做 CI 门槛。

## 文档与分支

- **README.md**：重写定位（克制的开箱即用基线）、命令、目录、从模板开始的步骤、SPA 静态托管 rewrite 注意事项。
- **docs/architecture.md**：更新路由装配位置、请求链路约定、前后端数据映射约定、`src/mocks` 定位、测试约定、check 命令构成。
- **docs/growth-guide.md**（新增）：FSD 生长指南——widgets/features/entities/shared 的建立时机与代码骨架，含跨页面客户端状态（Zustand store）的提升路径、认证骨架（`entities/session`、ProtectedRoute、token 注入）、E2E 与监控的扩展指引，承载教学示范职责。
- **AGENTS.md**：同步新增命令、别名规则、mock 目录规则、样式约定。
- **`example/full-fsd` 分支**（实施完成后单独进行）：基于主分支追加跨层完整示例（如 posts 列表/详情共用 entities/post 与 features），主分支保持纯净。

## 实施顺序

1. 路径别名 `@/` 与 Tailwind 接入，现有页面样式迁移。
2. React Router 接入：路由表、懒加载、404、errorElement、全局 ErrorBoundary、`useDocumentTitle`。
3. 请求链路与页面级状态：axios 实例（http-client）→ demo 页面（api/model/ui，含 Zustand store 示例）→ MSW 与 .env.example。
4. 表单：RHF + zod 接入、`shared/ui` 基础件、FeedbackForm 与 feedback mock 端点。
5. Vitest + Testing Library 接入，补三类示例测试。
6. Prettier、editorconfig、git hooks。
7. CI 与 `check` 命令更新、bundle 分析脚本。
8. README、architecture.md、AGENTS.md 更新，新增 growth-guide.md。
9. （后续单独任务）创建 `example/full-fsd` 分支。

## 验收标准

- `npm run check` 全绿（lint、FSD 架构检查、类型、测试、构建）。
- `npm run dev` 启动后：首页可经导航进入 demo 页；demo 页展示 MSW 驱动的 loading → success/error 完整状态。
- FeedbackForm：空提交与非法输入显示 zod 校验错误；含 `fail` 关键字的提交展示 API 失败回填；正常提交展示成功态。
- 访问未知路由显示 404 页；可触发 errorElement 与全局 ErrorBoundary 兜底路径。
- demo 页的 Zustand 状态在路由切换后保留，且 store 中没有复制任何服务端数据。
- 断网或禁用 mock 时错误路径可见且类型正确（`ApiError`）。
- 跨层 import 均为 `@/` 别名；`git commit` 触发 pre-commit 自动 lint + format。
- 文档与实际结构一致，无「不预装路由」类过时表述。
