import { getNFTMetadataFromIPFS } from "~~/utils/simpleNFT/ipfs";

export async function POST(request: Request) {
  try {
    const { ipfsHash } = await request.json();
    const res = await getNFTMetadataFromIPFS(ipfsHash);
    return Response.json(res);
  } catch (error) {
    console.log("Error getting metadata from ipfs", error);
    return Response.json({ error: "Error getting metadata from ipfs" });
  }
}
