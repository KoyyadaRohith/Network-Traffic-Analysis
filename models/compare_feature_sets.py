import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

# Load datasets
X_train = pd.read_csv("data/processed/X_train.csv")
X_test = pd.read_csv("data/processed/X_test.csv")

y_train = pd.read_csv("data/processed/y_train.csv").squeeze()
y_test = pd.read_csv("data/processed/y_test.csv").squeeze()

print("========== DATA LOADED ==========")
print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))
print("Total features:", X_train.shape[1])


# Load feature importance ranking
importance_df = pd.read_csv(
    "data/processed/model_feature_selection.csv"
)

# Feature sets to compare
feature_counts = [62, 38, 28, 23]

results = []


for count in feature_counts:

    print()
    print("========================================")
    print(f"TESTING TOP {count} FEATURES")
    print("========================================")

    selected_features = importance_df.head(count)["Feature"].tolist()

    X_train_selected = X_train[selected_features]
    X_test_selected = X_test[selected_features]

    print("Features used:", len(selected_features))

    # Train model
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train_selected, y_train)

    # Predictions
    y_pred = model.predict(X_test_selected)

    # Metrics
    accuracy = accuracy_score(y_test, y_pred)

    precision = precision_score(
        y_test,
        y_pred,
        pos_label="SUSPICIOUS"
    )

    recall = recall_score(
        y_test,
        y_pred,
        pos_label="SUSPICIOUS"
    )

    f1 = f1_score(
        y_test,
        y_pred,
        pos_label="SUSPICIOUS"
    )

    cm = confusion_matrix(
        y_test,
        y_pred,
        labels=["NORMAL", "SUSPICIOUS"]
    )

    print("Accuracy :", accuracy)
    print("Precision:", precision)
    print("Recall   :", recall)
    print("F1-score :", f1)

    print()
    print("Confusion Matrix:")
    print(cm)

    results.append({
        "Feature_Count": count,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1_Score": f1
    })


# Results table
results_df = pd.DataFrame(results)

print()
print("========== FINAL COMPARISON ==========")

print(results_df.to_string(index=False))

# Save results
output_file = "data/processed/feature_set_comparison.csv"

results_df.to_csv(
    output_file,
    index=False
)

print()
print("Results saved to:")
print(output_file)