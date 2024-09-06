import { Button } from './Button'
import { Heading3 } from './Heading3'
import { Visit } from '~~/types/Data'
import { useScaffoldWriteContract } from '~~/hooks/scaffold-eth'
import { formatUnits } from 'viem'


export function PaymentModal({ visit, onClose }: { visit: Visit, onClose: () => void }) {
  const { price, doctor } = visit
  const { avatar, name, specialization } = doctor
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("WorldCare");

  const onFinishVisit = async (visit: Visit) => {
    await writeYourContractAsync({
      functionName: "payForVisit",
      value: BigInt(visit.price),
      args: [
        visit.cid,
      ],
    }, {
      onSuccess: () => {
        console.log('Visit finished')
        onClose()
      }
    })
  }

  return (
    <>
      <div className="shadow bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 p-10 rounded-2xl flex flex-col gap-6 items-center">
        <div className="text-lg font-semibold">Doctor requests payment</div>
        <div className="text-4xl font-bold">{formatUnits(price, 18)}$</div>

        <img className="h-24" src={avatar} alt="" />

        <div className='text-center'>
          <div className="text-xl font-bold">{name}</div>
          <Heading3>{specialization}</Heading3>
        </div>

        <Button onClick={() => onFinishVisit(visit)}>Pay</Button>
        <button className="btn btn-ghost rounded-full min-w-60" onClick={onClose}>
            Close
          </button>
      </div>
      <div className="fixed top-0 right-0 w-full h-screen bg-[#AEE5F5] opacity-50 z-10" />
    </>
  )
}
