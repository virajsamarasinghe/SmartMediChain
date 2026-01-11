echo "Starting SmartMediChain Fraud Detection API..."

if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

if [ ! -f "app.py" ]; then
    echo "Please run this script from the ai-model-api directory"
    exit 1
fi

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

pip install --upgrade pip

echo "Installing dependencies..."
pip install -r requirements.txt

mkdir -p models
mkdir -p logs


if [ ! -f "models/fraud_detection_model.pkl" ]; then
    echo "Fraud detection model not found at models/fraud_detection_model.pkl"
    echo "Please ensure your trained logistic regression model is placed in the models directory."
    exit 1
else
    echo "Fraud detection model found."
fi

# Start the API
echo "Starting Fraud Detection API on port 5001..."
python app.py
