#!/bin/bash

# Backend startup script
# This script seeds the database and then starts the server

echo "🚀 Starting SmartMediChain Backend..."

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
while ! nc -z mongo 27017; do
  echo "MongoDB not ready, waiting 2 seconds..."
  sleep 2
done

echo "✅ MongoDB is ready!"

# Run database seeding
echo "🌱 Seeding database..."
npm run seed

# Check if seeding was successful
if [ $? -eq 0 ]; then
  echo "✅ Database seeding completed successfully"
else
  echo "❌ Database seeding failed, but continuing..."
fi

# Start the application
echo "🚀 Starting the backend server..."
exec npm start