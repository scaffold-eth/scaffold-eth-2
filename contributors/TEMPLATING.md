# Template files

A Template file is a file to which extensions can add content. Removing content is out of scope for this experiment.

## Template files API

### Template file name

All Template file should be named as \`{original-name.with-extension}.template.mjs\`. This way we can skip those files while copying base and extensions, and process them with the values from the base and the combined extensions.

Note how the extension is `.mjs`. We cover why in it's own section, [.mjs extension](#mjs-extension).

### Template file contents

All Template files should `export default` a function receiving named arguments and returning a string where those input arguments can be used to do string interpolation.

Given multiple extensions can write to the same templates, each of the name argument should expect to receive an array of strings. Note the array might potentially be empty, which would mean no extension is adding values to that template.

Therefore the exported function signature should always be \`(Record<string, string[]>) => string\`

The values from each file writing to the template are placed in the array in the same order the user selected the extensions. This effectively means nested extensions write last.

Also, receiving an array instead of strings give the template itself more control over the final output. Like how the different values should be joined.

Important to note that named arguments could use any arbitrary name. Because of that, we have to provide default values to all those arguments, otherwise missing values would be parsed as the string "undefined". Because we don't know what are the expected names for each template expects.

## Things to note about Template files

### `.mjs` extension

It's important to note the file extension should be `.mjs`. The CLI uses es6 modules, but other packages might use commonjs imports, like Hardhat.

When a package enforces commonjs imports, our templates created within those packages wouldn't work unless we explicitly tell node that it should use es6 imports. Using `.mjs` extensions is the best way we've found to do that.

### Default values

It's a bit annoying having to define an empty array as a default value for all the arguments. To solve this, We've created a utility function that receives the template and expected arguments with their default values, and takes care of it. You can find it at `templates/utils.js`, the function named `withDefaults`.

As a bonus, using this function will throw an error when an [Args file](#args-file-content) is trying to send an argument with a name not expected by the template.

The way it should be used is as follows:

```js
// file.ext.template.mjs
import { withDefaults } from "../path-to/utils.js";

const contents = ({ foo, bar }) =>
  `blah blah
foo value is ${foo}
bar value is ${bar}
blah blah
`;

export default withDefaults(contents, {
  foo: "default foo value",
  bar: "default bar value",
});
```

There's an optional 3rd argument that's for debugging purposes, which is `false` by default. If sent `true`, it will print some information about the arguments received.

⚠️ Important to note that all arguments should be defined in the object sent as the second argument. If an argument is used within the template, but it's not defined in the object, and it's not sent with any args file, it will become the string "undefined". For example:

```js
// file.ext.template.mjs
import { withDefaults } from "../path-to/utils.js";

const contents = ({ foo, bar }) => `${foo} and ${bar}`;

export default withDefaults(contents, {
  foo: "default",
  // bar: 'not defined!'
});

// result: "default and undefined"
```

### Unwanted new lines

Note when you use backticks, "`", to create interpolated strings, new lines are taken as part of the string. Therefore the following string would start and end with extra empty lines:

```ts
const stringWithNewLines = `
woops, there are new lines
`;
```

You can do the following:

```ts
const stringWithoutNewLines = `This string starts without a new line
and ends without new lines`;
```

If you do this, however, prettier will try to indent the backtick. To avoid that you can see We've added a bunch of `// prettier-ignore`s before the template strings.

# Args files

Args files are the files used to add content to Template files.

## Args files API

### Args file name

All Args files should be named as \`{original-name.with-extension}.args.mjs\`. This way we can check, for a given Template file, if any Args files exist.

Note how the extension is `.mjs`, due to the same reasons we needed to use it for template files. Read more about [.mjs extension](#mjs-extension).

Important to note here that the relative path of the Template and Args files **must** be the same. Otherwise the Args file content won't be used. By relative path I mean the path relative to the `base/` path or the `extensions/{extension-name}/` paths. An example:

```
create-dapp-example/
├─ ...
│
├─ templates/
│  ├─ base/
│  │  ├─ some-folder/
│  │  │  ├─ template-at-folder.md.template.mjs
│  │  ├─ template-at-root.md.template.mjs
│  │
│  ├─ extensions/
│  │  ├─ foo/
│  │  │  ├─ some-folder/
│  │  │  │  ├─ template-at-root.md.args.mjs <-- won't work!
│  │  │  │  ├─ template-at-folder.md.args.mjs
│  │  │  ├─ template-at-root.md.args.mjs
│  │  │  ├─ template-at-folder.md.args.mjs <-- won't work!
```

### Args file content

Args files should export an object with key-value pairs where keys are the named argument of the template, and the values are the content you want to send for the given named argument.

This can be accomplished by using named exports instead of explicitly defining the object.

```js
// this
export one = 1
export two = 2

