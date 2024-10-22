export const deploymentsScriptsImports = `import { DeployYourContract } from "./DeployYourContract.s.sol";`;
export const deploymentsLogic = `
    DeployYourContract deployYourContract = new DeployYourContract();
    deployYourContract.run();
`;
