import TransactionComp from "../_components/TransactionComp";
import type { NextPage } from "next";
import { Hash } from "viem";

type PageProps = {
  params: { txHash?: Hash };
};

export function generateStaticParams() {
  return [{ txHash: "0x0000000000000000000000000000000000000000" }];
}
const TransactionPage: NextPage<PageProps> = ({ params }: PageProps) => {
  const txHash = params?.txHash as Hash;
  return <TransactionComp txHash={txHash} />;
};

export default TransactionPage;
