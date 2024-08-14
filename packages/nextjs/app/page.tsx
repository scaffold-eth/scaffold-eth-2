"use client";

import Image from "next/image";
import type { NextPage } from "next";
import { useApproveToken } from "~~/hooks/useApproveToken";

const Home: NextPage = () => {
  const { mutate: approve } = useApproveToken();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">Steps</span>
          </h1>

          <div className="flex flex-col gap-10 justify-center items-center my-10">
            <ol className="list-decimal list-inside text-xl">
              <li>Click the button</li>
              <li>Follow the screenshots to set gas limit too low so tx reverts</li>
              <li>Observe the notification says Transaction completed successfully! even tho it reverted</li>
              <li>Check the console.logs to see that useMutation onSuccess was triggered</li>
            </ol>

            <div className="flex justify-center">
              <button
                className="btn btn-accent btn-lg"
                onClick={() =>
                  approve(
                    {
                      token: "0x80D6d3946ed8A1Da4E226aa21CCdDc32bd127d1A",
                      spender: "0x5036388C540994Ed7b74b82F71175a441F85BdA1",
                      rawAmount: 42069n,
                    },
                    {
                      onSuccess: () => {
                        console.log("useMutation's onSuccess has been triggered!");
                      },
                      onError: () => {
                        console.log("useMutation's onError has been triggered!");
                      },
                    },
                  )
                }
              >
                Click Me
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Image width="333" height="333" src="/mm-1.png" alt="mm-1" />
              <Image width="333" height="333" src="/mm-2.png" alt="mm-1" />
              <Image width="333" height="333" src="/mm-3.png" alt="mm-1" />
              <Image width="333" height="333" src="/mm-4.png" alt="mm-1" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
