import { Contract } from "ethers";
import { useRouter } from "next/router";
import { useContract, useNetwork, useProvider } from "wagmi";
import {
  getDeployedContract,
  getAllContractFunctions,
  getContractVariablesAndNoParamsReadMethods,
} from "~~/components/scaffold-eth/Contract/utilsContract";
import { useAppStore } from "~~/services/store/store";

const Covenant = () => {
  const router = useRouter();
  const { pid } = router.query;

  const tempState = useAppStore(state => state.tempSlice.tempState);
  const setTempState = useAppStore(state => state.tempSlice.setTempState);

  const contractName = "FarmMainRegularMinStakeABI";
  const { chain } = useNetwork();
  const provider = useProvider();

  let contractAddress = "";
  let contractABI = [];
  const deployedContractData = getDeployedContract(chain?.id.toString(), contractName);

  if (deployedContractData) {
    ({ address: contractAddress, abi: contractABI } = deployedContractData);
  }

  const contract: Contract = useContract({
    addressOrName: contractAddress,
    contractInterface: contractABI,
    signerOrProvider: provider,
  });

  const displayedContractFunctions = getAllContractFunctions(contract);
  const contractMethodsDisplay = getContractVariablesAndNoParamsReadMethods(contract, displayedContractFunctions);
  console.log("Contract: ", contract);
  console.log("Contract contractABI: ", contractABI);
};

export default Covenant;
