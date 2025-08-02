"""
SmartMediChain AI Model API

Flask application that provides machine learning predictions for medicine demand
and inventory optimization for the SmartMediChain system.
"""

import os
import logging
import traceback
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for backward compatibility
MODEL = None
SCALER = None


class ModelPredictor:
    """Class to handle ML model predictions for medicine demand and inventory optimization."""

    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = []

    def load_model(self, model_file_path, scaler_file_path=None):
        """Load the trained model and scaler"""
        try:
            if os.path.exists(model_file_path):
                self.model = joblib.load(model_file_path)
                logger.info("Model loaded successfully from %s", model_file_path)
            else:
                logger.warning("Model file not found: %s", model_file_path)
                return False

            if scaler_file_path and os.path.exists(scaler_file_path):
                self.scaler = joblib.load(scaler_file_path)
                logger.info("Scaler loaded successfully from %s", scaler_file_path)

            return True
        except (IOError, EOFError, ValueError) as e:
            logger.error("Error loading model: %s", str(e))
            return False

    def predict(self, features):
        """Make predictions using the loaded model"""
        try:
            if self.model is None:
                raise ValueError("Model not loaded")

            # Convert features to numpy array if needed
            if isinstance(features, list):
                features = np.array(features).reshape(1, -1)
            elif isinstance(features, dict):
                # Convert dict to array based on expected feature order
                features = np.array(
                    [features[name] for name in self.feature_names]
                ).reshape(1, -1)

            # Apply scaling if scaler is available
            if self.scaler is not None:
                features = self.scaler.transform(features)

            # Make prediction
            prediction = self.model.predict(features)

            # Get prediction probability if available
            try:
                probability = self.model.predict_proba(features)
                return {
                    "prediction": prediction.tolist(),
                    "probability": probability.tolist(),
                    "confidence": float(np.max(probability)),
                }
            except AttributeError:
                return {"prediction": prediction.tolist(), "confidence": 1.0}

        except (ValueError, AttributeError) as e:
            logger.error("Prediction error: %s", str(e))
            raise


# Initialize the predictor
predictor = ModelPredictor()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5000"])


@app.route("/", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "message": "AI Model API is running",
            "timestamp": datetime.now().isoformat(),
            "model_loaded": predictor.model is not None,
        }
    )


@app.route("/model/load", methods=["POST"])
def load_model():
    """Load model endpoint"""
    try:
        data = request.get_json()
        model_file_path = data.get("model_path", "./models/model.pkl")
        scaler_file_path = data.get("scaler_path", "./models/scaler.pkl")

        success = predictor.load_model(model_file_path, scaler_file_path)

        if success:
            return jsonify(
                {
                    "status": "success",
                    "message": "Model loaded successfully",
                    "timestamp": datetime.now().isoformat(),
                }
            )
        else:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Failed to load model",
                        "timestamp": datetime.now().isoformat(),
                    }
                ),
                400,
            )

    except (KeyError, TypeError, ValueError) as e:
        logger.error("Error in load_model: %s", str(e))
        return (
            jsonify(
                {
                    "status": "error",
                    "message": str(e),
                    "timestamp": datetime.now().isoformat(),
                }
            ),
            500,
        )


@app.route("/predict", methods=["POST"])
def predict():
    """Make prediction endpoint"""
    try:
        if predictor.model is None:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Model not loaded. Please load a model first.",
                        "timestamp": datetime.now().isoformat(),
                    }
                ),
                400,
            )

        data = request.get_json()

        if not data or "features" not in data:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Missing features in request body",
                        "timestamp": datetime.now().isoformat(),
                    }
                ),
                400,
            )

        features = data["features"]
        result = predictor.predict(features)

        return jsonify(
            {
                "status": "success",
                "result": result,
                "timestamp": datetime.now().isoformat(),
            }
        )

    except (KeyError, ValueError, AttributeError) as e:
        logger.error("Error in predict: %s", str(e))
        return (
            jsonify(
                {
                    "status": "error",
                    "message": str(e),
                    "timestamp": datetime.now().isoformat(),
                    "traceback": traceback.format_exc(),
                }
            ),
            500,
        )