// would be equivalent to
export default { one: 1, two: 2}
```

To avoid issues when named arguments have typos, the `withDefaults` utility will also throw an error when an argument is passed with a name that wasn't expected by the template.

# Args files injection in Template files

For each Template file, we search on the extensions the user selected for the existence of Args files in the exact same relative path. If Args files are found, we combine them into an array.

To see the list of template files and their matching args files, check [TEMPLATE-FILES.md](./TEMPLATE-FILES.md).

We've thought about how the strings should be joined, but an option is to use [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates). We can go as crazy as we want with tagged templates.

# Extension folder anatomy

Inside the folder you will have a mix of normal, templated, and special files and folders.

## Normal files and folders

These are the untouched files and folders you want the extension to add to the final project.
In the case of files, they will be copied to the resulting project and no other extension will be able to touch them.
For folders, they will create the folder with its contents, and other extension will be able to add new files to it.
Templated files can be nested within normal folders to keep the same path in the resulting project.

## Templated files

Templated files are both [Template files](#template-files), and [Args files](#args-files). We use them to write to other files already added by the base project or another extension, or to let other extensions modify a file created by this extension. Just to recap, those files are the ones ending in `*.template.js` (Template file) or `*.args.js` (Args file).

## Special files and folders

The special files and folders are:

- [`package.json` file](#merging-packagejson-files)
- `solidity-frameworks/` folder

# Things worth mentioning

## Rules for template args:

The reason for converting normal file to template is allowing customisation to that file for extension developer.
This customisation can be broadly broken into:

1. **When extending/modifying already declared variables/objects**:

- Use `preContent` (string) for imports and variable declarations
- Use `<name>Overrides` (object) to extend existing variables/objects
- Can reference variables defined in template and `preContent` in two ways:
  - `$$variableName$$` - When variable needs to be used without quotes (expressions/variables)
    - example: `{ accounts: ["$$deployerPrivateKey$$"] }` -> `{ accounts: [deployerPrivateKey] }`
  - `\${variableName}` - When variable needs to be interpolated within a string

<details>
  <summary>

    Example `hardhat.config.js.template.mjs`

  </summary>

```typescript
import { withDefaults } from "../utils";

