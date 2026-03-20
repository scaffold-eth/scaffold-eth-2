import { describe, it } from "node:test";
import assert from "node:assert";
import { isContractCreationBytecode } from "./decodeTxDataUtils.ts";

describe("isContractCreationBytecode", () => {
  it("returns true for standard Solidity init bytecode (0x60806040...)", () => {
    assert.strictEqual(isContractCreationBytecode("0x6080604052604051600055"), true);
    assert.strictEqual(isContractCreationBytecode("0x6080604052"), true);
    assert.strictEqual(isContractCreationBytecode("0x60806041"), true);
  });

  it("returns false for function call data (4-byte selector)", () => {
    assert.strictEqual(isContractCreationBytecode("0xa9059cbb000000000000000000000000"), false);
    assert.strictEqual(isContractCreationBytecode("0x60e06040"), false);
  });

  it("returns false for input shorter than 10 chars", () => {
    assert.strictEqual(isContractCreationBytecode("0x608060"), false);
  });
});
