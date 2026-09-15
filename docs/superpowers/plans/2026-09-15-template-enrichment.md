# React SPA 模板丰富计划 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将最小 FSD 模板升级为开箱即用的项目起点：路由、TanStack Query + axios、Zustand、Tailwind v4、RHF + zod、MSW、错误处理三层兜底、Biome 工具链、Vitest 测试、Git hooks 与 CI。

**Architecture:** 严格遵循 FSD（app → pages → shared，主分支不建 entities/widgets/features）。路由表与 Provider 集中在 `app` 层；`pages/demo` 一个 Slice 承载全部链路演示（Query、Zustand、表单、MSW）；`src/mocks/` 为非 FSD 的开发基础设施。

**Tech Stack:** React 19 · React Router v7 · TanStack Query v5 · axios v1 · zustand v5 · Tailwind v4 · react-hook-form v7 + zod v4 · msw v2 · Biome v2 · Vitest + Testing Library · simple-git-hooks + lint-staged · Steiger

**设计文档:** [2026-09-15-template-enrichment-design.md](../specs/2026-09-15-template-enrichment-design.md)

**约定（全部任务适用）:**
- 跨层 import 一律用 `@/` 别名；Slice 内部用相对路径。
- 提交信息用 Conventional Commits + 中文，不加 Co-Authored-By。
- 每个任务结束必须 `npm run check`（或任务内指定的子集）通过后再提交。
- 测试文件与被测文件同目录，命名 `*.test.ts(x)`。

---

### Task 1: 路径别名 `@/`

**Files:**
- Modify: `tsconfig.app.json`
- Modify: `vite.config.ts`
- Modify: `src/app/entrypoint/App.tsx`

- [ ] **Step 1: tsconfig 增加 paths**

`tsconfig.app.json` 的 `compilerOptions` 中、`"jsx": "react-jsx"` 行后加入：

```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] },
```

- [ ] **Step 2: Vite 增加 alias**

`vite.config.ts` 整体替换为：

```ts
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

- [ ] **Step 3: 改 App.tsx 验证别名生效**

`src/app/entrypoint/App.tsx` 第一行改为：

```ts
import { HomePage } from '@/pages/home'
```

- [ ] **Step 4: 验证**

Run: `npm run build`
Expected: 构建成功，无 "Cannot find module '@/pages/home'" 类错误。

- [ ] **Step 5: Commit**

```bash
git add tsconfig.app.json vite.config.ts src/app/entrypoint/App.tsx
git commit -m "feat: 配置 @ 路径别名"
```

---

### Task 2: Biome 替代 Oxlint 与 Prettier

**Files:**
- Create: `biome.json`、`.editorconfig`
- Delete: `.oxlintrc.json`
- Modify: `package.json`（scripts、依赖）

- [ ] **Step 1: 安装 Biome、移除 Oxlint**

```bash
npm uninstall oxlint
npm install -D @biomejs/biome
rm .oxlintrc.json
```

- [ ] **Step 2: 创建 biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.0/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": { "includes": ["**", "!dist", "!coverage"] },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": { "quoteStyle": "single", "semicolons": "asNeeded" }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "nursery": { "useSortedClasses": "warn" }
    }
  },
  "assist": {
    "enabled": true,
    "actions": { "source": { "organizeImports": "on" } }
  }
}
```

注：`useSortedClasses` 若当前 Biome 版本不含该规则（`npx biome explain useSortedClasses` 报错），删除该行并在提交信息注明。

- [ ] **Step 3: 创建 .editorconfig**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true
```

- [ ] **Step 4: 更新 package.json scripts**

`lint` 改为、并新增 `format`：

```json
"lint": "biome check",
"format": "biome check --write",
```

- [ ] **Step 5: 全库格式化并修复**

```bash
npm run format
```

Expected: 输出 "Fixed N files"，无 error（warning 可接受）。若出现 lint error，按提示修复后重跑至通过。

- [ ] **Step 6: 验证**

Run: `npm run lint && npm run build`
Expected: 两者均通过。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "build: 采用 Biome 替代 Oxlint 承担 lint 与格式化"
```

---

### Task 3: Vitest 测试基建 + useDocumentTitle（TDD）

**Files:**
- Create: `src/test/setup.ts`、`src/shared/lib/use-document-title.ts`、`src/shared/lib/use-document-title.test.ts`、`src/shared/lib/index.ts`
- Modify: `vite.config.ts`、`package.json`、`tsconfig.app.json`

- [ ] **Step 1: 安装依赖**

```bash
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: vite.config.ts 增加 test 配置**

在 `defineConfig({...})` 对象中追加（plugins、resolve 保持不变）：

```ts
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
```

同时文件第一行加类型引用：

```ts
/// <reference types="vitest/config" />
```

- [ ] **Step 3: 创建 src/test/setup.ts**

```ts
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 4: package.json 增加 scripts**

```json
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage",
```

- [ ] **Step 5: 写失败测试**

创建 `src/shared/lib/use-document-title.test.ts`：

```ts
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useDocumentTitle } from './use-document-title'

describe('useDocumentTitle', () => {
  it('将 document.title 设置为传入值', () => {
    renderHook(() => useDocumentTitle('测试标题'))
    expect(document.title).toBe('测试标题')
  })
})
```

- [ ] **Step 6: 运行确认失败**

Run: `npm run test:run`
Expected: FAIL，报错 `Failed to resolve import "./use-document-title"`。

- [ ] **Step 7: 实现**

创建 `src/shared/lib/use-document-title.ts`：

```ts
import { useEffect } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
```

创建 `src/shared/lib/index.ts`：

```ts
export { useDocumentTitle } from './use-document-title'
```

- [ ] **Step 8: 运行确认通过**

Run: `npm run test:run`
Expected: PASS，1 个测试通过。

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "test: 接入 Vitest 并新增 useDocumentTitle"
```

---

### Task 4: Tailwind v4 接入与首页迁移

**Files:**
- Modify: `vite.config.ts`、`package.json`、`src/app/styles/global.css`、`src/pages/home/ui/HomePage.tsx`
- Delete: `src/pages/home/ui/home-page.css`

- [ ] **Step 1: 安装**

```bash
npm install tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: vite.config.ts 注册插件**

