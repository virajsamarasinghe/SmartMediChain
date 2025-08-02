const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying SmartMediChain Fraud Detection Contract...");

    // Get the contract factory
    const SmartMediChainFraudDetection = await ethers.getContractFactory("SmartMediChainFraudDetection");

    // Deploy the contract
    const fraudDetection = await SmartMediChainFraudDetection.deploy();

    await fraudDetection.waitForDeployment();

    const contractAddress = await fraudDetection.getAddress();
    console.log("SmartMediChainFraudDetection deployed to:", contractAddress);

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deployed by:", deployer.address);

    // Setup additional accounts with roles
    const accounts = await ethers.getSigners();
    
    if (accounts.length > 1) {
        // Add managers
        for (let i = 1; i <= Math.min(4, accounts.length - 1); i++) {
            await fraudDetection.addManager(accounts[i].address);
            console.log(`Added manager: ${accounts[i].address}`);
        }

        // Add AI Oracle (last account)
        if (accounts.length > 5) {
            await fraudDetection.addAIOracle(accounts[accounts.length - 1].address);
            console.log(`Added AI Oracle: ${accounts[accounts.length - 1].address}`);
        }
    }

    // Save deployment info
    const deploymentInfo = {
        contractAddress: contractAddress,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        network: "localhost"
    };

    console.log("\nDeployment Info:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    return fraudDetection;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
