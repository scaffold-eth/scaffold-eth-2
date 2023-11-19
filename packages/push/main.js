// import in main.js
import { PushAPI } from '@pushprotocol/restapi';
import { ethers } from 'ethers';

// Creating a random signer from a wallet, ideally this is the wallet you will connect
const signer = ethers.Wallet.createRandom();
// options? - optional, can pass initialization parameters for customization
const userAlice = await PushAPI.initialize(signer, { env: CONSTANTS.ENV.STAGING });

// Requires user to have a channel, see Create Channel section for more info
// ['*'] sends to all wallets who have opted in to your channel
// const response = await userAlice.channel.send(["0xCBb8f44C01B5Ab2266Efae83912D6E7c3cedAAb5"], {
//     notification: {
//       title: "You awesome notification",
//       body: "from your amazing protocol",
//     },
//   });

// userAlice.channel.info(channel?)
const sendNotifRes = await userAlice.channel.send(["staging.push.org/channels?channel=0xCBb8f44C01B5Ab2266Efae83912D6E7c3cedAAb5"], {
    notification: { title: "New NFT!", body: "By Taylor Swift" },
  });

// Sending to nft format, any nfts supported including .lens, .crypto, .polygon or your crypto punks
const sendToLens = await userAlice.chat.send(
    "nft:eip155:11155111:0x42af3147f17239341477113484752D5D3dda997B:2:1683058528",
    {
      notification: {
        title: "Hello World",
        body: "Web3 native notification!",
      },
    },
  );
