# Main concepts

I propose we treat anything other than "base" as an extension. That way we don't need to make distinctions between solidity frameworks or any other kind of extension.

This change should make it easier to grow the options we provide our users without having to classify extensions by category.

This change requires a new file, `src/config.ts`, where a few things about the extensions are defined, e.g. the sequence of questions about extensions.

## Nested extensions

We can add extensions of extensions, just by adding an `/extensions` folder inside an existing extension. For example, adding [next-auth][1] as an extension for next would look something like the following:

```text
create-dapp-example/
├─ src/
│  ├─ ...
│
├─ templates/
│  ├─ base/
│  ├─ extensions/
│  │  ├─nextjs
│  │  ├─ ...
│  │  ├─ extensions/
│  │  │  ├─ next-auth/
│  │  │  ├─ ...
```

## Extending extensions

> sorry for the confusing naming

Extensions can also inherit (or extend) another extension. The goal of this feature is that two extensions can share files or nested extensions without duplication. An example of this could be hardhat and foundry, which are two different extensions, but both of them could have a shared UI to debug smart contracts.

The file structure could be like this:

```text
create-dapp-example/
├─ src/
│  ├─ ...
│
├─ templates/
│  ├─ base/
│  ├─ extensions/
│  │  ├─ foundry/
│  │  │  ├─ config.json <- important to declare the `extends` field here
│  │  │  ├─ ...
│  │  ├─ hardhat/
│  │  │  ├─ config.json <- important to declare the `extends` field here
│  │  │  ├─ ...
│  │  ├─ common/
│  │  │  ├─ extensions/
│  │  │  │  ├─ possible-shared-nested-extension/
│  │  │  │  ├─ ...
│  │  │  ├─ shared-file.md
```

For `foundry` and `hardhat` extensions to inherit from `common`, they need to add the `extends` field to the config.json file.

```json
{
  "extends": "common"
}
```

# Config files

There's one main `src/config.ts` file to configure the questions shown to the user.

For each extension there is an optional `templates/extensions/{extensionName}/config.json` file providing information about the specific extension.

| ⚠️ Note how the extension config file is a JSON file

## Config files API

### `src/config.ts`

Have a look at `src/types.ts#Config` or the file itself.

Just a quick note to mention that adding `null` as an item in the `extensions` property will show the "None" option to the user. That option doesn't add any extension for the given question.

### `{extension}/config.json`

Since these files can't be .ts, the API is not typed. However, there are certain properties that are used in the code.

Those properties are:

- `name`: the string to be used when showing the package name to the user via the cli, as well as for error reporting.

- `extends`: the name of a different extension used as "parent extension". Read more at the [Extending extensions](#extending-extensions) section

Note that all values are optional, as well as the file itself.

| ⚠️ TODO list when new properties are added to config.json:
| - Update this document
| - Update the ExtensionDescriptor type at /src/types.ts
| - Update the src/utils/extensions-tree.ts file so the new field from the config is actually added into the extension descriptor

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

It's a bit annoying having to define an empty array as a default value for all the arguments. To solve this, I've created a utility function that receives the template and expected arguments with their default values, and takes care of it. You can find it at `templates/utils.js`, the function named `withDefaults`.

As a bonus, using this function will throw an error when an [Args file](#args-file-content) is trying to send an argument with a name not expected by the template.

The way it should be used is as follows:
```js
// file.ext.template.mjs
import { withDefaults } from '../path-to/utils.js'

const contents = ({ foo, bar }) =>
`blah blah
foo value is ${foo}
bar value is ${bar}
blah blah
`

export default withDefaults(contents, {
  foo: 'default foo value',
  bar: 'default bar value'
})
```

There's an optional 3rd argument that's for debugging purposes, which is `false` by default. If sent `true`, it will print some information about the arguments received.

⚠️ Important to note that all arguments should be defined in the object sent as the second argument. If an argument is used within the template, but it's not defined in the object, and it's not sent with any args file, it will become the string "undefined". For example:

```js
// file.ext.template.mjs
import { withDefaults } from '../path-to/utils.js'

const contents = ({ foo, bar }) => `${foo} and ${bar}`

export default withDefaults(contents, {
  foo: 'default',
  // bar: 'not defined!'
})

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

If you do this, however, prettier will try to indent the backtick. To avoid that you can see I've added a bunch of `// prettier-ignore`s before the template strings.

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

For each Template file, we search on the extensions the user selected for the existence of Args files in the exact same relative path. If there are multiple Args files, we combine them into an array

I've thought about how the strings should be joined, but an option is to use [tagged templates](4). We can go as crazy as we want with tagged templates.

# Extension folder anatomy

When creating a new extension, simply create a new folder under `templates/extensions` with the name you want the extension to have.

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
- [`config.json` file](#extensionconfigjson)
- [`extensions/` folder](#nested-extensions)

# Things worth mentioning

## Merging package.json files

The package we use to merge package.json files [merge-packages](3) will use the last version of a dependency given a conflict. For example:

```
version on file one: 1.0.0
version on file two: 0.1.0
resulting version: 0.1.0

version on file one: 0.1.0
version on file two: 1.0.0
resulting version: 1.0.0
```

The first and last files are the first and second arguments when we call the function, so we can choose what version we want to win when there's a conflict.

## Filesystem async methods

This is a possible improvement in the speed of the cli. I've used the sync API to avoid adding extra complexity for the proof of concept, but it might be an improvement helping parallelize tasks. For example processing templates in parallel.

[1]: https://github.com/nextauthjs/next-auth
[2]: https://www.prisma.io/
[3]: https://github.com/zppack/merge-packages
[4]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
