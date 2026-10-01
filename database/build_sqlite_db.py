"""
Build Script: Generates the bundled read-only SQLite Data Warehouse
and its compressed archive for deployment:
  database/network_traffic_dw.sqlite
  database/network_traffic_dw.sqlite.gz

Preserves the exact Star Schema:
  - dim_date (1 record)
  - dim_network (23,950 records)
  - dim_classification (2 records)
  - fact_network_traffic (223,112 records)
"""

import gzip
import os
import shutil
import sqlite3
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

REPO_ROOT = Path(__file__).resolve().parent.parent
DB_DIR = REPO_ROOT / "database"
SQLITE_DB_PATH = DB_DIR / "network_traffic_dw.sqlite"
SQLITE_GZ_PATH = DB_DIR / "network_traffic_dw.sqlite.gz"
CSV_PATH = REPO_ROOT / "data" / "processed" / "dwdm_network_traffic_clean.csv"

DATE_ID = 20170707

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


def build_from_csv():
    import pandas as pd

    print(f"Reading dataset from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)
    total_rows = len(df)
    print(f"Dataset loaded: {total_rows:,} rows, {len(df.columns)} columns")

    if SQLITE_DB_PATH.exists():
        SQLITE_DB_PATH.unlink()

    print(f"Creating SQLite schema at: {SQLITE_DB_PATH}")
    sqlite_conn = sqlite3.connect(str(SQLITE_DB_PATH))
    sqlite_cur = sqlite_conn.cursor()

    sqlite_cur.execute("PRAGMA synchronous = OFF;")
    sqlite_cur.execute("PRAGMA journal_mode = MEMORY;")

    # 1. dim_date
    sqlite_cur.execute("""
    CREATE TABLE dim_date (
        date_id INTEGER PRIMARY KEY,
        full_date TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        day INTEGER NOT NULL,
        day_of_week TEXT NOT NULL
    );
    """)
    sqlite_cur.execute(
        "INSERT INTO dim_date VALUES (?, ?, ?, ?, ?, ?);",
        (DATE_ID, "2017-07-07", 2017, 7, 7, "Friday"),
    )
    print("  [✓] dim_date populated (1 record)")

    # 2. dim_classification
    sqlite_cur.execute("""
    CREATE TABLE dim_classification (
        classification_id INTEGER PRIMARY KEY,
        traffic_status TEXT NOT NULL,
        original_label TEXT NOT NULL
    );
    """)
    sqlite_cur.executemany(
        "INSERT INTO dim_classification VALUES (?, ?, ?);",
        [
            (1, "NORMAL", "BENIGN"),
            (2, "SUSPICIOUS", "DDoS"),
        ],
    )
    print("  [✓] dim_classification populated (2 records)")

    # 3. dim_network
    sqlite_cur.execute("""
    CREATE TABLE dim_network (
        network_id INTEGER PRIMARY KEY,
        destination_port INTEGER NOT NULL UNIQUE
    );
    """)
    unique_ports = sorted(int(p) for p in df["Destination Port"].unique())
    network_records = [(idx + 1, port) for idx, port in enumerate(unique_ports)]
    sqlite_cur.executemany("INSERT INTO dim_network VALUES (?, ?);", network_records)
    port_to_network_id = {port: net_id for net_id, port in network_records}
    print(f"  [✓] dim_network populated ({len(network_records):,} records)")

    # 4. fact_network_traffic
    col_defs = [
        "traffic_id INTEGER PRIMARY KEY",
        "date_id INTEGER NOT NULL",
        "network_id INTEGER NOT NULL",
        "classification_id INTEGER NOT NULL",
    ]
    for _, db_col in FEATURE_MAPPING:
        col_defs.append(f"{db_col} NUMERIC")

    create_fact_sql = f"CREATE TABLE fact_network_traffic ({', '.join(col_defs)});"
    sqlite_cur.execute(create_fact_sql)

    csv_feature_cols = [csv_col for csv_col, _ in FEATURE_MAPPING]

    label_to_class_id = {
        "BENIGN": 1,
        "DDoS": 2,
    }

    insert_cols = ["traffic_id", "date_id", "network_id", "classification_id"] + [
        db_col for _, db_col in FEATURE_MAPPING
    ]
    insert_sql = f"INSERT INTO fact_network_traffic ({', '.join(insert_cols)}) VALUES ({', '.join(['?'] * len(insert_cols))});"

    batch_size = 25000
    rows_batch = []
    print("Populating fact_network_traffic in batches...")

    for i in range(0, total_rows, batch_size):
        chunk = df.iloc[i : i + batch_size]
        batch_records = []
        for idx_in_df, row in chunk.iterrows():
            traffic_id = idx_in_df + 1
            port = int(row["Destination Port"])
            net_id = port_to_network_id[port]
            raw_label = str(row["Label"]).strip()
            class_id = label_to_class_id.get(raw_label, 2 if "DDOS" in raw_label.upper() else 1)

            feature_vals = [row[c] for c in csv_feature_cols]
            record = [traffic_id, DATE_ID, net_id, class_id] + feature_vals
            batch_records.append(record)

        sqlite_cur.executemany(insert_sql, batch_records)
        print(f"  ... {min(i + batch_size, total_rows):,} / {total_rows:,} records inserted")

    # Create indexes
    print("Creating indexes on fact_network_traffic...")
    sqlite_cur.execute("CREATE INDEX idx_dest_port ON fact_network_traffic(destination_port);")
    sqlite_cur.execute("CREATE INDEX idx_class_id ON fact_network_traffic(classification_id);")
    sqlite_cur.execute("CREATE INDEX idx_dt_id ON fact_network_traffic(date_id);")
    sqlite_cur.execute("CREATE INDEX idx_net_id ON fact_network_traffic(network_id);")

    sqlite_conn.commit()
    sqlite_conn.close()
    print("  [✓] SQLite database successfully built.")


def verify_sqlite_db():
    print("\n--- VERIFYING SQLITE DATA WAREHOUSE ---")
    conn = sqlite3.connect(str(SQLITE_DB_PATH))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Fact table count
    cur.execute("SELECT COUNT(*) AS cnt FROM fact_network_traffic;")
    fact_cnt = cur.fetchone()["cnt"]
    assert fact_cnt == 223112, f"Expected 223,112 fact rows, got {fact_cnt}"
    print(f"  [✓] fact_network_traffic = {fact_cnt:,}")

    # dim_date
    cur.execute("SELECT COUNT(*) AS cnt FROM dim_date;")
    date_cnt = cur.fetchone()["cnt"]
    assert date_cnt == 1, f"Expected 1 date row, got {date_cnt}"
    print(f"  [✓] dim_date = {date_cnt}")

    # dim_network
    cur.execute("SELECT COUNT(*) AS cnt FROM dim_network;")
    net_cnt = cur.fetchone()["cnt"]
    assert net_cnt == 23950, f"Expected 23,950 network rows, got {net_cnt}"
    print(f"  [✓] dim_network = {net_cnt:,}")

    # dim_classification
    cur.execute("SELECT COUNT(*) AS cnt FROM dim_classification;")
    class_cnt = cur.fetchone()["cnt"]
    assert class_cnt == 2, f"Expected 2 classification rows, got {class_cnt}"
    print(f"  [✓] dim_classification = {class_cnt}")

    # Traffic status distribution
    cur.execute("""
    SELECT c.traffic_status, COUNT(*) as cnt
    FROM fact_network_traffic f
    JOIN dim_classification c ON f.classification_id = c.classification_id
    GROUP BY c.traffic_status;
    """)
    dist = {r["traffic_status"]: r["cnt"] for r in cur.fetchall()}
    assert dist.get("NORMAL") == 95096, f"Expected 95,096 NORMAL, got {dist.get('NORMAL')}"
    assert dist.get("SUSPICIOUS") == 128016, f"Expected 128,016 SUSPICIOUS, got {dist.get('SUSPICIOUS')}"
    print(f"  [✓] NORMAL = {dist['NORMAL']:,} | SUSPICIOUS = {dist['SUSPICIOUS']:,}")

    # Port 80 stats
    cur.execute("""
    SELECT 
        COUNT(*) as total_p80,
        SUM(CASE WHEN c.traffic_status = 'NORMAL' THEN 1 ELSE 0 END) as norm_p80,
        SUM(CASE WHEN c.traffic_status = 'SUSPICIOUS' THEN 1 ELSE 0 END) as susp_p80
    FROM fact_network_traffic f
    JOIN dim_classification c ON f.classification_id = c.classification_id
    WHERE f.destination_port = 80;
    """)
    p80 = cur.fetchone()
    assert p80["total_p80"] == 136562, f"Expected 136,562 Port 80 rows, got {p80['total_p80']}"
    assert p80["norm_p80"] == 8549, f"Expected 8,549 Port 80 NORMAL rows, got {p80['norm_p80']}"
    assert p80["susp_p80"] == 128013, f"Expected 128,013 Port 80 SUSPICIOUS rows, got {p80['susp_p80']}"
    print(f"  [✓] Port 80 = {p80['total_p80']:,} (NORMAL: {p80['norm_p80']:,}, SUSPICIOUS: {p80['susp_p80']:,})")

    conn.close()


def compress_database():
    print("\n--- COMPRESSING SQLITE DATABASE TO .GZ ---")
    raw_size = SQLITE_DB_PATH.stat().st_size
    print(f"Raw SQLite size: {raw_size / (1024 * 1024):.2f} MB ({raw_size:,} bytes)")

    with open(SQLITE_DB_PATH, "rb") as f_in, gzip.open(SQLITE_GZ_PATH, "wb", compresslevel=9) as f_out:
        shutil.copyfileobj(f_in, f_out)

    gz_size = SQLITE_GZ_PATH.stat().st_size
    ratio = (1 - (gz_size / raw_size)) * 100
    print(f"Gzip archive size: {gz_size / (1024 * 1024):.2f} MB ({gz_size:,} bytes) - {ratio:.1f}% reduction")
    print(f"Saved: {SQLITE_GZ_PATH}")


if __name__ == "__main__":
    rebuild = "--rebuild" in sys.argv or not SQLITE_DB_PATH.exists()
    if rebuild:
        build_from_csv()
    verify_sqlite_db()
    compress_database()
    print("\nSUCCESS: All counts and verifications passed cleanly!")
