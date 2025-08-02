import os
import json
import shutil

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib


def create_sample_data(n_samples=1000):
    """Create sample data for medicine demand prediction"""
    np.random.seed(42)

    # Generate synthetic features
    data = {
        "historical_sales": np.random.poisson(50, n_samples),
        "current_stock": np.random.randint(0, 200, n_samples),
        "season_factor": np.random.uniform(0.5, 2.0, n_samples),
        "trend_factor": np.random.uniform(0.8, 1.5, n_samples),
        "price": np.random.uniform(10, 100, n_samples),
        "days_since_last_order": np.random.randint(1, 30, n_samples),
    }

    # Create target variable (predicted demand) with some realistic logic
    demand = (
        data["historical_sales"] * data["season_factor"] * data["trend_factor"]
        + np.random.normal(0, 10, n_samples)  # Add some noise
        + (200 - data["current_stock"]) * 0.1  # Low stock increases demand
        + (100 - data["price"]) * 0.5  # Lower price increases demand
    )

    # Ensure demand is not negative
    demand = np.maximum(demand, 0)

    data["demand"] = demand

    return pd.DataFrame(data)


def create_inventory_optimization_data(n_samples=800):
    """Create sample data for inventory optimization"""
    np.random.seed(123)

    data = {
        "current_stock": np.random.randint(0, 500, n_samples),
        "avg_daily_sales": np.random.uniform(1, 20, n_samples),
        "lead_time_days": np.random.randint(3, 14, n_samples),
        "safety_stock_factor": np.random.uniform(1.2, 2.0, n_samples),
        "cost_per_unit": np.random.uniform(5, 50, n_samples),
    }

    # Calculate optimal stock level (this is a simplified model)
    optimal_stock = data["avg_daily_sales"] * data["lead_time_days"] * data[
        "safety_stock_factor"
    ] + np.random.normal(
        0, 5, n_samples
    )  # Add some noise

    optimal_stock = np.maximum(optimal_stock, 10)  # Minimum stock level

    data["optimal_stock"] = optimal_stock

    return pd.DataFrame(data)


def train_demand_prediction_model():
    """Train a model for medicine demand prediction"""
    print("Creating sample data for demand prediction...")
    df = create_sample_data()

    # Prepare features and target
    feature_columns = [
        "historical_sales",
        "current_stock",
        "season_factor",
        "trend_factor",
        "price",
        "days_since_last_order",
    ]
    X = df[feature_columns]
    y = df["demand"]

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train the model
    print("Training demand prediction model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)

    # Evaluate the model
    y_pred = model.predict(X_test_scaled)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print("Demand Prediction Model Performance:")
    print(f"Mean Squared Error: {mse:.2f}")
    print(f"R² Score: {r2:.3f}")

    return model, scaler, feature_columns


def train_inventory_optimization_model():
    """Train a model for inventory optimization"""
    print("Creating sample data for inventory optimization...")
    df = create_inventory_optimization_data()

    # Prepare features and target
    feature_columns = [
        "current_stock",
        "avg_daily_sales",
        "lead_time_days",
        "safety_stock_factor",
        "cost_per_unit",
    ]
    X = df[feature_columns]
    y = df["optimal_stock"]

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train the model
    print("Training inventory optimization model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)

    # Evaluate the model
    y_pred = model.predict(X_test_scaled)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print("Inventory Optimization Model Performance:")
    print(f"Mean Squared Error: {mse:.2f}")
    print(f"R² Score: {r2:.3f}")

    return model, scaler, feature_columns


def save_model(model, scaler, feature_columns, model_name):
    """Save the trained model, scaler, and feature names"""
    models_dir = "./models"
    os.makedirs(models_dir, exist_ok=True)

    # Save model
    model_path = os.path.join(models_dir, f"{model_name}_model.pkl")
    joblib.dump(model, model_path)
    print(f"Model saved to: {model_path}")

    # Save scaler
    scaler_path = os.path.join(models_dir, f"{model_name}_scaler.pkl")
    joblib.dump(scaler, scaler_path)
    print(f"Scaler saved to: {scaler_path}")

    # Save feature names
    feature_names_path = os.path.join(models_dir, f"{model_name}_feature_names.json")
    with open(feature_names_path, "w", encoding="utf-8") as f:
        json.dump(feature_columns, f)
    print(f"Feature names saved to: {feature_names_path}")

    return model_path, scaler_path, feature_names_path


def main():
    """Main function to train and save models"""
    print("Starting model training process...")
    print("=" * 50)

    # Train demand prediction model
    demand_model, demand_scaler, demand_features = train_demand_prediction_model()
    save_model(demand_model, demand_scaler, demand_features, "demand_prediction")

    print("\n" + "=" * 50)

    # Train inventory optimization model
    inventory_model, inventory_scaler, inventory_features = (
        train_inventory_optimization_model()
    )
    save_model(
        inventory_model, inventory_scaler, inventory_features, "inventory_optimization"
    )

    print("\n" + "=" * 50)
    print("Model training completed successfully!")

    # Create a default model symlink for the main API
    models_dir = "./models"
    default_model_path = os.path.join(models_dir, "model.pkl")
    default_scaler_path = os.path.join(models_dir, "scaler.pkl")

    # Use demand prediction as the default model
    demand_model_path = os.path.join(models_dir, "demand_prediction_model.pkl")
    demand_scaler_path = os.path.join(models_dir, "demand_prediction_scaler.pkl")

    if os.path.exists(demand_model_path):
        if os.path.exists(default_model_path):
            os.remove(default_model_path)
        if os.path.exists(default_scaler_path):
            os.remove(default_scaler_path)

        # Create copies for default model
        shutil.copy2(demand_model_path, default_model_path)
        shutil.copy2(demand_scaler_path, default_scaler_path)
        print(f"Default model created: {default_model_path}")


if __name__ == "__main__":
    main()
