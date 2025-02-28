import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

async function getAddressBalance(address, rpcUrl) {
  // Default to localhost if no RPC URL is provided
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl || 'http://localhost:8545');
    
    // Validate the address
    if (!ethers.utils.isAddress(address)) {
      console.error('\n❌ Invalid Ethereum address');
      return null;
    }

    // Get the balance
    const balance = await provider.getBalance(address);
    const etherBalance = ethers.utils.formatEther(balance);
    
    console.log('\n💰 Address Balance Information:');
    console.log(`Address: ${address}`);
    console.log(`Balance: ${etherBalance} ETH`);
    console.log(`Raw Balance: ${balance.toString()} wei`);
    
    // Get the network information
    const network = await provider.getNetwork();
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    return {
      address,
      balance: etherBalance,
      rawBalance: balance.toString(),
      network: network.name,
      chainId: network.chainId
    };
  } catch (error) {
    console.error('\n❌ Error fetching balance:', error.message);
    return null;
  }
}

// Run the function if this script is called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const address = process.argv[2];
  const rpcUrl = process.argv[3] || process.env.RPC_URL;
  
  if (!address) {
    console.error('\n❌ Please provide an Ethereum address as the first argument');
    process.exit(1);
  }
  
  getAddressBalance(address, rpcUrl)
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { getAddressBalance }; 