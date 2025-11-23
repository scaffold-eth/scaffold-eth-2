import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Generic module to deploy contracts
export default buildModule("ScaffoldEthDeployModule", m => {
  const yourContract = m.contract("YourContract", ["0x0000000000000000000000000000000000000000"]);

  return { yourContract };
});
