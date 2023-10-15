"use client";

import { useEffect, useState } from "react";
import { Box, Button, Center, Heading, Link, Stack, Text, Wrap, WrapItem } from "@chakra-ui/react";
import { RegistrationEncoded } from "@passwordless-id/webauthn/dist/esm/types";
import { BigNumber, ethers } from "ethers";
import { hexZeroPad } from "ethers/lib/utils";
import { SessionKeySigner, SmartAccount } from "smart-accounts";
import { Client, Presets } from "userop";
import { WebauthnSigner } from "~~/utils/AA/userop";
import { createPasskeyCredential } from "~~/utils/AA/webauthn";

interface StorePasskeys {
  challenge: string;
  registration: RegistrationEncoded;
}

interface Base {
  stage: number;
  creatingAccount: boolean;
  creatingSessionKey: boolean;
  mintingNFT: boolean;
  account: string;
  storedPasskeys: StorePasskeys | null;
  ecdsaWallet: ethers.Wallet | null;
}
export default function AACard() {
  const chainId = 4690;
  const entrypoint = "0xc3527348De07d591c9d567ce1998eFA2031B8675";
  const webauthnValidator = "0xe2C03A87C78783d85C263B020E9AeFDa3525d69c";
  const sessionKeyValidator = "0x9c0bCB161986d50013783003FDef76f1d3548F3A";
  const accountFactory = "0xdC0a3eF76617794a944BAA1A21e863b1d9d94d8C";
  const nftAddr = "0xA3Ce183b2EA38053f85A160857E6f6A8C10EF5f7";
  const rpc = "https://babel-api.testnet.iotex.io";
  const bundler = "https://bundler.testnet.w3bstream.com";
  const paymaster = "https://paymaster.testnet.w3bstream.com/rpc/d98ecac885f4406d87517263b83cb237";

  const [base, setBase] = useState<Base>({
    stage: 0,
    creatingAccount: false,
    creatingSessionKey: false,
    mintingNFT: false,
    account: "",
    storedPasskeys: null,
    ecdsaWallet: null,
  });

  const [message, setMessage] = useState<string[]>([]);

  useEffect(() => {
    const storedKeyJson = localStorage.getItem("smart-accounts:key");
    if (storedKeyJson) {
      setBase(prev => {
        return { ...prev, storedPasskeys: JSON.parse(storedKeyJson), stage: 1 };
      });
    }
    const account = localStorage.getItem(`smart-accounts:account:${chainId}`);
    if (account) {
      setBase(prev => {
        return { ...prev, account: account, stage: 2 };
      });
    }
    if (base.ecdsaWallet) {
      setBase(prev => {
        return { ...prev, stage: 3 };
      });
    }
  }, []);

  const createPasskey = async () => {
    const credential = await createPasskeyCredential("SmartAccounts");
    localStorage.setItem("smart-accounts:key", JSON.stringify(credential));
    localStorage.removeItem(`smart-accounts:account:${chainId}`);
    setBase(prev => {
      return { ...prev, stage: 1, account: "", storedPasskeys: credential };
    });
  };

  const createAccount = async () => {
    if (!base.storedPasskeys) {
      throw Error("create passkeys first");
    }
    setBase(prev => {
      return { ...prev, creatingAccount: true };
    });
    try {
      const signer = new WebauthnSigner(base.storedPasskeys.registration, webauthnValidator);

      const client = await Client.init(rpc, {
        entryPoint: entrypoint,
        overrideBundlerRpc: bundler,
      });
      const accountBuilder = await SmartAccount.init(signer, rpc, {
        overrideBundlerRpc: bundler,
        entryPoint: entrypoint,
        factory: accountFactory,
        paymasterMiddleware: Presets.Middleware.verifyingPaymaster(paymaster, { type: "payg" }),
      });
      const response = await client.sendUserOperation(accountBuilder);
      const userOperationEvent = await response.wait();

      setMessage(prev => {
        // @ts-ignore
        return [
          ...prev,
          `create account opHash: ${response.userOpHash}`,
          `create account txHash: ${userOperationEvent!.transactionHash}`,
        ];
      });
      localStorage.setItem(`smart-accounts:account:${chainId}`, accountBuilder.getSender());
      setBase(prev => {
        return { ...prev, stage: 2, account: accountBuilder.getSender() };
      });
    } finally {
      setBase(prev => {
        return { ...prev, creatingAccount: false };
      });
    }
  };

  const createSessionKey = async () => {
    if (!base.storedPasskeys || !base.account) {
      throw Error("create passkeys or account first");
    }
    setBase(prev => {
      return { ...prev, creatingSessionKey: true };
    });
    try {
      const ecdsaWallet = ethers.Wallet.createRandom();
      setBase(prev => {
        return { ...prev, ecdsaWallet: ecdsaWallet };
      });
      const signer = new WebauthnSigner(base.storedPasskeys.registration, webauthnValidator);

      const client = await Client.init(rpc, {
        entryPoint: entrypoint,
        overrideBundlerRpc: bundler,
      });
      const accountBuilder = await SmartAccount.init(signer, rpc, {
        overrideBundlerRpc: bundler,
        entryPoint: entrypoint,
        factory: accountFactory,
        paymasterMiddleware: Presets.Middleware.verifyingPaymaster(paymaster, { type: "payg" }),
      });

      const validAfter = Math.floor(new Date().getTime() / 1000);
      // three hours
      const validUntil = validAfter + 10800;

      const validatorData = ethers.utils.solidityPack(
        ["bytes20", "bytes6", "bytes6"],
        [
          base.ecdsaWallet?.address ?? ecdsaWallet.address,
          hexZeroPad(BigNumber.from(validUntil).toHexString(), 6),
          hexZeroPad(BigNumber.from(validAfter).toHexString(), 6),
        ],
      );

      const enableValidator = new ethers.utils.Interface(["function enableValidator(address,bytes)"]);
      const enableValidatorCallData = enableValidator.encodeFunctionData("enableValidator", [
        sessionKeyValidator,
        validatorData,
      ]);
      const execute = new ethers.utils.Interface(["function execute(address,uint256,bytes)"]);
      const executeCallData = execute.encodeFunctionData("execute", [base.account, 0, enableValidatorCallData]);
      accountBuilder.setCallData(executeCallData);

      const response = await client.sendUserOperation(accountBuilder);

      const userOperationEvent = await response.wait();
      setMessage(prev => {
        // @ts-ignore
        return [
          ...prev,
          `create session key opHash: ${response.userOpHash}`,
          `create session key txHash: ${userOperationEvent!.transactionHash}`,
        ];
      });
      setBase(prev => {
        return { ...prev, stage: 3 };
      });
    } finally {
      setBase(prev => {
        return { ...prev, creatingSessionKey: false };
      });
    }
  };

  const mintNFT = async () => {
    if (!base.storedPasskeys || !base.account || !base.ecdsaWallet) {
      throw Error("create passkeys or account first");
    }
    setBase(prev => {
      return { ...prev, mintingNFT: true };
    });
    try {
      const signer = new SessionKeySigner(base.ecdsaWallet, sessionKeyValidator);

      const client = await Client.init(rpc, {
        entryPoint: entrypoint,
        overrideBundlerRpc: bundler,
      });
      const accountBuilder = await SmartAccount.new(base.account, signer, rpc, {
        overrideBundlerRpc: bundler,
        entryPoint: entrypoint,
        factory: accountFactory,
        paymasterMiddleware: Presets.Middleware.verifyingPaymaster(paymaster, { type: "payg" }),
      });
      const execute = new ethers.utils.Interface(["function execute(address,uint256,bytes)"]);
      const executeCallData = execute.encodeFunctionData("execute", [nftAddr, 0, "0x1249c58b"]);
      accountBuilder.setCallData(executeCallData);

      const response = await client.sendUserOperation(accountBuilder);
      const userOperationEvent = await response.wait();
      setMessage(prev => {
        return [
          ...prev,
          `mint nft opHash: ${response.userOpHash}`,
          // @ts-ignore
          `mint nft txHash: ${userOperationEvent!.transactionHash}`,
        ];
      });
      setBase(prev => {
        return { ...prev, stage: 3 };
      });
    } finally {
      setBase(prev => {
        return { ...prev, mintingNFT: false };
      });
    }
  };

  return (
    <Center p="10">
      <Box borderWidth="1px" borderRadius="lg" p="6" boxShadow="xl" className="bg-base-300 border-base-300">
        <Heading bgGradient="linear(to-l, #ff80b5, #9089fc)" bgClip="text" fontSize="3xl" fontWeight="extrabold">
          Passkeys Account Abstraction demo
        </Heading>
        <Box paddingTop="6">
          <Box p="2">
            <Heading
              fontSize="md"
              textTransform="uppercase"
              bgGradient="linear(to-l, #ff80b5, #9089fc)"
              bgClip="text"
              fontWeight="extrabold"
            >
              Account
            </Heading>
            <Box>
              <Text>Passkeys: {base.storedPasskeys ? base.storedPasskeys.registration?.credential.id : "None"}</Text>
              <Text>
                Created Account:{" "}
                {base.account ? (
                  <Link color="teal.500" isExternal href={"https://testnet.iotexscan.io/address/" + base.account}>
                    {base.account}
                  </Link>
                ) : (
                  "None"
                )}
              </Text>
              <Text>Session key: {base.ecdsaWallet ? base.ecdsaWallet.address : "None"}</Text>
            </Box>
          </Box>
          <Box p="2">
            <Heading
              fontSize="md"
              textTransform="uppercase"
              bgGradient="linear(to-l, #ff80b5, #9089fc)"
              bgClip="text"
              fontWeight="extrabold"
            >
              Message
            </Heading>
            <Box paddingTop="3">
              {message.map((m, i) => (
                <Text key={"message-" + i}>
                  {m} {""}
                </Text>
              ))}
            </Box>
          </Box>
          <Box p="2">
            <Wrap spacing={4}>
              <WrapItem>
                {base.stage == 1 ? (
                  <Button colorScheme="purple" variant="outline" onClick={createPasskey}>
                    Create Passkeys
                  </Button>
                ) : (
                  <Button colorScheme="purple" onClick={createPasskey}>
                    Create Passkeys
                  </Button>
                )}
              </WrapItem>
              {base.stage == 1 && (
                <WrapItem>
                  <Button
                    isLoading={base.creatingAccount}
                    loadingText="Creating Passkeys Account"
                    colorScheme="pink"
                    onClick={createAccount}
                  >
                    Create Passkeys Account
                  </Button>
                </WrapItem>
              )}
              {base.stage == 2 && (
                <WrapItem>
                  <Button
                    isLoading={base.creatingSessionKey}
                    loadingText="Creating Session Key"
                    colorScheme="linkedin"
                    onClick={createSessionKey}
                  >
                    Create Session Key
                  </Button>
                </WrapItem>
              )}
              {base.stage == 3 && (
                <WrapItem>
                  <Button
                    isLoading={base.mintingNFT}
                    loadingText="Minting NFT with Session Key"
                    colorScheme="yellow"
                    onClick={mintNFT}
                  >
                    Mint NFT with Session Key
                  </Button>
                </WrapItem>
              )}
            </Wrap>
          </Box>
        </Box>
        <Box p="2">
          <Stack direction="row" justify="center">
            <Text>
              Made by{" "}
              <Link isExternal color="teal.500" href="https://github.com/ququzone/smart-accounts">
                Smart Accounts
              </Link>
            </Text>
          </Stack>
        </Box>
      </Box>
    </Center>
  );
}
