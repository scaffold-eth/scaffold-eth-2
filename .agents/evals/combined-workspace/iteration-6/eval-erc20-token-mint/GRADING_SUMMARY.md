# ERC-20 Token Mint Eval — Grading Summary (Iteration 6)

## Results Table

| Assertion | with_skill R1 | with_skill R2 | with_skill R3 | without_skill R1 | without_skill R2 | without_skill R3 | Discriminating? |
|---|---|---|---|---|---|---|---|
| 1. named-imports | PASS | PASS | PASS | FAIL | FAIL | FAIL | **YES** |
| 2. erc20-permit | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | No |
| 3. dynamic-decimals | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | No |
| 4. format-helper | PASS | PASS | PASS | PASS | PASS | PASS | No |
| 5. update-override | PASS | PASS | PASS | PASS | PASS | PASS | No |
| 6. erc20-capped | PASS | PASS | PASS | PASS | PASS | PASS | No |
| 7. se2-hooks | PASS | PASS | PASS | PASS | PASS | PASS | No |
| 8. deploy-script | PASS | PASS | PASS | PASS | PASS | PASS | No |
| 9. mint-transfer-ui | PASS | PASS | PASS | PASS | PASS | PASS | No |
| 10. ownable-v5 | PASS | PASS | PASS | PASS | PASS | PASS | No |

## Score Summary

| Run | Passed | Failed | Pass Rate |
|---|---|---|---|
| with_skill run-1 | 8 | 2 | 0.80 |
| with_skill run-2 | 8 | 2 | 0.80 |
| with_skill run-3 | 8 | 2 | 0.80 |
| without_skill run-1 | 7 | 3 | 0.70 |
| without_skill run-2 | 7 | 3 | 0.70 |
| without_skill run-3 | 7 | 3 | 0.70 |

## Aggregate

| Group | Avg Pass Rate |
|---|---|
| with_skill | 0.80 |
| without_skill | 0.70 |
| **Delta** | **+0.10** |

## Discriminating Assertions

Only **1 out of 10** assertions discriminated between with_skill and without_skill:

1. **named-imports** (3/3 with_skill pass, 0/3 without_skill pass): The skill consistently produces `import {ERC20} from "..."` named import syntax, while without the skill all runs use `import "..."` wildcard imports. This is a **perfectly discriminating** assertion.

## Non-Discriminating Assertions

- **erc20-permit** (0/6 total): Neither group implements ERC20Permit. This assertion has zero signal.
- **dynamic-decimals** (0/6 total): All runs hardcode `18` instead of reading `decimals()` from the contract. Zero signal.
- **format-helper** (6/6 total): All runs create a `formatTokenAmount` helper. Both groups converge on this pattern naturally.
- **update-override** (6/6 total): N/A for all runs since none use ERC20Permit. All pass by default.
- **erc20-capped** (6/6 total): All runs use ERC20Capped. Both groups handle this correctly.
- **se2-hooks** (6/6 total): All runs use SE-2 hooks. This is baseline behavior from AGENTS.md guidance.
- **deploy-script** (6/6 total): All runs produce correct deploy scripts. Baseline behavior.
- **mint-transfer-ui** (6/6 total): All runs include both mint and transfer. Baseline behavior.
- **ownable-v5** (6/6 total): All runs use the OZ v5 Ownable(address) pattern. Both groups handle this.

## Additional Observations

- The with_skill runs also consistently include the `_update` override for ERC20Capped (required for OZ v5 compilation), while the without_skill runs omit it. This is not captured by the assertions (assertion 5 is N/A for all since none use ERC20Permit), but it is a real quality difference — the without_skill Solidity contracts would fail to compile with OpenZeppelin v5.
- The skill's impact is narrow but consistent: it primarily ensures correct Solidity import style (named imports with curly braces) and correct _update overrides.
