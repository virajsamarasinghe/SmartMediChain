# SmartMediChain AI Model API

This directory contains the AI/ML model API that provides intelligent predictions and recommendations for the SmartMediChain system.

## Features

- **Medicine Demand Prediction**: Predict future demand for medicines based on historical data
- **Inventory Optimization**: Recommend optimal stock levels for medicines
- **Smart Reordering**: Intelligent suggestions for when and how much to reorder
- **Analytics Insights**: AI-powered insights for business intelligence

## Setup

### 1. Install Dependencies

```bash
cd ai-model-api
pip install -r requirements.txt
```

### 2. Train the Models

Before running the API, you need to train the models:

```bash
python train_model.py
```

This will create sample data and train models for:
- Medicine demand prediction
- Inventory optimization

The trained models will be saved in the `./models/` directory.

### 3. Configure Environment

Copy the `.env` file and adjust the settings as needed:

```bash
cp .env.example .env
```

### 4. Start the API

```bash
python app.py
```

The API will start on `http://localhost:5001` by default.

## API Endpoints

### Health Check
- **GET** `/` - Check if the API is running and model is loaded

### Model Management
- **POST** `/model/load` - Load a specific model
  ```json
  {
    "model_path": "./models/model.pkl",
    "scaler_path": "./models/scaler.pkl"
  }
  ```

### Predictions
- **POST** `/predict` - General prediction endpoint
  ```json
  {
    "features": [value1, value2, ...]
  }
  ```

- **POST** `/predict/medicine-demand` - Predict medicine demand
  ```json
  {
    "historical_sales": 50,
    "current_stock": 100,
    "season_factor": 1.2,
    "trend_factor": 1.1,
    "price": 25.50,
    "days_since_last_order": 7
  }
  ```

- **POST** `/predict/inventory-optimization` - Get optimal inventory levels
  ```json
  {
    "medicines": [
      {
        "id": "medicine_id",
        "name": "Medicine Name",
        "current_stock": 50,
        "avg_daily_sales": 5,
        "lead_time_days": 7,
        "safety_stock_factor": 1.5,
        "cost_per_unit": 10.00
      }
    ]
  }
  ```

## Model Training

The `train_model.py` script creates sample data and trains two main models:

1. **Demand Prediction Model**: Uses features like historical sales, current stock, seasonal factors, etc.
2. **Inventory Optimization Model**: Predicts optimal stock levels based on sales patterns and lead times.

### Custom Training Data

To use your own training data, modify the `train_model.py` script to load your data instead of generating sample data.

## Integration with Backend

The backend connects to this AI API through the `aiModelService.js` service. The backend provides the following endpoints:

- `GET /api/ai/health` - Check AI model health
- `GET /api/ai/medicine/:id/demand` - Get demand prediction for a medicine
- `GET /api/ai/inventory/optimization` - Get inventory optimization recommendations
- `GET /api/ai/reorder/suggestions` - Get smart reorder suggestions
- `POST /api/ai/predictions/batch` - Get batch predictions
- `GET /api/ai/insights` - Get AI-powered insights

## Customization

### Adding New Models

1. Create your model training script
2. Save the model using `joblib.dump()`
3. Update the `app.py` to include new endpoints
4. Update the backend service to call new endpoints

### Modifying Features

1. Update the feature extraction logic in `train_model.py`
2. Retrain the models
3. Update the API endpoints to handle new features
4. Update the backend service to send correct features

## Monitoring

The API includes basic logging and error handling. For production use, consider adding:

- Model performance monitoring
- Prediction logging
- Model drift detection
- A/B testing capabilities

## Dependencies

See `requirements.txt` for the full list of dependencies. Main libraries:

- **Flask**: Web framework
- **scikit-learn**: Machine learning library
- **pandas/numpy**: Data manipulation
- **joblib**: Model serialization

## Troubleshooting

### Common Issues

1. **Model not loading**: Ensure the model files exist in the `./models/` directory
2. **Port conflicts**: Change the port in `.env` if 5001 is already in use
3. **Dependencies**: Make sure all requirements are installed with correct versions

### Logs

Check the console output for detailed error messages and request logs.

## Future Enhancements

- Support for deep learning models (TensorFlow/PyTorch)
- Real-time model updates
- Advanced time series forecasting
- Integration with external data sources
- Model versioning and rollback capabilities
