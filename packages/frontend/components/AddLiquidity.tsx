import React, { useState, useEffect } from "react";
import Link from "next/link";
import InputUI from "../components/scaffold-eth/Contract/InputUI";
import { Contract, BigNumber } from "ethers";
import { useRouter } from "next/router";
import { useContract, useNetwork, useProvider, useContractRead } from "wagmi";
import {
  getDeployedContract,
  getAllContractFunctions,
  getContractVariablesAndNoParamsReadMethods,
} from "~~/components/scaffold-eth/Contract/utilsContract";
import { useAppStore } from "~~/services/store/store";

function AddLiquidity() {
  const [isOpen, setIsOpen] = useState(false);
  // create form and setForm function
  const router = useRouter();
  const { pid } = router.query;

  const tempState = useAppStore(state => state.tempSlice.tempState);
  const setTempState = useAppStore(state => state.tempSlice.setTempState);
  // Add state for form
  const [form, setForm] = useState({["..." + pid]: ""});
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
  console.log("Contract: ", displayedContractFunctions);
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

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        <div
          style={{
            // format as button
            boxShadow: "0 16px 32px 0 rgba(0, 0, 0, 0.7)",
            padding: "20px 20px",
            display: "inline-block",
            backgroundColor: "#2E86AB",
            borderRadius: "10px",
            marginRight: "15px",
          }}
        >
          Add Liquidity
        </div>
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              // add headings inside main div
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              backgroundColor: "#2E86AB",
              borderRadius: "10px",
              boxShadow: "0 16px 32px 0 rgba(0, 0, 0, 0.7)",
            }}
          >
            <h1>Add Liquidity</h1>
            <h2>Enter the amount of tokens you want to add</h2>
            {/* add input fields */}
            <InputUI
              paramType="uint256"
              functionFragment={displayedContractFunctions[8]}
              form={form}
              setForm={setForm}
            />

            <button
              onClick={() => {
                // send transaction
                //contract?.addLiquidity(BigNumber.from(pid), tempState.tempStuff);
                //setIsOpen(false);
                console.log("form", form);
              }}
            >
              Add Liquidity
            </button>

            <div
              style={{
                //format as UI box
                boxShadow: "0 16px 32px 0 rgba(0, 0, 0, 0.7)",
                padding: "20px 20px",
                display: "inline-block",
                backgroundColor: "#2E86AB",
                borderRadius: "10px",
                marginRight: "15px",
              }}
            >
              <button onClick={() => setIsOpen(false)}>Close Pop-up</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddLiquidity;
