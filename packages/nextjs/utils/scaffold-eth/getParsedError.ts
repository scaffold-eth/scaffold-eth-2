import { BaseError as BaseViemError } from "viem";

/**
 * @dev utility function to parse error
 * @param e - error object
 * @returns {string} parsed error string
 */
export const getParsedError = (e: any | BaseViemError): string => {
  let message = e.message ?? "An unknown error occurred";

  if (e instanceof BaseViemError) {
    if (e.details) {
      message = e.details;
    } else if (e.shortMessage) {
      message = e.shortMessage;
    } else if (e.message) {
      message = e.message;
    } else if (e.name) {
      message = e.name;
    }
  }

  return message;
};
