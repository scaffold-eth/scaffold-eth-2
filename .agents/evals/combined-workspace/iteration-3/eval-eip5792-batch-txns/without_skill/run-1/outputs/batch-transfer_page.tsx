"use client";

import BatchTransferForm from "./_components/BatchTransferForm";
import type { NextPage } from "next";

const BatchTransfer: NextPage = () => {
  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center mb-4">
          <span className="block text-2xl mb-2">EIP-5792</span>
          <span className="block text-4xl font-bold">Batch Token Transfer</span>
        </h1>
        <p className="text-center text-lg mb-8 opacity-70">
          Approve and transfer ERC-20 tokens in a single batch transaction using{" "}
          <code className="bg-base-300 px-1 rounded">wallet_sendCalls</code>.
        </p>
        <BatchTransferForm />
      </div>
    </div>
  );
};

export default BatchTransfer;
