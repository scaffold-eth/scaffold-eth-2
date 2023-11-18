import { get } from 'http';
import React from 'react'
import { useAccount, useContractWrite } from 'wagmi';
import { useDeployedContractInfo, useTransactor } from '~~/hooks/scaffold-eth';
import { getTargetNetwork, notification } from '~~/utils/scaffold-eth';
import { getParsedError } from '../scaffold-eth';
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

export default function SubscribeButton({smartContract, amountETH, contentCreatorAddr}) {
    console.log("welcome: ", smartContract)
    const writeTxn = useTransactor();


    const publicKey = /*TODO: get from metamask snap*/ "0x04fcbbf4c8055a8e04271d4e36dec9be5bdfdfe544fc7ccf8b80e71d11b080b09830e1776c66e99ffbe73accfd2d367e9631eac125d5983a6cfa2f4a514eb7c6f5"
    const {
        data: result,
        isLoading,
        writeAsync,
    } = useContractWrite({
        chainId: getTargetNetwork().id,
        address: smartContract.address,
        functionName: "subscribeSpotsAvaliable",
        abi: smartContract.abi,
        args: [
            contentCreatorAddr,
            publicKey
        ],
    });

    const handleWrite = async () => {
        console.log("Subscribing");
        console.log(smartContract);
        if (writeAsync) {
            try {
                const makeWriteWithParams = () => writeAsync({ value: amountETH });
                await writeTxn(makeWriteWithParams);
            } catch (e: any) {
                const message = getParsedError(e);
                console.log(e)
                notification.error(message);
            }
        }
    };

    return (
        <div>
            <button
                className="mb-1 w-56 bg-green-700 text-white active:bg-slate-700 font-bold uppercase text-sm px-4 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={handleWrite}>Subscribe</button>

        </div>
    )
}
