import { TransactionHash } from "./TransactionHash";
import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { TransactionWithFunction } from "~~/utils/scaffold-eth";
import { TransactionsTableProps } from "~~/utils/scaffold-eth/";

export const TransactionsTable = ({ blocks, transactionReceipts }: TransactionsTableProps) => {
  const { targetNetwork } = useTargetNetwork();

  return (
    <div className="flex justify-center px-4 md:px-0">
      <div className="overflow-x-auto w-full shadow-2xl rounded-xl">
        <table className="table-auto text-xl bg-base-100 w-full">
          <thead>
            <tr className="rounded-xl text-sm text-base-content">
              <th className="bg-primary px-4 py-3">Transaction Hash</th>
              <th className="bg-primary px-4 py-3">Function Called</th>
              <th className="bg-primary px-4 py-3">Block Number</th>
              <th className="bg-primary px-4 py-3">Time Mined</th>
              <th className="bg-primary px-4 py-3">From</th>
              <th className="bg-primary px-4 py-3">To</th>
              <th className="bg-primary px-4 py-3 text-end">Value ({targetNetwork.nativeCurrency.symbol})</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map(block =>
              (block.transactions as TransactionWithFunction[]).map(tx => {
                const receipt = transactionReceipts[tx.hash];
                const timeMined = new Date(Number(block.timestamp) * 1000).toLocaleString();
                const functionCalled = tx.input.substring(0, 10);

                return (
                  <tr key={tx.hash} className={`hover text-sm even:bg-base-200`}>
                    <td className="w-1/12 px-4 py-3">
                      <TransactionHash hash={tx.hash} />
                    </td>
                    <td className="w-2/12 px-4 py-3 text-center">
                      {tx.functionName === "0x" ? "" : <span className="mr-1">{tx.functionName}</span>}
                      {functionCalled !== "0x" && (
                        <span className="badge badge-primary font-bold text-xs">{functionCalled}</span>
                      )}
                    </td>
                    <td className="w-1/12 px-4 py-3 text-center">{block.number?.toString()}</td>
                    <td className="w-2/12 px-4 py-3 text-center">{timeMined}</td>
                    <td className="w-2/12 px-4 py-3 text-center">
                      <Address address={tx.from} size="sm" onlyEnsOrAddress />
                    </td>
                    <td className="w-2/12 px-4 py-3 text-center">
                      {!receipt?.contractAddress ? (
                        tx.to && <Address address={tx.to} size="sm" onlyEnsOrAddress />
                      ) : (
                        <div className="relative">
                          <Address address={receipt.contractAddress} size="sm" onlyEnsOrAddress />
                          <small className="absolute top-4 left-4">(Contract Creation)</small>
                        </div>
                      )}
                    </td>
                    <td className="text-right px-4 py-3">
                      {formatEther(tx.value)} {targetNetwork.nativeCurrency.symbol}
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
