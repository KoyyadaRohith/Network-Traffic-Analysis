import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Load training data only
X_train = pd.read_csv("data/processed/X_train.csv")
y_train = pd.read_csv("data/processed/y_train.csv").squeeze()

print("========== DATA LOADED ==========")

print("Training samples:", len(X_train))
print("Features:", X_train.shape[1])

# Train Random Forest
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

print()
print("========== TRAINING RANDOM FOREST ==========")

model.fit(X_train, y_train)

print("Training completed!")

# Feature importance
importance_df = pd.DataFrame({
    "Feature": X_train.columns,
    "Importance": model.feature_importances_
})

importance_df = importance_df.sort_values(
    by="Importance",
    ascending=False
).reset_index(drop=True)

# Calculate cumulative importance
importance_df["Cumulative_Importance"] = (
    importance_df["Importance"].cumsum()
)

print()
print("========== FEATURE SELECTION ANALYSIS ==========")

print(
    importance_df.to_string(index=False)
)

print()
print("========== CUMULATIVE IMPORTANCE ==========")

for threshold in [0.80, 0.90, 0.95, 0.99]:

    selected_count = (
        importance_df["Cumulative_Importance"] <= threshold
    ).sum()

    # Include the first feature that crosses the threshold
    selected_count += 1

    if selected_count > len(importance_df):
        selected_count = len(importance_df)

    print(
        f"Features needed for approximately "
        f"{threshold * 100:.0f}% importance: "
        f"{selected_count}"
    )

# Save results
output_file = "data/processed/model_feature_selection.csv"

importance_df.to_csv(
    output_file,
    index=False
)

print()
print("Results saved to:")
print(output_file)