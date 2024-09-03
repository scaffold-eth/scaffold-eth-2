import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { Wallet } from 'ethers';
import * as fs from 'fs';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const privateKey = process.env.PRIVATE_KEY || '';
const wallet = new Wallet(privateKey, client);

const KarVaOneToken = JSON.parse(fs.readFileSync('./artifacts/contracts/KarVaOneToken.sol/KarVaOneToken.json', 'utf8'));
const SudhiCarbonToken = JSON.parse(fs.readFileSync('./artifacts/contracts/SudhiCarbonToken.sol/SudhiCarbonToken.json', 'utf8'));

async function deploy() {
  const karVaOneContract = await wallet.deployContract({
    abi: KarVaOneToken.abi,
    bytecode: KarVaOneToken.bytecode,
    args: [1000000] // Initial supply
  });
  console.log(`KarVaOneToken deployed to: ${karVaOneContract.address}`);

  const sudhiCarbonContract = await wallet.deployContract({
    abi: SudhiCarbonToken.abi,
    bytecode: SudhiCarbonToken.bytecode,
    args: [1000000] // Initial supply
  });
  console.log(`SudhiCarbonToken deployed to: ${sudhiCarbonContract.address}`);
}

deploy().catch(console.error);
