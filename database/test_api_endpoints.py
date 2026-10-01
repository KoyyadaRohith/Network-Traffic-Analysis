import io
import os
import sys
from pathlib import Path

# Add project root to sys.path
root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root))
sys.path.insert(0, str(root / "backend"))

print("=== 1. TESTING BACKEND IMPORTS ===")
from backend.database import get_db_connection, get_sqlite_db_path
from backend.main import app
from fastapi.testclient import TestClient

print("Backend imports succeeded.")

print("\n=== 2. TESTING DIRECT DB CONNECTION ===")
conn = get_db_connection()
assert conn.is_connected() is True, "Connection should be connected"
cur = conn.cursor(dictionary=True)
cur.execute("SELECT COUNT(*) AS total FROM fact_network_traffic;")
res = cur.fetchone()
print("Direct count:", res["total"])
assert res["total"] == 223112, "Total must be 223,112"
cur.close()
conn.close()
assert conn.is_connected() is False, "Connection should report disconnected"
print("Direct connection test passed.")

print("\n=== 3. TESTING API ENDPOINTS VIA TESTCLIENT ===")
client = TestClient(app)

endpoints = [
    ("/db-health", 200),
    ("/api/dashboard", 200),
    ("/api/analytics/summary", 200),
    ("/api/analytics/classification", 200),
    ("/api/analytics/ports", 200),
    ("/api/analytics/statistics", 200),
    ("/api/analytics/comparison", 200),
    ("/api/analytics/date-summary", 200),
    ("/api/analytics/traffic", 200),
    ("/api/dwdm/overview", 200),
    ("/api/dwdm/classification-summary", 200),
    ("/api/dwdm/port-analysis", 200),
    ("/api/dwdm/status-comparison", 200),
    ("/api/dwdm/rollup?group_by=port", 200),
    ("/api/dwdm/rollup?group_by=status", 200),
    ("/api/dwdm/rollup", 200),
    ("/api/dwdm/drilldown/80", 200),
    ("/api/dwdm/queries", 200),
    ("/api/dataset/summary", 200),
    ("/api/dataset/class-distribution", 200),
    ("/api/dataset/features", 200),
    ("/api/model/evaluation", 200),
    ("/api/model/feature-importance", 200),
]

all_passed = True
for ep, expected_code in endpoints:
    resp = client.get(ep)
    if resp.status_code != expected_code:
        print(f"FAILED: {ep} returned {resp.status_code}: {resp.text[:200]}")
        all_passed = False
    else:
        print(f"PASS: {ep} -> {resp.status_code}")

assert all_passed, "One or more GET endpoints failed"

print("\n=== 4. TESTING SPECIFIC DATA WAREHOUSE & OLAP METRICS ===")
# Dashboard counts
dash_resp = client.get("/api/dashboard").json()
dash_metrics = dash_resp.get("summary") or dash_resp
print("Dashboard summary:", dash_metrics)
tot = dash_metrics["total_records"]
norm = dash_metrics["normal_records"]
susp = dash_metrics["suspicious_records"]
assert tot == 223112, f"Expected 223112, got {tot}"
assert norm == 95096, f"Expected 95096, got {norm}"
assert susp == 128016, f"Expected 128016, got {susp}"

# Slice: Suspicious = 128016
slice_resp = client.get("/api/analytics/traffic?status=SUSPICIOUS").json()
slice_total = slice_resp["summary"]["total_records"]
print(f"Slice (SUSPICIOUS): {slice_total}")
assert slice_total == 128016, f"Slice expected 128016, got {slice_total}"

# Dice: Suspicious + Port 80 + 2017-07-07 = 128013
dice_resp = client.get("/api/analytics/traffic?status=SUSPICIOUS&destination_port=80&date=2017-07-07").json()
dice_total = dice_resp["summary"]["total_records"]
print(f"Dice (SUSPICIOUS + Port 80 + 2017-07-07): {dice_total}")
assert dice_total == 128013, f"Dice expected 128013, got {dice_total}"

# Drill-Down Port 80: Normal = 8549, Suspicious = 128013, Total = 136562
dd_resp = client.get("/api/dwdm/drilldown/80").json()
dd_data = dd_resp.get("drilldown_data") or dd_resp
p80_tot = dd_data["total_records"]
p80_norm = dd_data["normal_records"]
p80_susp = dd_data["suspicious_records"]
print(f"Drill-down Port 80: Total={p80_tot}, Normal={p80_norm}, Suspicious={p80_susp}")
assert p80_tot == 136562, f"Expected 136562, got {p80_tot}"
assert p80_norm == 8549, f"Expected 8549, got {p80_norm}"
assert p80_susp == 128013, f"Expected 128013, got {p80_susp}"

# Roll-up response structure and totals
rollup_port = client.get("/api/dwdm/rollup?group_by=port").json()
assert "data" in rollup_port and len(rollup_port["data"]) > 0
gt_port = [r for r in rollup_port["data"] if r["level"] == "Grand Total"]
assert len(gt_port) == 1 and gt_port[0]["record_count"] == 223112
print("Port Rollup grand total record_count:", gt_port[0]["record_count"])

rollup_status = client.get("/api/dwdm/rollup?group_by=status").json()
gt_status = [r for r in rollup_status["data"] if r["level"] == "Grand Total"]
assert len(gt_status) == 1 and gt_status[0]["record_count"] == 223112
print("Status Rollup grand total record_count:", gt_status[0]["record_count"])

rollup_date = client.get("/api/dwdm/rollup").json()
gt_date = [r for r in rollup_date["data"] if r["level"] == "Grand Total"]
assert len(gt_date) == 1 and gt_date[0]["record_count"] == 223112
print("Date-Status Rollup grand total record_count:", gt_date[0]["record_count"])

print("\n=== 5. TESTING /api/predict ===")
with open(root / "data" / "processed" / "dwdm_network_traffic_clean.csv", "r") as f:
    header = f.readline()
    sample_row = f.readline()
csv_payload = (header + sample_row).encode("utf-8")
pred_resp = client.post(
    "/api/predict",
    files={"file": ("test.csv", io.BytesIO(csv_payload), "text/csv")},
)
print("Predict HTTP status:", pred_resp.status_code)
assert pred_resp.status_code == 200, f"Predict failed: {pred_resp.text}"
pred_json = pred_resp.json()
print("Predict keys:", list(pred_json.keys()))
if "predictions" in pred_json and len(pred_json["predictions"]) > 0:
    first_pred = pred_json["predictions"][0]
    print("Sample prediction:", first_pred)
    assert first_pred.get("prediction") in ["NORMAL", "SUSPICIOUS"]

print("\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!")
