# Dockerfile for frontend (React)
FROM node:18-slim

COPY public/ /app/public/
COPY src/ /app/src/
COPY package.json /app/
COPY package-lock.json /app/


WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
