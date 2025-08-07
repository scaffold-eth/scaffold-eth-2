import { inspect } from "util";
import createDeepMerge from "@fastify/deepmerge";

const getType = (value) => {
  if (Array.isArray(value)) {
    return 'array';
  }
  if (value === null) {
    return 'null';
  }
  return typeof value;
};

const getCallerFile = () => {
  const stackTrace = new Error().stack;
  const callerLine = stackTrace
    ?.split('\n')
    ?.slice(1)
    ?.find(line => !line.includes('utils.js'));
  
  if (!callerLine) return 'unknown';
  
  const match = callerLine.match(/file:\/\/(.*?):\d+:\d+/);
  if (!match) return 'unknown';
  
  const fullPath = match[1].replace(/^\/+|\/+$/g, '');
  
  const parts = fullPath.split('/');
  const templatesIndex = parts.lastIndexOf('templates');
  
  if (templatesIndex === -1) return fullPath;
  
  return parts.slice(templatesIndex).join('/');
};

// https://github.com/fastify/deepmerge?tab=readme-ov-file#mergearray Example 1
const replaceByClonedSource = options => {
  const clone = options.clone;
  return (_target, source) => {
    return clone(source);
  };
};

const deepMergeWithoutKeysOrder = createDeepMerge({ mergeArray: replaceByClonedSource });

export const deepMerge = (...args) => {
  const mergedConfig = deepMergeWithoutKeysOrder(...args);
  const finalConfig = {};
  for (const key of Object.keys(args[0])) {
    finalConfig[key] = mergedConfig[key];
  }
  for (const key of Object.keys(mergedConfig)) {
    if (!(key in finalConfig)) {
      finalConfig[key] = mergedConfig[key];
    }
  }
  return finalConfig;
};

export const withDefaults =
  (template, expectedArgsDefaults, debug = false) => {
  expectedArgsDefaults.solidityFramework = ""
  console.log("The expectedArgsDefault are:"
  )
    const callerFile = getCallerFile();

    return receivedArgs => {
    const argsWithDefault = Object.fromEntries(
      Object.entries(expectedArgsDefaults).map(([argName, argDefault]) => [
        argName,
        receivedArgs[argName] ?? [argDefault],
      ]),
    );

    if (debug) {
      console.log(argsWithDefault, expectedArgsDefaults, receivedArgs);
    }

    const expectedArgsNames = Object.keys(expectedArgsDefaults);
    Object.keys(receivedArgs).forEach(receivedArgName => {
      if (!expectedArgsNames.includes(receivedArgName)) {
        throw new Error(
          `Template ${callerFile} received unexpected argument \`${receivedArgName}\`. Expected only ${expectedArgsNames
            .map(name => `\`${name}\``)
            .join(", ")}`,
        );
      }

      const receivedType = getType(receivedArgs[receivedArgName][0]);
      const expectedType = getType(expectedArgsDefaults[receivedArgName]);

      if (receivedType !== expectedType) {
        throw new Error(
          `Template ${callerFile} argument \`${receivedArgName}\` has wrong type. Expected ${
            expectedType
          } but received ${receivedType}.`,
        );
      }
    });

    return template(argsWithDefault);
  };
};

