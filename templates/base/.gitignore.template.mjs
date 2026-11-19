import { withDefaults } from "../utils.js";

const contents = ({ postContent }) =>
`# dependencies
node_modules

# yarn
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# eslint
.eslintcache

# misc
.DS_Store

# IDE
.vscode
.idea

# cli
dist
${postContent[0] || ''}`;

export default withDefaults(contents, {
  postContent: ''
})
