export const EIP_712_DOMAIN = {
  name: "Scaffold-ETH 2 Extensions Hackathon",
  version: "1",
} as const;

export const EIP_712_TYPES__SUBMISSION = {
  Message: [
    { name: "github", type: "string" },
    { name: "telegram", type: "string" },
    { name: "email", type: "string" },
  ],
} as const;
