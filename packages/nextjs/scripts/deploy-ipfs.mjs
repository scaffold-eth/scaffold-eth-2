import { create } from "kubo-rpc-client";
import { globSource } from "kubo-rpc-client";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ipfsConfig = {
  host: "ipfs.nifty.ink",
  port: 3001,
  protocol: "https",
  timeout: 250000,
};

async function addDirectoryToIpfs(path) {
  console.log("📦 Adding directory to IPFS via Nifty Ink...");

  try {
    const ipfs = create(ipfsConfig);

    // Track the root directory CID
    let rootCid = null;

    // Add the entire directory to IPFS
    for await (const result of ipfs.addAll(globSource(path, "**/*"), {
      pin: true,
      wrapWithDirectory: true, // This is key - it wraps all files in a directory
    })) {
      if (result.path === "") {
        // This is the root directory entry
        rootCid = result.cid;
      } else {
        console.log(`Added ${result.path} - CID: ${result.cid}`);
      }
    }

    if (!rootCid) {
      throw new Error("Failed to get root directory CID");
    }

    return rootCid.toString();
  } catch (error) {
    console.error("Error adding directory to IPFS:", error);
    throw error;
  }
}

async function main() {
  // Get the path to the out directory
  const outDir = join(__dirname, "..", "out");

  console.log("🚀 Uploading to Nifty Ink IPFS...");
  const cid = await addDirectoryToIpfs(outDir);

  console.log("\n✨ Upload complete! Your site is now available at:");
  console.log(`🔗 Nifty Ink Gateway: https://gateway.nifty.ink:42069/ipfs/${cid}`);
  console.log("\n💡 Note: Your content is being served through the Nifty Ink IPFS gateway");
}

main().catch(err => {
  console.error("Error uploading to IPFS:", err);
  process.exit(1);
});
