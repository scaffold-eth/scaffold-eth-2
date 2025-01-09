import { exec } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function checkIpfsDaemon() {
  try {
    await execAsync("ipfs --version");
    // Check if daemon is running and has peers
    const { stdout } = await execAsync("ipfs swarm peers");
    const peerCount = stdout.split("\n").filter(Boolean).length;

    if (peerCount < 1) {
      console.log("⚠️  Warning: Your IPFS node has no peers. Content might not be accessible immediately.");
      console.log("Waiting for peers to connect...");
      // Wait for peers to connect
      await new Promise(resolve => setTimeout(resolve, 10000));
      const { stdout: newStdout } = await execAsync("ipfs swarm peers");
      const newPeerCount = newStdout.split("\n").filter(Boolean).length;
      if (newPeerCount < 1) {
        console.log("Still no peers connected. You might want to:");
        console.log("1. Check your internet connection");
        console.log("2. Ensure your IPFS daemon is not behind a firewall");
        console.log("3. Try running 'ipfs daemon --enable-pubsub-experiment' for better connectivity");
      } else {
        console.log(`✓ Connected to ${newPeerCount} peers`);
      }
    } else {
      console.log(`✓ Connected to ${peerCount} peers`);
    }
  } catch (error) {
    console.error("❌ IPFS is not installed or daemon is not running.");
    console.log("Please install IPFS and start the daemon:");
    console.log("1. Install IPFS: https://docs.ipfs.tech/install/");
    console.log("2. Start the daemon: ipfs daemon");
    process.exit(1);
  }
}

async function addDirectoryToIpfs(path) {
  console.log("📦 Adding directory to IPFS...");

  try {
    // Add the entire directory to IPFS and get the hash
    const { stdout } = await execAsync(`ipfs add -r -Q "${path}"`);
    const cid = stdout.trim();

    // Announce the content to the network
    try {
      await execAsync(`ipfs dht provide ${cid}`);
      console.log("✓ Announced content to the IPFS network");
    } catch (error) {
      console.log("⚠️  Warning: Could not announce content to the network. Content might take longer to be available.");
    }

    return cid;
  } catch (error) {
    console.error("Error adding directory to IPFS:", error);
    throw error;
  }
}

async function main() {
  // First check if IPFS is installed and running
  await checkIpfsDaemon();

  // Get the path to the out directory
  const outDir = join(__dirname, "..", "out");

  console.log("🚀 Uploading to IPFS...");
  const cid = await addDirectoryToIpfs(outDir);

  // Give the network some time to propagate the content
  console.log("\n⏳ Waiting for network propagation...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log("\n✨ Upload complete! Your site is now available at:");
  console.log(`🔗 IPFS Gateway: https://ipfs.io/ipfs/${cid}`);
  console.log(`🔗 Dweb link: ipfs://${cid}`);
  console.log("\n💡 To ensure your site stays available:");
  console.log("1. Keep your IPFS daemon running");
  console.log("2. Pin the CID on other nodes: ipfs pin add " + cid);
  console.log("\n💡 If the gateway times out, you can:");
  console.log("1. Wait a few minutes and try again");
  console.log("2. Try another gateway like https://cloudflare-ipfs.com/ipfs/" + cid);
  console.log("3. Install the IPFS Companion browser extension");
}

main().catch(err => {
  console.error("Error uploading to IPFS:", err);
  process.exit(1);
});
