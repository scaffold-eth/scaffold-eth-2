'use client'

import Link from 'next/link'
import { NextPage } from 'next'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { Heading1 } from '~~/components/ui/Heading1'
import { Heading3 } from '~~/components/ui/Heading3'

const Home: NextPage = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-8">
      <div className="flex flex-col justify-center items-center gap-4">
        <Heading1>Hello!</Heading1>
        <Heading3>Welcome to Worldcare platform</Heading3>
      </div>
      <div className="card card-bordered border-black min-w-[900px] cursor-pointer hover:bg-[#FDFF7D]">
        <div className="card-body px-20 py-5">
          <div className="flex flex-row items-center gap-4 min-h-44">
            <span className="text-3xl">I already have an account</span>
            <ArrowRightIcon className="w-5 h-5" />
          </div>
        </div>
        <img className="absolute right-5 bottom-0" alt="home login" src="/home-login.svg" />
      </div>
      <div className="card card-bordered border-black min-w-[900px] hover:bg-[#AEE5F5]">
        <Link href="/register/select">
          <div className="card-body px-20 py-5">
            <div className="flex flex-row items-center gap-4 min-h-44">
              <span className="text-3xl">I don&apos;t have an account</span>
              <ArrowRightIcon className="w-5 h-5" />
            </div>
          </div>
          <img className="absolute right-5 bottom-0" alt="home login" src="/home-register.svg" />
        </Link>
      </div>
    </div>
  )
}

export default Home
