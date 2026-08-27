# React SPA Template

基于 React、TypeScript 和 Vite 的轻量 SPA 模板，严格遵循 Feature-Sliced Design（FSD）。

## 特点

- React 19、TypeScript 和 Vite
- 使用标准的 Layer、Slice、Segment 三级结构
- 通过 Slice Public API 和单向依赖保护模块边界
- Oxlint、Steiger 与 TypeScript 静态检查
- GitHub Actions 持续集成
- 不预装路由、状态库和请求库，由真实需求驱动扩展

## 开发命令

```bash
npm install
npm run dev
```

提交前检查：

```bash
npm run check
```

`check` 会依次执行 Oxlint、FSD 架构检查、TypeScript 类型检查和生产构建。

## 代码组织

项目当前采用最小但完整的 FSD 结构：

```text
src/
├── app/
│   ├── entrypoint/
│   └── styles/
└── pages/
    └── home/
        ├── index.ts
        └── ui/
```

- `app`：应用入口、装配与全局基础设施。
- `pages/home`：首页 Slice，通过 `index.ts` 暴露 Public API。
- `pages/home/ui`：首页 UI、样式和页面专属资源。

FSD 不要求使用全部 Layer。当前没有真实的跨页面业务能力，因此不预先创建空的 `widgets`、`features`、`entities` 和 `shared`。详细规则见 [FSD 架构约定](docs/architecture.md)。

## 从模板开始开发

1. 修改 `package.json` 中的包名和描述。
2. 替换首页、图标和静态资源。
3. 新页面在 `src/pages` 下建立 Slice，并提供 `index.ts` Public API。
4. Slice 内使用 `ui`、`api`、`model` 等 Segment 按技术目的组织代码。
5. 只有业务能力真正跨越多个页面时，才提取 `src/features`。
6. 安装新依赖后运行 `npm run check`。
