import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function Heading1({ children }: Props) {
  return <h1 className="text-5xl font-semibold text-semantic-accent-content">{children}</h1>
}
