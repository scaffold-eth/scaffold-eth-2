import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'

export function BackButton({ href }: { href: string }) {
  return (
    <Link href={href}>
      <button className="btn btn-ghost">
        <ArrowLeftIcon className="h-5 w-5" /> Back
      </button>
    </Link>
  )
}
