import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

# Load datasets
X_train = pd.read_csv("data/processed/X_train.csv")
X_test = pd.read_csv("data/processed/X_test.csv")

y_train = pd.read_csv("data/processed/y_train.csv").squeeze()
y_test = pd.read_csv("data/processed/y_test.csv").squeeze()

print("========== DATA LOADED ==========")

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))
print("Features:", X_train.shape[1])

# Train Random Forest
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

print()
print("========== TRAINING MODEL ==========")

model.fit(X_train, y_train)

print("Training completed!")

# Calculate permutation importance
print()
print("========== PERMUTATION IMPORTANCE ==========")

result = permutation_importance(
    model,
    X_test,
    y_test,
    n_repeats=5,
    random_state=42,
    n_jobs=-1
)

# Create results table
importance_df = pd.DataFrame({
    "Feature": X_test.columns,
    "Importance_Mean": result.importances_mean,
    "Importance_Std": result.importances_std
})

# Sort by importance
importance_df = importance_df.sort_values(
    by="Importance_Mean",
    ascending=False
)

print()
print("========== FEATURE IMPORTANCE RANKING ==========")

print(importance_df.to_string(index=False))

# Save results
output_file = "data/processed/permutation_importance.csv"

importance_df.to_csv(
    output_file,
    index=False
)

print()
print("Results saved to:")
print(output_file)