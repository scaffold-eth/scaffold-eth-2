import { ethers } from "ethers";
import { TransactionHash } from "~~/components/blockexplorer/TransactionHash";
import { Address } from "~~/components/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { TransactionWithFunction, TransactionsTableProps } from "~~/utils/scaffold-eth/block";

export const TransactionsTable = ({ blocks, transactionReceipts, isLoading }: TransactionsTableProps) => {
  const targetNetwork = getTargetNetwork();

  return (
    <div className="overflow-x-auto shadow-lg">
      <table className="min-w-full divide-y divide-primary shadow-lg rounded-lg bg-neutral">
        <thead className="bg-primary">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider"
            >
              Transaction Hash
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider"
            >
              Function Called
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider"
            >
              Block Number
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider"
            >
              Time Mined
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider"
            >
              From
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider"
            >
              To
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider"
            >
              Value ({targetNetwork.nativeCurrency.symbol})
            </th>
          </tr>
        </thead>
        {isLoading ? (
          <tbody className="bg-base-100 divide-y divide-primary-content text-base-content">
            {[...Array(20)].map((_, rowIndex) => (
              <tr key={rowIndex} className="bg-base-200 hover:bg-base-300 transition-colors duration-200 h-12">
                {[...Array(7)].map((_, colIndex) => (
                  <td
                    key={colIndex}
                    className={`${
                      colIndex === 1 ? "w-full md:w-1/2 lg:w-1/5" : "w-20"
                    } border px-4 py-2 text-base-content`}
                  >
                    <div
                      className="h-2 bg-gray-200 rounded-full w-3/4 animate-pulse"
                      style={{
                        animationDelay: `${0.1 * (rowIndex + colIndex)}s`,
                      }}
                    ></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody className="bg-base-100 divide-y divide-primary-content text-base-content">
            {blocks.map(block =>
              block.transactions.map((tx: TransactionWithFunction) => {
                const receipt = transactionReceipts[tx.hash];
                const timeMined = new Date(block.timestamp * 1000).toLocaleString();
                const functionCalled = tx.data.substring(0, 10);

                return (
                  <tr key={tx.hash} className="bg-base-100 hover:bg-base-300 transition-colors duration-200">
                    <td className="border px-4 py-2 text-base-content">
                      <TransactionHash hash={tx.hash} />
                    </td>

                    <td className="border px-4 py-2 w-full md:w-1/2 lg:w-1/5 text-base-content">
                      {tx.functionName === "0x" ? "" : tx.functionName}
                      {functionCalled !== "0x" && functionCalled !== "0x60a06040" && (
                        <span className="ml-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-primary-content bg-accent">
                          {functionCalled}
                        </span>
                      )}
                    </td>
                    <td className="border px-4 py-2 w-20 text-base-content">{block.number}</td>
                    <td className="border px-4 py-2 text-base-content">{timeMined}</td>
                    <td className="border px-4 py-2 text-base-content">
                      <Address address={tx.from} />
                    </td>
                    <td className="border px-4 py-2 text-base-content">
                      {!receipt?.contractAddress ? (
                        tx.to && <Address address={tx.to} />
                      ) : (
                        <span>
                          Contract Creation:
                          <Address address={receipt.contractAddress} />
                        </span>
                      )}
                    </td>
                    <td className="border px-4 py-2 text-base-content">
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
