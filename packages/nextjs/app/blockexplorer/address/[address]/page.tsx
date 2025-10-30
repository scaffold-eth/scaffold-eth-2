import { AddressComponent, getContractData } from "@scaffold-ui/block-explorer";
import { Address } from "viem";
import deployedContracts from "~~/contracts/deployedContracts";

type AddressPageProps = {
  params: Promise<{ address: Address }>;
};

const AddressPage = async (props: AddressPageProps) => {
  const params = await props.params;
  const address = params?.address as Address;

  const contractData: { bytecode: string; assembly: string } | null = await getContractData({
    dirname: __dirname,
    address,
    contracts: deployedContracts,
  });
  return <AddressComponent address={address} contractData={contractData} deployedContracts={deployedContracts} />;
};

export default AddressPage;