const addComments = (val, comments = {}) => {
  let str = inspect(val, {
    depth: null,
    compact: false,
    maxArrayLength: null,
    maxStringLength: null,
  });

  if (Object.keys(comments).length === 0) {
    return str;
  }

  // Add comments above their respective properties
  // Create a map of all property paths in the object
  const pathMap = new Map();

  // Process flat properties first
  Object.keys(comments)
    .filter(key => !key.includes("."))
    .forEach(prop => {
      const topLevelPropertyRegex = new RegExp(`(^|\\n)(\\s*)(${prop}):\\s`, "g");
      // Matches: "\n  propertyName: "
      let match;

      while ((match = topLevelPropertyRegex.exec(str)) !== null) {
        // Verify this is a top-level property (indentation level check)
        if (match[2].length === 2) {
          const position = match.index + (match[1] ? match[1].length : 0);
          pathMap.set(prop, {
            position,
            indent: match[2],
            comment: comments[prop],
          });
        }
      }
    });

  // Process nested properties
  Object.keys(comments)
    .filter(key => key.includes("."))
    .forEach(path => {
      const parts = path.split(".");

      // Start by finding the top-level object
      let currentPath = parts[0];
      const objectStartRegex = new RegExp(`(^|\\n)(\\s*)(${currentPath}):\\s*\\{`, "g");
      // Matches: "\n  objectName: {"
      let match = objectStartRegex.exec(str);

      if (!match) return; // Top object not found

      let position = match.index + match[0].length;
      let baseIndent = match[2];

      // Handle special case for paths ending with a dot (comment for the object itself)
      if (parts.length === 2 && parts[1] === "") {
        // This is a comment for the object itself (e.g., "rpcOverrides.")
        // Position should be right after the opening brace, with proper newline
        pathMap.set(path, {
          position: position,
          indent: baseIndent + "  ", // Indent one level deeper
          comment: comments[path],
          isObjectComment: true, // Flag to handle special formatting
          objectIndent: baseIndent, // Store the indentation of the object itself
        });
        return;
      }

      // Navigate through each nested level
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        const expectedIndent = baseIndent + "  ".repeat(i);

        const nestedPropertyRegex = new RegExp(`(\\n)(${expectedIndent})(${part}):\\s`, "g");
        nestedPropertyRegex.lastIndex = position; // Start search from current position
        // Matches: "\n    nestedProperty: " (with the correct indentation)
        match = nestedPropertyRegex.exec(str) || match;
        if (!match && part !== "") break; // Property not found at this level
        // If this is the target property (last in path), store its info
        if (i === parts.length - 1) {
          // The position should be right after the newline character
          const exactPosition = match
            ? match.index + match[1].length
            : part === ""
              ? position
              : position + parts[i - 1].length + 3;

          pathMap.set(path, {
            position: exactPosition,
            indent: match ? match[2] : expectedIndent,
            comment: comments[path],
          });
        } else {
          // Otherwise, continue down the path
          position = match.index + match[0].length;
        }
      }
    });

  // Apply comments in reverse order of position (to maintain correct indices)
  const sortedPaths = Array.from(pathMap.entries()).sort((a, b) => b[1].position - a[1].position);

  for (const [path, info] of sortedPaths) {
    const { position, indent, comment, isObjectComment, objectIndent } = info;
    const commentBlock = comment
      .split("\n")
      .map(line => `${indent}// ${line}`)
      .join("\n");

    // Insert the comment before the property, ensuring it's on a new line
    if (isObjectComment) {
      // For object comments, add a newline after the brace and ensure proper indentation
      // First, find the position of the closing brace
      const closingBracePos = str.indexOf("}", position);

      if (closingBracePos !== -1) {
        // Insert comment after opening brace
        str =
          str.slice(0, position) +
          "\n" +
          commentBlock +
          "\n" +
          // Fix the closing brace indentation - using the stored objectIndent
          str.slice(position, closingBracePos) +
          objectIndent +
          str.slice(closingBracePos);
      } else {
        // Fallback if closing brace not found
        str = str.slice(0, position) + "\n" + commentBlock + "\n" + str.slice(position);
      }
    } else {
      str = str.slice(0, position) + commentBlock + "\n" + str.slice(position);
    }
  }

  return str;
};

const prepareVariables = str => {
  return str
    .replace(/"\$\$([^"]+)\$\$"/g, "$1")
    .replace(/'\$\$([^']+)\$\$'/g, "$1")
    .replace(/(['"])(.*?\$\{.*?\}.*?)\1/g, "`$2`");
};

export const stringify = (val, comments = {}) => prepareVariables(addComments(val, comments));
