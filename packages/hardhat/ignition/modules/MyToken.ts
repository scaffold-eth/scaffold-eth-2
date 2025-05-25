// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const MyTokenModule = buildModule('MyTokenModule', (m) => {
    const initialSupply = m.getParameter('initialSupply', 1_000_000n * 10n ** 18n);

    const token = m.contract('MyToken', [initialSupply]);

    return { token };
});

export default MyTokenModule;
