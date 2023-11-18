import { keccak256 } from "@ethersproject/keccak256";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";

// leaf_position corresponds to player classification being 0 the winner of the tournament
export function getMerkleRoot(
  contentCreator: string,
  subscriberAddresses: string[],
  subsShares: bigint[],
  publicKeys: string[],
  positionLeaf: number,
) {
  // Create an array to store the leaves
  const leaves: string[] = [];
  const positions: number[] = Array.from({ length: 256 }, (_, index) => index);

  // Iterate through the results_bytes array and create leaves
  for (let i = 0; i < positions.length; i++) {
    const leaf = keccak256(
      ethers.utils.solidityPack(
        ["uint256", "address", "uint256", "address"],
        [positions[i], subscriberAddresses[i], subsShares[i], publicKeys[i]],
      ),
    );
    leaves.push(leaf);
  }

  const tree = new MerkleTree(leaves, keccak256);

  let root = tree.getRoot().toString("hex");
  root = `0x${root}`;
  const leaf = tree.getLeaf(positionLeaf);
  const proof = tree.getProof(leaf);
  // Sacamos el isLeft[]
  const isLeft: boolean[] = [];

  const inputProof: string[] = [];
  // console.log(proof)
  proof.forEach(el => {
    isLeft.push(el.position === "left" ? true : false);
  });

  proof.forEach(el => {
    const inputBuffer = Buffer.from(el.data);
    // Convert the input buffer to a hex string
    const hexString = "0x" + inputBuffer.toString("hex");

    // Parse the hex string as a bytes32
    const bytes32Value = ethers.utils.hexZeroPad(hexString, 32);
    inputProof.push(bytes32Value);
  });
  return { isLeft, inputProof, root };
}
