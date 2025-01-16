import { alchemyEnhancedApiActions } from "@account-kit/infra";
import { UseSmartAccountClientProps, useSmartAccountClient } from "@account-kit/react";
import { Alchemy } from "alchemy-sdk";
import { apiKey } from "~~/config";

export const useClient = (
  config: UseSmartAccountClientProps = {
    type: "LightAccount",
  },
) => {
  const alchemy = new Alchemy({
    apiKey,
  });
  const enhancedApiDecorator = alchemyEnhancedApiActions(alchemy);
  const { client, address } = useSmartAccountClient(config);
  return { client: client?.extend(enhancedApiDecorator), address };
};
