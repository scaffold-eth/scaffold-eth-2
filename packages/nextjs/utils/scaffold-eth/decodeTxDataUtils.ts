/** Standard Solidity contract creation bytecode starts with PUSH1 0x80 PUSH1 0x40 (0x6080604...). */
export const isContractCreationBytecode = (input: string): boolean =>
  input.length >= 10 && input.startsWith("0x6080604");
