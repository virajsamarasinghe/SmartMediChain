#!/bin/bash

# Ultra-Fast Docker Build Script with BuildKit for SmartMediChain

echo "🚀 Starting BuildKit-optimized Docker builds..."

# Enable BuildKit for maximum performance
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Create buildx builder if it doesn't exist
if ! docker buildx ls | grep -q "smartmedichain"; then
    echo "📦 Creating BuildKit builder..."
    docker buildx create --name smartmedichain --use
fi

# Use the custom builder
docker buildx use smartmedichain

echo "⚡ Building services with BuildKit parallel processing..."

# Build with maximum parallelism and cache optimization
docker-compose build \
    --parallel \
    --compress \
    --build-arg BUILDKIT_INLINE_CACHE=1

echo "✅ Build completed!"

# Show build cache usage
echo "📊 Build cache usage:"
docker system df

echo "🎉 All services built successfully with BuildKit!"
echo "Run 'docker-compose up' to start the services."

# Optional: Clean up old build cache (uncomment if needed)
# echo "🧹 Cleaning up old build cache..."
# docker builder prune -f --filter until=24h