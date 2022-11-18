import type { NextPage } from "next";
import Head from "next/head";
import { useAppStore } from "~~/services/store/store";
import { Address, AddressInput, Balance } from "../components/scaffold-eth";
import { useEffect } from "react";
import Link from "next/link";
import { ReadOnlyFunctionForm } from "../components/scaffold-eth/Contract/ReadOnlyFunctionForm";
import { Contract } from "ethers";
import { useContract, useNetwork, useProvider, useContractRead } from "wagmi";
import {
  getContractVariablesAndNoParamsReadMethods,
  getAllContractFunctions,
  getDeployedContract,
} from "../components/scaffold-eth/Contract/utilsContract";

const Home: NextPage = () => {
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

  // reads contract state
  const cRead = useContractRead({
    addressOrName: contractAddress,
    contractInterface: contractABI,
    functionName: "setups",
    chainId: 1,
    watch: true,
    cacheOnBlock: false,
    args: [],
  });

  // sets contract state to app store
  useEffect(() => {
    if (cRead) {
      console.log("cRead", cRead);
      setTempState({ tempStuff: cRead?.data });
    }
  }, [cRead, setTempState]);

  return (
    <div className="px-8">
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>
      <div
        style={{
          textAlign: "center",
          display: "block",
        }}
      >
        {" "}
        <AddressInput />
        <br></br>
        {tempState?.tempStuff?.map(
          (setup, index) => (
            console.log("setup", setup),
            (
              <div
                style={{
                  backgroundColor: "rgba(100,100,100,0.2)",
                  border: "10px solid white",
                  borderRadius: "25px",
                  display: "inline-grid",
                  margin: "2vw",
                  color: "white",
                }}
              >
                <div
                  key={index}
                  style={{
                    display: "inline-block",
                    padding: "2vw",
                    margin: "8px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0, 255, 0, 0.1)",
                  }}
                >
                  <div>setup {index}</div>
                  <div
                    style={{
                      border: "1px solid white",
                      padding: "10px",
                      backgroundColor: "lightgreen",
                      borderRadius: "10px",
                      marginBottom: "5px",
                    }}
                  >
                    RewardsPerBlock: {setup.rewardPerBlock?.toString()}
                  </div>
                  <div
                    style={{
                      border: "1px solid white",
                      padding: "20px 20px",
                      display: "inline-block",
                      backgroundColor: "orange",
                      borderRadius: "10px",
                      marginRight: "5px",
                    }}
                  >
                    Endblock: {setup.endBlock?.toNumber()}
                  </div>
                  <div
                    style={{
                      border: "1px solid white",
                      padding: "35px",
                      display: "inline-block",
                      backgroundColor: "lightblue",
                      borderRadius: "10px",
                    }}
                  >
                    Supply: {setup.totalSupply?.toString()}
                  </div>
                  <br></br>
                  <button
                    style={{
                      borderRadius: "25px",
                      border: "1px solid white",
                      padding: "5px",
                      backgroundColor: "rgba(155, 35, 0)",
                      marginTop: "16px",
                    }}
                  >
                    Start Farming
                  </button>
                </div>
              </div>
            )
          ),
        )}
      </div>

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