const defaultConfig = {
  networks: {
    hardhat: {
      enabled: '$$process.env.MAINNET_FORKING_ENABLED === "true"$$', // enabled: process.env.MAINNET_FORKING_ENABLED === "true"
      chainId: 31337,
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/\${providerApiKey}`,
      accounts: ["$$deployerPrivateKey$$"], // ==> accounts: [deployerPrivateKey]
    },
  },
};

export default withDefaults(
  ({ preContent, configOverrides }) => `
${preContent}

const deployerPrivateKey =
  process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const config = ${stringify(deepMerge(defaultConfig, configOverrides[0]))};

export default config;
`,
  {
    preContent: "",
    configOverrides: {},
  },
);

// In extension's args file (hardhat.config.ts.args.mjs)
export const preContent = `
// Custom variables
const CUSTOM_API_KEY = process.env.CUSTOM_API_KEY;
`;

export const configOverrides = {
  networks: {
    hardhat: {
      forking: {
        enabled: '$$process.env.MAINNET_FORKING_ENABLED === "false"$$', // (expression) enabled: process.env.MAINNET_FORKING_ENABLED === "false"
        blockNumber: 1234567,
      },
    },
    customNetwork: {
      url: "https://custom.network",
      accounts: ["$$deployerPrivateKey$$"], // (variable) accounts: [deployerPrivateKey]
      blah: `test \${CUSTOM_API_KEY}`, // (string interpolation) blah: `test ${CUSTOM_API_KEY}`
      verify: {
        etherscan: {
          apiUrl: "https://api.custom-explorer.io",
          apiKey: "$$etherscanApiKey$$",
        },
      },
    },
  },
};
```

</details>

2. When adding new code/logic:

- Use descriptive/sensible `string` arguments. Depending on level of customisation.

<details>
  <summary>

    Example `Component.tsx.template.mjs`

  </summary>

```typescript
export default withDefaults(
  ({ preContent, renderContent }) => `
import { Base } from './Base';
${preContent[0] || ""}

export const Component = () => {
${renderContent}
};
`,
  {
    preContent: "",
    renderContent: "",
  },
);
```

</details>

## Recommended way to handle complex arguments in templates

Most of the time you will use string arguments for templating, but sometimes you will need to add arrays, objects, bigints, etc. You can handle them however you want, but we're recommending to use the table below as a helper.

The `stringify` and `deepMerge` functions used in the examples below should be imported from the `templates/utils.js` file:

> NOTE: If if the template file is `.json` file, you should use `JSON.stringify` instead of `stringify` utility. This makes sure the JSON is formatted correctly.

```javascript
import { stringify, deepMerge } from "../path/to/templates/utils.js";
```

| Pattern                                  | Template                                                                                                                      | Args                                                                                             | Result                                                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Replace an object                        | `const replacedObj = ${stringify(replacedObj[0])}`                                                                            | `const replacedObj = { key1: "Replaced", key2: "Object" }`                                       | `const replacedObj = { key1: "Replaced", key2: "Object" }`                                                      |
| Replace an array                         | `const replacedArr = ${stringify(replacedArr[0])}`                                                                            | `const replacedArr = ["Replaced", "Array"]`                                                      | `const replacedArr = ["Replaced", "Array"]`                                                                     |
| Object, add new entries                  | `const mergedObj = ${stringify(deepMerge({ key1: "value1", key2: "value2"}, objToMerge[0] })};`                               | `const objToMerge = { key3: "Merged", key4: "Object" }`                                          | `const mergedObj = { key1: "value1", key2: "value2", key3: "Merged", key4: "Object" };`                         |
| Array, add new items                     | `const arrWithAdditionalItems = ${stringify(['a', 'b', ...arrayToSpread[0]])}`                                                | `const arrayToSpread = ["Spread", "This"]`                                                       | `const arrWithAdditionalItems = ["a", "b", "Spread", "This"]`                                                   |
| Object, deep merge (Arrays are replaced) | `const deepMergedObj = ${deepMerge({ key1: "value1", key2: "value2", key3: ["value3_0", "value3_1"]}, objToDeepMerge[0] ))};` | `const objToDeepMerge = { key1: "replacedValue_1", key3: ["replacedValue3_0"], key4: "value4" }` | `const deepMergedObj = { key1: "replacedValue_1", key2: "value2", key3: ["replacedValue3_0"], key4: "value4" }` |
| BigInt                                   | `const bigInt = ${stringify(someBigInt[0])};`                                                                                 | `const someBigInt = 123n`                                                                        | `const bigInt = 123n;`                                                                                          |

> NOTE: If the object contains function as a value `stringify` utility truncates it to `[Function keyName]`. In this case we have to use object spread operator while merging the objects and `JSON.stringify` while replacing the objects. Checkout [`next.config.js.template.mjs`](https://github.com/scaffold-eth/create-eth/blob/main/templates/base/packages/nextjs/next.config.js.template.mjs) for an example.

## Merging package.json files

The package we use to merge `package.json` files [merge-packages](https://www.npmjs.com/package/merge-packages) will attempt to find intersections of dependencies. If there is a conflict, the version from the last `package.json` will be taken.

For example:

```
version on file one: ~1.2.3
version on file two: ^1.0.0
resulting version: ~1.2.3

version on file one: ^1.0.0
version on file two: >=1.2.0 <1.3.0
resulting version: ~1.2.0

version on file one: 1.0.0
version on file two: 0.1.0
resulting version: 0.1.0

version on file one: 0.1.0
version on file two: 1.0.0
resulting version: 1.0.0
```

The first and last files are the first and second arguments when we call the function, so we can choose what version we want to win when there's a conflict.

## Filesystem async methods

This is a possible improvement in the speed of the cli. We've used the sync API to avoid adding extra complexity for the proof of concept, but it might be an improvement helping parallelize tasks. For example processing templates in parallel.
