---
"create-eth": patch
---

Pin `hardhat-deploy` to `~2.0.30` in the Hardhat template. Newer `hardhat-deploy` releases (2.1.0 and up) need newer `rocketh` packages than the template has, which breaks `yarn deploy` and tests in new projects.
