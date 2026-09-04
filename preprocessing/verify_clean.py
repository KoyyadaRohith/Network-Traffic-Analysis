import pandas as pd
import numpy as np

file_path = "data/processed/dwdm_network_traffic_clean.csv"

print("Loading cleaned dataset...")

df = pd.read_csv(file_path)

print()
print("========== CLEAN DATASET VERIFICATION ==========")

print("Rows:", len(df))
print("Columns:", len(df.columns))

print()
print("========== MISSING VALUES ==========")

missing = df.isnull().sum().sum()
print("Total missing values:", missing)

print()
print("========== DUPLICATES ==========")

duplicates = df.duplicated().sum()
print("Duplicate rows:", duplicates)

print()
print("========== INFINITE VALUES ==========")

numeric_df = df.select_dtypes(include=np.number)

positive_inf = np.isposinf(numeric_df).sum().sum()
negative_inf = np.isneginf(numeric_df).sum().sum()

print("Positive infinity:", positive_inf)
print("Negative infinity:", negative_inf)

print()
print("========== TRAFFIC STATUS ==========")

print(df["Traffic_Status"].value_counts())

print()
print("========== ORIGINAL LABEL ==========")

print(df["Label"].value_counts())

print()
print("========== VERIFICATION COMPLETE ==========")