import { stringify, withDefaults } from '../../../utils.js'

const contents = ({ extraPlugins, extraCompilerOptions }) => `${stringify({
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
      ...extraPlugins[0]
    ],
    ...extraCompilerOptions[0]
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
})}`

export default withDefaults(contents, {
  extraPlugins: [],
  extraCompilerOptions: {}
})