`plugins` 改为：

```ts
import tailwindcss from '@tailwindcss/vite'

plugins: [react(), tailwindcss()],
```

- [ ] **Step 3: 重写 global.css**

`src/app/styles/global.css` 整体替换为：

```css
@import 'tailwindcss';

@theme {
  --font-sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, Consolas, monospace;
  --color-accent: #aa3bff;
  --color-accent-soft: rgba(170, 59, 255, 0.1);
  --color-accent-strong: #c084fc;
}

@layer base {
  :root {
    color-scheme: light dark;
    font: 18px/145% var(--font-sans);
    letter-spacing: 0.18px;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  body {
    margin: 0;
    color: #6b6375;
    background: #fff;
  }

  @media (prefers-color-scheme: dark) {
    body {
      color: #9ca3af;
      background: #16171d;
    }
  }

  #root {
    display: flex;
    width: 1126px;
    max-width: 100%;
    min-height: 100svh;
    flex-direction: column;
    margin: 0 auto;
    border-inline: 1px solid #e5e4e7;
    text-align: center;
  }

  @media (prefers-color-scheme: dark) {
    #root {
      border-inline-color: #2e303a;
    }
  }
}
```

- [ ] **Step 4: 重写 HomePage.tsx**

`src/pages/home/ui/HomePage.tsx` 整体替换为（删除 home-page.css 的 import）：

```tsx
import { useState } from 'react'

import heroImg from './hero.png'
import reactLogo from './react.svg'
import viteLogo from './vite.svg'

const links = [
  { href: 'https://vite.dev/', icon: 'logo', label: 'Explore Vite', img: viteLogo },
  { href: 'https://react.dev/', icon: 'button-icon', label: 'Learn more', img: reactLogo },
]

const socials = [
  { href: 'https://github.com/vitejs/vite', label: 'GitHub' },
  { href: 'https://chat.vite.dev/', label: 'Discord' },
  { href: 'https://x.com/vite_js', label: 'X.com' },
  { href: 'https://bsky.app/profile/vite.dev', label: 'Bluesky' },
]

export function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-8">
      <div className="relative">
        <img src={heroImg} width="170" height="179" alt="" className="relative z-0 mx-auto w-[170px]" />
        <img
          src={reactLogo}
          alt="React logo"
          className="absolute top-[34px] z-10 h-7 [transform:perspective(2000px)_rotateZ(300deg)_rotateX(44deg)_rotateY(39deg)_scale(1.4)]"
        />
        <img
          src={viteLogo}
          alt="Vite logo"
          className="top-[107px] absolute z-0 h-6.5 [transform:perspective(2000px)_rotateZ(300deg)_rotateX(40deg)_rotateY(39deg)_scale(0.8)]"
        />
      </div>

      <div>
        <h1 className="my-8 text-4xl font-medium tracking-tight text-gray-900 md:my-5 dark:text-gray-100">
          React SPA Template
        </h1>
        <p>
          Edit <code className="rounded bg-gray-100 px-2 py-1 font-mono text-[15px] text-gray-900 dark:bg-gray-800 dark:text-gray-100">src/pages/home/ui/HomePage.tsx</code> and save to test <code className="rounded bg-gray-100 px-2 py-1 font-mono text-[15px] text-gray-900 dark:bg-gray-800 dark:text-gray-100">HMR</code>
        </p>
      </div>

      <button
        type="button"
        className="mb-6 rounded-md border-2 border-transparent bg-accent-soft px-2.5 py-1.5 font-mono text-base text-accent transition-colors duration-300 hover:border-accent-strong focus-visible:mt-0.5 focus-visible:outline-2 focus-visible:outline-accent"
        onClick={() => setCount((currentCount) => currentCount + 1)}
      >
        Count is {count}
      </button>

      <section className="flex flex-1 flex-col border-t border-gray-200 text-left md:flex-row dark:border-gray-700">
        <div className="flex-1 p-8 max-md:text-center">
          <svg className="mb-4 size-5.5 max-md:mx-auto" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon" />
          </svg>
          <h2 className="mb-2 text-2xl font-medium text-gray-900 dark:text-gray-100">Documentation</h2>
          <p>Your questions, answered</p>
          <ul className="mt-8 flex list-none flex-wrap gap-2 p-0">
            {links.map((link) => (
              <li key={link.href} className="flex basis-full md:basis-auto">
                <a
                  href={link.href}
                  target="_blank"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-100/50 px-3 py-1.5 text-base text-gray-900 no-underline transition-shadow duration-300 hover:shadow-lg md:w-auto dark:bg-gray-800/50 dark:text-gray-100"
                >
                  <img src={link.img} alt="" className="h-4.5" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 border-t border-gray-200 p-8 max-md:text-center md:border-t-0 md:border-l dark:border-gray-700">
          <svg className="mb-4 size-5.5 max-md:mx-auto" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon" />
          </svg>
          <h2 className="mb-2 text-2xl font-medium text-gray-900 dark:text-gray-100">Connect with us</h2>
          <p>Join the Vite community</p>
          <ul className="mt-8 flex list-none flex-wrap justify-center gap-2 p-0 md:justify-start">
            {socials.map((social) => (
              <li key={social.href} className="flex basis-[calc(50%-8px)] md:basis-auto">
                <a
                  href={social.href}
                  target="_blank"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-100/50 px-3 py-1.5 text-base text-gray-900 no-underline transition-shadow duration-300 hover:shadow-lg md:w-auto dark:bg-gray-800/50 dark:text-gray-100"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 5: 删除旧样式文件**

```bash
rm src/pages/home/ui/home-page.css
```

- [ ] **Step 6: 格式化并验证**

```bash
npm run format
npm run lint && npm run typecheck && npm run build
```

Expected: 全部通过。`npm run dev` 打开首页确认视觉正常（明暗两种主题都看一眼）。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: 接入 Tailwind v4 并迁移首页样式"
```

