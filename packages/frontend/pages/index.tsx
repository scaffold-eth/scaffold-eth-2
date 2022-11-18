import type { NextPage } from "next";
import Head from "next/head";
import { useAppStore } from "~~/services/store/store";
import { Address, AddressInput, Balance } from "../components/scaffold-eth";
import { useEffect } from "react";
import Link from "next/link";
import { ReadOnlyFunctionForm } from "../components/scaffold-eth/Contract/ReadOnlyFunctionForm";
import { Contract } from "ethers";
import { useContract, useNetwork, useProvider } from "wagmi";
import {
  getContractVariablesAndNoParamsReadMethods,
  getAllContractFunctions,
  getDeployedContract,
} from "../components/scaffold-eth/Contract/utilsContract";

const Home: NextPage = () => {
  const contractName = "FarmMainRegularMinStakeABI";
  const { chain } = useNetwork();
  const provider = useProvider();

  useEffect(() => {
    console.log("useEffect");
  }, [contractName]);

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
  return (
    <div className="px-8">
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl items-start">
        <div className="bg-white rounded-sm px-4 py-2 border-solid border-2">
          <p className="font-semibold text-black text-2xl my-4 underline decoration-wavy underline-offset-2 decoration-violet-700 ">
            Read Functions
          </p>
          {contractMethodsDisplay.length ? contractMethodsDisplay : "Loading read methods..."}
        </div>
      </div>
    </div>
  );
};

export default Home;