@app.route("/predict/medicine-demand", methods=["POST"])
def predict_medicine_demand():
    """Predict medicine demand based on historical data"""
    try:
        if predictor.model is None:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Model not loaded. Please load a model first.",
                        "timestamp": datetime.now().isoformat(),
                    }
                ),
                400,
            )

        data = request.get_json()

        # Expected features for medicine demand prediction
        required_features = [
            "historical_sales",
            "current_stock",
            "season_factor",
            "trend_factor",
            "price",
            "days_since_last_order",
        ]

        features = []
        for feature in required_features:
            if feature not in data:
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": f"Missing required feature: {feature}",
                            "required_features": required_features,
                            "timestamp": datetime.now().isoformat(),
                        }
                    ),
                    400,
                )
            features.append(data[feature])

        result = predictor.predict(features)

        # Interpret the prediction for medicine demand
        if isinstance(result["prediction"], list):
            predicted_demand = result["prediction"][0]
        else:
            predicted_demand = result["prediction"]

        return jsonify(
            {
                "status": "success",
                "predicted_demand": float(predicted_demand),
                "confidence": result.get("confidence", 1.0),
                "recommendation": get_demand_recommendation(predicted_demand),
                "timestamp": datetime.now().isoformat(),
            }
        )

    except (KeyError, ValueError, AttributeError) as e:
        logger.error("Error in predict_medicine_demand: %s", str(e))
        return (
            jsonify(
                {
                    "status": "error",
                    "message": str(e),
                    "timestamp": datetime.now().isoformat(),
                }
            ),
            500,
        )


@app.route("/predict/inventory-optimization", methods=["POST"])
def predict_inventory_optimization():
    """Predict optimal inventory levels"""
    try:
        if predictor.model is None:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Model not loaded. Please load a model first.",
                        "timestamp": datetime.now().isoformat(),
                    }
                ),
                400,
            )

        data = request.get_json()
        medicines = data.get("medicines", [])

        predictions = []

        for medicine in medicines:
            try:
                features = [
                    medicine.get("current_stock", 0),
                    medicine.get("avg_daily_sales", 0),
                    medicine.get("lead_time_days", 7),
                    medicine.get("safety_stock_factor", 1.5),
                    medicine.get("cost_per_unit", 0),
                ]

                result = predictor.predict(features)
                if isinstance(result["prediction"], list):
                    optimal_stock = result["prediction"][0]
                else:
                    optimal_stock = result["prediction"]

                predictions.append(
                    {
                        "medicine_id": medicine.get("id"),
                        "medicine_name": medicine.get("name"),
                        "current_stock": medicine.get("current_stock", 0),
                        "predicted_optimal_stock": float(optimal_stock),
                        "reorder_needed": medicine.get("current_stock", 0)
                        < optimal_stock,
                        "confidence": result.get("confidence", 1.0),
                    }
                )

            except (ValueError, KeyError, AttributeError) as e:
                medicine_name = medicine.get("name", "unknown")
                logger.error(
                    "Error predicting for medicine %s: %s", medicine_name, str(e)
                )
                continue

        return jsonify(
            {
                "status": "success",
                "predictions": predictions,
                "timestamp": datetime.now().isoformat(),
            }
        )

    except (KeyError, ValueError, AttributeError) as e:
        logger.error("Error in predict_inventory_optimization: %s", str(e))
        return (
            jsonify(
                {
                    "status": "error",
                    "message": str(e),
                    "timestamp": datetime.now().isoformat(),
                }
            ),
            500,
        )


def get_demand_recommendation(predicted_demand):
    """Get recommendation based on predicted demand"""
    if predicted_demand > 100:
        return "High demand expected. Consider increasing stock levels."
    elif predicted_demand > 50:
        return "Moderate demand expected. Maintain current stock levels."
    elif predicted_demand > 20:
        return "Low demand expected. Consider reducing orders."
    else:
        return "Very low demand expected. Minimize stock levels."


@app.errorhandler(404)
def not_found(_error):
    """Handle 404 errors"""
    return (
        jsonify(
            {
                "status": "error",
                "message": "Endpoint not found",
                "timestamp": datetime.now().isoformat(),
            }
        ),
        404,
    )


@app.errorhandler(500)
def internal_error(_error):
    """Handle 500 errors"""
    return (
        jsonify(
            {
                "status": "error",
                "message": "Internal server error",
                "timestamp": datetime.now().isoformat(),
            }
        ),
        500,
    )


if __name__ == "__main__":
    # Try to load model on startup if it exists
    default_model_path = os.getenv("MODEL_PATH", "./models/model.pkl")
    default_scaler_path = os.getenv("SCALER_PATH", "./models/scaler.pkl")

    if os.path.exists(default_model_path):
        predictor.load_model(default_model_path, default_scaler_path)
    else:
        logger.warning(
            "No model found on startup. Use /model/load endpoint to load a model."
        )

    # Start the Flask app
    port = int(os.getenv("AI_MODEL_PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=True)
