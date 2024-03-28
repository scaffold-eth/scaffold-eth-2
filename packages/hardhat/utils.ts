import * as fs from "fs";
import hre from "hardhat";

export const generateDeployments = async function ({
  address,
  contractData,
  chainId,
}: {
  address: string;
  contractData: any;
  chainId: number;
}) {
  const contractName = contractData.contractName;

  const DEPLOYMENTS_DIR = `./deployments/${hre.network.name}`;

  if (!fs.existsSync(DEPLOYMENTS_DIR)) {
    fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
    fs.writeFileSync(`${DEPLOYMENTS_DIR}/.chainId`, JSON.stringify(chainId));
  }

  contractData.address = address;

  try {
    fs.writeFileSync(`${DEPLOYMENTS_DIR}/${contractName}.json`, JSON.stringify(contractData, null, 2));
  } catch (err) {
    console.log(err);
  }

  console.log(`📝 Generated ${DEPLOYMENTS_DIR}/${contractName}.json`);
};
