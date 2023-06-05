import { Block, TransactionReceipt } from "viem";

interface TransactionReceipts {
  [key: string]: TransactionReceipt;
}

export interface TransactionsTableProps {
  blocks: Block[];
  transactionReceipts: TransactionReceipts;
  isLoading: boolean;
}
