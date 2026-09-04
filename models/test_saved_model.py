import pandas as pd
import joblib

from sklearn.metrics import accuracy_score, classification_report

# Load saved model
model_file = "models/random_forest_model.joblib"

model = joblib.load(model_file)

print("========== MODEL LOADED ==========")
print("Model:", type(model).__name__)
print("Number of features:", model.n_features_in_)
print("Classes:", model.classes_)

# Load test data
X_test = pd.read_csv("data/processed/X_test.csv")
y_test = pd.read_csv("data/processed/y_test.csv").squeeze()

print()
print("========== TEST DATA LOADED ==========")
print("Testing samples:", len(X_test))
print("Testing features:", X_test.shape[1])

# Make predictions
y_pred = model.predict(X_test)

print()
print("========== SAVED MODEL EVALUATION ==========")

accuracy = accuracy_score(y_test, y_pred)

print("Accuracy:", accuracy)

print()
print("Classification Report:")
print(classification_report(y_test, y_pred))

print()
print("========== SAMPLE PREDICTIONS ==========")

for i in range(10):
    print(
        f"Sample {i + 1}: "
        f"Actual = {y_test.iloc[i]}, "
        f"Predicted = {y_pred[i]}"
    )