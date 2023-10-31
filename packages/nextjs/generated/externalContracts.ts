import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *      address: "0x..."
 *      abi: [...],
 *    }
 * } satisfies GenericContractsDeclaration | null;
 */
const externalContracts = {} satisfies GenericContractsDeclaration | null;

export default externalContracts;
