//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/// Checkpoint 6 //////
import { IVerifier } from "../Verifier.sol";

contract VerifierMock is IVerifier {
    bool public shouldVerify = true;

    // Optional: enforce an exact public inputs set and order for tests
    bool public enforceExpectedInputs;
    bytes32 public expectedNullifier;
    bytes32 public expectedRoot;
    bytes32 public expectedVote;
    bytes32 public expectedDepth;

    function setShouldVerify(bool _shouldVerify) external {
        shouldVerify = _shouldVerify;
    }

    function setExpectedInputs(bytes32 _nullifier, bytes32 _root, bytes32 _vote, bytes32 _depth) external {
        enforceExpectedInputs = true;
        expectedNullifier = _nullifier;
        expectedRoot = _root;
        expectedVote = _vote;
        expectedDepth = _depth;
    }

    function clearExpectedInputs() external {
        enforceExpectedInputs = false;
        expectedNullifier = 0x0;
        expectedRoot = 0x0;
        expectedVote = 0x0;
        expectedDepth = 0x0;
    }

    function verify(bytes calldata, bytes32[] calldata _publicInputs) external view returns (bool) {
        if (!shouldVerify) {
            return false;
        }
        if (enforceExpectedInputs) {
            if (
                _publicInputs.length != 4 || _publicInputs[0] != expectedNullifier || _publicInputs[1] != expectedRoot
                    || _publicInputs[2] != expectedVote || _publicInputs[3] != expectedDepth
            ) {
                return false;
            }
        }
        return true;
    }
}
