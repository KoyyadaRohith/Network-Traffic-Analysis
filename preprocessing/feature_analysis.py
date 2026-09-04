import pandas as pd

file_path = "data/processed/dwdm_network_traffic_clean.csv"

df = pd.read_csv(file_path)

print("Dataset loaded successfully!")

# Numerical features
numeric_columns = df.select_dtypes(include="number").columns

print()
print("========== CLASS-WISE FEATURE ANALYSIS ==========")

# Calculate median for NORMAL traffic
normal_median = df[df["Traffic_Status"] == "NORMAL"][
    numeric_columns
].median()

# Calculate median for SUSPICIOUS traffic
suspicious_median = df[df["Traffic_Status"] == "SUSPICIOUS"][
    numeric_columns
].median()

# Create comparison table
comparison = pd.DataFrame({
    "Feature": numeric_columns,
    "Normal_Median": normal_median.values,
    "Suspicious_Median": suspicious_median.values
})

# Calculate absolute difference
comparison["Absolute_Difference"] = (
    comparison["Suspicious_Median"]
    - comparison["Normal_Median"]
).abs()

# Sort by difference
comparison = comparison.sort_values(
    by="Absolute_Difference",
    ascending=False
)

print()
print("Features with largest NORMAL vs SUSPICIOUS median differences:")

print(comparison.to_string(index=False))

# Save results
output_file = "data/processed/class_feature_comparison.csv"

comparison.to_csv(output_file, index=False)

print()
print("Results saved to:")
print(output_file)