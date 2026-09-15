import type { InputHTMLAttributes, ReactNode } from 'react'

import { ErrorText } from './ErrorText'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: ReactNode
}

export function Input({ label, error, hint, id, ...rest }: Props) {
  const inputId = id ?? label
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1 text-left">
      <span className="text-gray-600 text-sm dark:text-gray-300">{label}</span>
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
