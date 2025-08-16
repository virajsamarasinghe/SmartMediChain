# Dockerfile for smart-contract (Hardhat)
FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Make the startup script executable
RUN chmod +x start.sh

EXPOSE 8545
CMD ["./start.sh"]
