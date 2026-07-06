import { useCallback, useEffect, useState } from "react";
import {
  Address,
  Block,
  Hash,
  Transaction,
  TransactionReceipt,
  createTestClient,
  publicActions,
  walletActions,
  webSocket,
} from "viem";
import { hardhat } from "viem/chains";
import { decodeTransactionData } from "~~/utils/scaffold-eth";

const TRANSACTIONS_PER_PAGE = 20;
const BLOCK_BATCH_SIZE = 50;

export const testClient = createTestClient({
  chain: hardhat,
  mode: "hardhat",
  transport: webSocket("ws://127.0.0.1:8545"),
})
  .extend(publicActions)
  .extend(walletActions);

const groupTransactionsByBlock = (items: { block: Block; tx: Transaction }[]): Block[] => {
  const blockMap = new Map<string, Block>();

  for (const { block, tx } of items) {
    const key = block.number!.toString();
    if (!blockMap.has(key)) {
      blockMap.set(key, { ...block, transactions: [] });
    }
    (blockMap.get(key)!.transactions as Transaction[]).push(tx);
  }

  const seenBlocks = new Set<string>();
  const groupedBlocks: Block[] = [];

  for (const { block } of items) {
    const key = block.number!.toString();
    if (!seenBlocks.has(key)) {
      seenBlocks.add(key);
      groupedBlocks.push(blockMap.get(key)!);
    }
  }

  return groupedBlocks;
};

// Collects the requested page plus one extra transaction (the cheap "is there a next page?"
// signal), counting only transactions that pass matchesFilter — so address views paginate over
// the address's own transactions instead of slicing a global page.
const fetchPageItems = async (
  latestBlock: bigint,
  page: number,
  matchesFilter: (tx: Transaction) => boolean,
): Promise<{ block: Block; tx: Transaction }[]> => {
  const skipCount = page * TRANSACTIONS_PER_PAGE;
  const pageItems: { block: Block; tx: Transaction }[] = [];
  let skipped = 0;

  for (let blockNum = latestBlock; blockNum >= 0n; ) {
    const batchEnd = blockNum - BigInt(BLOCK_BATCH_SIZE - 1);
    const batchStart = batchEnd < 0n ? 0n : batchEnd;

    const blockNumbers: bigint[] = [];
    for (let b = blockNum; b >= batchStart; b--) {
      blockNumbers.push(b);
    }

    const fetchedBlocks = await Promise.all(
      blockNumbers.map(blockNumber => testClient.getBlock({ blockNumber, includeTransactions: true })),
    );

    for (const block of fetchedBlocks) {
      for (const tx of block.transactions as Transaction[]) {
        if (!matchesFilter(tx)) {
          continue;
        }

        if (skipped < skipCount) {
          skipped++;
          continue;
        }

        pageItems.push({ block, tx });
        if (pageItems.length > TRANSACTIONS_PER_PAGE) {
          return pageItems;
        }
      }
    }

    blockNum = batchStart - 1n;
  }

  return pageItems;
};

export const useFetchBlocks = (addressFilter?: Address) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactionReceipts, setTransactionReceipts] = useState<{
    [key: string]: TransactionReceipt;
  }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const matchesAddressFilter = useCallback(
    (tx: Transaction) => {
      if (!addressFilter) return true;
      const filter = addressFilter.toLowerCase();
      return tx.from.toLowerCase() === filter || tx.to?.toLowerCase() === filter;
    },
    [addressFilter],
  );

  const fetchBlocks = useCallback(async () => {
    setError(null);

    try {
      const blockNumber = await testClient.getBlockNumber();
      const fetchedItems = await fetchPageItems(blockNumber, currentPage, matchesAddressFilter);
      const items = fetchedItems.slice(0, TRANSACTIONS_PER_PAGE);

      items.forEach(({ tx }) => decodeTransactionData(tx));

      const txReceipts = await Promise.all(
        items.map(async ({ tx }) => {
          try {
            const receipt = await testClient.getTransactionReceipt({ hash: tx.hash });
            return { [tx.hash]: receipt };
          } catch (err) {
            setError(err instanceof Error ? err : new Error("An error occurred."));
            throw err;
          }
        }),
      );

      setBlocks(groupTransactionsByBlock(items));
      setHasNextPage(fetchedItems.length > TRANSACTIONS_PER_PAGE);
      setTransactionReceipts(prevReceipts => ({ ...prevReceipts, ...Object.assign({}, ...txReceipts) }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred."));
    }
  }, [currentPage, matchesAddressFilter]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  useEffect(() => {
    const handleNewBlock = async (newBlock: Block) => {
      try {
        if (currentPage === 0 && newBlock.transactions.length > 0) {
          let blockWithTxDetails = newBlock;

          if (typeof newBlock.transactions[0] === "string") {
            const transactionsDetails = await Promise.all(
              newBlock.transactions.map(txHash => testClient.getTransaction({ hash: txHash as Hash })),
            );
            blockWithTxDetails = { ...newBlock, transactions: transactionsDetails };
          }

          const matchingTransactions = (blockWithTxDetails.transactions as Transaction[]).filter(matchesAddressFilter);
          if (matchingTransactions.length === 0) {
            return;
          }
          blockWithTxDetails = { ...blockWithTxDetails, transactions: matchingTransactions };

          (blockWithTxDetails.transactions as Transaction[]).forEach(tx => decodeTransactionData(tx));

          const receipts = await Promise.all(
            (blockWithTxDetails.transactions as Transaction[]).map(async tx => {
              try {
                const receipt = await testClient.getTransactionReceipt({ hash: tx.hash });
                return { [tx.hash]: receipt };
              } catch (err) {
                setError(err instanceof Error ? err : new Error("An error occurred fetching receipt."));
                throw err;
              }
            }),
          );

          setBlocks(prevBlocks => {
            const latestBlockNumber = blockWithTxDetails.number!;
            const existingBlockIndex = prevBlocks.findIndex(block => block.number === latestBlockNumber);

            const nextBlocks =
              existingBlockIndex >= 0
                ? prevBlocks.map((block, index) => (index === existingBlockIndex ? blockWithTxDetails : block))
                : [blockWithTxDetails, ...prevBlocks];

            const trimmedBlocks = [...nextBlocks];
            let transactionsInTrimmedBlocks = trimmedBlocks.reduce(
              (count, block) => count + block.transactions.length,
              0,
            );

            // More than one page of transactions are now in view, so a next page exists.
            if (transactionsInTrimmedBlocks > TRANSACTIONS_PER_PAGE) {
              setHasNextPage(true);
            }

            while (transactionsInTrimmedBlocks > TRANSACTIONS_PER_PAGE && trimmedBlocks.length > 0) {
              const removedBlock = trimmedBlocks.pop();
              if (removedBlock) {
                transactionsInTrimmedBlocks -= removedBlock.transactions.length;
              }
            }

            return trimmedBlocks;
          });

          setTransactionReceipts(prevReceipts => ({ ...prevReceipts, ...Object.assign({}, ...receipts) }));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred."));
      }
    };

    return testClient.watchBlocks({ onBlock: handleNewBlock, includeTransactions: true });
  }, [currentPage, matchesAddressFilter]);

  return {
    blocks,
    transactionReceipts,
    currentPage,
    hasNextPage,
    setCurrentPage,
    error,
  };
};
