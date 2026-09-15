# 模板丰富计划设计文档

日期：2026-09-15
状态：已确认

## 背景与定位

模板当前是最小 FSD 结构（仅 `app`、`pages` 两层），工程底盘有 Oxlint、Steiger、TypeScript 和 CI，但没有路由、请求、测试和格式化能力。本次丰富的目标定位是四个方向的组合：

1. **开箱即用的项目起点**：预装一套克制的默认技术栈，新项目 clone 下来即可开发。
2. **保持极简、强化工程化**：每个依赖都有明确职责，不预装投机性依赖（如 UI 组件库、i18n）。
3. **FSD 教学示范**：以文档「生长指南」承载，主分支不放跨层演示代码。
4. **新技术试验场**：作为后续用法，不在本次实施范围内。

原 README「不预装路由、状态库和请求库」的立场调整为「预装经过挑选的最小基线」。

## 决策记录

| 决策点 | 结论 |
|---|---|
| 运行时能力 | 路由、请求 + 服务端状态、样式方案、Mock 全部预装 |
| 全局客户端状态（Zustand） | 预装 zustand；store 归属各业务 Slice 的 `model`，不建全局 `src/store` 目录；服务端数据仍归 TanStack Query |
| 路由库 | React Router v7（声明式模式），放弃 TanStack Router（生成步骤与学习成本高） |
| HTTP 客户端 | axios 实例 + 拦截器，错误统一为 `ApiError` |
| 样式 | Tailwind CSS v4（@tailwindcss/vite 插件，CSS-first 配置） |
| Mock | MSW v2，仅 dev 环境启用 |
| 工程化 | Vitest + Testing Library、Prettier、simple-git-hooks + lint-staged、CI 增强 |
| 示例形态 | 主分支只留两个页面的最小示例；跨层完整示例放文档生长指南 + `example/full-fsd` 分支 |

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
│   │   └── App.tsx             # 组合 Providers 与 Router
│   ├── providers/
│   │   └── query-client.ts     # QueryClient 实例与默认配置
│   ├── routes/
│   │   └── index.tsx           # 集中声明的路由表
│   └── styles/
│       └── global.css          # @import "tailwindcss" + @theme 变量
├── pages/
│   ├── home/
│   │   ├── index.ts            # Public API: HomePage
│   │   └── ui/HomePage.tsx     # 改造为 Tailwind，含站内导航
│   └── demo/
│       ├── index.ts            # Public API: DemoPage
│       ├── api/fetchDemoData.ts
│       ├── model/
│       │   ├── useDemoData.ts  # useQuery 封装
│       │   └── demo-store.ts   # Zustand store（页面级客户端状态示例）
│       └── ui/DemoPage.tsx     # loading / error / success 完整状态展示
├── shared/
│   ├── api/
│   │   ├── http-client.ts      # axios 实例：baseURL、拦截器、统一 ApiError
│   │   └── index.ts
│   └── ui/                     # 仅放真实被用到的组件（如加载态）
└── mocks/                      # 开发基础设施，非 FSD 层
    ├── browser.ts              # setupWorker
    └── handlers.ts             # 拦截 /api/*，含人为延迟
