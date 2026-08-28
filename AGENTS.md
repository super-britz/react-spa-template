# React SPA Template 维护规则

## 沟通与提交

- 使用中文回复和维护项目文档。
- 先说明结论，再解释必要原因。
- Git 提交使用 Conventional Commits，提交说明使用中文。
- 不添加 Co-Authored-By 或任何 AI/Codex 署名。

## 开始修改前

1. 阅读 `docs/architecture.md`。
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

当前项目只需要 `app` 和 `pages`。不要仅为形式完整而创建 `widgets`、`features`、`entities` 或 `shared`。

## 代码放置规则

- 应用入口、Provider、路由装配、全局样式放在 `app`。
- 一个路由页面及其专属状态、请求、组件和资源放在对应的 `pages/<slice>`。
- 跨页面复用的大型独立 UI 区块，确有需要时放在 `widgets`。
- 为用户提供明确价值、跨页面复用的交互，确有需要时放在 `features`。
- 被多个上层 Slice 使用的稳定业务概念，确有需要时放在 `entities`。
- 不包含具体业务语义的 UI Kit、API Client、配置和基础库放在 `shared`。
- 只在一个 Page 使用的交互继续留在该 Page，不提前提升为 Feature。
- 只被一个 Slice 使用的图片、样式和其他资源与该 Slice 就近放置。

## Slice 与 Segment

- 每个 Slice 使用根目录 `index.ts` 暴露最小 Public API。
- Slice 外部只能从 Public API 导入，不能访问 `ui`、`model`、`api` 等内部路径。
- Slice 内部使用相对路径。
- Segment 按技术目的命名，优先使用 `ui`、`model`、`api`、`lib`、`config`。
- 不建立全局 `components`、`hooks`、`services`、`utils` 大杂烩目录。

## 状态规则

按以下顺序确定状态归属：

1. 组件局部状态。
2. Page 或其他业务 Slice 的局部状态。
3. 可以派生的数据不重复保存。
4. 需要分享、刷新恢复或参与导航的状态优先放入 URL。
5. 服务端数据使用服务端缓存方案，不复制到全局客户端 Store。
6. 只有真正跨越多个边界的客户端状态才提升作用域。

## 变更验收

完成代码修改后运行：

```bash
npm run check
```

该命令必须同时通过：

- Oxlint 代码检查；
- Steiger FSD 架构检查；
- TypeScript 类型检查；
- Vite 生产构建。

如果变更引入新的 Layer、公共边界或状态策略，同步更新 `docs/architecture.md` 和 README 中的目录说明。
