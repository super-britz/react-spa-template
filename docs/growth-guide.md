# FSD 生长指南

主分支保持最小结构：`app`、`pages`、`shared` 三层。本文说明什么时候、怎么长出其余层级与常见能力。原则只有一条：**从页面里抽出来，而不是预先建层**。

## 何时新增一层

### entities（业务实体）

**信号**：同一个业务概念（如 Order、Product、User）在多个页面独立出现——列表页展示、详情页展示、其他 Slice 引用其类型。

```text
entities/
└── order/
    ├── index.ts            # export { OrderCard }, export type { Order }
    ├── api/fetchOrder.ts
    ├── model/selectors.ts  # 按需：从 Query 缓存派生的 selector
    └── ui/OrderCard.tsx
```

### features（用户动作）

**信号**：一个为用户提供明确价值的交互（取消订单、收藏）出现在**两个及以上**页面。只在一个页面用的交互永远留在该 Page Slice。

```text
features/
└── cancel-order/
    ├── index.ts            # export { CancelOrderButton }
    ├── api/cancelOrder.ts
    ├── model/useCancelOrder.ts   # useMutation + 失败提示
    └── ui/CancelOrderButton.tsx
```

### widgets（独立区块）

**信号**：页面上一块可独立理解的组合区块需要跨页面复用（页头、侧边栏、订单汇总面板）。比 feature 更偏「静态组合」，比 page 更小。

```text
widgets/
└── order-summary/
    ├── index.ts
    └── ui/OrderSummary.tsx  # 组合 entities/order 与 features/*
```

### shared 的继续生长

无业务语义的基础能力继续按 Segment 加入：`shared/api`（HTTP）、`shared/ui`（UI Kit）、`shared/lib`（工具）、`shared/config`（环境）。**带业务名字的代码不要因为「复用」就下沉 shared**——先判断属于 entity、feature 还是页面。

## 跨页面客户端状态

状态需要跨页面时，把 store 下沉到最符合业务含义的业务 Slice 的 `model`，高层组合它：

```ts
// entities/order/model/order-filter-store.ts
export const useOrderFilterStore = create<OrderFilterStore>((set) => ({ /* ... */ }))
```

- 各页面用 selector 订阅，遵守「服务端数据不进 store」。
- 永远不要建全局 `src/store` 目录——那是所有 Slice 都能摸到所有状态的后门。

## 认证骨架

1. **entities/session**：`model/session-store.ts`（Zustand + persist 保存 `{ token, user }`，提供 login/logout）；`api/auth.ts`（login/logout 请求 + DTO 映射）。
2. **token 注入拦截器**：`shared/api` 不能反向依赖 `entities`。在 http-client 暴露 `setAuthTokenGetter(getter)`，由 `app/entrypoint/main.tsx` 装配时注入（从 session store 读取），请求拦截器据此附加 `Authorization: Bearer`。
3. **ProtectedRoute**：路由守卫放 `app/routes`（路由组合属于 app 职责），未登录重定向 `/login`。
4. **pages/login**：登录页 + RHF/zod 表单（可参照 demo 页 FeedbackForm 的模式）。
5. **MSW**：`handlers.ts` 增加 `POST /api/auth/login`、`POST /api/auth/logout`。

## 表单进阶

demo 页的 FeedbackForm 覆盖了基本模式。更复杂场景：

- **多步表单**：`useForm` 的 `mode: 'onTouched'` + 每步一个子 schema，最后用 `z.intersection` 合并校验。
- **跨字段校验**：用 zod 的 `.refine((data) => ..., { path: [...] })` 在 schema 层做，不要写在组件里。
- **服务端联动**：字段变化触发的请求走 Query 的 `enabled` 条件查询，不要在 watch 回调里手动 fetch。

## E2E（Playwright）

```bash
npm install -D @playwright/test
npx playwright install
```

最小 `playwright.config.ts`（webServer 起 vite）+ 一条冒烟测试（打开首页、导航到 demo、等待数据渲染）。CI 增加 `ubuntu-latest` 的独立 job 安装浏览器并执行。E2E 测试目录建议放 `e2e/`（与 `src/` 平级，不进 FSD 结构）。

## 监控（Sentry）

1. `npm install @sentry/react`。
2. `app/init/sentry.ts` 初始化，`main.tsx` 最早调用。
3. `app/init/error-boundary.tsx` 的 `componentDidCatch` 接 `Sentry.captureException`。
4. 构建时上传 source map（`@sentry/vite-plugin` 加进 `vite.config.ts` 的 analyze 之外常规构建链）。

## 工具链考察记录

- **当前选型：Biome**（lint + format 一体）。决策原因：新项目无迁移成本、单配置单命令、formatter 成熟（v2.x）；`useSortedClasses` 与 `organizeImports` 内置。
- **趋势备选：oxc**（Oxlint + Oxfmt，Vite 母公司 VoidZero 的 Vite+ 统一工具链路线）。Oxfmt 已通过 Prettier 100% 一致性测试。
- **重新评估信号**：Vite+ 正式发布并集成 oxc 工具链；或 Biome 出现停滞。届时迁移成本约为一次全库格式化（两边输出均与 Prettier 对齐）。

## 完整跨层示例

`example/full-fsd` 分支（规划中）：在主分支基础上追加 posts 列表/详情两个页面，共用 `entities/post` 与 `features/select-post`，演示完整七层生长结果。
