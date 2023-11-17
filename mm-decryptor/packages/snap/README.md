# TypeScript Example Snap

This snap demonstrates how to develop a snap with TypeScript. It is a simple
snap that displays a confirmation dialog when the `hello` JSON-RPC method is
called.

## Testing

The snap comes with some basic tests, to demonstrate how to write tests for
snaps. To test the snap, run `yarn test` in this directory. This will use
[`@metamask/snaps-jest`](https://github.com/MetaMask/snaps/tree/main/packages/snaps-jest)
to run the tests in `src/index.test.ts`.
