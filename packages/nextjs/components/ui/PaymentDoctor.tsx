import { Heading3 } from './Heading3'
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline'
import { Visit } from '~~/types/Data'

export function PaymentDoctor({ visit, onClose, isOpen }: { visit?: Visit; onClose: () => void; isOpen: boolean }) {
  if (!isOpen || !visit) return null

  const { price, transaction } = visit

  return (
    <>
      <div className="shadow bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 p-10 rounded-2xl flex flex-col gap-4 items-center">
        <img src="/paid.svg" className="w-64" alt="" />
        <div className="text-4xl font-bold">{price?.toString()}$</div>

        <Heading3>Visit is paid!</Heading3>

        <div>
          <a
            href={`https://optimism-sepolia.blockscout.com/tx/${transaction}`}
            target="_blank"
            className="btn btn-primary border-none rounded-full bg-primary min-w-60 flex items-center gap-1 mb-2"
          >
            <span>See on the Blockscout</span> <ArrowUpOnSquareIcon className="h-5 w-5" />
          </a>
          <button className="btn btn-ghost rounded-full min-w-60" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="fixed top-0 right-0 w-full h-screen bg-[#AEE5F5] opacity-50 z-10" />
    </>
  )
}
