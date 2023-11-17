module.exports = {
  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['@metamask/eslint-config-browser'],
    },
  ],

  ignorePatterns: ['.cache/', 'public/'],
};
