module.exports = {
  arrowParens: "avoid",
  printWidth: 120,
  tabWidth: 2,
  trailingComma: "all",
  importOrder: ["^react$", "^next/(.*)$", "<THIRD_PARTY_MODULES>", "^@heroicons/(.*)$", "^~~/(.*)$"],
  importOrderSortSpecifiers: true,
  plugins: [require.resolve("@trivago/prettier-plugin-sort-imports")],
};
