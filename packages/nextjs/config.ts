// @noErrors
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { AuthType, cookieStorage, createConfig } from "@account-kit/react";
import { QueryClient } from "@tanstack/react-query";

if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
  throw new Error(
    "Hey friend, you should set your alchemy api key in your environment variables inside of the nextjs package!",
  );
}

const authSections: AuthType[][] = [[{ type: "email" }], [{ type: "social", authProviderId: "google", mode: "popup" }]];

if (process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  authSections.push([
    {
      type: "external_wallets",
      walletConnect: { projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID },
    },
  ]);
}

export const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

export const config = createConfig(
  {
    // alchemy config
    transport: alchemy({ apiKey }), // TODO: add your Alchemy API key - setup your app and embedded account config in the alchemy dashboard (https://dashboard.alchemy.com/accounts)
    policyId: process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID,
    chain: arbitrumSepolia, // TODO: specify your preferred chain here and update imports from @account-kit/infra
    ssr: true, // Defers hydration of the account state to the client after the initial mount solving any inconsistencies between server and client state (read more here: https://accountkit.alchemy.com/react/ssr)
    storage: cookieStorage, // persist the account state using cookies (read more here: https://accountkit.alchemy.com/react/ssr#persisting-the-account-state)
    enablePopupOauth: true, // must be set to "true" if you plan on using popup rather than redirect in the social login flow
  },
  {
    // authentication ui config - your customizations here
    auth: {
      sections: authSections,
      addPasskeyOnSignup: false,
    },
  },
);

export const queryClient = new QueryClient();
