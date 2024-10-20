import { create } from "kubo-rpc-client";

const PROJECT_ID = "2GajDLTC6y04qsYsoDRq9nGmWwK";
const PROJECT_SECRET = "48c62c6b3f82d2ecfa2cbe4c90f97037";
const PROJECT_ID_SECRECT = `${PROJECT_ID}:${PROJECT_SECRET}`;

export const ipfsClient = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    Authorization: `Basic ${Buffer.from(PROJECT_ID_SECRECT).toString("base64")}`,
  },
});

export async function getNFTMetadataFromIPFS(ipfsHash: string) {
  for await (const file of ipfsClient.get(ipfsHash)) {
    // The file is of type unit8array so we need to convert it to string
    const content = new TextDecoder().decode(file);
    // Remove any leading/trailing whitespace
    const trimmedContent = content.trim();
    // Find the start and end index of the JSON object
    const startIndex = trimmedContent.indexOf("{");
    const endIndex = trimmedContent.lastIndexOf("}") + 1;
    // Extract the JSON object string
    const jsonObjectString = trimmedContent.slice(startIndex, endIndex);
    try {
      const jsonObject = JSON.parse(jsonObjectString);
      return jsonObject;
    } catch (error) {
      console.log("Error parsing JSON:", error);
      return undefined;
    }
  }
}
