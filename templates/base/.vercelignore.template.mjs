import { withDefaults } from "../utils.js";

const contents = ({ packageVercelIgnoreContent }) =>
  `# --- Monorepo files ---

.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
.eslintcache
.DS_Store
.vscode
.idea
.vercel

# --- Next.js files ---

# dependencies
packages/nextjs/node_modules
packages/nextjs/.pnp
packages/nextjs/.pnp.js

# testing
packages/nextjs/coverage

# next.js
packages/nextjs/.next/
packages/nextjs/out/

# production
packages/nextjs/build

# misc
packages/nextjs/.DS_Store
packages/nextjs/*.pem

# debug
packages/nextjs/npm-debug.log*
packages/nextjs/yarn-debug.log*
packages/nextjs/yarn-error.log*
packages/nextjs/.pnpm-debug.log*

# local env files
packages/nextjs/.env.local
packages/nextjs/.env.development.local
packages/nextjs/.env.test.local
packages/nextjs/.env.production.local

# typescript
packages/nextjs/*.tsbuildinfo

${packageVercelIgnoreContent.join("\n")}`;

export default withDefaults(contents, {
  packageVercelIgnoreContent: "",
});
