import { withDefaults } from "../../../../utils.js";

const contents = ({postContent}) =>
`# dependencies
node_modules

# env files
.env

# coverage
coverage
coverage.json

# generated contract types
types
generated

# hardhat files
cache
artifacts

# zkSync files
artifacts-zk
cache-zk

# local deployments
deployments/default
deployments/localhost

# typescript
*.tsbuildinfo

# other
temp
${postContent[0] || ''}`;

export default withDefaults(contents, {
  postContent: ''
})