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
