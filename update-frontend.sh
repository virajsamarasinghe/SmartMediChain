#!/bin/bash

echo "Stopping the frontend container..."
docker-compose stop frontend

echo "Installing react-icons package..."
cd /Users/virajsamarasinghe/Viraj\ Projects/SmartMediChain/frontend
npm install --save react-icons

echo "Rebuilding the frontend container..."
cd /Users/virajsamarasinghe/Viraj\ Projects/SmartMediChain
docker-compose build frontend

echo "Starting the frontend container..."
docker-compose up -d frontend
