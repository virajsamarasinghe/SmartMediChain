#!/bin/bash

# SmartMediChain AI Model API Startup Script

echo "🚀 Starting SmartMediChain AI Model API..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "app.py" ]; then
    echo "❌ Please run this script from the ai-model-api directory"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade pip
pip install --upgrade pip

# Install requirements
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Create models directory if it doesn't exist
mkdir -p models
mkdir -p logs

# Check if models exist, if not train them
if [ ! -f "models/model.pkl" ]; then
    echo "🧠 Training models (this may take a few minutes)..."
    python train_model.py
else
    echo "✅ Models already exist. Skipping training."
fi

# Start the API
echo "🌟 Starting AI Model API on port 5001..."
python app.py
