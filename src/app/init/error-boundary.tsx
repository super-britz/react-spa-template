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
          <h1 className="font-medium text-4xl text-gray-900 dark:text-gray-100">应用崩溃了</h1>
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
