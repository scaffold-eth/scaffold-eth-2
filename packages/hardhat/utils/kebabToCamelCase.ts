/**
 * Returns camelCase string for corresponding kebab-case string
 * eg : arbitrum-goerli -> arbitrumGoerli
 * @param str - string to be converted
 */
export function kebabToCamelCase(str: string) {
  // The regular expression `/-([a-z])/g` matches all instances of a dash followed by a lowercase letter.
  return str.replace(/-([a-z])/g, function (match, letter) {
    return letter.toUpperCase();
  });
}
