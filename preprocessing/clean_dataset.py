import pandas as pd
import numpy as np

input_file = "data/raw/Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv"
output_file = "data/processed/dwdm_network_traffic_clean.csv"

# Load dataset
df = pd.read_csv(input_file)

print("========== DATA CLEANING ==========")

print("Original rows:", len(df))
print("Original columns:", len(df.columns))

# Remove extra spaces from column names
df.columns = df.columns.str.strip()

# Replace infinite values with NaN
df = df.replace([np.inf, -np.inf], np.nan)

# Fill numerical missing values with median
numeric_columns = df.select_dtypes(include="number").columns

for column in numeric_columns:
    if df[column].isna().sum() > 0:
        df[column] = df[column].fillna(df[column].median())

# Remove duplicate rows
before_duplicates = len(df)

df = df.drop_duplicates()

duplicates_removed = before_duplicates - len(df)

print("Duplicates removed:", duplicates_removed)

# Create binary traffic status
df["Traffic_Status"] = df["Label"].apply(
    lambda x: "NORMAL" if x == "BENIGN" else "SUSPICIOUS"
)

# Remove constant numerical features
numeric_columns = df.select_dtypes(include="number").columns

unique_counts = df[numeric_columns].nunique()

constant_features = unique_counts[unique_counts == 1].index.tolist()

print()
print("Constant features removed:", len(constant_features))

if len(constant_features) > 0:
    print()
    print("Removed features:")

    for feature in constant_features:
        print("-", feature)

    df = df.drop(columns=constant_features)

# Remove exact duplicate features that represent the same information
duplicate_features_to_remove = [
    "Subflow Fwd Packets",
    "Subflow Bwd Packets",
    "Subflow Fwd Bytes",
    "Subflow Bwd Bytes",
    "Avg Fwd Segment Size",
    "Fwd Header Length.1"
]

existing_duplicate_features = [
    column
    for column in duplicate_features_to_remove
    if column in df.columns
]

print()
print("Exact duplicate features removed:", len(existing_duplicate_features))

if len(existing_duplicate_features) > 0:
    print()
    print("Removed duplicate features:")

    for feature in existing_duplicate_features:
        print("-", feature)

    df = df.drop(columns=existing_duplicate_features)

# Save cleaned dataset
df.to_csv(output_file, index=False)

print()
print("========== CLEANING COMPLETE ==========")

print("Final rows:", len(df))
print("Final columns:", len(df.columns))

print()
print("Traffic Status distribution:")
print(df["Traffic_Status"].value_counts())

print()
print("Remaining missing values:", df.isnull().sum().sum())

print(
    "Remaining infinite values:",
    np.isinf(df.select_dtypes(include="number")).sum().sum()
)