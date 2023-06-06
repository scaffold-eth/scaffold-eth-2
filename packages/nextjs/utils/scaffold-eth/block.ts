import { BlockWithTransactions, TransactionResponse } from "@ethersproject/abstract-provider";

export type TransactionWithFunction = TransactionResponse & {
  functionName?: string;
  functionArgs?: any[];
  functionArgNames?: string[];
  functionArgTypes?: string[];
};

export interface Block extends BlockWithTransactions {
  transactions: TransactionWithFunction[];
}

interface TransactionReceipts {
  [key: string]: {
    contractAddress: string;
  };
}

export interface TransactionsTableProps {
  blocks: Block[];
  transactionReceipts: TransactionReceipts;
  isLoading: boolean;
}
