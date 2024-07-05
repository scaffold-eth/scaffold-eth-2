export const solidityEnvSetup = `
      - name: Install foundry-toolchain
        uses: foundry-rs/foundry-toolchain@v1
        with:
          version: nightly

      - name: Run foundry node, deploy contracts (& generate contracts typescript output)
        env:
          ETHERSCAN_API_KEY: \${{ secrets.ETHERSCAN_API_KEY }}
        run: yarn chain & yarn deploy
`;
