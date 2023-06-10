import { Block, Transaction, TransactionReceipt } from "viem";

export type TransactionWithFunction = Transaction & {
  functionName?: string;
  functionArgs?: any[];
  functionArgNames?: string[];
  functionArgTypes?: string[];
};

interface TransactionReceipts {
  [key: string]: TransactionReceipt;
}

export interface TransactionsTableProps {
  blocks: Block[];
  transactionReceipts: TransactionReceipts;
  isLoading: boolean;
}
