import { withDefaults } from "../../../utils.js";

const contents = ({ solidityEnvSetup }) =>
  `name: Lint

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  ci:
    runs-on: \${{ matrix.os }}

    strategy:
      matrix:
        os: [ubuntu-latest]
        node: [lts/*]

    steps:
      - name: Checkout
        uses: actions/checkout@master

      - name: Setup node env
        uses: actions/setup-node@v3
        with:
          node-version: \${{ matrix.node }}
          cache: yarn

      - name: Install dependencies
        run: yarn install --immutable
      ${solidityEnvSetup.filter(Boolean).join("\n")}
      - name: Run nextjs lint
        run: yarn next:lint --max-warnings=0

      - name: Check typings on nextjs
        run: yarn next:check-types`;

export default withDefaults(contents, {
  solidityEnvSetup: "",
});
