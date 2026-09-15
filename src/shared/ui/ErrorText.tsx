import type { ReactNode } from 'react'

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <span role="alert" className="text-red-600 text-sm dark:text-red-400">
      {children}
    </span>
  )
}
