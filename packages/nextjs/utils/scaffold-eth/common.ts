// To be used in JSON.stringify when a field might be bigint
import { getParsedError } from "./getParsedError";
import { notification } from "./notification";
import { Abi } from "abitype";
import { Config } from "wagmi";
import { simulateContract } from "wagmi/actions";
import { WriteContractVariables } from "wagmi/query";

// https://wagmi.sh/react/faq#bigint-serialization
export const replacer = (_key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const isZeroAddress = (address: string) => address === ZERO_ADDRESS;

export const simulateContractWriteAndNotifyError = async ({
  wagmiConfig,
  writeContractParams: params,
}: {
  wagmiConfig: Config;
  writeContractParams: WriteContractVariables<Abi, string, any[], Config, number>;
}) => {
  try {
    await simulateContract(wagmiConfig, params);
  } catch (error) {
    const parsedError = getParsedError(error);
    notification.error(parsedError);
    throw error;
  }
};
