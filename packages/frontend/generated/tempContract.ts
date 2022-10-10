// todo remove this, this is until we have contract element

export const tempContract = {
  address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "purpose",
          type: "string",
        },
      ],
      name: "SetPurpose",
      type: "event",
    },
    {
      inputs: [],
      name: "purpose",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "newPurpose",
          type: "string",
        },
      ],
      name: "setPurpose",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};
