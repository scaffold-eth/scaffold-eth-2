import { useRouter } from "next/router";
import Home from "../index";
import { useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useAppStore } from "~~/services/store/store";
import { Address, AddressInput, Balance } from "../../components/scaffold-eth";
import Link from "next/link";
import { ReadOnlyFunctionForm } from "../../components/scaffold-eth/Contract/ReadOnlyFunctionForm";
import { Contract } from "ethers";
import { useContract, useNetwork, useProvider, useContractRead } from "wagmi";
import {
  getContractVariablesAndNoParamsReadMethods,
  getAllContractFunctions,
  getDeployedContract,
} from "../../components/scaffold-eth/Contract/utilsContract";
import { BigNumber } from "ethers";

const Setup = () => {
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

  const cRead = useContractRead({
    addressOrName: contractAddress,
    contractInterface: contractABI,
    functionName: "setup",
    chainId: 1,
    watch: true,
    cacheOnBlock: false,
    args: [BigNumber.from(pid)],
  });

  // sets contract state to app store
  useEffect(() => {
    if (cRead) {
      console.log("cRead", cRead);
      setTempState({ tempStuff: cRead?.data });
    }
  }, [cRead, setTempState]);

  // //make this useEffect querry for cRead limit the data to one entry on the
  // useEffect(() => {
  //   if (cRead) {
  //     console.log("cRead", cRead);
  //     setTempState({ tempStuff: cRead?.data});
  //   }
  // }, [cRead, setTempState]);
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
                  borderRadius: "25px",
                  display: "inline-grid",
                  boxShadow: "0 16px 32px 0 rgba(0, 0, 0, 0.4)",
                  margin: "2vw",
                  color: "white",
                  background: "radial-gradient(#F24236, #4C0905)",
                }}
              >
                <div
                  key={index}
                  style={{
                    display: "inline-block",
                    padding: "2vw",
                    margin: "8px",
                    borderRadius: "8px",
                  }}
                >
                  <div>Setup {index}</div>

                  <div>
                    {/* This is the spot to be working on for the routing */}
                    <button
                      style={{
                        borderRadius: "25px",
                        boxShadow: "0 16px 32px 0 rgba(0, 0, 0, 0.5)",
                        padding: "5px",
                        backgroundColor: "#F02419",
                        margin: "2vh",
                      }}
                    >
                      <Link href={`./setups/setups_${index}.jsx`}>
                        <a>View Setup {index}</a>
                      </Link>
                    </button>
                  </div>

                  <div
                    style={{
                      padding: "10px",
                      boxShadow: "0 16px 32px 0 rgba(0, 0, 0, 0.7)",
                      borderRadius: "10px",
                      marginBottom: "15px",
                      backgroundColor: "#2E86AB",
                    }}
                  >
                    RewardsPerBlock: {setup.rewardPerBlock?.toString()}
                  </div>

                  <div
                    style={{
                      boxShadow: "0 16px 32px 0 rgba(0, 0, 0, 0.7)",
                      padding: "20px 20px",
                      display: "inline-block",
                      backgroundColor: "#2E86AB",
                      borderRadius: "10px",
                      marginRight: "15px",
                    }}
                  >
                    Endblock: {setup.endBlock?.toNumber()}
                  </div>

                  <div
                    style={{
                      boxShadow: "0 16px 32px 0 rgba(0, 0, 0, 0.7)",
                      padding: "35px",
                      display: "inline-block",
                      backgroundColor: "#2E86AB",
                      borderRadius: "10px",
                    }}
                  >
                    Supply: {setup.totalSupply?.toString()}
                  </div>

                  <br></br>
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

export default Setup;
