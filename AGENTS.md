# React SPA Template 维护规则

## 沟通与提交

- 使用中文回复和维护项目文档。
- 先说明结论，再解释必要原因。
- Git 提交使用 Conventional Commits，提交说明使用中文。
- 不添加 Co-Authored-By 或任何 AI/Codex 署名。

## 开始修改前

1. 阅读 `docs/architecture.md`；需要建新层或加认证/E2E/监控时读 `docs/growth-guide.md`。
2. 查看目标 Slice 及其 Public API，确认代码的真实归属。
3. 先复用现有结构，不为了未来可能的需求创建空目录或抽象。

## 架构基线

项目采用渐进式 Feature-Sliced Design：

```text
app → pages → widgets → features → entities → shared
```

- 依赖只能指向严格更低的 Layer。
- 同一 Layer 的不同 Slice 默认不能互相依赖。
- `app` 和 `shared` 直接按 Segment 组织，其余 Layer 按 Slice 组织。
- 不增加自定义顶层 Layer。
- 没有真实代码时，不创建空的 Layer、Slice 或 Segment。
- 跨层 import 一律使用 `@/` 别名；Slice 内部使用相对路径。
- `src/mocks/`、`src/test/`、`src/vite-env.d.ts` 是工具链目录，不属于 FSD 层。

## 代码放置规则

- 应用入口、Provider 装配、路由表、全局兜底放在 `app`（`entrypoint` / `init` / `routes` / `styles`）。
- 一个路由页面及其专属状态、请求、组件和资源放在对应的 `pages/<slice>`，并在 `app/routes` 注册懒加载路由。
- 跨页面复用的大型独立 UI 区块，确有需要时放在 `widgets`。
- 为用户提供明确价值、跨页面复用的交互，确有需要时放在 `features`。
- 被多个上层 Slice 使用的稳定业务概念，确有需要时放在 `entities`。
- 不包含具体业务语义的 HTTP Client、UI Kit、工具和配置放在 `shared`。
- 请求函数放 Slice 的 `api` Segment；后端 DTO 与映射只允许出现在该文件，其余代码只用领域类型。
- Query hook 与 Zustand store 放 Slice 的 `model` Segment；store 不复制服务端数据。
- 只被一个 Slice 使用的图片、样式和其他资源与该 Slice 就近放置。

## Slice 与 Segment

- 每个 Slice 使用根目录 `index.ts` 暴露最小 Public API。
- Slice 外部只能从 Public API 导入，不能访问 `ui`、`model`、`api` 等内部路径。
- Segment 按技术目的命名，优先使用 `ui`、`model`、`api`、`lib`、`config`。
- 不建立全局 `components`、`hooks`、`services`、`utils`、`store` 大杂烩目录。

## 状态规则

按以下顺序确定状态归属：

1. 组件局部状态。
2. Page 或其他业务 Slice 的局部状态。
3. 可以派生的数据不重复保存。
4. 需要分享、刷新恢复或参与导航的状态优先放入 URL。
5. 服务端数据使用 TanStack Query 缓存，不复制到客户端 Store。
6. 只有真正跨越多个边界的客户端状态才提升作用域，store 放最符合业务含义的业务 Slice。

## 测试规则

- 测试文件与被测文件同目录，命名 `*.test.ts(x)`。
- 请求函数测试经 MSW `server.use` 覆盖端点；组件测试经 `findBy*` 等待异步。

## 变更验收

完成代码修改后运行：

```bash
npm run check
```

该命令必须同时通过：

- Biome（lint、格式化、import 排序）；
- Steiger FSD 架构检查；
- TypeScript 类型检查；
- Vitest 测试；
- Vite 生产构建。

pre-commit 钩子只对暂存文件执行 Biome（`npm run format` 可全量修复）；类型与测试依赖 CI。如果变更引入新的 Layer、公共边界或状态策略，同步更新 `docs/architecture.md`、`docs/growth-guide.md` 和 README 中的目录说明。
