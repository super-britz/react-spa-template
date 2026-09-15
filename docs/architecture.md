# Feature-Sliced Design 架构约定

## 结论

本项目严格遵循 Feature-Sliced Design（FSD）的三级结构：

```text
Layer → Slice → Segment
```

依赖方向自上而下：`app → pages → widgets → features → entities → shared`。当前业务使用 `app`、`pages`、`shared` 三层；`widgets`、`features`、`entities` 不预建，建立时机见 [growth-guide](growth-guide.md)。

## 当前目录

```text
src/
├── app/                     # App Layer，不包含 Slice
│   ├── entrypoint/          # main.tsx（挂载、dev 启用 MSW）、App.tsx（组装）
│   ├── init/                # 应用初始化：QueryClient、全局 ErrorBoundary
│   ├── routes/              # 路由表、站点布局（AppLayout）、路由错误展示
│   └── styles/              # global.css（Tailwind 入口与 @theme 主题）
├── pages/                   # Pages Layer
│   ├── home/                # 首页 Slice
│   ├── demo/                # Demo Slice：api / model / ui
│   └── not-found/           # 404 Slice
├── shared/                  # Shared Layer，无业务语义，不包含 Slice
│   ├── api/                 # axios 实例（http-client）与 ApiError
│   ├── lib/                 # useDocumentTitle 等基础工具
│   └── ui/                  # Button、Input、ErrorText 基础组件
├── mocks/                   # MSW handlers（开发基础设施，非 FSD 层）
└── test/                    # Vitest 全局 setup（非 FSD 层）
```

`src/mocks/`、`src/test/`、`src/vite-env.d.ts` 是工具链目录，定位同 `public/`，不属于 FSD 层，Steiger 不检查它们。`public/` 由 Vite 直接管理。

## 路由与 Provider 装配

- 路由表集中在 `app/routes/index.tsx`；页面组件经 Slice Public API 懒加载（`React.lazy` + 动态 `import`），实现路由级代码分割。
- 页面 Slice 不感知自己被谁引用；新增页面只需建 Slice 并在路由表注册。
- Provider 装配在 `app/entrypoint/App.tsx`：全局 ErrorBoundary → QueryClientProvider（含 dev-only Devtools）→ RouterProvider。
- 站点框架（header 导航 + Outlet）是 `app/routes/app-layout.tsx`，属于 app 层的装配职责。

## 错误处理（三层兜底）

1. **全局 ErrorBoundary**（`app/init/error-boundary.tsx`）：包裹 RouterProvider，兜住任何渲染崩溃。
2. **路由 errorElement**（`app/routes/route-error.tsx`）：兜住路由加载与页面内 throw 的错误。
3. **404 页**（`pages/not-found`）：路由表通配路由。

请求层错误由 axios 拦截器归一为 `ApiError`，页面按 Query 的 error 态展示；渲染层兜底与请求层归一互补。

## 请求链路与数据映射

- `shared/api/http-client.ts` 导出统一 axios 实例：baseURL 读 `VITE_API_BASE_URL`、超时 10s；响应拦截器把非 2xx 与网络错误归一为 `ApiError`（status、message、原始错误）。
- **拦截器只做协议级、全局的转换**（错误归一、后端统一信封的拆包）。
- **DTO → 领域类型的映射显式写在各 Slice `api` Segment 请求函数的函数体内**。后端 DTO（命名风格、时间戳、信封等）只允许出现在该文件；`model`、`ui` 与 Public API 只使用领域类型。后端契约变化时影响面收敛在单个文件。
- 不使用自定义 `transformResponse` 做映射：共享实例上的 transform 无法按 Slice 区分、会让 shared 认识业务 DTO，且替换默认行为后需自行 `JSON.parse`。
- Query hook 放 Slice 的 `model`，queryKey 以 Slice 名为前缀（如 `['demo', 'data']`）。
- MSW handler（`src/mocks/handlers.ts`）拦截 `/api/*`，返回后端 DTO 形状的数据并带人为延迟，让映射与 loading/error 态真实可观察。

## 依赖与 Public API 规则

1. 高层只能依赖更低层：`app → pages → widgets → features → entities → shared`。
2. 同一 Layer 的不同 Slice 不能互相依赖。
3. 每个 Slice 提供根目录 `index.ts` 作为 Public API；外部只能从 Public API 导入，不能引用其 `ui`、`api`、`model` 等内部路径。
4. 跨层 import 统一使用 `@/` 别名；Slice 内部使用相对路径。
5. `app` 和 `shared` 不包含 Slice，直接按 Segment 组织。
6. 不增加自定义顶层 Layer，也不创建没有实际内容的架构目录。

## 客户端状态（Zustand）

- store 属于拥有该状态的 Slice，放在其 `model` Segment，组件用 selector 订阅；不建全局 `src/store` 目录。
- 示例：`pages/demo/model/demo-store.ts`（页面级展示偏好，路由切换后保留）。
- 服务端数据一律走 TanStack Query，不复制进 store。跨页面状态的提升顺序：

1. 只影响一个组件：组件局部状态。
2. 只影响一个页面：Page Slice 的 `model`。
3. 可以从已有数据计算：不保存，直接派生。
4. 需要刷新后保留或支持分享：优先考虑 URL。
5. 来自服务端：服务端数据缓存方案（Query）。
6. 真正跨越多个边界的客户端状态：放入最符合业务含义的下层 Slice，再由高层组合。

## 样式

- Tailwind v4 经 `@tailwindcss/vite` 接入；主题定制写在 `global.css` 的 `@theme`；class 排序由 Biome 的 `useSortedClasses` 规则处理。
- 静态资源归属：只被一个 Slice 使用就放在该 Slice 内；被多个 Slice 复用且无业务含义进 `shared/ui`；全局样式与字体进 `app/styles` 或 `public/`。

## 测试

- Vitest（jsdom）+ Testing Library；配置与 `vite.config.ts` 共享；全局 setup 在 `src/test/setup.ts`（jest-dom 断言 + MSW server 生命周期）。
- 测试文件与被测文件同目录。请求函数的测试用 MSW `server.use` 覆盖端点验证映射与错误路径；组件测试经 `findBy*` 等待异步。

## 增加新页面

```text
pages/
└── orders-list/
    ├── index.ts            # export { OrdersListPage }
    ├── api/fetchOrders.ts  # 请求 + DTO 映射
    ├── model/useOrders.ts  # useQuery hook（+ 按需 store）
    └── ui/OrdersListPage.tsx
```

再到 `app/routes/index.tsx` 注册懒加载路由。不要先建全局 `components`、`hooks`、`services` 再拆散页面代码。

## 变更验收

```bash
npm run check
```

依次执行：Biome（lint + 格式 + import 排序）、Steiger FSD 架构检查、TypeScript 类型检查、Vitest 测试、生产构建，必须全部通过。pre-commit 钩子只对暂存文件执行 Biome；类型与测试交给 CI。若变更引入新的 Layer、Slice、公共边界或状态策略，同步更新本文件和 README 的目录说明。