```

根目录新增：`.env.example`（`VITE_API_BASE_URL`、`VITE_DISABLE_MOCK`）、`.prettierrc`、`.editorconfig`。

## 模块设计

### 路由

- 路由表集中在 `app/routes`，页面 Slice 不感知自己被谁引用，符合 `app → pages` 依赖方向。
- `App.tsx` 组合 QueryClientProvider 与 RouterProvider；Provider 装配统一放 `app/providers`。

### 请求链路

- `shared/api/http-client.ts`：导出统一 axios 实例——baseURL 读 `VITE_API_BASE_URL`、设置超时；响应拦截器把非 2xx 响应与网络错误归一为 `ApiError`（含 status、message、原始错误）。JSON 序列化与解析由 axios 处理。
- 页面请求函数放各自 Slice 的 `api` Segment，`useQuery` hook 放 `model` Segment，queryKey 以 Slice 名为前缀。
- MSW handler 拦截 `/api/*` 并加人为延迟（约 800ms），使 demo 页面可观察 loading 与错误态。

### 客户端状态（Zustand）

- 预装 zustand，但**不建全局 `src/store` 目录**：store 属于拥有该状态的 Slice，放在该 Slice 的 `model` Segment，由各组件用 selector 订阅。
- demo 页面提供一个页面级 store 示例（如列表展示偏好），演示 `create` + selector 订阅的最小模式；该状态在路由切换后保留，体现客户端状态与服务端缓存（Query）的分工。
- 服务端数据一律走 TanStack Query，不复制进 store；跨页面状态的提升路径（下沉到业务 Slice 的 `model` 再由高层组合）写入 growth-guide。

### 样式

- Tailwind v4 经由 Vite 插件接入，无需 `tailwind.config`；主题定制（品牌色等）写在 `global.css` 的 `@theme`。
- 现有 `home-page.css` 及内联样式迁移为 Tailwind class；prettier-plugin-tailwindcss 负责 class 排序。
- 静态资源归属规则不变（页面专属资源留在页面 Slice）。

### 测试

- Vitest（jsdom）+ Testing Library，配置与 `vite.config.ts` 共享 plugins。
- 两类示例测试：`http-client` 单元测试（响应解析与错误路径）；demo 页面组件测试（RTL 渲染 + MSW 拦截，验证 loading → success 与 error 态）。
- 命令：`npm run test`（watch 之外的 CI 模式用 `test:run`）、`npm run test:coverage`。

### 格式化与钩子

- Prettier 管格式，Oxlint 管质量，职责不重叠。
- simple-git-hooks 配 pre-commit：lint-staged 对暂存文件执行 `oxlint --fix` 与 `prettier --write`。typecheck 与 build 不进钩子，留给 CI。

### CI

- `npm run check` 升级为 `lint && lint:fsd && typecheck && test:run && build`。
- CI 增加 `test:coverage`，覆盖率报告上传为 artifact。
- `npm run build:analyze` 使用 rollup-plugin-visualizer，仅本地脚本，不做 CI 门槛。

## 文档与分支

- **README.md**：重写定位（克制的开箱即用基线）、命令、目录、从模板开始的步骤。
- **docs/architecture.md**：更新路由装配位置、请求链路约定、`src/mocks` 定位、测试约定、check 命令构成。
- **docs/growth-guide.md**（新增）：FSD 生长指南——widgets/features/entities/shared 的建立时机与代码骨架，含跨页面客户端状态（Zustand store）的提升路径，承载教学示范职责。
- **AGENTS.md**：同步新增命令、mock 目录规则、样式约定。
- **`example/full-fsd` 分支**（实施完成后单独进行）：基于主分支追加跨层完整示例（如 posts 列表/详情共用 entities/post 与 features），主分支保持纯净。

## 实施顺序

1. Tailwind 接入与现有页面样式迁移。
2. React Router 接入，路由表落到 `app/routes`。
3. 请求链路与客户端状态：axios 实例（http-client）→ demo 页面（api/model/ui，含 Zustand store 示例）→ MSW 与 .env.example。
4. Vitest + Testing Library 接入，补两类示例测试。
5. Prettier、editorconfig、git hooks。
6. CI 与 `check` 命令更新、bundle 分析脚本。
7. README、architecture.md、AGENTS.md 更新，新增 growth-guide.md。
8. （后续单独任务）创建 `example/full-fsd` 分支。

## 验收标准

- `npm run check` 全绿（lint、FSD 架构检查、类型、测试、构建）。
- `npm run dev` 启动后：首页可经导航进入 demo 页，demo 页展示 MSW 驱动的 loading → success/error 完整状态。
- 断网或禁用 mock 时错误路径可见且类型正确（`ApiError`）。
- demo 页的 Zustand 状态在路由切换后保留，且 store 中没有复制任何服务端数据。
- `git commit` 触发 pre-commit 自动 lint + format。
- 文档与实际结构一致，无「不预装路由」类过时表述。