---

### Task 5: React Router v7 + 错误处理三层兜底

**Files:**
- Create: `src/app/routes/index.tsx`、`src/app/ui/app-layout.tsx`、`src/app/ui/route-error.tsx`、`src/app/ui/error-boundary.tsx`、`src/pages/not-found/index.ts`、`src/pages/not-found/ui/NotFoundPage.tsx`
- Modify: `package.json`（依赖）、`src/app/entrypoint/App.tsx`、`src/app/entrypoint/main.tsx`（不变则跳过）

- [ ] **Step 1: 安装**

```bash
npm install react-router
```

- [ ] **Step 2: 404 页 Slice**

创建 `src/pages/not-found/index.ts`：

```ts
export { NotFoundPage } from './ui/NotFoundPage'
```

创建 `src/pages/not-found/ui/NotFoundPage.tsx`：

```tsx
import { useDocumentTitle } from '@/shared/lib'

export function NotFoundPage() {
  useDocumentTitle('页面不存在 - React SPA Template')
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-5xl font-medium text-gray-900 dark:text-gray-100">404</h1>
      <p>页面不存在或已被移动。</p>
      <a
        href="/"
        className="rounded-md border-2 border-transparent bg-accent-soft px-3 py-1.5 text-accent transition-colors hover:border-accent-strong"
      >
        返回首页
      </a>
    </main>
  )
}
```

- [ ] **Step 3: app/ui 三件（布局、路由错误、全局边界）**

创建 `src/app/ui/app-layout.tsx`：

```tsx
import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router'

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3 dark:border-gray-700">
        <span className="font-mono text-sm text-gray-900 dark:text-gray-100">react-spa-template</span>
        <nav className="flex gap-2">
          {[
            { to: '/', label: '首页' },
            { to: '/demo', label: 'Demo' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 no-underline ${
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <Suspense fallback={<div className="p-8 text-center">页面加载中…</div>}>
        <Outlet />
      </Suspense>
    </div>
  )
}
```

注：此时 `/demo` 路由尚未注册，点击会落到 404，属预期中间状态，Task 7 补上。

创建 `src/app/ui/route-error.tsx`：

```tsx
import { Link, isRouteErrorResponse, useRouteError } from 'react-router'

export function RouteError() {
  const error = useRouteError()

  const title = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : '页面出错了'
  const detail =
    isRouteErrorResponse(error) || error instanceof Error ? error.message : '发生未知错误'

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-medium text-gray-900 dark:text-gray-100">{title}</h1>
      <p className="text-sm">{detail}</p>
      <Link
        to="/"
        className="rounded-md border-2 border-transparent bg-accent-soft px-3 py-1.5 text-accent transition-colors hover:border-accent-strong"
      >
        返回首页
      </Link>
    </main>
  )
}
```

创建 `src/app/ui/error-boundary.tsx`：

```tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('未捕获的渲染错误', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
          <h1 className="text-4xl font-medium text-gray-900 dark:text-gray-100">应用崩溃了</h1>
          <p className="text-sm">{this.state.error.message}</p>
          <button
            type="button"
            className="rounded-md border-2 border-transparent bg-accent-soft px-3 py-1.5 text-accent transition-colors hover:border-accent-strong"
            onClick={() => this.setState({ error: null })}
          >
            尝试恢复
          </button>
        </main>
      )
    }
    return this.props.children
  }
}
```

- [ ] **Step 4: 路由表**

创建 `src/app/routes/index.tsx`：

```tsx
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'

import { AppLayout } from '../ui/app-layout'
import { RouteError } from '../ui/route-error'

const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })))
const NotFoundPage = lazy(() => import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
```

- [ ] **Step 5: 改造 App.tsx 并给首页加标题**

`src/app/entrypoint/App.tsx` 整体替换为：

```tsx
import { RouterProvider } from 'react-router'

import { router } from '../routes'
import { ErrorBoundary } from '../ui/error-boundary'

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
```

`src/pages/home/ui/HomePage.tsx` 组件体首行加（import 区加 `import { useDocumentTitle } from '@/shared/lib'`）：

```tsx
useDocumentTitle('React SPA Template')
```

- [ ] **Step 6: 验证**

Run: `npm run lint && npm run typecheck && npm run test:run && npm run build`
Expected: 全部通过。`npm run dev` 手动验证：`/` 正常、访问 `/xyz` 显示 404、header 导航高亮正确、刷新后路由不 404（dev 服务器 fallback 正常）。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: 接入 React Router 并建立错误处理三层兜底"
```

---

### Task 6: TanStack Query Provider + Devtools

**Files:**
- Create: `src/app/providers/query-client.ts`
- Modify: `package.json`、`src/app/entrypoint/App.tsx`

- [ ] **Step 1: 安装**

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

- [ ] **Step 2: 创建 query-client.ts**

创建 `src/app/providers/query-client.ts`：

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})
```

- [ ] **Step 3: App.tsx 接线**

`src/app/entrypoint/App.tsx` 替换为：

```tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router'

import { queryClient } from '../providers/query-client'
import { router } from '../routes'
import { ErrorBoundary } from '../ui/error-boundary'

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
```

- [ ] **Step 4: 验证并提交**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: 通过。`npm run dev` 页面右下角出现 Query Devtools 面板。

```bash
git add -A
git commit -m "feat: 接入 TanStack Query 全局 Provider 与 Devtools"
```

---

### Task 7: MSW 基建与 mock 端点

**Files:**
- Create: `src/mocks/handlers.ts`、`src/mocks/browser.ts`、`src/mocks/server.ts`、`.env.example`、`src/vite-env.d.ts`
- Create（由命令生成）: `public/mockServiceWorker.js`
- Modify: `package.json`、`src/app/entrypoint/main.tsx`、`src/test/setup.ts`

- [ ] **Step 1: 安装并生成 worker**

```bash
npm install -D msw
npx msw init public/ --save
```

Expected: `public/mockServiceWorker.js` 生成。

- [ ] **Step 2: handlers.ts**

创建 `src/mocks/handlers.ts`（mock 数据刻意用后端 DTO 形状：snake_case）：

```ts
import { delay, http, HttpResponse } from 'msw'

export const handlers = [
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
        { error_code: 'FEEDBACK_REJECTED', error_message: '演示错误：这条反馈被服务端拒绝' },
        { status: 500 },
      )
    }
    return HttpResponse.json({ success: true, received_message: body.message ?? '' })
  }),
]
```

- [ ] **Step 3: browser.ts 与 server.ts**

创建 `src/mocks/browser.ts`：

```ts
import { setupWorker } from 'msw/browser'

import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

创建 `src/mocks/server.ts`（供 Vitest 使用）：

```ts
import { setupServer } from 'msw/node'

import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

- [ ] **Step 4: main.tsx 条件启用**

`src/app/entrypoint/main.tsx` 整体替换为：

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import '../styles/global.css'

async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_DISABLE_MOCK) {
    return
  }
  const { worker } = await import('@/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
```

- [ ] **Step 5: test/setup.ts 接入 node server**

`src/test/setup.ts` 替换为：

```ts
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from '@/mocks/server'

import '@testing-library/jest-dom/vitest'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
```

- [ ] **Step 6: .env.example 与环境变量类型**

创建 `.env.example`：

```
# API 基础地址；留空表示同源（请求 /api/... 相对路径）
VITE_API_BASE_URL=
# dev 环境设为 true 可禁用 MSW mock，直连真实后端
VITE_DISABLE_MOCK=
```

创建 `src/vite-env.d.ts`（工具链约定文件，位于 src 根，不属于 FSD 层）：

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_DISABLE_MOCK?: string
}
```

- [ ] **Step 7: lint:fsd 排除 mocks**

`package.json` 中 `lint:fsd` 改为按目录执行（steiger 对显式列出的目录做检查，src/mocks 与 src/test 天然排除）：

```json
"lint:fsd": "steiger src/app src/pages src/shared",
```

- [ ] **Step 8: 验证并提交**

Run: `npm run lint && npm run lint:fsd && npm run typecheck && npm run test:run && npm run build`
Expected: 全部通过（测试此时无网络请求，`onUnhandledRequest: 'error'` 不受影响）。

```bash
git add -A
git commit -m "feat: 接入 MSW mock 基建"
```

---

### Task 8: axios http-client 与 ApiError（TDD）

**Files:**
- Create: `src/shared/api/http-client.ts`、`src/shared/api/http-client.test.ts`、`src/shared/api/index.ts`
- Modify: `package.json`

- [ ] **Step 1: 安装**

```bash
npm install axios
```

- [ ] **Step 2: 写失败测试**

创建 `src/shared/api/http-client.test.ts`：

```ts
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/mocks/server'

import { ApiError, http as httpClient } from './http-client'

describe('http-client 响应拦截器', () => {
  it('非 2xx 响应归一为 ApiError 并保留服务端错误信息', async () => {
    server.use(
      http.get('/api/error', () =>
        HttpResponse.json({ error_code: 'X', error_message: '服务端错误信息' }, { status: 500 }),
      ),
    )

    const promise = httpClient.get('/api/error')

    const error = await expect(promise).rejects.toThrowError(ApiError) as unknown as ApiError
    expect(error.status).toBe(500)
    expect(error.message).toBe('服务端错误信息')
  })

  it('网络错误归一为 ApiError（status 0）', async () => {
    server.use(http.get('/api/network-error', { forceNetworkError: true }))

    const error = await expect(httpClient.get('/api/network-error')).rejects.toThrowError(
      ApiError,
    ) as unknown as ApiError
    expect(error.status).toBe(0)
  })

  it('成功请求返回解析后的 JSON', async () => {
    server.use(http.get('/api/ok', () => HttpResponse.json({ ok: true })))

    await expect(httpClient.get('/api/ok')).resolves.toMatchObject({ data: { ok: true } })
  })
})
```

- [ ] **Step 3: 运行确认失败**

Run: `npm run test:run`
Expected: FAIL，`Failed to resolve import "./http-client"`。

- [ ] **Step 4: 实现**

创建 `src/shared/api/http-client.ts`：

```ts
import axios, { AxiosError, isAxiosError } from 'axios'

export class ApiError extends Error {
  readonly status: number
  readonly original: unknown

  constructor(message: string, status: number, original: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.original = original
  }
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10_000,
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      return Promise.reject(toApiError(error))
    }
    return Promise.reject(error)
  },
)

function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0
  const data = error.response?.data as { error_message?: string; message?: string } | undefined
  const message = data?.error_message ?? data?.message ?? error.message
  return new ApiError(message, status, error)
}
```

创建 `src/shared/api/index.ts`：

```ts
export { ApiError, http } from './http-client'
```

- [ ] **Step 5: 运行确认通过**

Run: `npm run test:run`
Expected: PASS，全部测试通过。

- [ ] **Step 6: 验证并提交**

Run: `npm run lint && npm run typecheck && npm run build`

```bash
git add -A
git commit -m "feat: 新增 axios http-client 与 ApiError 错误归一"
```

---

### Task 9: demo 页面 Slice（Query + Zustand + 组件测试）

**Files:**
- Create: `src/pages/demo/index.ts`、`src/pages/demo/api/fetch-demo-data.ts`、`src/pages/demo/api/fetch-demo-data.test.ts`、`src/pages/demo/model/use-demo-data.ts`、`src/pages/demo/model/demo-store.ts`、`src/pages/demo/ui/DemoPage.tsx`、`src/pages/demo/ui/DemoPage.test.tsx`
- Modify: `package.json`、`src/app/routes/index.tsx`

- [ ] **Step 1: 安装 zustand**

```bash
npm install zustand
```

- [ ] **Step 2: 写 DTO 映射的失败测试**

创建 `src/pages/demo/api/fetch-demo-data.test.ts`：

```ts
import { describe, expect, it } from 'vitest'

import { fetchDemoData } from './fetch-demo-data'

describe('fetchDemoData', () => {
  it('将后端 DTO 映射为领域类型', async () => {
    const data = await fetchDemoData()

    expect(data.id).toBe('demo-001')
    expect(data.generatedAt).toBeTypeOf('string')
    expect(data.items[0]).toEqual({ name: 'React', kind: 'UI library' })
    expect(Object.keys(data)).toEqual(['id', 'generatedAt', 'items'])
  })
})
```

- [ ] **Step 3: 运行确认失败**

Run: `npm run test:run`
Expected: FAIL，`Failed to resolve import "./fetch-demo-data"`。

- [ ] **Step 4: 实现请求函数（含显式 DTO 映射）**

创建 `src/pages/demo/api/fetch-demo-data.ts`：

```ts
import { http } from '@/shared/api'

export interface DemoItem {
  name: string
  kind: string
}

export interface DemoData {
  id: string
  generatedAt: string
  items: DemoItem[]
}

// 后端 DTO 只允许出现在本文件
interface DemoDataDto {
  id: string
  generated_at: string
  framework_list: { name: string; type: string }[]
}

function mapDemoData(dto: DemoDataDto): DemoData {
  return {
    id: dto.id,
    generatedAt: dto.generated_at,
    items: dto.framework_list.map((item) => ({ name: item.name, kind: item.type })),
  }
}

export async function fetchDemoData(): Promise<DemoData> {
  const { data } = await http.get<DemoDataDto>('/api/demo/data')
  return mapDemoData(data)
}
```

Run: `npm run test:run` → PASS。

- [ ] **Step 5: model 层（Query hook + Zustand store）**

创建 `src/pages/demo/model/use-demo-data.ts`：

```ts
import { useQuery } from '@tanstack/react-query'

import { fetchDemoData } from '../api/fetch-demo-data'

export function useDemoData() {
  return useQuery({
    queryKey: ['demo', 'data'],
    queryFn: fetchDemoData,
  })
}
```

创建 `src/pages/demo/model/demo-store.ts`：

```ts
import { create } from 'zustand'

export type Density = 'comfortable' | 'compact'

interface DemoStore {
  density: Density
  toggleDensity: () => void
}

export const useDemoStore = create<DemoStore>((set) => ({
  density: 'comfortable',
  toggleDensity: () =>
    set((state) => ({ density: state.density === 'comfortable' ? 'compact' : 'comfortable' })),
}))
```

- [ ] **Step 6: DemoPage UI**

创建 `src/pages/demo/ui/DemoPage.tsx`：

```tsx
import { useDocumentTitle } from '@/shared/lib'

import { useDemoData } from '../model/use-demo-data'
import { useDemoStore } from '../model/demo-store'

export function DemoPage() {
  useDocumentTitle('Demo - React SPA Template')
  const { data, isPending, error } = useDemoData()
  const density = useDemoStore((state) => state.density)
  const toggleDensity = useDemoStore((state) => state.toggleDensity)

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6 text-left">
      <h1 className="text-3xl font-medium text-gray-900 dark:text-gray-100">请求链路 Demo</h1>
      <p className="text-sm">数据由 MSW mock 提供（含 800ms 人为延迟），经 axios → TanStack Query → DTO 映射到达本组件。</p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleDensity}
          className="rounded-md border-2 border-transparent bg-accent-soft px-3 py-1.5 text-accent transition-colors hover:border-accent-strong"
        >
          列表密度：{density === 'comfortable' ? '舒适' : '紧凑'}（Zustand）
        </button>
      </div>

      {isPending ? (
        <p className="animate-pulse text-gray-500">加载中…</p>
      ) : error ? (
        <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          加载失败：{error.message}
        </div>
      ) : (
        <ul className={`list-none p-0 ${density === 'comfortable' ? 'space-y-3' : 'space-y-1'}`}>
          {data?.items.map((item) => (
            <li
              key={item.name}
              className={`rounded-md border border-gray-200 dark:border-gray-700 ${
                density === 'comfortable' ? 'px-4 py-3' : 'px-2 py-1'
              }`}
            >
              <span className="text-gray-900 dark:text-gray-100">{item.name}</span>
              <span className="ml-2 text-sm text-gray-500">{item.kind}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-gray-400">数据生成时间（DTO 字段 generated_at 映射而来）：{data?.generatedAt ?? '—'}</p>
    </main>
  )
}
```

创建 `src/pages/demo/index.ts`：

```ts
export { DemoPage } from './ui/DemoPage'
```

- [ ] **Step 7: 注册路由**

`src/app/routes/index.tsx`：HomePage 懒加载声明后加入一行，路由 children `{ path: '*', ... }` 之前加入路由：

```tsx
const DemoPage = lazy(() => import('@/pages/demo').then((m) => ({ default: m.DemoPage })))
```

```tsx
      { index: true, element: <HomePage /> },
      { path: 'demo', element: <DemoPage /> },
      { path: '*', element: <NotFoundPage /> },
```

- [ ] **Step 8: 写组件测试（loading → success）**

创建 `src/pages/demo/ui/DemoPage.test.tsx`：

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { DemoPage } from './DemoPage'

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('DemoPage', () => {
  it('先展示加载态，随后渲染 MSW mock 数据', async () => {
    renderWithProviders(<DemoPage />)

    expect(screen.getByText(/加载中/)).toBeInTheDocument()

    const firstItem = await screen.findByText('React')
    expect(firstItem).toBeInTheDocument()
    expect(screen.getByText('Vite')).toBeInTheDocument()
  })
})
```

Run: `npm run test:run`
Expected: PASS（含此前所有测试）。

- [ ] **Step 9: 验证并提交**

Run: `npm run lint && npm run lint:fsd && npm run typecheck && npm run build`
`npm run dev` 手动验证：`/demo` 先显示加载态约 800ms，再渲染 5 条数据；密度按钮切换间距且**导航到首页再回来后密度保留**。

```bash
git add -A
git commit -m "feat: 新增 demo 页面演示请求链路与页面级状态"
```

---

### Task 10: shared/ui 基础件 + FeedbackForm（TDD）

**Files:**
- Create: `src/shared/ui/Button.tsx`、`src/shared/ui/Input.tsx`、`src/shared/ui/ErrorText.tsx`、`src/shared/ui/index.ts`、`src/pages/demo/api/submit-feedback.ts`、`src/pages/demo/api/submit-feedback.test.ts`、`src/pages/demo/ui/FeedbackForm.tsx`、`src/pages/demo/ui/FeedbackForm.test.tsx`
- Modify: `package.json`、`src/pages/demo/ui/DemoPage.tsx`

- [ ] **Step 1: 安装**

```bash
npm install react-hook-form zod @hookform/resolvers
```

- [ ] **Step 2: shared/ui 基础件**

创建 `src/shared/ui/Button.tsx`：

```tsx
import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  const base =
    'rounded-md border-2 border-transparent px-3 py-1.5 text-base transition-colors disabled:cursor-not-allowed disabled:opacity-50'
  const variants = {
    primary: 'bg-accent-soft text-accent hover:border-accent-strong',
    ghost: 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100',
  }
  return <button type="button" className={`${base} ${variants[variant]} ${className}`} {...rest} />
}
```

创建 `src/shared/ui/Input.tsx`：

```tsx
import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: ReactNode
}

