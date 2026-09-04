import pandas as pd

file_path = "data/raw/Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv"

df = pd.read_csv(file_path)

print("Dataset loaded successfully!")
print()

print("Number of rows:", len(df))
print("Number of columns:", len(df.columns))
print()

print("Column names:")
for column in df.columns:
    print(column)

print()

print("First 5 rows:")
print(df.head())

print()
print("========== LABEL DISTRIBUTION ==========")

print(df[" Label"].value_counts())

print()
print("========== DATA QUALITY CHECK ==========")

# Missing values
missing_values = df.isnull().sum()

print()
print("Columns with missing values:")
print(missing_values[missing_values > 0])

# Duplicate rows
duplicate_count = df.duplicated().sum()

print()
print("Duplicate rows:", duplicate_count)

# Infinite values
infinite_count = (df.select_dtypes(include="number") == float("inf")).sum().sum()
negative_infinite_count = (df.select_dtypes(include="number") == float("-inf")).sum().sum()

print()
print("Positive infinity values:", infinite_count)
print("Negative infinity values:", negative_infinite_count)