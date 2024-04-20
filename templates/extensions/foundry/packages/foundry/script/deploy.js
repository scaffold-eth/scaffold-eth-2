const { execSync } = require("node:child_process");
require("dotenv").config();

const accountAndSender = process.env.DEPLOYER_PUBLIC_KEY;

async function main() {
  let deploymentAddendum = "";

  let slicedArgs = process.argv.slice(2);

  if (process.argv.length > 2) {
    deploymentAddendum = " ";
    for (let i = 0; i < slicedArgs.length; i++) {
      deploymentAddendum +=
        i !== slicedArgs.length - 1 ? slicedArgs[i] + " " : slicedArgs[i];
    }
  }

  let commands = [
    "forge build --build-info --build-info-path out/build-info/",

    "forge script script/Deploy.s.sol --rpc-url ${1:-default_network} --broadcast --legacy" +
      deploymentAddendum,
    "node script/generateTsAbis.js",
  ];

  for (let i = 0; i < slicedArgs.length; i++) {
    if (slicedArgs[i] === "--network") {
      commands[1] =
        "forge script script/Deploy.s.sol --rpc-url " +
        slicedArgs[i + 1] +
        ` --account ${accountAndSender} --sender ${accountAndSender} --broadcast --legacy`;
    }

    if (slicedArgs[i] === "--verify") {
      commands[1] += "--verify";
    }
  }

  console.log("Deploying contracts...");

  for (let i = 0; i < commands.length; i++) {
    console.log("Executing " + commands[i]);
    let output = execSync(`${commands[i]}`);
    console.log(output.toString());
    console.log("Finished executing " + commands[i]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