export function Input({ label, error, hint, id, ...rest }: Props) {
  const inputId = id ?? label
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1 text-left">
      <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`rounded-md border bg-transparent px-3 py-2 text-gray-900 outline-none focus:border-accent dark:text-gray-100 ${
          error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
        }`}
        {...rest}
      />
      {error ? <ErrorText>{error}</ErrorText> : hint}
    </label>
  )
}
```

创建 `src/shared/ui/ErrorText.tsx`：

```tsx
import type { ReactNode } from 'react'

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <span role="alert" className="text-sm text-red-600 dark:text-red-400">
      {children}
    </span>
  )
}
```

创建 `src/shared/ui/index.ts`：

```ts
export { Button } from './Button'
export { ErrorText } from './ErrorText'
export { Input } from './Input'
```

- [ ] **Step 3: submit-feedback 失败测试**

创建 `src/pages/demo/api/submit-feedback.test.ts`：

```ts
import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api'

import { submitFeedback } from './submit-feedback'

describe('submitFeedback', () => {
  it('成功提交并映射返回值', async () => {
    const result = await submitFeedback({ name: '张三', message: '这是一条测试反馈，长度足够。' })
    expect(result).toEqual({ success: true, receivedMessage: '这是一条测试反馈，长度足够。' })
  })

  it('包含 fail 关键字时抛出 ApiError', async () => {
    const error = await expect(
      submitFeedback({ name: '张三', message: '这条会 fail 的反馈，长度足够。' }),
    ).rejects.toThrowError(ApiError) as unknown as ApiError
    expect(error.status).toBe(500)
    expect(error.message).toContain('拒绝')
  })
})
```

Run: `npm run test:run` → FAIL（模块不存在）。

- [ ] **Step 4: 实现 submit-feedback**

创建 `src/pages/demo/api/submit-feedback.ts`：

```ts
import { http } from '@/shared/api'

