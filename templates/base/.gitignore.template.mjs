const contents = () => 
`node_modules

# dependencies, yarn, etc
# yarn / eslint
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
.eslintcache
.vscode/**
.DS_Store
.vscode
.idea
.vercel`;

export default contents
