import os
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

# Paths to the model and feature specifications
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "random_forest_model.joblib"
FEATURES_PATH = BASE_DIR / "models" / "model_features.txt"

# Cache loaded model and features in memory
_model = None
_model_features = None


def get_model_features():
    """
    Loads and returns the list of required features in exact training order.
    """
    global _model_features
    if _model_features is None:
        if not FEATURES_PATH.exists():
            raise FileNotFoundError(f"Feature list not found at: {FEATURES_PATH}")
        with open(FEATURES_PATH, "r", encoding="utf-8") as f:
            _model_features = [line.strip() for line in f if line.strip()]
    return _model_features


def get_model():
    """
    Loads and returns the pre-trained Random Forest model.
    """
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Trained model file not found at: {MODEL_PATH}")
        _model = joblib.load(MODEL_PATH)
    return _model


def _calc_profile_metrics(df_subset: pd.DataFrame) -> dict:
    """
    Helper to compute traffic profile metrics safely from a DataFrame subset.
    """
    if df_subset.empty:
        return {
            "average_flow_duration": 0.0,
            "average_fwd_packets": 0.0,
            "average_backward_packets": 0.0,
            "average_packet_length": 0.0,
            "average_flow_bytes_per_sec": 0.0,
            "average_flow_packets_per_sec": 0.0,
        }

    def _safe_mean(col_name):
        if col_name in df_subset.columns:
            series = pd.to_numeric(df_subset[col_name], errors="coerce").replace([np.inf, -np.inf], np.nan)
            val = series.mean()
            return round(float(val), 2) if pd.notna(val) else 0.0
        return 0.0

    return {
        "average_flow_duration": _safe_mean("Flow Duration"),
        "average_fwd_packets": _safe_mean("Total Fwd Packets"),
        "average_backward_packets": _safe_mean("Total Backward Packets"),
        "average_packet_length": _safe_mean("Packet Length Mean"),
        "average_flow_bytes_per_sec": _safe_mean("Flow Bytes/s"),
        "average_flow_packets_per_sec": _safe_mean("Flow Packets/s"),
    }


