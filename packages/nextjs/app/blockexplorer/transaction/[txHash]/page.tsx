import TransactionComp from "../_components/TransactionComp";
import type { NextPage } from "next";
import { Hash } from "viem";

type PageProps = {
  params: { txHash?: Hash };
};

export function generateStaticParams() {
  // An workaround to enable static exports in Next.js
  return [{ txHash: "0x0000000000000000000000000000000000000000" }];
}
const TransactionPage: NextPage<PageProps> = ({ params }: PageProps) => {
  const txHash = params?.txHash as Hash;

  if (txHash === "0x0000000000000000000000000000000000000000") return null;
  return <TransactionComp txHash={txHash} />;
};

export default TransactionPage;
