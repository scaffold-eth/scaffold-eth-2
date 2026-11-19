---
"create-eth": patch
---

Pin `hardhat-deploy` to `2.0.24` in the Hardhat template. Newer `hardhat-deploy` releases need newer `rocketh` packages than the template has, so `yarn deploy` failed in new Hardhat projects with `HHE202`.
