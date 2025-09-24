# Dockerfile for backend (Node.js)
FROM node:18-slim

# Install netcat for database connection checking
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (not just production)
RUN npm install

# Copy source code
COPY . .

# Make startup script executable
RUN chmod +x start.sh

# Set environment
ENV NODE_ENV=development
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the application using the startup script
CMD ["./start.sh"]
