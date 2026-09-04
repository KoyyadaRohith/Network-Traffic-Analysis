import pandas as pd
from sklearn.model_selection import train_test_split

input_file = "data/processed/dwdm_network_traffic_clean.csv"

df = pd.read_csv(input_file)

print("Dataset loaded successfully!")

# Select numerical features
feature_columns = df.select_dtypes(include="number").columns.tolist()

X = df[feature_columns]

# Target
y = df["Traffic_Status"]

print()
print("========== ORIGINAL DATASET ==========")
print("Total records:", len(df))
print("Total features:", len(feature_columns))

print()
print("Class distribution:")
print(y.value_counts())

# 80% training, 20% testing
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print()
print("========== TRAIN / TEST SPLIT ==========")

print("Training records:", len(X_train))
print("Testing records:", len(X_test))

print()
print("Training class distribution:")
print(y_train.value_counts())

print()
print("Testing class distribution:")
print(y_test.value_counts())

# Save datasets
X_train.to_csv(
    "data/processed/X_train.csv",
    index=False
)

X_test.to_csv(
    "data/processed/X_test.csv",
    index=False
)

y_train.to_csv(
    "data/processed/y_train.csv",
    index=False
)

y_test.to_csv(
    "data/processed/y_test.csv",
    index=False
)

print()
print("========== FILES SAVED ==========")
print("X_train.csv")
print("X_test.csv")
print("y_train.csv")
print("y_test.csv")