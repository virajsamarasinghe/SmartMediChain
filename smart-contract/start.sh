#!/bin/bash

echo "Starting SmartMediChain Smart Contract Service..."

# Start Hardhat node in background
echo "Starting Hardhat node..."
npx hardhat node --hostname 0.0.0.0 &
HARDHAT_PID=$!

# Wait for Hardhat node to be ready
echo "Waiting for Hardhat node to be ready..."
sleep 5

# Deploy contracts
echo "Deploying smart contracts..."
npx hardhat run scripts/deploy.js --network localhost

# Keep the script running
echo "Smart contract service is ready!"
echo "Hardhat node PID: $HARDHAT_PID"

# Wait for the Hardhat node process
wait $HARDHAT_PID