"""
Automated Verification Script for CyberFlow Vercel Deployment Readiness
Tests:
1. Python backend import & ASGI app creation via api/index.py
2. Model loading (random_forest_model.joblib & model_features.txt)
3. API endpoints using FastAPI TestClient
4. Inference / prediction pipeline using traffic_classification_demo.csv
"""
import sys
import os
from pathlib import Path
import warnings

# Suppress sklearn unpickle warning during verification test output
warnings.filterwarnings("ignore")

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))
sys.path.insert(0, str(REPO_ROOT / "backend"))

def run_tests():
    print("=" * 60)
    print("CYBERFLOW INTELLIGENCE — VERCEL READINESS TEST SUITE")
    print("=" * 60)

    # Test 1: Entrypoint & ASGI import
    print("\n[TEST 1] Testing api/index.py ASGI entrypoint...")
    try:
        from api.index import app
        print(f"  [PASS] Successfully imported FastAPI app: '{app.title}' (v{app.version})")
    except Exception as e:
        print(f"  [FAIL] FAILED to import app from api/index.py: {e}")
        return False

    # Test 2: Model & features loading
    print("\n[TEST 2] Testing ML model & features loading...")
    try:
        from backend.prediction import get_model, get_model_features
        features = get_model_features()
        print(f"  [PASS] Feature list loaded: {len(features)} features")
        assert len(features) == 62, f"Expected 62 features, got {len(features)}"

        model = get_model()
        print(f"  [PASS] Random Forest model loaded: {type(model).__name__} (n_estimators={getattr(model, 'n_estimators', 'N/A')})")
    except Exception as e:
        print(f"  [FAIL] FAILED to load model/features: {e}")
        return False

    # Test 3: API Endpoint Tests with TestClient
    print("\n[TEST 3] Testing FastAPI endpoints via TestClient...")
    try:
        from fastapi.testclient import TestClient
        client = TestClient(app)

        # 3.1 Root & Health endpoints
        r_root = client.get("/")
        assert r_root.status_code == 200, f"Root returned {r_root.status_code}"
        print(f"  [PASS] GET / -> 200 OK ({r_root.json().get('message')})")

        r_health = client.get("/health")
        assert r_health.status_code == 200
        print(f"  [PASS] GET /health -> 200 OK")

        r_api_health = client.get("/api/health")
        assert r_api_health.status_code == 200
        print(f"  [PASS] GET /api/health -> 200 OK")

        # 3.2 Dataset features endpoint
        r_feat = client.get("/api/dataset/features")
        assert r_feat.status_code == 200
        print(f"  [PASS] GET /api/dataset/features -> 200 OK (total features: {r_feat.json().get('total_features')})")

        # 3.3 Dataset summary endpoint
        r_sum = client.get("/api/dataset/summary")
        assert r_sum.status_code == 200
        print(f"  [PASS] GET /api/dataset/summary -> 200 OK (raw rows: {r_sum.json().get('raw_file', {}).get('row_count')})")

        # 3.4 Model evaluation endpoint
        r_eval = client.get("/api/model/evaluation")
        assert r_eval.status_code == 200
        print(f"  [PASS] GET /api/model/evaluation -> 200 OK (accuracy: {r_eval.json().get('accuracy') * 100:.4f}%)")

        # 3.5 Feature importance endpoint
        r_imp = client.get("/api/model/feature-importance")
        assert r_imp.status_code == 200
        top_feature = r_imp.json().get("top_10", [{}])[0].get("feature_name")
        print(f"  [PASS] GET /api/model/feature-importance -> 200 OK (rank 1: {top_feature})")

    except Exception as e:
        print(f"  [FAIL] FAILED endpoint tests: {e}")
        return False

    # Test 4: Prediction test with traffic_classification_demo.csv
    print("\n[TEST 4] Testing live CSV inference with traffic_classification_demo.csv...")
    demo_csv_paths = [
        REPO_ROOT / "data" / "traffic_classification_demo.csv",
        REPO_ROOT / "frontend" / "public" / "traffic_classification_demo.csv",
        REPO_ROOT / "frontend" / "public" / "sample_traffic_test.csv"
    ]
    test_csv = next((p for p in demo_csv_paths if p.exists()), None)
    if not test_csv:
        print("  [FAIL]: No demo CSV file found.")
        return False

    try:
        with open(test_csv, "rb") as f:
            r_pred = client.post("/api/predict", files={"file": ("traffic_classification_demo.csv", f, "text/csv")})
        
        assert r_pred.status_code == 200, f"Expected 200, got {r_pred.status_code}: {r_pred.text}"
        data = r_pred.json()
        print(f"  [PASS] POST /api/predict -> 200 OK")
        print(f"    - Total records evaluated: {data.get('total_records')}")
        print(f"    - NORMAL flows: {data.get('normal_records')} ({data.get('normal_percentage')}%)")
        print(f"    - SUSPICIOUS flows: {data.get('suspicious_records')} ({data.get('suspicious_percentage')}%)")
        print(f"    - Threat summary: {data.get('analysis', {}).get('overall_status')}")
    except Exception as e:
        print(f"  [FAIL] FAILED prediction test: {e}")
        return False

    print("\n" + "=" * 60)
    print("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
