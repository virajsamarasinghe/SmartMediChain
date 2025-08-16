const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying SmartMediChainFraudDetection contract...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const SmartMediChainFraudDetection = await ethers.getContractFactory("SmartMediChainFraudDetection");
  const contract = await SmartMediChainFraudDetection.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("SmartMediChainFraudDetection deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deployedAt: new Date().toISOString(),
    network: "localhost",
    blockNumber: await ethers.provider.getBlockNumber()
  };

  // Create deployment directory if it doesn't exist
  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  // Save deployment info
  fs.writeFileSync(
    path.join(deploymentDir, "SmartMediChainFraudDetection.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments/SmartMediChainFraudDetection.json");

  // Grant AI_ORACLE_ROLE to the deployer for testing
  const AI_ORACLE_ROLE = await contract.AI_ORACLE_ROLE();
  await contract.grantRole(AI_ORACLE_ROLE, deployer.address);
  console.log("Granted AI_ORACLE_ROLE to deployer for testing");

  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((contractAddress) => {
    console.log("Deployment completed successfully!");
    console.log("Contract Address:", contractAddress);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });