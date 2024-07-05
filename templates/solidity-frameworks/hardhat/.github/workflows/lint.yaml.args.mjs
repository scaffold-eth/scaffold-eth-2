export const solidityEnvSetup = `
      - name: Run hardhat node, deploy contracts (& generate contracts typescript output)
        run: yarn chain & yarn deploy

      - name: Run hardhat lint
        run: yarn hardhat:lint --max-warnings=0
`;