export interface FeedbackValues {
  name: string
  message: string
}

export interface FeedbackResult {
  success: boolean
  receivedMessage: string
}

interface FeedbackResultDto {
  success: boolean
  received_message: string
}

export async function submitFeedback(values: FeedbackValues): Promise<FeedbackResult> {
  const { data } = await http.post<FeedbackResultDto>('/api/demo/feedback', values)
  return { success: data.success, receivedMessage: data.received_message }
}
```

Run: `npm run test:run` → PASS（ApiError 由拦截器抛出，此处无需 catch）。

- [ ] **Step 5: FeedbackForm 失败测试**

创建 `src/pages/demo/ui/FeedbackForm.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { FeedbackForm } from './FeedbackForm'

describe('FeedbackForm', () => {
  it('空提交显示 zod 校验错误', async () => {
    const user = userEvent.setup()
    render(<FeedbackForm />)

    await user.click(screen.getByRole('button', { name: '提交反馈' }))

    expect(await screen.findByText('昵称至少 2 个字符')).toBeInTheDocument()
    expect(screen.getByText('反馈内容至少 10 个字符')).toBeInTheDocument()
  })

  it('提交含 fail 的内容显示服务端错误回填', async () => {
    const user = userEvent.setup()
    render(<FeedbackForm />)

    await user.type(screen.getByLabelText('昵称'), '张三')
    await user.type(screen.getByLabelText('反馈内容'), '这条会 fail 的反馈，长度足够。')
    await user.click(screen.getByRole('button', { name: '提交反馈' }))

    expect(await screen.findByText(/被服务端拒绝/)).toBeInTheDocument()
  })

  it('正常提交显示成功提示', async () => {
    const user = userEvent.setup()
    render(<FeedbackForm />)

    await user.type(screen.getByLabelText('昵称'), '张三')
    await user.type(screen.getByLabelText('反馈内容'), '这是一条测试反馈，长度足够。')
    await user.click(screen.getByRole('button', { name: '提交反馈' }))

    expect(await screen.findByText('提交成功，感谢反馈！')).toBeInTheDocument()
  })
})
```

Run: `npm run test:run` → FAIL（组件不存在）。

- [ ] **Step 6: 实现 FeedbackForm**

创建 `src/pages/demo/ui/FeedbackForm.tsx`：

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { ApiError } from '@/shared/api'
import { Button, ErrorText, Input } from '@/shared/ui'

import { submitFeedback } from '../api/submit-feedback'

const feedbackSchema = z.object({
  name: z.string().min(2, '昵称至少 2 个字符'),
  message: z.string().min(10, '反馈内容至少 10 个字符').max(200, '反馈内容最多 200 个字符'),
})

export type FeedbackFormValues = z.infer<typeof feedbackSchema>

export function FeedbackForm() {
  const [succeeded, setSucceeded] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { name: '', message: '' },
  })

  const onSubmit = async (values: FeedbackFormValues) => {
    try {
      await submitFeedback(values)
      setSucceeded(true)
      reset()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '提交失败，请稍后重试'
      setError('root', { message })
    }
  }

  return (
    <section className="flex w-full max-w-md flex-col gap-4 text-left">
      <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">提交反馈（表单 Demo）</h2>
      <p className="text-xs text-gray-400">内容包含 "fail" 关键字可触发服务端 500，观察错误回填。</p>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="昵称" error={errors.name?.message} {...register('name')} />
        <Input label="反馈内容" error={errors.message?.message} {...register('message')} />

        {errors.root ? <ErrorText>{errors.root.message}</ErrorText> : null}
        {succeeded ? <p className="text-sm text-green-600 dark:text-green-400">提交成功，感谢反馈！</p> : null}

        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? '提交中…' : '提交反馈'}
        </Button>
      </form>
    </section>
  )
}
```

