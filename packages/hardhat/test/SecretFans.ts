import { expect } from "chai";
import { ethers } from "hardhat";
import { SecretFans } from "../typechain-types";
import type { Signer } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";

describe("SecretFans", function () {
  // We define a fixture to reuse the same setup in every test.

  let secretFans: SecretFans;
  let contentCreator: Signer, participant1: Signer, participant2: Signer;
  const privateKey1 = "9e241c6f05e08ce348ec94347bf91816eeec45de4eb3bd54526da902fffb9afa";
  const publicKey1 =
    "0x04fcbbf4c8055a8e04271d4e36dec9be5bdfdfe544fc7ccf8b80e71d11b080b09830e1776c66e99ffbe73accfd2d367e9631eac125d5983a6cfa2f4a514eb7c6f5";
  const privateKey2 = "310e2789b97e3f003939e14d78961f467765480715551c9add3bfb542a085f94";
  const publicKey2 =
    "0x04fcbbf4c8055a8e04271d4e36dec9be5bdfdfe544fc7ccf8b80e71d11b080b09830e1776c66e99ffbe73accfd2d367e9631eac125d5983a6cfa2f4a514eb7c6f5";

  const enrollmentAmount = ethers.utils.parseEther("1");
  const enrollmentAmount2 = ethers.utils.parseEther("0.76567");
  let add0 = ethers.constants.AddressZero;
  let subscriberAddresses: string[] = Array.from({ length: 255 }, () => add0);
  let subscriberShares: bigint[] = Array.from({ length: 255 }, () => 0n);
  let subscriberPubKeys: string[] = Array.from({ length: 2 }, () => add0);

  before(async () => {
    [contentCreator, participant1, participant2] = await ethers.getSigners();
    const SecretFansFactory = await ethers.getContractFactory("SecretFans");
    secretFans = (await SecretFansFactory.deploy(contentCreator.getAddress())) as SecretFans;
    await secretFans.deployed();
  });

  describe("SecretFans", function () {
    it("Should allow subscibtion, check(pools,sub shares,add array) update, balance contract", async function () {
      await secretFans
        .connect(participant1)
        .subscribeSpotsAvaliable(contentCreator.getAddress(), publicKey1, { value: enrollmentAmount });
      await secretFans
        .connect(participant2)
        .subscribeSpotsAvaliable(contentCreator.getAddress(), publicKey2, { value: enrollmentAmount2 });

      const contentCreatorChannel = await secretFans.Channels(contentCreator.getAddress());
      const shares1 = await secretFans.getSubShares(participant1.getAddress(), contentCreator.getAddress());

      subscriberPubKeys[0]=publicKey1
      subscriberPubKeys[1]=publicKey2
      const PubKey1 = await secretFans.getSubPubKeys(contentCreator.getAddress());
      const CCsubs = await secretFans.getCCSubscriptors(contentCreator.getAddress());

      expect(contentCreatorChannel.totalETH).to.equal(enrollmentAmount.add(enrollmentAmount2));
      expect(shares1).to.equal(enrollmentAmount);
      expect(PubKey1).to.deep.equal(subscriberPubKeys);
      expect(CCsubs[0]).to.equal(await participant1.getAddress());

      const provider = ethers.provider;
      expect(await provider.getBalance(secretFans.address)).to.equal(enrollmentAmount.add(enrollmentAmount2));
    });

    it("Should allow publishing NFT and geting part of the totalETH", async function () {
      const partAdd = await participant1.getAddress();
      console.log(BigInt((await contentCreator.getBalance()).toString()));
      await secretFans.connect(contentCreator).publish("dafdaff", [{ sub: partAdd, key: publicKey1 }]);
      const uri = await secretFans.uri(0);
      expect(uri).to.equal("dafdaff");
      console.log(BigInt((await contentCreator.getBalance()).toString()));
    });

    it("Should not allow to publish 2 NFT consecutively", async function () {
      const partAdd = await participant1.getAddress();
      await expect(
        secretFans.connect(contentCreator).publish("dafdaff", [{ sub: partAdd, key: publicKey1 }]),
      ).to.be.revertedWith("Function is timelocked");
    });

    it("Should allow minting NFT", async function () {
      const partAdd = await participant1.getAddress();
      await secretFans.connect(participant1).mint(0);
      expect(await secretFans.balanceOf(partAdd, 0)).to.be.equal(1);
    });

    it("Should not allow minting more than one NFT", async function () {
      const partAdd = await participant1.getAddress();
      await expect(secretFans.connect(participant1).mint(0)).to.be.revertedWith("You already minted this NFT!");
    });
  });
});
