import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export function Heading3({ children, className }: Props) {
  return <h3 className={`text-lg font-bold text-neutral tracking-wider ${className}`}>{children}</h3>
}
