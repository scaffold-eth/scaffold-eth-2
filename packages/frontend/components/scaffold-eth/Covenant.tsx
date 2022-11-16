import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import COVENANT_ABI from "./covenant-abi.json";

const COVENANT_ADDRESS = "0x4A4E4F8A4D4bB5c5B5D4D4E4F4F4F4F4F4F4F4F4";

const Covenant = () => {
  const [balance, setBalance] = useState<number>(0);
  const [contract, setContract] = useState<ethers.Contract>();

  useEffect(() => {
    const init = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const covenant = new ethers.Contract(COVENANT_ADDRESS, COVENANT_ABI, signer);
      const balance = await covenant.balance();
      setBalance(balance.toNumber());
      setContract(covenant);
    };
    init();
  }, []);

  const deposit = async () => {
    const amount = 100;
    const tx = await contract?.deposit({ value: amount });
    await tx?.wait();
    const balance = await contract?.balance();
    setBalance(balance.toNumber());
  };

  const withdraw = async () => {
    const amount = 100;
    const tx = await contract?.withdraw(amount);
    await tx?.wait();
    const balance = await contract?.balance();
    setBalance(balance.toNumber());
  };

  return (
    <div>
      <h1>Covenant</h1>
      <div>Balance: {balance}</div>
      <button onClick={deposit}>Deposit</button>
      <button onClick={withdraw}>Withdraw</button>
    </div>
  );
};

export default Covenant;
