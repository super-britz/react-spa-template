# React SPA Template

基于 React、TypeScript 和 Vite 的轻量 SPA 模板，默认采用渐进式 Page-first 架构。

## 特点

- React 19、TypeScript 和 Vite
- 页面代码按变化边界就近组织
- Oxlint 与 TypeScript 静态检查
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

`check` 会依次执行 Oxlint、TypeScript 类型检查和生产构建。

## 代码组织

项目当前采用最小的 Page-first 架构：

```text
src/
├── main.tsx
├── app/
├── pages/
└── assets/
```

- `app`：应用装配与全局基础设施。
- `pages`：页面及其专属状态、组件和样式。
- `assets`：静态资源。

当前没有真实的跨页面业务能力，因此不预先创建 `features` 和 `shared`。详细的目录约束、状态归属和演进条件见 [前端架构约定](docs/architecture.md)。

## 从模板开始开发

1. 修改 `package.json` 中的包名和描述。
2. 替换首页、图标和静态资源。
3. 新页面放入 `src/pages`，页面专属代码保持就近。
4. 只有业务能力真正跨越多个页面时，才提取 `src/features`。
5. 安装新依赖后运行 `npm run check`。
