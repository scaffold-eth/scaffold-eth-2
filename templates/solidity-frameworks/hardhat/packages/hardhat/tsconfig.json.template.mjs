import { withDefaults, deepMerge } from "../../../../utils.js";

const defaultTsConfig = {
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
};

const contents = ({ configOverrides }) => {
  // Merge the default config with any overrides
  const finalConfig = deepMerge(defaultTsConfig, configOverrides[0] || {});

  return `${JSON.stringify(finalConfig, null, 2)}
`;
};

export default withDefaults(contents, {
  configOverrides: {},
});
