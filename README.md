# React SPA Template

基于 React、TypeScript、Vite 与 Feature-Sliced Design（FSD）的开箱即用 SPA 模板。

## 特点

- React 19、TypeScript、Vite
- React Router v7：集中路由表、路由级懒加载、三层错误兜底（全局 ErrorBoundary / errorElement / 404）
- TanStack Query v5 + axios：服务端状态缓存、`ApiError` 统一错误归一、DTO 映射约定、Devtools
- Zustand：客户端状态，store 归属各 Slice 的 `model`，不建全局 store
- Tailwind CSS v4：CSS-first 配置，`@theme` 主题变量
- react-hook-form + zod：表单与校验（demo 页含完整示例）
- MSW：dev 环境与测试共用的 mock 数据层
- Biome：lint + 格式化 + import 排序 + Tailwind class 排序，单一工具单一配置
- Vitest + Testing Library：单元与组件测试
- Steiger：FSD 架构边界静态检查
- simple-git-hooks + lint-staged：pre-commit 自动 lint + format
- GitHub Actions CI：check + 覆盖率报告

**刻意不预装**（有真实需求时按 [growth-guide](docs/growth-guide.md) 扩展）：UI 组件库、i18n、E2E、监控、认证骨架、全局状态总线。

## 开发命令

```bash
npm install
npm run dev
```

提交前检查：

```bash
npm run check
```

`check` 依次执行：Biome（lint + 格式 + import 排序）、Steiger FSD 架构检查、TypeScript 类型检查、Vitest 测试、生产构建。

其他常用命令：

```bash
npm run test              # 测试 watch 模式
npm run format            # Biome 自动修复格式与排序
npm run build:analyze     # 构建并打开 bundle 体积报告
VITE_DISABLE_MOCK=true npm run dev   # 禁用 MSW，直连真实后端
```

环境变量见 `.env.example`。

## 代码组织

```text
src/
├── app/                     # App Layer（不包含 Slice）
│   ├── entrypoint/          # main.tsx（挂载 + dev 启用 MSW）、App.tsx（组装 Provider 与路由）
│   ├── init/                # 应用初始化装配：QueryClient、全局 ErrorBoundary
│   ├── routes/              # 路由表、站点布局、路由错误展示
│   └── styles/              # 全局样式（Tailwind 入口与 @theme）
├── pages/                   # Pages Layer（每个路由页面一个 Slice）
│   ├── home/                # 首页
│   ├── demo/                # 请求链路 Demo：api / model(Query+Zustand) / ui(含表单)
│   └── not-found/           # 404 页
├── shared/                  # Shared Layer（无业务语义的基础能力）
│   ├── api/                 # axios 实例、ApiError
│   ├── lib/                 # useDocumentTitle 等基础工具
│   └── ui/                  # Button、Input、ErrorText 基础组件
├── mocks/                   # MSW（开发基础设施，非 FSD 层）
└── test/                    # Vitest 全局 setup（非 FSD 层）
```

跨层 import 一律使用 `@/` 别名（如 `@/pages/home`）；Slice 内部使用相对路径；Slice 外部只能经 `index.ts` Public API 导入。详细的架构规则与原因见 [FSD 架构约定](docs/architecture.md)；各层什么时候建、认证/E2E/监控怎么加见 [FSD 生长指南](docs/growth-guide.md)。

## 从模板开始开发

1. 修改 `package.json` 中的包名和描述。
2. 替换首页、图标和静态资源。
3. 接入真实后端：删除 `src/mocks/`，复制 `.env.example` 为 `.env.local` 并配置 `VITE_API_BASE_URL`。
4. 新页面在 `src/pages` 下建立 Slice 并提供 `index.ts`，再到 `app/routes` 注册路由（懒加载）。
5. 请求函数放 Slice 的 `api`（DTO 映射也在此），Query hook 和 store 放 `model`。
6. 安装新依赖后运行 `npm run check`。

## 部署注意

SPA 的所有路由都需要回退到 `index.html`：

- Vercel：`vercel.json` 中 `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- Netlify：`_redirects` 文件写入 `/* /index.html 200`
- Nginx：`try_files $uri $uri/ /index.html;`

## 维护规则

维护项目时遵循根目录的 [AGENTS.md](AGENTS.md)：它保存简短、可执行的代码归属和依赖约束；`docs/architecture.md` 负责解释这些规则背后的原因。
