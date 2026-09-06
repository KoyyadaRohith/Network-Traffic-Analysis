import os
import pandas as pd
import mysql.connector
from getpass import getpass


# ============================================================
# CONFIGURATION
# ============================================================

CSV_PATH = "data/processed/dwdm_network_traffic_clean.csv"

BATCH_SIZE = 5000

# Friday, July 7, 2017
DATE_ID = 20170707


# ============================================================
# MYSQL CONNECTION
# ============================================================

DB_PASSWORD = os.environ.get("DB_PASSWORD") or getpass("Enter MySQL root password: ")

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", 3306)),
    "user": os.environ.get("DB_USER", "root"),
    "password": DB_PASSWORD,
    "database": os.environ.get("DB_NAME", "network_traffic_dw")
}


# ============================================================
# DATASET FEATURE → DATABASE COLUMN MAPPING
# ============================================================

FEATURE_MAPPING = [
    ("Destination Port", "destination_port"),
    ("Flow Duration", "flow_duration"),
    ("Total Fwd Packets", "total_fwd_packets"),
    ("Total Backward Packets", "total_backward_packets"),
    ("Total Length of Fwd Packets", "total_length_fwd_packets"),
    ("Total Length of Bwd Packets", "total_length_bwd_packets"),

    ("Fwd Packet Length Max", "fwd_packet_length_max"),
    ("Fwd Packet Length Min", "fwd_packet_length_min"),
    ("Fwd Packet Length Mean", "fwd_packet_length_mean"),
    ("Fwd Packet Length Std", "fwd_packet_length_std"),

    ("Bwd Packet Length Max", "bwd_packet_length_max"),
    ("Bwd Packet Length Min", "bwd_packet_length_min"),
    ("Bwd Packet Length Mean", "bwd_packet_length_mean"),
    ("Bwd Packet Length Std", "bwd_packet_length_std"),

    ("Flow Bytes/s", "flow_bytes_per_sec"),
    ("Flow Packets/s", "flow_packets_per_sec"),

    ("Flow IAT Mean", "flow_iat_mean"),
    ("Flow IAT Std", "flow_iat_std"),
    ("Flow IAT Max", "flow_iat_max"),
    ("Flow IAT Min", "flow_iat_min"),

    ("Fwd IAT Total", "fwd_iat_total"),
    ("Fwd IAT Mean", "fwd_iat_mean"),
    ("Fwd IAT Std", "fwd_iat_std"),
    ("Fwd IAT Max", "fwd_iat_max"),
    ("Fwd IAT Min", "fwd_iat_min"),

    ("Bwd IAT Total", "bwd_iat_total"),
    ("Bwd IAT Mean", "bwd_iat_mean"),
    ("Bwd IAT Std", "bwd_iat_std"),
    ("Bwd IAT Max", "bwd_iat_max"),
    ("Bwd IAT Min", "bwd_iat_min"),

    ("Fwd PSH Flags", "fwd_psh_flags"),

    ("Fwd Header Length", "fwd_header_length"),
    ("Bwd Header Length", "bwd_header_length"),

    ("Fwd Packets/s", "fwd_packets_per_sec"),
    ("Bwd Packets/s", "bwd_packets_per_sec"),

    ("Min Packet Length", "min_packet_length"),
    ("Max Packet Length", "max_packet_length"),
    ("Packet Length Mean", "packet_length_mean"),
    ("Packet Length Std", "packet_length_std"),
    ("Packet Length Variance", "packet_length_variance"),

    ("FIN Flag Count", "fin_flag_count"),
    ("SYN Flag Count", "syn_flag_count"),
    ("RST Flag Count", "rst_flag_count"),
    ("PSH Flag Count", "psh_flag_count"),
    ("ACK Flag Count", "ack_flag_count"),
    ("URG Flag Count", "urg_flag_count"),
    ("ECE Flag Count", "ece_flag_count"),

    ("Down/Up Ratio", "down_up_ratio"),
    ("Average Packet Size", "average_packet_size"),
    ("Avg Bwd Segment Size", "avg_bwd_segment_size"),

    ("Init_Win_bytes_forward", "init_win_bytes_forward"),
    ("Init_Win_bytes_backward", "init_win_bytes_backward"),

    ("act_data_pkt_fwd", "act_data_pkt_fwd"),
    ("min_seg_size_forward", "min_seg_size_forward"),

    ("Active Mean", "active_mean"),
    ("Active Std", "active_std"),
    ("Active Max", "active_max"),
    ("Active Min", "active_min"),

    ("Idle Mean", "idle_mean"),
    ("Idle Std", "idle_std"),
    ("Idle Max", "idle_max"),
    ("Idle Min", "idle_min"),
]


