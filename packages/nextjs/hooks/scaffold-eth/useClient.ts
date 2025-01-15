import { UseSmartAccountClientProps, useSmartAccountClient } from "@account-kit/react";

export const useClient = (
  config: UseSmartAccountClientProps = {
    type: "LightAccount",
  },
) => {
  return useSmartAccountClient(config);
};
