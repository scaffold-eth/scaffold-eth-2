import { expect } from "chai";
import { ethers } from "hardhat";
import { SecretFans } from "../typechain-types";
import type { Signer } from "ethers";
import { getMerkleRoot } from "../../nextjs/utils/merkleTree/merkleTree";

describe("SecretFans", function () {
  // We define a fixture to reuse the same setup in every test.

  let secretFans: SecretFans;
  let contentCreator: Signer, participant1: Signer, participant2: Signer;
  const publicKey1 = "0x2BAb50935100E3cC34d3a8c4D370Db770CD72398";
  const privateKey1 = "9e241c6f05e08ce348ec94347bf91816eeec45de4eb3bd54526da902fffb9afa";
  const publicKey2 = "0xC497FCB667e24eEe83E9A50c1cAF56BB2845857f";
  const privateKey2 = "310e2789b97e3f003939e14d78961f467765480715551c9add3bfb542a085f94";
  const enrollmentAmount = ethers.utils.parseEther("1");
  const enrollmentAmount2 = ethers.utils.parseEther("0.76567");
  let add0 = ethers.constants.AddressZero;
  let subscriberAddresses: string[] = Array.from({ length: 255 }, () => add0);
  let subscriberShares: bigint[] = Array.from({ length: 255 }, () => 0n);
  let subscriberPubKeys: string[] = Array.from({ length: 255 }, () => add0);


  before(async () => {
    [contentCreator, participant1, participant2] = await ethers.getSigners();
    const SecretFansFactory = await ethers.getContractFactory("SecretFans");
    secretFans = (await SecretFansFactory.deploy(contentCreator.getAddress())) as SecretFans;
    await secretFans.deployed();
  });

  describe("SecretFans", function () {
    it("Should allow subscibtion", async function () {
      await secretFans.subscribeSpotsAvaliable(contentCreator.getAddress(), publicKey1, { value: enrollmentAmount });
      await secretFans.subscribeSpotsAvaliable(contentCreator.getAddress(), publicKey2, { value: enrollmentAmount2 });
      const contentCreatorChannel = await secretFans.Channels(contentCreator.getAddress());
      const merkletree = await secretFans.getMerkleTree(contentCreator.getAddress());

      expect(contentCreatorChannel.totalETH).to.equal(enrollmentAmount.add(enrollmentAmount2));

      console.log(merkletree[254]);

      subscriberAddresses[0] = await participant1.getAddress();
      subscriberAddresses[1] = await participant2.getAddress();
      subscriberShares[0] = BigInt(enrollmentAmount.toString());
      subscriberShares[1] = BigInt(enrollmentAmount2.toString());
      subscriberPubKeys[0] = publicKey1
      subscriberPubKeys[1] = publicKey2
      const cc =await contentCreator.getAddress()

      const backEndMerkleTree = getMerkleRoot(cc, subscriberAddresses,subscriberShares,subscriberPubKeys,2);
      console.log(backEndMerkleTree.root);

      expect(merkletree[254]).to.equal(backEndMerkleTree.root);
    });
  });
});
