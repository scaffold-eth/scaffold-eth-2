import { TransactionPage as TransactionPageUI } from "@scaffold-ui/block-explorer";
import { Hash } from "viem";
import deployedContracts from "~~/contracts/deployedContracts";

type PageProps = {
  params: Promise<{ txHash?: Hash }>;
};

export default async function TransactionPage(props: PageProps) {
  const params = await props.params;
  const txHash = params?.txHash as Hash;

  return <TransactionPageUI txHash={txHash} deployedContracts={deployedContracts} />;
}
