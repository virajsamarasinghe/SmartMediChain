"""
SmartMediChain AI Model API - Fraud Detection

Flask application that provides fraud detection predictions for procurement orders
using logistic regression model for the SmartMediChain system.
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


class FraudDetectionPredictor:
    """Class to handle fraud detection predictions for procurement orders."""

    def __init__(self):
        self.model = None
        self.scaler = None

    def load_model(self, model_file_path, scaler_file_path=None):
        """Load the trained fraud detection model and scaler"""
        try:
            if os.path.exists(model_file_path):
                self.model = joblib.load(model_file_path)
                logger.info("Fraud detection model loaded successfully from %s", model_file_path)
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
        """Make fraud detection predictions using the loaded model"""
        try:
            if self.model is None:
                raise ValueError("Model not loaded")

            # Convert features to numpy array if needed
            if isinstance(features, list):
                features = np.array(features).reshape(1, -1)

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


# Initialize the fraud detection predictor
fraud_predictor = FraudDetectionPredictor()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5000"])


@app.route("/", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "message": "Fraud Detection AI API is running",
            "timestamp": datetime.now().isoformat(),
            "model_loaded": fraud_predictor.model is not None,
        }
    )


@app.route("/predict/fraud-detection", methods=["POST"])
def predict_fraud_detection():
    """Predict fraud detection for procurement orders"""
    try:
        if fraud_predictor.model is None:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Fraud detection model not loaded",
                        "timestamp": datetime.now().isoformat(),
                    }
                ),
                400,
            )

        data = request.get_json()

        # Expected features based on your procurement data
        required_features = [
            "ordered_quantity",
            "current_stock", 
            "min_required",
            "max_capacity",
            "unit_cost",
            "avg_usage_per_day",
            "restock_lead_time"
        ]

        # Validate required features
        missing_features = [f for f in required_features if f not in data]
        if missing_features:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": f"Missing required features: {missing_features}",
                        "required_features": required_features,
                        "timestamp": datetime.now().isoformat(),
                    }
                ),
                400,
            )

        # Extract base features
        base_features = [data[feature] for feature in required_features]
        
        # Expand to 26 features to match the trained model
        # Add derived and default features to reach 26 total features
        expanded_features = base_features + [
            # Additional derived features (positions 7-25)
            data["ordered_quantity"] / max(data["current_stock"], 1),  # order to stock ratio
            data["unit_cost"] * data["ordered_quantity"],  # total order value
            data["current_stock"] / max(data["min_required"], 1),  # stock coverage ratio
            data["ordered_quantity"] / max(data["avg_usage_per_day"], 1),  # days of supply
            max(0, data["ordered_quantity"] - data["max_capacity"]),  # excess quantity
            1 if data["current_stock"] < data["min_required"] else 0,  # low stock flag
            1 if data["ordered_quantity"] > data["max_capacity"] else 0,  # overorder flag
            data["restock_lead_time"] * data["avg_usage_per_day"],  # lead time demand
            data["unit_cost"] / max(data.get("avg_market_price", data["unit_cost"]), 0.01),  # price ratio
            len(data.get("medicine_name", "")),  # medicine name length
            1 if data["unit_cost"] > 100 else 0,  # high cost flag
            data["ordered_quantity"] % 10,  # quantity modulo (pattern detection)
            1 if data["ordered_quantity"] > data["avg_usage_per_day"] * 30 else 0,  # month+ supply
            data["current_stock"] + data["ordered_quantity"],  # total after order
            abs(data["ordered_quantity"] - data["avg_usage_per_day"] * 7),  # deviation from weekly need
            1 if data["restock_lead_time"] > 14 else 0,  # long lead time flag
            data["max_capacity"] - data["current_stock"],  # available capacity
            data["ordered_quantity"] / max(data["max_capacity"], 1),  # capacity utilization
            1 if data["ordered_quantity"] == data["min_required"] else 0,  # exact min order flag
        ]
        
        # Pad with zeros if we still don't have 26 features
        while len(expanded_features) < 26:
            expanded_features.append(0.0)
        
        # Ensure we have exactly 26 features
        features = expanded_features[:26]

        # Make prediction
        result = fraud_predictor.predict(features)

        # Interpret the prediction
        if isinstance(result["prediction"], list):
            is_fraud = bool(result["prediction"][0])
        else:
            is_fraud = bool(result["prediction"])

        confidence = result.get("confidence", 0.5)
        
        # Determine risk level based on confidence
        if confidence >= 0.9:
            risk_level = "HIGH" if is_fraud else "LOW"
        elif confidence >= 0.7:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Generate fraud reasons based on the input data
        fraud_reasons = []
        if is_fraud:
            # Check for over stock order
            if data["ordered_quantity"] > data["max_capacity"]:
                fraud_reasons.append("Order quantity exceeds maximum storage capacity")
            
            # Check if order is much higher than typical usage
            estimated_need = data["avg_usage_per_day"] * data["restock_lead_time"] * 2  # 2x safety factor
            if data["ordered_quantity"] > estimated_need:
                fraud_reasons.append("Order quantity significantly exceeds estimated need")
            
            # Check for unusual pricing
            if data["unit_cost"] <= 0:
                fraud_reasons.append("Invalid or suspicious unit cost")
            
            # Check if current stock is already sufficient
            if data["current_stock"] > data["min_required"] * 2 and data["ordered_quantity"] > data["avg_usage_per_day"] * 7:
                fraud_reasons.append("Unnecessary order - current stock is sufficient")

        return jsonify(
            {
                "status": "success",
                "result": {
                    "is_fraud": is_fraud,
                    "risk_level": risk_level,
                    "confidence_score": int(confidence * 100),
                    "reasons": fraud_reasons,
                    "probability": result.get("probability", [[1-confidence, confidence]]),
                },
                "timestamp": datetime.now().isoformat(),
            }
        )

    except (KeyError, ValueError, AttributeError) as e:
        logger.error("Error in predict_fraud_detection: %s", str(e))
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
    # Try to load fraud detection model on startup
    fraud_model_path = os.getenv("FRAUD_MODEL_PATH", "./models/fraud_detection_model.pkl")
    fraud_scaler_path = os.getenv("FRAUD_SCALER_PATH", "./models/fraud_scaler.pkl")

    if os.path.exists(fraud_model_path):
        fraud_predictor.load_model(fraud_model_path, fraud_scaler_path)
    else:
        logger.warning(
            "Fraud detection model not found at startup: %s", fraud_model_path
        )

    # Start the Flask app
    port = int(os.getenv("AI_MODEL_PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=True)