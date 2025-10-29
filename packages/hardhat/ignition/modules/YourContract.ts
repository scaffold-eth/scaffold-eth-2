import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("YourContract", m => {
  const yourContract = m.contract("YourContract", ["0x0000000000000000000000000000000000000000"]);

  return { yourContract };
});
