import { stringify, withDefaults } from '../../../../utils.js'

const contents = ({ externalContracts }) =>
`import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
const externalContracts = ${stringify(externalContracts[0])} as const;

export default externalContracts satisfies GenericContractsDeclaration;
`

export default withDefaults(contents, {
    externalContracts: {}
})
