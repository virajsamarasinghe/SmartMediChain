# SmartMediChain Fraud Detection API

This directory contains the AI/ML fraud detection API that provides intelligent fraud detection for procurement orders in the SmartMediChain system using a logistic regression model.

## Features

- **Fraud Detection**: Detect fraudulent procurement orders using machine learning
- **Risk Assessment**: Classify orders by risk level (LOW, MEDIUM, HIGH)
- **Confidence Scoring**: Provide confidence scores for predictions
- **Detailed Reasoning**: Explain why an order is flagged as fraudulent

## Setup

### 1. Install Dependencies

```bash
cd ai-model-api
pip install -r requirements.txt
```

### 2. Place Your Trained Model

Ensure your trained logistic regression fraud detection model is placed at:

```
./models/fraud_detection_model.pkl
```

### 3. Configure Environment

The `.env` file is already configured for fraud detection:

```bash
# Fraud Detection AI Model API Configuration
FLASK_ENV=development
FLASK_DEBUG=True
AI_MODEL_PORT=5001
AI_MODEL_HOST=0.0.0.0

# Fraud Detection Model Paths
FRAUD_MODEL_PATH=./models/fraud_detection_model.pkl
FRAUD_SCALER_PATH=./models/fraud_scaler.pkl
```

### 4. Start the API

Using the startup script:

```bash
chmod +x start.sh
./start.sh
```

Or directly:

```bash
python app.py
```

The API will start on `http://localhost:5001` by default.

## API Endpoints

### Health Check

- **GET** `/` - Check if the API is running and fraud detection model is loaded

### Fraud Detection

- **POST** `/predict/fraud-detection` - Detect fraud in procurement orders

  ```json
  {
    "ordered_quantity": 500,
    "current_stock": 200,
    "min_required": 100,
    "max_capacity": 1000,
    "unit_cost": 15.5,
    "avg_usage_per_day": 25,
    "restock_lead_time": 7
  }
  ```

  **Response:**

  ```json
  {
    "status": "success",
    "result": {
      "is_fraud": false,
      "risk_level": "LOW",
      "confidence_score": 85,
      "reasons": [],
      "probability": [[0.85, 0.15]]
    },
    "timestamp": "2024-01-01T12:00:00"
  }
  ```

## Model Features

The fraud detection model uses the following features:

1. **ordered_quantity**: The quantity being ordered
2. **current_stock**: Current stock level
3. **min_required**: Minimum required stock level
4. **max_capacity**: Maximum storage capacity
5. **unit_cost**: Cost per unit
6. **avg_usage_per_day**: Average daily usage
7. **restock_lead_time**: Lead time for restocking

## Fraud Detection Logic

The model detects two main types of fraud:

1. **Over Unit Price**: When the unit cost is significantly higher than normal
2. **Over Stock Order**: When the ordered quantity is excessive compared to:
   - Maximum storage capacity
   - Estimated need based on usage patterns
   - Current stock levels

## Risk Levels

- **LOW**: Confidence >= 90% and not fraud, or confidence < 70%
- **MEDIUM**: Confidence between 70-90%
- **HIGH**: Confidence >= 90% and fraud detected

## Integration with Backend

The backend connects to this fraud detection API through the `aiModelService.js` service:

```javascript
// Analyze order for fraud
const result = await AIModelService.analyzeOrderForFraud(orderData);
```

The blockchain controller uses this for order validation:

```javascript
// Call AI fraud detection
const aiResult = await this.callAIFraudDetection(orderData);
```

## Docker Support

Build and run with Docker:

```bash
# Build the image
docker build -t smartmedichain-fraud-api .

# Run the container
docker run -p 5001:5001 smartmedichain-fraud-api
```

Or use with docker-compose:

```bash
docker-compose up ai-model-api
```

## Dependencies

Main libraries used:

- **Flask**: Web framework for the API
- **Flask-CORS**: Cross-origin resource sharing
- **scikit-learn**: Machine learning library
- **joblib**: Model serialization
- **numpy**: Numerical computations
- **pandas**: Data manipulation

## Troubleshooting

### Common Issues

1. **Model not found**: Ensure `fraud_detection_model.pkl` exists in the `./models/` directory
2. **Port conflicts**: Change `AI_MODEL_PORT` in `.env` if 5001 is already in use
3. **Missing features**: Ensure all required features are provided in the request

### Logs

The API provides detailed logging for:

- Model loading status
- Prediction requests and results
- Error messages and stack traces

## Model Performance

The logistic regression model provides:

- Fast prediction times (< 100ms)
- Interpretable results
- Confidence scores for risk assessment
- Detailed fraud reasoning

## Future Enhancements

- Support for additional fraud patterns
- Real-time model updates
- Historical fraud pattern analysis
- Integration with external fraud databases
- Advanced ensemble methods