Run: `npm run test:run` → PASS。

- [ ] **Step 7: 集成进 DemoPage**

`src/pages/demo/ui/DemoPage.tsx`：import 区加 `import { FeedbackForm } from './FeedbackForm'`，在数据列表 `</ul>` 之后、生成时间 `<p>` 之前插入：

```tsx
      <div className="mt-4 border-t border-gray-200 pt-6 dark:border-gray-700">
        <FeedbackForm />
      </div>
```

- [ ] **Step 8: 验证并提交**

Run: `npm run lint && npm run lint:fsd && npm run typecheck && npm run test:run && npm run build`
`npm run dev` 手动验证 `/demo`：表单空提交、含 fail 提交、正常提交三种路径。

```bash
git add -A
git commit -m "feat: 新增表单基础件与反馈表单示例"
```

---

### Task 11: Git hooks（simple-git-hooks + lint-staged）

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装**

```bash
npm install -D simple-git-hooks lint-staged
```

- [ ] **Step 2: package.json 增加配置与 postinstall**

在 `package.json` 根级增加（`scripts` 区加 postinstall）：

```json
"postinstall": "simple-git-hooks",
"simple-git-hooks": {
  "pre-commit": "npx lint-staged"
},
"lint-staged": {
  "*.{ts,tsx,css,json,md}": ["biome check --write --no-errors-on-unmatched"]
}
```

- [ ] **Step 3: 安装钩子并验证**

```bash
npx simple-git-hooks
echo "const  x=1" > /tmp/format-check.ts && cp /tmp/format-check.ts src/format-check.ts
git add src/format-check.ts
git commit -m "test: 验证 pre-commit 钩子"
git show --stat HEAD
rm src/format-check.ts && git add -A && git commit -m "test: 移除钩子验证文件"
```

