import { withDefaults, deepMerge } from "../../../../templates/utils.js";

const defaultTsConfig = {
  "compilerOptions": {
    "target": "es2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "~~/*": ["./*"]
    },
    "plugins": [
      {
        "name": "next"
      },
    ],
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}

const contents = ({ configOverrides }) => {
  // Merge the default config with any overrides
  const finalConfig = deepMerge(defaultTsConfig, configOverrides[0] || {});

  return  `${JSON.stringify(finalConfig, null, 2)}
`;
};

export default withDefaults(contents, {
  configOverrides: {},
});
