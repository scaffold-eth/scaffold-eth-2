export const BurnerConnectorErrorList = {
  accountNotFound: "Account not found",
  couldNotConnect: "Could not connect to network",
  unsupportedBurnerChain: "This network is not supported for burner connector",
} as const;

export type BurnerConnectorErrorTypes = typeof BurnerConnectorErrorList[keyof typeof BurnerConnectorErrorList];

export class BurnerConnectorError extends Error {
  constructor(errorType: BurnerConnectorErrorTypes, message?: string) {
    super(`BurnerConnectorError ${errorType}: ${message ?? ""} `);
  }
}
