import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'

import { AppLayout } from './app-layout'
import { RouteError } from './route-error'

const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })))
const DemoPage = lazy(() => import('@/pages/demo').then((m) => ({ default: m.DemoPage })))
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })),
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'demo', element: <DemoPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
