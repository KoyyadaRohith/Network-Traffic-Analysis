import urllib.request
import json
import math

BASE_URL = "http://127.0.0.1:8000"

def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def test_step14():
    print("Testing DWDM & OLAP endpoints (Step 14)...", flush=True)

    # 1. Overview
    status, ov = get("/api/dwdm/overview")
    assert status == 200
    assert ov["database_name"] == "network_traffic_dw"
    assert ov["fact_table"] == "fact_network_traffic"
    assert ov["fact_rows"] == 223112, f"Expected 223112, got {ov['fact_rows']}"
    assert ov["date_count"] == 1
    assert ov["network_count"] == 23950
    assert ov["classification_count"] == 2
    assert "dim_date" in ov["dimension_tables"]
    assert "dim_network" in ov["dimension_tables"]
    assert "dim_classification" in ov["dimension_tables"]
    print("PASS: /api/dwdm/overview -> Verified 223,112 fact rows & exact dimension counts", flush=True)

    # 2. Classification Summary
    status, cs = get("/api/dwdm/classification-summary")
    assert status == 200
    assert cs["total_records"] == 223112
    assert len(cs["data"]) == 2
    class_map = {item["traffic_status"]: item for item in cs["data"]}
    assert "NORMAL" in class_map and "SUSPICIOUS" in class_map
    assert class_map["NORMAL"]["record_count"] == 95096, f"Expected NORMAL 95096, got {class_map['NORMAL']['record_count']}"
    assert class_map["SUSPICIOUS"]["record_count"] == 128016, f"Expected SUSPICIOUS 128016, got {class_map['SUSPICIOUS']['record_count']}"
    assert not math.isnan(class_map["NORMAL"]["average_flow_duration"])
    assert not math.isnan(class_map["SUSPICIOUS"]["average_packet_length"])
    print("PASS: /api/dwdm/classification-summary -> Verified NORMAL=95,096, SUSPICIOUS=128,016", flush=True)

    # 3. Port Analysis
    status, pa = get("/api/dwdm/port-analysis")
    assert status == 200
    assert len(pa["data"]) >= 10
    top = pa["data"][0]
    assert top["destination_port"] == 80
    assert top["total_records"] == 136562
    assert top["normal_records"] == 8549
    assert top["suspicious_records"] == 128013
    assert top["suspicious_percentage"] == 93.74
    print(f"PASS: /api/dwdm/port-analysis -> Top Port {top['destination_port']} has {top['total_records']} records", flush=True)

    # 4. Status Comparison
    status, sc = get("/api/dwdm/status-comparison")
    assert status == 200
    assert len(sc["data"]) == 2
    for item in sc["data"]:
        for k, v in item.items():
            if isinstance(v, float):
                assert not math.isnan(v) and not math.isinf(v)
    print("PASS: /api/dwdm/status-comparison -> Verified comparison measures without NaN/Inf", flush=True)

    # 5. Roll-Up Analysis
    status, ro = get("/api/dwdm/rollup")
    assert status == 200
    assert len(ro["data"]) == 4
    grand_total_row = [r for r in ro["data"] if r["level"] == "Grand Total"][0]
    assert grand_total_row["record_count"] == 223112
    assert grand_total_row["capture_date"] == "GRAND TOTAL"
    assert "one capture date" in ro["scope_notice"]
    print("PASS: /api/dwdm/rollup -> Verified WITH ROLLUP grand total 223,112 and single-date notice", flush=True)

    # 6. Drilldown
    status, dd = get("/api/dwdm/drilldown/80")
    assert status == 200
    assert dd["destination_port"] == 80
    assert dd["total_records"] == 136562
    assert "HTTP" in dd["service_name"]
    print("PASS: /api/dwdm/drilldown/80 -> Verified parameterized port inspection", flush=True)

    # 7. Query Catalog
    status, qc = get("/api/dwdm/queries")
    assert status == 200
    assert qc["total_queries"] == 8
    assert len(qc["queries"]) == 8
    for q in qc["queries"]:
        assert "password" not in q["sql"].lower()
        assert "root" not in q["sql"].lower()
    print("PASS: /api/dwdm/queries -> Verified 8 SQL catalog entries without credential leakage", flush=True)

    # 8. Check Regression on Key System Endpoints
    for p in [
        "/health",
        "/db-health",
        "/api/dashboard",
        "/api/dataset/summary",
        "/api/model/evaluation",
        "/api/model/feature-importance",
    ]:
        st, _ = get(p)
        assert st == 200, f"Regression check failed for {p}: {st}"
    print("PASS: Regression check on existing endpoints successful", flush=True)

    print("\nALL STEP 14 VERIFICATIONS PASSED SUCCESSFULLY!", flush=True)

if __name__ == "__main__":
    test_step14()
