# Dockerfile for backend (Node.js)
FROM node:18-slim

COPY src/ /app/src/
COPY package.json /app/
COPY package-lock.json /app/


WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=development
ENV PORT=5000
EXPOSE 5000

CMD ["node", "src/app.js"]
