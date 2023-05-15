/**
 * Error list used by {@link BurnerConnectorError}
 */
export const BurnerConnectorErrorList = {
  accountNotFound: "Account not found",
  couldNotConnect: "Could not connect to network",
  unsupportedBurnerChain: "This network is not supported for burner connector",
  chainIdNotResolved: "Cound not resolve chainId",
  signerNotResolved: "Cound not resolve signer",
  chainNotSupported: "Chain is not supported, check burner wallet config",
} as const;

/**
 * A union of all the BurnerConnectorErrorList
 */
export type BurnerConnectorErrorTypes = typeof BurnerConnectorErrorList[keyof typeof BurnerConnectorErrorList];

export class BurnerConnectorError extends Error {
  constructor(errorType: BurnerConnectorErrorTypes, message?: string) {
    const msg = `BurnerConnectorError ${errorType}: ${message ?? ""} `;
    super(msg);
    console.warn(msg);
  }
}
