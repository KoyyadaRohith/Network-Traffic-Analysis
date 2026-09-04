import urllib.request
import urllib.parse
import json
import math

BASE_URL = "http://127.0.0.1:8000"

def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def test_endpoints():
    print("Testing all system endpoints...")
    
    # 1. Health & Root
    for p in ["/", "/health", "/db-health"]:
        status, data = get(p)
        assert status == 200, f"Failed {p}: {status}"
        print(f"PASS: {p} (200)")

    # 2. Analytics & Dashboard
    for p in [
        "/api/dashboard",
        "/api/analytics/summary",
        "/api/analytics/classification",
        "/api/analytics/ports",
        "/api/analytics/statistics",
        "/api/analytics/comparison",
        "/api/analytics/date-summary",
        "/api/analytics/traffic",
        "/api/analytics/port-drilldown/80",
    ]:
        status, data = get(p)
        assert status == 200, f"Failed {p}: {status}"
        print(f"PASS: {p} (200)")

    # 3. Dataset Explorer
    for p in [
        "/api/dataset/summary",
        "/api/dataset/class-distribution",
        "/api/dataset/features",
    ]:
        status, data = get(p)
        assert status == 200, f"Failed {p}: {status}"
        print(f"PASS: {p} (200)")

    # 4. Model Evaluation & Feature Importance (Step 13)
    status, eval_data = get("/api/model/evaluation")
    assert status == 200, f"Failed /api/model/evaluation: {status}"
    print("PASS: /api/model/evaluation (200)")

    # Verify requirements:
    # - exactly 62 features
    assert eval_data["feature_count"] == 62, f"Expected 62 features, got {eval_data['feature_count']}"
    # - confusion matrix totals equal 44,623
    cm = eval_data["confusion_matrix"]
    cm_total = cm["tn"] + cm["fp"] + cm["fn"] + cm["tp"]
    assert cm_total == 44623, f"Expected 44623 total in CM, got {cm_total}"
    assert cm["total"] == 44623
    assert cm["tn"] == 19019
    assert cm["fp"] == 0
    assert cm["fn"] == 6
    assert cm["tp"] == 25598

    # - class support totals equal 44,623
    class_metrics = eval_data["class_metrics"]
    support_total = sum(c["support"] for c in class_metrics)
    assert support_total == 44623, f"Expected support 44623, got {support_total}"

    # - no NaN/Infinity in returned metrics
    for k in ["accuracy", "precision", "recall", "f1_score"]:
        val = eval_data[k]
        assert not math.isnan(val) and not math.isinf(val), f"{k} is NaN/Inf"
    print(f"  Accuracy: {eval_data['accuracy']:.6f}")
    print(f"  Precision: {eval_data['precision']:.6f}")
    print(f"  Recall: {eval_data['recall']:.6f}")
    print(f"  F1 Score: {eval_data['f1_score']:.6f}")
    print(f"  Confusion Matrix: TN={cm['tn']}, FP={cm['fp']}, FN={cm['fn']}, TP={cm['tp']}")

    status, feat_data = get("/api/model/feature-importance")
    assert status == 200, f"Failed /api/model/feature-importance: {status}"
    print("PASS: /api/model/feature-importance (200)")

    # - feature importance list contains exactly 62 entries
    assert feat_data["total_features"] == 62, f"Expected 62 features, got {feat_data['total_features']}"
    assert len(feat_data["features"]) == 62
    assert len(feat_data["top_10"]) == 10

    # Verify descending sort and no NaN
    prev_imp = 999.0
    for idx, f in enumerate(feat_data["features"], 1):
        assert f["rank"] == idx
        imp = f["importance"]
        assert not math.isnan(imp) and not math.isinf(imp)
        assert imp <= prev_imp + 1e-9, f"Features not sorted descending at index {idx}: {imp} > {prev_imp}"
        prev_imp = imp

    print(f"  Top 3 Features: {feat_data['top_10'][0]['feature_name']} ({feat_data['top_10'][0]['importance']}), {feat_data['top_10'][1]['feature_name']} ({feat_data['top_10'][1]['importance']}), {feat_data['top_10'][2]['feature_name']} ({feat_data['top_10'][2]['importance']})")

    # 5. Dataset Explorer metadata checks
    status, ds_sum = get("/api/dataset/summary")
    assert ds_sum["warehouse_port_count"] == 23950, f"Expected 23950 distinct destination ports, got {ds_sum['warehouse_port_count']}"
    assert ds_sum["preprocessing"]["constant_features_removed"] == 10
    assert ds_sum["preprocessing"]["duplicate_features_removed"] == 6
    assert ds_sum["preprocessing"]["columns_after_cleaning"] == 64
    print(f"  Dataset Explorer Verified: 23,950 distinct ports, 64 clean columns (62 features + Label + Traffic_Status)")

    print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
