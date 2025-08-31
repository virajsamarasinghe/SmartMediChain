# Dockerfile for backend (Node.js)
FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (not just production)
RUN npm install

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=development
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "src/app.js"]