# ============================================================
# LOAD DATASET
# ============================================================

print("\n============================================================")
print("LOADING CLEANED DATASET")
print("============================================================")

df = pd.read_csv(CSV_PATH)

print("Dataset loaded successfully.")
print("Rows:", len(df))
print("Columns:", len(df.columns))


# ============================================================
# VERIFY DATASET
# ============================================================

print("\n============================================================")
print("VERIFYING DATASET")
print("============================================================")

expected_feature_count = 62

if len(FEATURE_MAPPING) != expected_feature_count:
    raise ValueError(
        f"Expected {expected_feature_count} features, "
        f"but mapping contains {len(FEATURE_MAPPING)}."
    )

print("Feature mapping verified:", len(FEATURE_MAPPING))


required_columns = [
    dataset_column
    for dataset_column, database_column in FEATURE_MAPPING
]

required_columns.extend([
    "Label",
    "Traffic_Status"
])


missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing dataset columns: {missing_columns}"
    )

print("All required dataset columns found.")


# ============================================================
# CONNECT TO MYSQL
# ============================================================

print("\n============================================================")
print("CONNECTING TO MYSQL")
print("============================================================")

connection = mysql.connector.connect(**DB_CONFIG)

cursor = connection.cursor()

print("Connected successfully.")
print("Database:", connection.database)


# ============================================================
# SAFETY CHECK — FACT TABLE MUST BE EMPTY
# ============================================================

print("\n============================================================")
print("FACT TABLE SAFETY CHECK")
print("============================================================")

cursor.execute("""
    SELECT COUNT(*)
    FROM fact_network_traffic
""")

existing_records = cursor.fetchone()[0]

print("Existing fact records:", existing_records)

if existing_records != 0:

    cursor.close()
    connection.close()

    raise RuntimeError(
        "\nFACT TABLE IS NOT EMPTY.\n"
        "Loading has been stopped to prevent duplicate records."
    )


# ============================================================
# LOAD NETWORK ID MAPPING
# ============================================================

print("\n============================================================")
print("LOADING NETWORK DIMENSION MAPPING")
print("============================================================")

cursor.execute("""
    SELECT
        network_id,
        destination_port
    FROM dim_network
""")

network_id_map = {
    int(destination_port): int(network_id)
    for network_id, destination_port
    in cursor.fetchall()
}

print("Network IDs loaded:", len(network_id_map))


# ============================================================
# LOAD CLASSIFICATION ID MAPPING
# ============================================================

print("\n============================================================")
print("LOADING CLASSIFICATION DIMENSION MAPPING")
print("============================================================")

cursor.execute("""
    SELECT
        classification_id,
        traffic_status,
        original_label
    FROM dim_classification
""")

classification_id_map = {
    (traffic_status, original_label): int(classification_id)
    for classification_id, traffic_status, original_label
    in cursor.fetchall()
}

print(
    "Classification IDs loaded:",
    len(classification_id_map)
)


# ============================================================
# PREPARE COLUMN POSITIONS
# ============================================================

# We use positions rather than getattr().
# This avoids problems with column names such as
# "Destination Port", "Flow Bytes/s", etc.

column_positions = {
    column: df.columns.get_loc(column)
    for column in df.columns
}


# ============================================================
# BUILD INSERT SQL
# ============================================================

database_columns = [
    database_column
    for dataset_column, database_column
    in FEATURE_MAPPING
]

insert_columns = [
    "date_id",
    "network_id",
    "classification_id"
] + database_columns

placeholders = ", ".join(
    ["%s"] * len(insert_columns)
)

