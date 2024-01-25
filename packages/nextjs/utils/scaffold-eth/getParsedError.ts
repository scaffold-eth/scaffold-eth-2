import { BaseError as BaseViemError, DecodeErrorResultReturnType } from "viem";

/**
 * Parses an viem/wagmi error to get a displayable string
 * @param e - error object
 * @returns parsed error string
 */
export const getParsedError = (e: any): string => {
  let message: string = e.message ?? "An unknown error occurred";
  if (e instanceof BaseViemError) {
    if (e.details) {
      message = e.details;
    } else if (e.shortMessage) {
      message = e.shortMessage;
      const cause = e.cause as { data?: DecodeErrorResultReturnType } | undefined;
      // if its not generic error, append custom error name and its args to message
      if (cause?.data && cause.data?.abiItem?.name !== "Error") {
        const customErrorArgs = cause.data.args?.toString() ?? "";
        message = `${message.replace(/reverted\.$/, "reverted with following reason:")}\n${
          cause.data.errorName
        }(${customErrorArgs})`;
      }
    } else if (e.message) {
      message = e.message;
    } else if (e.name) {
      message = e.name;
    }
  }

  return message;
};
