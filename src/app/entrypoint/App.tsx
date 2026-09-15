import { RouterProvider } from 'react-router'
import { ErrorBoundary } from '../init/error-boundary'
import { router } from '../routes'

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