Expected: 首次提交时钩子自动把 `const  x=1` 格式化为规范代码（`git show` 可见被修复）。

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: 接入 pre-commit 钩子自动执行 Biome"
```

---

### Task 12: CI、check 命令与 bundle 分析

**Files:**
- Modify: `package.json`、`vite.config.ts`、`.github/workflows/ci.yml`

- [ ] **Step 1: check 命令串入测试**

`package.json` 的 `check` 改为：

```json
"check": "npm run lint && npm run lint:fsd && npm run typecheck && npm run test:run && npm run build",
```

- [ ] **Step 2: bundle 分析脚本**

```bash
npm install -D rollup-plugin-visualizer
```

`package.json` scripts 增加：

```json
"build:analyze": "vite build --mode analyze",
```

`vite.config.ts` 整体替换为（构建分析走 `--mode analyze`）：

```ts
/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), ...(mode === 'analyze' ? [visualizer({ open: true })] : [])],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
}))
```

Run: `npm run build:analyze`
Expected: 构建后自动打开 `stats.html` 体积报告。

- [ ] **Step 3: CI 增加覆盖率**

`.github/workflows/ci.yml` 的 `Check` step 改为，并追加覆盖率上传：

```yaml
      - name: Check
        run: npm run check

      - name: Coverage
        run: npm run test:coverage

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
```

- [ ] **Step 4: 验证并提交**

Run: `npm run check`
Expected: Biome、Steiger、tsc、Vitest、构建全部通过。

```bash
git add -A
git commit -m "ci: check 串入测试并增加覆盖率与 bundle 分析"
```

---

### Task 13: 文档四件套更新

**Files:**
- Modify: `README.md`、`AGENTS.md`、`docs/architecture.md`
- Create: `docs/growth-guide.md`

- [ ] **Step 1: README.md 重写**

按以下结构整体重写（保留现有文件链接习惯）：

1. 标题与一句话定位：「基于 React、TypeScript、Vite 与 FSD 的开箱即用 SPA 模板」。
2. **特点**列表：React 19 + TS + Vite；React Router v7（集中路由表、懒加载）；TanStack Query + axios（`ApiError` 统一错误、DTO 映射约定）；Zustand（store 归属 Slice）；Tailwind v4；RHF + zod；MSW mock；错误处理三层兜底；Biome（lint + format 一体）；Vitest + Testing Library；Steiger FSD 架构检查；GitHub Actions CI。明确「不预装」清单：UI 组件库、i18n、E2E、监控、认证骨架——指向 growth-guide。
3. **开发命令**：`npm run dev`、`npm run check`（列出其包含的五步）、`npm run test`、`npm run format`、`npm run build:analyze`、`VITE_DISABLE_MOCK=true npm run dev`。
4. **目录结构**：与最终实际结构一致的树（app/pages/shared + mocks + test）。
5. **从模板开始开发**：改包名 → 替换首页 → 按需删除 `src/mocks` 并接真实后端 → 新页面建 Slice → 更新 growth-guide 讲的扩展路径。
6. **部署注意**：SPA 需将所有路径 rewrite 到 `index.html`（Vercel/Netlify/Nginx 各一行示例）。

- [ ] **Step 2: docs/architecture.md 更新**

在现有文档基础上做以下**增量修改**（保留仍正确的部分）：

1. 「当前目录」一节替换为最终实际目录树，并加一行说明 `src/mocks`、`src/test`、`src/vite-env.d.ts` 是工具链目录、不属于 FSD 层。
2. 「三层结构的职责」后新增小节「**路由与 Provider 装配**」：路由表在 `app/routes`、页面经 Public API 懒加载、Provider 在 `app/providers`、站点框架在 `app/ui/app-layout`。
3. 新增小节「**请求链路与数据映射**」：搬入设计文档「请求链路」「前后端数据映射」两节的四条约定（axios 实例与拦截器、ApiError、DTO 只出现在 Slice `api`、不用 transformResponse）。
4. 「静态资源规则」不变；「状态放置顺序」第 5 条补充示例：demo 页 `model/demo-store.ts` 为页面级 store 示例。
5. 「变更验收」一节更新 `check` 的五步构成，并注明 pre-commit 只做 Biome，类型与测试依赖 CI。
6. 文末命令说明同步：`npm run lint` 现为 Biome（lint + format + import 排序一体）。

- [ ] **Step 3: 新建 docs/growth-guide.md**

完整章节：

1. **何时新增一层**：widgets/features/entities/shared 的判断信号各 2-3 条 + 各层最小代码骨架（`index.ts` + segment），强调「从页面里抽出来，而不是预先建层」。
2. **跨页面客户端状态**：store 下沉到业务 Slice `model`、selector 订阅、禁止全局 `src/store`。
3. **认证骨架扩展**：`entities/session`（session-store + api/auth）、`setAuthTokenGetter` 注入手法（解决 shared 不能反向依赖 entities）、ProtectedRoute 放 app 层、MSW 增加 auth 端点。
4. **表单进阶**：多步表单、跨字段校验的 RHF 模式提示。
5. **E2E（Playwright）接入步骤**：安装、配置、一条冒烟测试示例、CI job 增量。
6. **监控（Sentry）接入步骤**：Sentry.init 放 app/providers、ErrorBoundary 接 Sentry.captureException、source map 上传提示。
7. **工具链考察记录**：为何选 Biome（新项目零迁移、单配置、formatter 成熟）；oxc（Oxlint+Oxfmt，Vite+ 路线）是趋势备选；重新评估信号（Vite+ 正式发布 / Biome 停滞）。
8. **完整跨层示例**：指向 `example/full-fsd` 分支（创建后补链接）。

- [ ] **Step 4: AGENTS.md 更新**

增量修改：

1. 「沟通与提交」不变；「开始修改前」第 1 条后加「跨层 import 一律使用 `@/` 别名」。
2. 「架构基线」的层列表补 `shared` 当前已存在；加一行：`src/mocks`、`src/test`、`src/vite-env.d.ts` 为工具链目录，非 FSD 层。
3. 「代码放置规则」补充：请求函数在 Slice `api` 且 DTO 不得越过该文件；store 在 Slice `model`。
4. 「状态规则」不变。
5. 「变更验收」：`check` 五步更新；`npm run format` 修复格式；提交钩子会自动执行 Biome。

- [ ] **Step 5: 校验文档与实际一致并提交**

对照 `find src -type f` 逐项核对文档目录树；Run: `npm run check` 确认全绿。

```bash
git add -A
git commit -m "docs: 更新架构文档与 README 并新增 FSD 生长指南"
```

---

### Task 14: 全量验收

- [ ] **Step 1: 全量检查**

Run: `npm run check`
Expected: Biome、Steiger、TypeScript、Vitest、构建全部通过。

- [ ] **Step 2: 手动验收清单（npm run dev）**

逐条核对设计文档「验收标准」：

1. 首页 → header 导航进入 `/demo`；`/xyz` 显示 404。
2. `/demo`：loading（约 800ms）→ 5 条数据渲染；密度按钮切换间距；**切到首页再回来，密度保留**。
3. FeedbackForm：空提交出两条 zod 错误；含 `fail` 提交出服务端错误回填；正常提交出成功提示。
4. `VITE_DISABLE_MOCK=true npm run dev` 再开 `/demo`：请求失败，页面显示 `ApiError` 错误态（红色框）。
5. Query Devtools 面板可见且能查看缓存。
6. 随便改一个文件 `git commit`，钩子自动格式化。

- [ ] **Step 3: 对照设计文档查漏**

通读 [设计文档](../specs/2026-09-15-template-enrichment-design.md) 的「验收标准」逐条打勾；发现遗漏回到对应 Task 补齐后重跑 Step 1。

- [ ] **Step 4: 收尾提交（如有零星修正）**

```bash
git add -A
git commit -m "chore: 模板丰富计划收尾修正"
```

---

## 自查记录（Self-Review）

1. **Spec 覆盖**：路由（T5）、懒加载/404/errorElement/ErrorBoundary（T5）、title hook（T3+T5/T9）、Query+Devtools（T6/T9）、axios+ApiError（T8）、DTO 映射（T8/T9/T10）、MSW+延迟+fail 端点（T7/T10）、Zustand demo（T9）、表单+基础件（T10）、Tailwind（T4）、别名（T1）、Biome（T2）、Vitest 三类测试（T3/T8/T9/T10）、hooks（T11）、CI+coverage+analyze（T12）、文档四件（T13）——设计文档所有条目均有对应任务。`example/full-fsd` 分支为设计文档标注的「后续单独任务」，不在本计划内。
2. **占位符**：Task 13 文档任务以「结构与要点清单」给出（内容型任务，非代码占位）；其余任务代码完整。
3. **类型一致性**：`ApiError(message, status, original)`、`DemoData{id, generatedAt, items}`、`FeedbackResult{success, receivedMessage}`、`demo-store{density, toggleDensity}` 在各任务间引用一致。
