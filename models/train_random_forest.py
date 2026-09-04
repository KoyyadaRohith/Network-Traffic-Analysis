import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# File paths
X_train_file = "data/processed/X_train.csv"
X_test_file = "data/processed/X_test.csv"
y_train_file = "data/processed/y_train.csv"
y_test_file = "data/processed/y_test.csv"

# Load data
X_train = pd.read_csv(X_train_file)
X_test = pd.read_csv(X_test_file)

y_train = pd.read_csv(y_train_file).squeeze()
y_test = pd.read_csv(y_test_file).squeeze()

print("========== DATA LOADED ==========")

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))
print("Number of features:", X_train.shape[1])

# Create Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

print()
print("========== TRAINING RANDOM FOREST ==========")

model.fit(X_train, y_train)

print("Training completed successfully!")

# Predictions
y_pred = model.predict(X_test)

print()
print("========== MODEL EVALUATION ==========")

accuracy = accuracy_score(y_test, y_pred)

print("Accuracy:", accuracy)

print()
print("Classification Report:")
print(classification_report(y_test, y_pred))

print()
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Feature importance
feature_importance = pd.DataFrame({
    "Feature": X_train.columns,
    "Importance": model.feature_importances_
})

feature_importance = feature_importance.sort_values(
    by="Importance",
    ascending=False
)

print()
print("========== FEATURE IMPORTANCE ==========")

print(feature_importance.to_string(index=False))

# Save feature importance
feature_importance.to_csv(
    "data/processed/random_forest_feature_importance.csv",
    index=False
)

print()
print("Feature importance saved to:")
print("data/processed/random_forest_feature_importance.csv")