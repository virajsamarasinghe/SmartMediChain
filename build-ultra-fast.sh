#!/bin/bash

# Ultra-Fast BuildKit Build Script using docker buildx bake

echo "⚡ Starting ultra-fast BuildKit builds with docker buildx bake..."

# Enable BuildKit
export DOCKER_BUILDKIT=1

# Create buildx builder with advanced features
if ! docker buildx ls | grep -q "smartmedichain-ultra"; then
    echo "🏗️  Creating advanced BuildKit builder..."
    docker buildx create \
        --name smartmedichain-ultra \
        --driver docker-container \
        --use \
        --bootstrap
fi

# Create bake file for parallel builds
cat > docker-bake.hcl << 'EOF'
group "default" {
  targets = ["backend", "ai-model-api", "frontend", "smart-contract"]
}

target "backend" {
  context = "./backend"
  dockerfile = "Dockerfile"
  target = "final"
  cache-from = ["type=local,src=/tmp/.buildx-cache/backend"]
  cache-to = ["type=local,dest=/tmp/.buildx-cache/backend,mode=max"]
  tags = ["smartmedichain/backend:latest"]
}

target "ai-model-api" {
  context = "./ai-model-api"
  dockerfile = "Dockerfile"
  target = "final"
  cache-from = ["type=local,src=/tmp/.buildx-cache/ai-model-api"]
  cache-to = ["type=local,dest=/tmp/.buildx-cache/ai-model-api,mode=max"]
  tags = ["smartmedichain/ai-model-api:latest"]
}

target "frontend" {
  context = "./frontend"
  dockerfile = "Dockerfile"
  target = "dev"
  cache-from = ["type=local,src=/tmp/.buildx-cache/frontend"]
  cache-to = ["type=local,dest=/tmp/.buildx-cache/frontend,mode=max"]
  tags = ["smartmedichain/frontend:latest"]
}

target "smart-contract" {
  context = "./smart-contract"
  dockerfile = "Dockerfile"
  target = "final"
  cache-from = ["type=local,src=/tmp/.buildx-cache/smart-contract"]
  cache-to = ["type=local,dest=/tmp/.buildx-cache/smart-contract,mode=max"]
  tags = ["smartmedichain/smart-contract:latest"]
}
EOF

# Create cache directory
mkdir -p /tmp/.buildx-cache

echo "🚀 Building all services in parallel with maximum cache optimization..."

# Build all services in parallel with advanced caching
docker buildx bake \
    --progress=plain \
    --load

echo "✅ Ultra-fast build completed!"

# Show cache usage
echo "📊 BuildKit cache usage:"
du -sh /tmp/.buildx-cache/* 2>/dev/null || echo "No cache data yet"

echo "🎉 All services built with maximum speed!"
echo "Run 'docker-compose up' to start the services."

# Clean up bake file
rm -f docker-bake.hcl