insert_sql = f"""
INSERT INTO fact_network_traffic
(
    {", ".join(insert_columns)}
)
VALUES
(
    {placeholders}
)
"""


print("\n============================================================")
print("INSERT STATEMENT READY")
print("============================================================")

print("Fact table columns:", len(insert_columns))
print("Expected:", 65)


# ============================================================
# PREPARE FEATURE COLUMN POSITIONS
# ============================================================

feature_positions = [
    (
        dataset_column,
        column_positions[dataset_column]
    )
    for dataset_column, database_column
    in FEATURE_MAPPING
]


# ============================================================
# LOAD FACT TABLE IN BATCHES
# ============================================================

print("\n============================================================")
print("LOADING FACT TABLE")
print("============================================================")

total_records = len(df)

loaded_records = 0

batch_number = 0


try:

    for start in range(
        0,
        total_records,
        BATCH_SIZE
    ):

        end = min(
            start + BATCH_SIZE,
            total_records
        )

        batch = df.iloc[start:end]

        batch_values = []

        # ----------------------------------------------------
        # Convert each row to database values
        # ----------------------------------------------------

        for row in batch.itertuples(
            index=False,
            name=None
        ):

            # ----------------------------------------------
            # Destination Port
            # ----------------------------------------------

            destination_port_position = column_positions[
                "Destination Port"
            ]

            destination_port = int(
                row[destination_port_position]
            )

            # ----------------------------------------------
            # Classification information
            # ----------------------------------------------

            traffic_status_position = column_positions[
                "Traffic_Status"
            ]

            label_position = column_positions[
                "Label"
            ]

            traffic_status = row[
                traffic_status_position
            ]

            original_label = row[
                label_position
            ]

            # ----------------------------------------------
            # Find dimension IDs
            # ----------------------------------------------

            if destination_port not in network_id_map:

                raise ValueError(
                    f"Destination port "
                    f"{destination_port} "
                    f"not found in dim_network."
                )

            classification_key = (
                traffic_status,
                original_label
            )

            if classification_key not in classification_id_map:

                raise ValueError(
                    f"Classification "
                    f"{classification_key} "
                    f"not found in dim_classification."
                )

            network_id = network_id_map[
                destination_port
            ]

            classification_id = classification_id_map[
                classification_key
            ]

            # ----------------------------------------------
            # Extract 62 feature values
            # ----------------------------------------------

            feature_values = []

            for dataset_column, position in feature_positions:

                value = row[position]

                if dataset_column == "Destination Port":

                    value = int(value)

                else:

                    value = float(value)

                feature_values.append(value)

            # ----------------------------------------------
            # Complete fact-table record
            # ----------------------------------------------

            fact_record = (
                DATE_ID,
                network_id,
                classification_id,
                *feature_values
            )

            batch_values.append(
                fact_record
            )

        # ----------------------------------------------------
        # Insert batch
        # ----------------------------------------------------

        cursor.executemany(
            insert_sql,
            batch_values
        )

        connection.commit()

        loaded_records += len(batch)

        batch_number += 1

        percentage = (
            loaded_records / total_records
        ) * 100

        print(
            f"Batch {batch_number:>3} | "
            f"Loaded {loaded_records:,} / "
            f"{total_records:,} "
            f"({percentage:.2f}%)"
        )


    # ========================================================
    # SUCCESS
    # ========================================================

    print("\n============================================================")
    print("FACT TABLE LOAD COMPLETE")
    print("============================================================")

    print(
        "Total records loaded:",
        f"{loaded_records:,}"
    )

    print(
        "Expected records:",
        f"{total_records:,}"
    )

    if loaded_records == total_records:

        print("Verification: SUCCESS")

    else:

        print("Verification: WARNING")


except Exception as error:

    # --------------------------------------------------------
    # Roll back current transaction if anything fails
    # --------------------------------------------------------

    connection.rollback()

    print("\n============================================================")
    print("FACT TABLE LOAD FAILED")
    print("============================================================")

    print("Error:", error)

    raise


finally:

    cursor.close()

    connection.close()

    print("\nMySQL connection closed.")