#!/bin/bash

echo "Starting SmartMediChain Smart Contract Service..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Compile contracts
echo "Compiling smart contracts..."
npx hardhat compile

# Start Hardhat node in background
echo "Starting Hardhat node..."
npx hardhat node --hostname 0.0.0.0 &
HARDHAT_PID=$!

# Wait for Hardhat node to be ready
echo "Waiting for Hardhat node to be ready..."
sleep 10

# Deploy contracts
echo "Deploying smart contracts..."
npx hardhat run scripts/deploy.js --network localhost

# Keep the script running
echo "Smart contract service is ready!"
echo "Hardhat node PID: $HARDHAT_PID"

# Wait for the Hardhat node process
wait $HARDHAT_PID