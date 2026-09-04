import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier

# Load training data
X_train = pd.read_csv("data/processed/X_train.csv")
y_train = pd.read_csv("data/processed/y_train.csv").squeeze()

print("========== DATA LOADED ==========")

print("Training samples:", len(X_train))
print("Features:", X_train.shape[1])

# Create final Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

print()
print("========== TRAINING FINAL MODEL ==========")

model.fit(X_train, y_train)

print("Training completed!")

# Save model
model_file = "models/random_forest_model.joblib"

joblib.dump(model, model_file)

print()
print("Model saved to:")
print(model_file)

# Save feature names
feature_file = "models/model_features.txt"

with open(feature_file, "w") as file:
    for feature in X_train.columns:
        file.write(feature + "\n")

print()
print("Feature list saved to:")
print(feature_file)

print()
print("========== MODEL INFORMATION ==========")

print("Number of trees:", model.n_estimators)
print("Number of features:", model.n_features_in_)
print("Classes:", model.classes_)