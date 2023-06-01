import { ethers } from "ethers";
import { TransactionHash } from "~~/components/blockexplorer/TransactionHash";
import { Address } from "~~/components/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { TransactionsTableProps } from "~~/utils/scaffold-eth/";

export const TransactionsTable = ({ blocks, transactionReceipts, isLoading }: TransactionsTableProps) => {
  const targetNetwork = getTargetNetwork();

  return (
    <div className="flex justify-center">
      <table className="table table-zebra w-full shadow-lg">
        <thead>
          <tr>
            <th className="bg-primary">Transaction Hash</th>
            <th className="bg-primary">Function Called</th>
            <th className="bg-primary">Block Number</th>
            <th className="bg-primary">Time Mined</th>
            <th className="bg-primary">From</th>
            <th className="bg-primary">To</th>
            <th className="bg-primary text-end">Value ({targetNetwork.nativeCurrency.symbol})</th>
          </tr>
        </thead>
        {isLoading ? (
          <tbody>
            {[...Array(20)].map((_, rowIndex) => (
              <tr key={rowIndex} className="bg-base-200 hover:bg-base-300 transition-colors duration-200 h-12">
                <td className="w-1/12">
                  <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
                </td>
                <td className="w-2/12">
                  <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
                </td>
                <td className="w-1/12">
                  <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
                </td>
                <td className="w-2/12">
                  <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
                </td>
                <td className="w-2/12">
                  <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
                </td>
                <td className="w-2/12">
                  <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
                </td>
                <td>
                  <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            {blocks.map(block =>
              block.transactions.map(tx => {
                const receipt = transactionReceipts[tx.hash];
                const timeMined = new Date(block.timestamp * 1000).toLocaleString();
                const functionCalled = tx.data.substring(0, 10);

                return (
                  <tr key={tx.hash} className="hover">
                    <td className="w-1/12">
                      <TransactionHash hash={tx.hash} />
                    </td>
                    <td className="w-2/12">
                      {tx.functionName === "0x" ? "" : tx.functionName}
                      {functionCalled !== "0x" && (
                        <span className="ml-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-primary-content bg-accent">
                          {functionCalled}
                        </span>
                      )}
                    </td>
                    <td className="w-1/12">{block.number}</td>
                    <td className="w-2/12">{timeMined}</td>
                    <td className="w-2/12">
                      <Address address={tx.from} />
                    </td>
                    <td className="w-2/12">
                      {!receipt?.contractAddress ? (
                        tx.to && <Address address={tx.to} />
                      ) : (
                        <div className="relative">
                          <Address address={receipt.contractAddress} />
                          <small className="absolute top-6">(Contract Creation)</small>
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      {ethers.utils.formatEther(tx.value)} {targetNetwork.nativeCurrency.symbol}
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        )}
      </table>
    </div>
  );
};
