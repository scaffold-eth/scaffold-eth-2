"use client";

import { useEffect, useState } from "react";
import { Hash, Transaction, TransactionReceipt, formatEther, formatUnits } from "viem";
import { hardhat } from "viem/chains";
import { usePublicClient } from "wagmi";
import { BackButton } from "~~/app/blockexplorer/_components/BackButton";
import { Address } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { decodeTransactionData, getFunctionDetails } from "~~/utils/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";

const TransactionComp = ({ txHash }: { txHash: Hash }) => {
  const client = usePublicClient({ chainId: hardhat.id });
  const [transaction, setTransaction] = useState<Transaction>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [functionCalled, setFunctionCalled] = useState<string>();

  const { targetNetwork } = useTargetNetwork();

  useEffect(() => {
    if (txHash && client) {
      const fetchTransaction = async () => {
        const tx = await client.getTransaction({ hash: txHash });
        const receipt = await client.getTransactionReceipt({ hash: txHash });

        const transactionWithDecodedData = decodeTransactionData(tx);
        setTransaction(transactionWithDecodedData);
        setReceipt(receipt);

        const functionCalled = transactionWithDecodedData.input.substring(0, 10);
        setFunctionCalled(functionCalled);
      };

      fetchTransaction();
    }
  }, [client, txHash]);

  return (
    <div className="container mx-auto mt-10 mb-20 px-10 md:px-0">
      <BackButton />
      {transaction ? (
        <div className="overflow-x-auto">
          <h2 className="text-3xl font-bold mb-4 text-center text-primary-content">Transaction Details</h2>{" "}
          <table className="table-auto rounded-lg bg-base-100 w-full shadow-lg">
            <tbody>
              <tr className="border-b border-primary/40">
                <td className="px-4 py-3">
                  <strong>Transaction Hash:</strong>
                </td>
                <td className="px-4 py-3">{transaction.hash}</td>
              </tr>
              <tr className="border-b border-primary/40">
                <td className="px-4 py-3">
                  <strong>Block Number:</strong>
                </td>
                <td className="px-4 py-3">{Number(transaction.blockNumber)}</td>
              </tr>
              <tr className="border-b border-primary/40">
                <td className="px-4 py-3">
                  <strong>From:</strong>
                </td>
                <td className="px-4 py-3">
                  <Address address={transaction.from} format="long" onlyEnsOrAddress />
                </td>
              </tr>
              <tr className="border-b border-primary/40">
                <td className="px-4 py-3">
                  <strong>To:</strong>
                </td>
                <td className="px-4 py-3">
                  {!receipt?.contractAddress ? (
                    transaction.to && <Address address={transaction.to} format="long" onlyEnsOrAddress />
                  ) : (
                    <span>
                      Contract Creation:
                      <Address address={receipt.contractAddress} format="long" onlyEnsOrAddress />
                    </span>
                  )}
                </td>
              </tr>
              <tr className="border-b border-primary/40">
                <td className="px-4 py-3">
                  <strong>Value:</strong>
                </td>
                <td className="px-4 py-3">
                  {formatEther(transaction.value)} {targetNetwork.nativeCurrency.symbol}
                </td>
              </tr>
              <tr className="border-b border-primary/40">
                <td className="px-4 py-3">
                  <strong>Function called:</strong>
                </td>
                <td className="px-4 py-3">
                  <div className="w-full md:max-w-[600px] lg:max-w-[800px] overflow-x-auto whitespace-nowrap">
                    {functionCalled === "0x" ? (
                      "This transaction did not call any function."
                    ) : (
                      <>
                        <span className="mr-2">{getFunctionDetails(transaction)}</span>
                        <span className="badge badge-primary font-bold">{functionCalled}</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
              <tr className="border-b border-primary/40">
                <td className="px-4 py-3">
                  <strong>Gas Price:</strong>
                </td>
                <td className="px-4 py-3">{formatUnits(transaction.gasPrice || 0n, 9)} Gwei</td>
              </tr>
              <tr className="border-b border-primary/40">
                <td className="px-4 py-3">
                  <strong>Data:</strong>
                </td>
                <td className="form-control px-4 py-3">
                  <textarea readOnly value={transaction.input} className="p-0 w-full bg-inherit h-[150px]" />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <strong>Logs:</strong>
                </td>
                <td className="px-4 py-3">
                  <ul>
                    {receipt?.logs?.map((log, i) => (
                      <li key={i}>
                        <strong>Log {i} topics:</strong> {JSON.stringify(log.topics, replacer, 2)}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-2xl text-base-content">Loading...</p>
      )}
    </div>
  );
};

export default TransactionComp;
