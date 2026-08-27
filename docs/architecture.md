# Feature-Sliced Design 架构约定

## 结论

本项目严格遵循 Feature-Sliced Design（FSD）的三级结构：

```text
Layer → Slice → Segment
```

当前业务只有一个页面，因此只使用实际需要的 `app` 和 `pages` Layer。FSD 不要求创建所有 Layer；没有真实代码时，不创建空的 `widgets`、`features`、`entities` 或 `shared`。

## 当前目录

```text
src/
├── app/                         # App Layer，不包含 Slice
│   ├── entrypoint/              # 应用入口 Segment
│   │   ├── main.tsx             # 挂载 React
│   │   └── App.tsx              # 组合页面
│   └── styles/                  # 全局样式 Segment
│       └── global.css
└── pages/                       # Pages Layer
    └── home/                    # home Slice
        ├── index.ts             # Slice Public API
        └── ui/                  # UI Segment
            ├── HomePage.tsx
            ├── home-page.css
            └── ...              # 首页专属图片
```

根目录的 `public/` 由 Vite 直接管理，不属于 FSD Layer；favicon、无需构建处理的静态文件可以保留在这里。

## 三层结构的职责

- **Layer** 表示责任和依赖高度。当前依赖方向是 `app → pages`。
- **Slice** 按产品或业务含义划分。`home` 是一个页面 Slice。
- **Segment** 按技术目的组织 Slice 内部代码，例如 `ui`、`api`、`model`、`lib`、`config`。

页面是 SPA 中天然的业务边界。首页的 UI、样式、状态和专属图片因同一种页面需求变化，因此共同保留在 `pages/home/ui`。当前计数状态只影响首页，继续使用组件局部状态。

## 依赖与 Public API 规则

1. 高层只能依赖更低层：`app → pages → widgets → features → entities → shared`。
2. 同一 Layer 的不同 Slice 不能互相依赖，例如一个 Page 不能导入另一个 Page。
3. 每个 Slice 必须提供 Public API，通常是 Slice 根目录的 `index.ts`。
4. Slice 外部只能通过 Public API 导入，不能引用其 `ui`、`api`、`model` 等内部路径。
5. 同一 Slice 内部使用相对路径，可以直接引用本 Slice 的其他文件。
6. `app` 和 `shared` 不包含 Slice，直接按 Segment 组织。
7. 不增加自定义顶层 Layer，也不创建没有实际内容的架构目录。

例如，App 只能这样使用首页：

```ts
import { HomePage } from '../../pages/home'
```

不能绕过 Public API：

```ts
import { HomePage } from '../../pages/home/ui/HomePage'
```

## 静态资源规则

静态资源和代码遵循同样的归属原则：

1. 只被一个 Slice 使用：放在该 Slice 内，靠近使用它的 Segment。
2. 被多个 Slice 复用且没有具体业务含义：放入 `shared/ui`。
3. 全局样式、字体等应用级资源：放入 `app/styles`、`app/fonts` 或 `public/`。
4. 不建立按文件类型集中所有业务资源的顶层 `src/assets`。

## 增加新页面

每个独立页面默认建立一个 Page Slice，并提供 Public API：

```text
pages/
├── home/
│   ├── index.ts
│   └── ui/
├── orders-list/
│   ├── index.ts
│   └── ui/
└── order-details/
    ├── index.ts
    └── ui/
```

页面专属的请求放入该 Slice 的 `api`，页面模型放入 `model`。不要先建立全局的 `components`、`hooks` 或 `services` 再把页面代码拆散。

## 增加 Feature

Feature 表示为用户提供业务价值、并在多个页面复用的交互。只有真实需求出现时才创建，例如：

```text
features/
└── cancel-order/
    ├── index.ts
    ├── ui/
    │   └── CancelOrderButton.tsx
    ├── model/
    │   └── useCancelOrder.ts
    └── api/
        └── cancelOrder.ts
```

只在一个页面使用的交互仍可留在 Page Slice；FSD 不要求把每个用户动作都提前拆成 Feature。

## 增加 Shared

`shared` 只承载不依赖具体业务 Slice 的基础能力，并直接按 Segment 组织：

```text
shared/
├── ui/       # UI Kit
├── api/      # HTTP Client
├── lib/      # 单一目的的基础库
└── config/   # 环境与全局配置
```

`shared` 的每个 Segment 应提供自己的 Public API。带有 `Order`、`Product` 等具体业务含义的代码，应先判断属于 `entities`、`features` 还是页面，而不是因为复用就直接放入 `shared`。

## 状态放置顺序

1. 只影响一个组件：组件局部状态。
2. 只影响一个页面：Page Slice 的 `model` 或 `ui`。
3. 可以从已有数据计算：不保存，直接派生。
4. 需要刷新后保留或支持分享：优先考虑 URL。
5. 来自服务端：使用服务端数据缓存方案，不重复复制到全局 Store。
6. 真正跨越多个边界的客户端状态：放入最符合业务含义的下层 Slice，再由高层组合。

## 新增代码前检查

1. 它属于哪个 Layer？
2. 它表达哪个业务 Slice？
3. 它在 Slice 中承担什么技术目的？
4. 外部是否只通过 Public API 使用它？
5. 依赖是否只指向严格更低的 Layer？
6. 资源是否放在最接近实际使用位置的地方？

项目保持严格的 FSD 边界，同时继续按真实需求渐进增加 Layer 和 Slice。

运行 `npm run lint:fsd` 可以单独检查 FSD 规则；`npm run check` 会将架构检查与代码、类型和生产构建检查一起执行。
