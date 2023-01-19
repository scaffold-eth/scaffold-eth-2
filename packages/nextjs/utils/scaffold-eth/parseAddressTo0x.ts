/**
 * @dev Converts an address string to the form of `0x${string}`
 * @param {string} address - address to be parsed
 * @return string of the form `0x${string}`
 */
export default function parseAddressTo0x(address: string): `0x${string}` {
  if (address.startsWith("0x")) {
    return `0x${address.substring(2)}`;
  }

  return `0x${address}`;
}