def predict_traffic(df: pd.DataFrame):
    """
    Validates input DataFrame against the 62 model features, orders columns,
    cleans numeric values, and runs inference using the saved RandomForest model.

    Produces row-level predictions, analytical summaries, confidence breakdowns,
    traffic profile characteristics, class-specific statistics, and the formal
    NetGuard Analytical Risk Assessment report.
    """
    if df.empty:
        raise ValueError("The provided dataset is empty.")

    required_features = get_model_features()
    model = get_model()

    # 1. Validate required features
    missing_features = [f for f in required_features if f not in df.columns]
    if missing_features:
        raise ValueError(
            f"Dataset is missing {len(missing_features)} required feature(s): {', '.join(missing_features[:10])}"
            + (f" and {len(missing_features) - 10} more." if len(missing_features) > 10 else ".")
        )

    # 2. Select features strictly in the saved model's feature order
    X = df[required_features].copy()

    # 3. Safely convert to numeric and handle NaN/infinite values
    for col in required_features:
        X[col] = pd.to_numeric(X[col], errors="coerce")

    # Replace infinite values with NaN then fill with 0.0
    X.replace([np.inf, -np.inf], np.nan, inplace=True)
    X.fillna(0.0, inplace=True)

    # 4. Model inference
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)

    # Identify class index positions
    classes = list(model.classes_)
    normal_idx = classes.index("NORMAL") if "NORMAL" in classes else 0
    suspicious_idx = classes.index("SUSPICIOUS") if "SUSPICIOUS" in classes else 1

    total_records = len(predictions)
    normal_records = int(np.sum(predictions == "NORMAL"))
    suspicious_records = int(np.sum(predictions == "SUSPICIOUS"))

    normal_pct = round((normal_records / total_records) * 100, 2) if total_records > 0 else 0.0
    suspicious_pct = round((suspicious_records / total_records) * 100, 2) if total_records > 0 else 0.0

    # Build row-level predictions & record class confidences
    row_predictions = []
    confidences = []
    normal_confidences = []
    suspicious_confidences = []

    for i in range(total_records):
        pred = str(predictions[i])
        norm_prob = float(probabilities[i][normal_idx])
        susp_prob = float(probabilities[i][suspicious_idx])
        conf = susp_prob if pred == "SUSPICIOUS" else norm_prob

        confidences.append(conf)
        if pred == "NORMAL":
            normal_confidences.append(conf)
        else:
            suspicious_confidences.append(conf)

        row_predictions.append({
            "row_number": i + 1,
            "prediction": pred,
            "confidence": round(conf, 4),
            "normal_probability": round(norm_prob, 4),
            "suspicious_probability": round(susp_prob, 4)
        })

    # Confidence aggregations
    avg_conf = round(float(np.mean(confidences)), 4) if confidences else 0.0
    min_conf = round(float(np.min(confidences)), 4) if confidences else 0.0
    max_conf = round(float(np.max(confidences)), 4) if confidences else 0.0
    normal_avg_conf = round(float(np.mean(normal_confidences)), 4) if normal_confidences else None
    susp_avg_conf = round(float(np.mean(suspicious_confidences)), 4) if suspicious_confidences else None

    # Overall Status
    overall_status = "SUSPICIOUS" if suspicious_records > normal_records else "NORMAL"

    # Traffic Profile Metrics across entire dataset
    overall_profile = _calc_profile_metrics(df)

    most_common_port = None
    if "Destination Port" in df.columns:
        valid_ports = pd.to_numeric(df["Destination Port"], errors="coerce").dropna()
        if not valid_ports.empty:
            modes = valid_ports.mode()
            if not modes.empty:
                most_common_port = int(modes[0])

    overall_profile["most_common_destination_port"] = most_common_port

    # Class-specific traffic profiles
    is_normal_mask = (predictions == "NORMAL")
    is_suspicious_mask = (predictions == "SUSPICIOUS")

    normal_profile = _calc_profile_metrics(df[is_normal_mask])
    suspicious_profile = _calc_profile_metrics(df[is_suspicious_mask])

    # Risk Assessment calculation based on NetGuard Analytical Thresholds
    if suspicious_pct <= 10.0:
        risk_level = "LOW"
        risk_threshold = "0% – 10% suspicious traffic ratio"
        risk_description = (
            "Anomalous flow volume is minimal (<=10%). Observed packet transactions align with benign communication baselines."
        )
    elif suspicious_pct <= 30.0:
        risk_level = "MODERATE"
        risk_threshold = ">10% – 30% suspicious traffic ratio"
        risk_description = (
            "Elevated anomalous flow activity detected (10–30%). Moderate pattern deviation observed in the evaluated sample."
        )
    elif suspicious_pct <= 60.0:
        risk_level = "HIGH"
        risk_threshold = ">30% – 60% suspicious traffic ratio"
        risk_description = (
            "Substantial suspicious flow concentration observed (30–60%). Significant anomaly patterns detected in the evaluated sample."
        )
    else:
        risk_level = "CRITICAL"
        risk_threshold = ">60% – 100% suspicious traffic ratio"
        risk_description = (
            "Severe threat volume observed (>60% suspicious flows). Evaluated traffic is heavily dominated by anomaly signatures matching trained attack patterns."
        )

    # Narrative observations strictly adhering to factual data boundaries
    observations = [
        f"{total_records:,} network flow records were evaluated by the 62-feature Random Forest model.",
        f"Observed {suspicious_records:,} suspicious flows ({suspicious_pct}%) and {normal_records:,} normal flows ({normal_pct}%) in the analyzed sample.",
        f"NetGuard Analytical Risk Level is assessed as {risk_level} based on suspicious concentration ({risk_threshold}).",
        f"Model classification confidence averaged {round(avg_conf * 100, 2)}% across all evaluated flows.",
    ]

    if normal_avg_conf is not None:
        observations.append(f"Average confidence for NORMAL flow predictions: {round(normal_avg_conf * 100, 2)}%.")
    if susp_avg_conf is not None:
        observations.append(f"Average confidence for SUSPICIOUS flow predictions: {round(susp_avg_conf * 100, 2)}%.")
    if most_common_port is not None:
        observations.append(f"Most frequent destination port in the analyzed sample: Port {most_common_port}.")

    if overall_status == "SUSPICIOUS":
        summary_text = (
            f"Suspicious flow concentration was prominent ({suspicious_pct}% of evaluated flows). "
            f"Observed in the analyzed sample: significant flow volume matching trained anomalous intrusion patterns."
        )
        recommendation = (
            "Investigate affected destination ports and packet length anomalies. "
            "Correlate observed flow signatures with endpoint logs and apply targeted access control filtration."
        )
    else:
        summary_text = (
            f"Evaluated traffic was predominantly normal ({normal_pct}% benign flows). "
            f"Observed in the analyzed sample: baseline traffic patterns without extensive anomaly contamination."
        )
        recommendation = (
            "Maintain continuous network flow surveillance and routinely re-verify automated intrusion classification baselines."
        )

    # Formal TrafficReport structure
    traffic_report = {
        "overview": {
            "total_records": total_records,
            "normal_records": normal_records,
            "suspicious_records": suspicious_records,
            "normal_percentage": normal_pct,
            "suspicious_percentage": suspicious_pct,
        },
        "classification": {
            "normal_count": normal_records,
            "normal_percentage": normal_pct,
            "suspicious_count": suspicious_records,
            "suspicious_percentage": suspicious_pct,
        },
        "confidence": {
            "average_confidence": avg_conf,
            "minimum_confidence": min_conf,
            "maximum_confidence": max_conf,
            "normal_average_confidence": normal_avg_conf,
            "suspicious_average_confidence": susp_avg_conf,
        },
        "traffic_profile": overall_profile,
        "class_metrics": {
            "normal": {
                "count": normal_records,
                "percentage": normal_pct,
                "average_confidence": normal_avg_conf,
                **normal_profile
            },
            "suspicious": {
                "count": suspicious_records,
                "percentage": suspicious_pct,
                "average_confidence": susp_avg_conf,
                **suspicious_profile
            }
        },
        "risk_assessment": {
            "risk_level": risk_level,
            "framework": "NetGuard Analytical Risk Level",
            "threshold_applied": risk_threshold,
            "description": risk_description,
        },
        "observations": observations,
        "recommendation": recommendation,
    }

    return {
        "total_records": total_records,
        "normal_records": normal_records,
        "suspicious_records": suspicious_records,
        "normal_percentage": normal_pct,
        "suspicious_percentage": suspicious_pct,
        "predictions": row_predictions,
        "analysis": {
            "overall_status": overall_status,
            "summary": summary_text,
            "observations": observations,
            "recommendation": recommendation,
            "average_confidence": avg_conf,
            "min_confidence": min_conf,
            "max_confidence": max_conf,
            "normal_average_confidence": normal_avg_conf,
            "suspicious_average_confidence": susp_avg_conf,
        },
        "report": traffic_report,
    }
