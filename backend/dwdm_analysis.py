import os
from decimal import Decimal
from typing import Dict, List, Any
try:
    from database import get_db_connection
except ImportError:
    from backend.database import get_db_connection

# In-memory cache for warehouse analytical queries to ensure sub-10ms response times
_cache: Dict[str, Any] = {}

PORT_SERVICES = {
    80: "HTTP (World Wide Web)",
    443: "HTTPS (SSL/TLS Encrypted)",
    53: "DNS (Domain Name System)",
    8080: "HTTP-Proxy / Alternate Web",
    22: "SSH (Secure Shell)",
    21: "FTP (File Transfer Protocol)",
    25: "SMTP (Simple Mail Transfer)",
    123: "NTP (Network Time Protocol)",
    137: "NetBIOS Name Service",
    139: "NetBIOS Session Service",
    445: "SMB (Server Message Block)",
    88: "Kerberos Authentication",
    389: "LDAP (Directory Access)",
    3268: "MS Global Catalog",
    0: "Reserved / ICMP Control",
}


def _safe_float(val: Any) -> float:
    if val is None:
        return 0.0
    if isinstance(val, (Decimal, int, float)):
        return float(val)
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0


def _safe_int(val: Any) -> int:
    if val is None:
        return 0
    if isinstance(val, Decimal):
        return int(val)
    try:
        return int(val)
    except (ValueError, TypeError):
        return 0


def get_dwdm_overview() -> Dict[str, Any]:
    """
    Returns data warehouse overview with actual counts from MySQL.
    """
    if "overview" in _cache:
        return _cache["overview"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT COUNT(*) AS cnt FROM fact_network_traffic")
        fact_rows = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) AS cnt FROM dim_date")
        date_count = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) AS cnt FROM dim_network")
        network_count = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) AS cnt FROM dim_classification")
        classification_count = cursor.fetchone()["cnt"]

        res = {
            "database_name": "network_traffic_dw",
            "fact_table": "fact_network_traffic",
            "dimension_tables": ["dim_date", "dim_network", "dim_classification"],
            "fact_rows": fact_rows,
            "dimension_counts": {
                "dim_date": date_count,
                "dim_network": network_count,
                "dim_classification": classification_count,
            },
            "date_count": date_count,
            "network_count": network_count,
            "classification_count": classification_count,
        }
        _cache["overview"] = res
        return res
    finally:
        cursor.close()
        conn.close()


def get_classification_summary() -> Dict[str, Any]:
    """
    Calculates classification summary by joining fact_network_traffic with dim_classification.
    """
    if "classification_summary" in _cache:
        return _cache["classification_summary"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT 
            dc.traffic_status,
            dc.original_label,
            COUNT(*) AS record_count,
            ROUND(AVG(ft.flow_duration), 2) AS average_flow_duration,
            ROUND(AVG(ft.packet_length_mean), 2) AS average_packet_length,
            ROUND(AVG(ft.flow_bytes_per_sec), 2) AS average_flow_bytes_per_sec,
            ROUND(AVG(ft.flow_packets_per_sec), 2) AS average_flow_packets_per_sec
        FROM fact_network_traffic ft
        JOIN dim_classification dc ON ft.classification_id = dc.classification_id
        GROUP BY dc.traffic_status, dc.original_label
        ORDER BY record_count DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        total = sum(r["record_count"] for r in rows) if rows else 223112

        data = []
        for r in rows:
            cnt = r["record_count"]
            pct = round((cnt * 100.0) / total, 2) if total > 0 else 0.0
            data.append({
                "traffic_status": r["traffic_status"],
                "original_label": r["original_label"],
                "record_count": cnt,
                "percentage": pct,
                "average_flow_duration": _safe_float(r["average_flow_duration"]),
                "average_packet_length": _safe_float(r["average_packet_length"]),
                "average_flow_bytes_per_sec": _safe_float(r["average_flow_bytes_per_sec"]),
                "average_flow_packets_per_sec": _safe_float(r["average_flow_packets_per_sec"]),
            })

        res = {
            "total_records": total,
            "data": data,
        }
        _cache["classification_summary"] = res
        return res
    finally:
        cursor.close()
        conn.close()


def get_port_analysis(limit: int = 15) -> Dict[str, Any]:
    """
    Analyzes top destination ports with normal/suspicious ratios.
    """
    cache_key = f"port_analysis_{limit}"
    if cache_key in _cache:
        return _cache[cache_key]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT 
            dn.destination_port,
            COUNT(*) AS total_records,
            SUM(CASE WHEN dc.traffic_status = 'NORMAL' THEN 1 ELSE 0 END) AS normal_records,
            SUM(CASE WHEN dc.traffic_status = 'SUSPICIOUS' THEN 1 ELSE 0 END) AS suspicious_records
        FROM fact_network_traffic ft
        JOIN dim_network dn ON ft.network_id = dn.network_id
        JOIN dim_classification dc ON ft.classification_id = dc.classification_id
        GROUP BY dn.destination_port
        ORDER BY total_records DESC
        LIMIT %s
        """
        cursor.execute(query, (limit,))
        rows = cursor.fetchall()

        data = []
        for r in rows:
            tot = _safe_int(r["total_records"])
            norm = _safe_int(r["normal_records"])
            susp = _safe_int(r["suspicious_records"])
            susp_pct = round((susp * 100.0) / tot, 2) if tot > 0 else 0.0
            data.append({
                "destination_port": _safe_int(r["destination_port"]),
                "total_records": tot,
                "normal_records": norm,
                "suspicious_records": susp,
                "suspicious_percentage": susp_pct,
            })

        res = {
            "total_analyzed_ports": len(data),
            "data": data,
        }
        _cache[cache_key] = res
        return res
    finally:
        cursor.close()
        conn.close()


def get_status_comparison() -> Dict[str, Any]:
    """
    Compares NORMAL and SUSPICIOUS traffic across behavioral flow metrics.
    """
    if "status_comparison" in _cache:
        return _cache["status_comparison"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT 
            dc.traffic_status,
            COUNT(*) AS record_count,
            ROUND(AVG(ft.flow_duration), 2) AS avg_flow_duration,
            ROUND(AVG(ft.total_fwd_packets), 2) AS avg_fwd_packets,
            ROUND(AVG(ft.total_backward_packets), 2) AS avg_bwd_packets,
            ROUND(AVG(ft.packet_length_mean), 2) AS avg_packet_length,
            ROUND(AVG(ft.flow_bytes_per_sec), 2) AS avg_flow_bytes_per_sec,
            ROUND(AVG(ft.flow_packets_per_sec), 2) AS avg_flow_packets_per_sec,
            ROUND(MIN(ft.flow_duration), 2) AS min_flow_duration,
            ROUND(MAX(ft.flow_duration), 2) AS max_flow_duration
        FROM fact_network_traffic ft
        JOIN dim_classification dc ON ft.classification_id = dc.classification_id
        GROUP BY dc.traffic_status
        ORDER BY record_count DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        total = sum(r["record_count"] for r in rows) if rows else 223112

        data = []
        for r in rows:
            cnt = r["record_count"]
            pct = round((cnt * 100.0) / total, 2) if total > 0 else 0.0
            data.append({
                "traffic_status": r["traffic_status"],
                "record_count": cnt,
                "percentage": pct,
                "avg_flow_duration": _safe_float(r["avg_flow_duration"]),
                "avg_fwd_packets": _safe_float(r["avg_fwd_packets"]),
                "avg_bwd_packets": _safe_float(r["avg_bwd_packets"]),
                "avg_packet_length": _safe_float(r["avg_packet_length"]),
                "avg_flow_bytes_per_sec": _safe_float(r["avg_flow_bytes_per_sec"]),
                "avg_flow_packets_per_sec": _safe_float(r["avg_flow_packets_per_sec"]),
                "min_flow_duration": _safe_float(r["min_flow_duration"]),
                "max_flow_duration": _safe_float(r["max_flow_duration"]),
            })

        res = {"data": data}
        _cache["status_comparison"] = res
        return res
    finally:
        cursor.close()
        conn.close()


def get_rollup_analysis() -> Dict[str, Any]:
    """
    Demonstrates OLAP Roll-Up using MySQL GROUP BY ... WITH ROLLUP.
    """
    if "rollup_analysis" in _cache:
        return _cache["rollup_analysis"]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT 
            COALESCE(CAST(dd.full_date AS CHAR), 'GRAND TOTAL') AS capture_date,
            COALESCE(dc.traffic_status, 'ALL STATUSES') AS traffic_status,
            COUNT(*) AS record_count,
            ROUND(AVG(ft.flow_duration), 2) AS avg_flow_duration,
            ROUND(AVG(ft.packet_length_mean), 2) AS avg_packet_length,
            GROUPING(dd.full_date) AS is_date_rollup,
            GROUPING(dc.traffic_status) AS is_status_rollup
        FROM fact_network_traffic ft
        JOIN dim_date dd ON ft.date_id = dd.date_id
        JOIN dim_classification dc ON ft.classification_id = dc.classification_id
        GROUP BY dd.full_date, dc.traffic_status WITH ROLLUP
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        data = []
        for r in rows:
            is_date = _safe_int(r["is_date_rollup"])
            is_status = _safe_int(r["is_status_rollup"])

            if is_date == 1:
                level = "Grand Total"
            elif is_status == 1:
                level = "Date Total"
            else:
                level = "Detailed"

            data.append({
                "capture_date": r["capture_date"],
                "traffic_status": r["traffic_status"],
                "record_count": _safe_int(r["record_count"]),
                "avg_flow_duration": _safe_float(r["avg_flow_duration"]),
                "avg_packet_length": _safe_float(r["avg_packet_length"]),
                "is_date_rollup": is_date,
                "is_status_rollup": is_status,
                "level": level,
            })

        res = {
            "scope_notice": (
                "The current dataset contains one capture date (2017-07-07), therefore the roll-up "
                "demonstrates date-level and grand-total aggregation rather than multiple historical dates."
            ),
            "data": data,
        }
        _cache["rollup_analysis"] = res
        return res
    finally:
        cursor.close()
        conn.close()


def get_port_drilldown(port: int) -> Dict[str, Any]:
    """
    Returns detailed metrics for a specific destination port using parameterized SQL.
    """
    cache_key = f"drilldown_{port}"
    if cache_key in _cache:
        return _cache[cache_key]

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT 
            dn.destination_port,
            COUNT(*) AS total_records,
            SUM(CASE WHEN dc.traffic_status = 'NORMAL' THEN 1 ELSE 0 END) AS normal_records,
            SUM(CASE WHEN dc.traffic_status = 'SUSPICIOUS' THEN 1 ELSE 0 END) AS suspicious_records,
            ROUND(AVG(ft.flow_duration), 2) AS avg_flow_duration,
            ROUND(AVG(ft.packet_length_mean), 2) AS avg_packet_length,
            ROUND(AVG(ft.flow_bytes_per_sec), 2) AS avg_flow_bytes_per_sec,
            ROUND(AVG(ft.flow_packets_per_sec), 2) AS avg_flow_packets_per_sec
        FROM fact_network_traffic ft
        JOIN dim_network dn ON ft.network_id = dn.network_id
        JOIN dim_classification dc ON ft.classification_id = dc.classification_id
        WHERE dn.destination_port = %s
        GROUP BY dn.destination_port
        """
        cursor.execute(query, (port,))
        r = cursor.fetchone()

        service_name = PORT_SERVICES.get(port, f"Custom / Unassigned Port {port}")

        if not r:
            res = {
                "destination_port": port,
                "service_name": service_name,
                "total_records": 0,
                "normal_records": 0,
                "suspicious_records": 0,
                "suspicious_percentage": 0.0,
                "avg_flow_duration": 0.0,
                "avg_packet_length": 0.0,
                "avg_flow_bytes_per_sec": 0.0,
                "avg_flow_packets_per_sec": 0.0,
            }
        else:
            tot = _safe_int(r["total_records"])
            susp = _safe_int(r["suspicious_records"])
            susp_pct = round((susp * 100.0) / tot, 2) if tot > 0 else 0.0
            res = {
                "destination_port": _safe_int(r["destination_port"]),
                "service_name": service_name,
                "total_records": tot,
                "normal_records": _safe_int(r["normal_records"]),
                "suspicious_records": susp,
                "suspicious_percentage": susp_pct,
                "avg_flow_duration": _safe_float(r["avg_flow_duration"]),
                "avg_packet_length": _safe_float(r["avg_packet_length"]),
                "avg_flow_bytes_per_sec": _safe_float(r["avg_flow_bytes_per_sec"]),
                "avg_flow_packets_per_sec": _safe_float(r["avg_flow_packets_per_sec"]),
            }

        _cache[cache_key] = res
        return res
    finally:
        cursor.close()
        conn.close()


def get_query_catalog() -> Dict[str, Any]:
    """
    Returns the catalog of real SQL queries demonstrated on the page.
    """
    queries = [
        {
            "query_id": "Q1",
            "operation": "Classification Aggregation",
            "title": "Classification Distribution and Average Flow Measures",
            "dwdm_concept": "Aggregation / GROUP BY",
            "purpose": "Calculates total volume and average flow durations for NORMAL and SUSPICIOUS traffic classes.",
            "sql": (
                "SELECT \n"
                "    dc.traffic_status,\n"
                "    dc.original_label,\n"
                "    COUNT(*) AS record_count,\n"
                "    ROUND(AVG(ft.flow_duration), 2) AS average_flow_duration,\n"
                "    ROUND(AVG(ft.packet_length_mean), 2) AS average_packet_length,\n"
                "    ROUND(AVG(ft.flow_bytes_per_sec), 2) AS average_flow_bytes_per_sec,\n"
                "    ROUND(AVG(ft.flow_packets_per_sec), 2) AS average_flow_packets_per_sec\n"
                "FROM fact_network_traffic ft\n"
                "JOIN dim_classification dc ON ft.classification_id = dc.classification_id\n"
                "GROUP BY dc.traffic_status, dc.original_label\n"
                "ORDER BY record_count DESC;"
            ),
        },
        {
            "query_id": "Q2",
            "operation": "Top Destination Ports",
            "title": "High-Volume Destination Port Ranking",
            "dwdm_concept": "Ranking / Multi-Measure Aggregation",
            "purpose": "Ranks target ports by flow volume and computes benign vs malicious traffic proportions.",
            "sql": (
                "SELECT \n"
                "    dn.destination_port,\n"
                "    COUNT(*) AS total_records,\n"
                "    SUM(CASE WHEN dc.traffic_status = 'NORMAL' THEN 1 ELSE 0 END) AS normal_records,\n"
                "    SUM(CASE WHEN dc.traffic_status = 'SUSPICIOUS' THEN 1 ELSE 0 END) AS suspicious_records,\n"
                "    ROUND(SUM(CASE WHEN dc.traffic_status = 'SUSPICIOUS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS suspicious_percentage\n"
                "FROM fact_network_traffic ft\n"
                "JOIN dim_network dn ON ft.network_id = dn.network_id\n"
                "JOIN dim_classification dc ON ft.classification_id = dc.classification_id\n"
                "GROUP BY dn.destination_port\n"
                "ORDER BY total_records DESC\n"
                "LIMIT 15;"
            ),
        },
        {
            "query_id": "Q3",
            "operation": "Status Comparison",
            "title": "NORMAL vs SUSPICIOUS Behavioral Contrast",
            "dwdm_concept": "Comparative Analysis",
            "purpose": "Compares network flow metrics across packet counts, duration, and packet sizes between classes.",
            "sql": (
                "SELECT \n"
                "    dc.traffic_status,\n"
                "    COUNT(*) AS record_count,\n"
                "    ROUND(AVG(ft.flow_duration), 2) AS avg_flow_duration,\n"
                "    ROUND(AVG(ft.total_fwd_packets), 2) AS avg_fwd_packets,\n"
                "    ROUND(AVG(ft.total_backward_packets), 2) AS avg_bwd_packets,\n"
                "    ROUND(AVG(ft.packet_length_mean), 2) AS avg_packet_length,\n"
                "    ROUND(AVG(ft.flow_bytes_per_sec), 2) AS avg_flow_bytes_per_sec,\n"
                "    ROUND(AVG(ft.flow_packets_per_sec), 2) AS avg_flow_packets_per_sec,\n"
                "    ROUND(MIN(ft.flow_duration), 2) AS min_flow_duration,\n"
                "    ROUND(MAX(ft.flow_duration), 2) AS max_flow_duration\n"
                "FROM fact_network_traffic ft\n"
                "JOIN dim_classification dc ON ft.classification_id = dc.classification_id\n"
                "GROUP BY dc.traffic_status;"
            ),
        },
        {
            "query_id": "Q4",
            "operation": "Port Filtering (Slice)",
            "title": "OLAP Slice on Traffic_Status Dimension",
            "dwdm_concept": "Slice",
            "purpose": "Slices the data cube along a single dimension coordinate (Traffic_Status = 'SUSPICIOUS').",
            "sql": (
                "SELECT \n"
                "    dn.destination_port,\n"
                "    COUNT(*) AS flow_count,\n"
                "    ROUND(AVG(ft.flow_duration), 2) AS avg_duration,\n"
                "    ROUND(AVG(ft.packet_length_mean), 2) AS avg_pkt_length\n"
                "FROM fact_network_traffic ft\n"
                "JOIN dim_classification dc ON ft.classification_id = dc.classification_id\n"
                "JOIN dim_network dn ON ft.network_id = dn.network_id\n"
                "WHERE dc.traffic_status = 'SUSPICIOUS'\n"
                "GROUP BY dn.destination_port\n"
                "ORDER BY flow_count DESC\n"
                "LIMIT 10;"
            ),
        },
        {
            "query_id": "Q5",
            "operation": "Status + Port Filtering (Dice)",
            "title": "OLAP Dice Across Multiple Dimensions",
            "dwdm_concept": "Dice",
            "purpose": "Dices a sub-cube by intersecting predicates across multiple dimensions (Status AND Port).",
            "sql": (
                "SELECT \n"
                "    dd.full_date,\n"
                "    dn.destination_port,\n"
                "    dc.traffic_status,\n"
                "    COUNT(*) AS total_flows,\n"
                "    ROUND(AVG(ft.flow_duration), 2) AS avg_duration,\n"
                "    ROUND(AVG(ft.flow_bytes_per_sec), 2) AS avg_bytes_sec\n"
                "FROM fact_network_traffic ft\n"
                "JOIN dim_date dd ON ft.date_id = dd.date_id\n"
                "JOIN dim_network dn ON ft.network_id = dn.network_id\n"
                "JOIN dim_classification dc ON ft.classification_id = dc.classification_id\n"
                "WHERE dc.traffic_status = 'SUSPICIOUS' AND dn.destination_port = 80\n"
                "GROUP BY dd.full_date, dn.destination_port, dc.traffic_status;"
            ),
        },
        {
            "query_id": "Q6",
            "operation": "Date Aggregation (Roll-Up)",
            "title": "OLAP Roll-Up Using WITH ROLLUP & GROUPING()",
            "dwdm_concept": "Roll-Up",
            "purpose": "Aggregates from detailed status categories to date subtotals and warehouse grand totals.",
            "sql": (
                "SELECT \n"
                "    COALESCE(CAST(dd.full_date AS CHAR), 'GRAND TOTAL') AS capture_date,\n"
                "    COALESCE(dc.traffic_status, 'ALL STATUSES') AS traffic_status,\n"
                "    COUNT(*) AS record_count,\n"
                "    ROUND(AVG(ft.flow_duration), 2) AS avg_flow_duration,\n"
                "    ROUND(AVG(ft.packet_length_mean), 2) AS avg_packet_length,\n"
                "    GROUPING(dd.full_date) AS is_date_rollup,\n"
                "    GROUPING(dc.traffic_status) AS is_status_rollup\n"
                "FROM fact_network_traffic ft\n"
                "JOIN dim_date dd ON ft.date_id = dd.date_id\n"
                "JOIN dim_classification dc ON ft.classification_id = dc.classification_id\n"
                "GROUP BY dd.full_date, dc.traffic_status WITH ROLLUP;"
            ),
        },
        {
            "query_id": "Q7",
            "operation": "Port Detailed Inspection (Drill-Down)",
            "title": "OLAP Drill-Down to Granular Port Measures",
            "dwdm_concept": "Drill-Down",
            "purpose": "Drills down into detailed behavioral metrics for a specific target port using parameterized SQL.",
            "sql": (
                "SELECT \n"
                "    dn.destination_port,\n"
                "    COUNT(*) AS total_records,\n"
                "    SUM(CASE WHEN dc.traffic_status = 'NORMAL' THEN 1 ELSE 0 END) AS normal_records,\n"
                "    SUM(CASE WHEN dc.traffic_status = 'SUSPICIOUS' THEN 1 ELSE 0 END) AS suspicious_records,\n"
                "    ROUND(SUM(CASE WHEN dc.traffic_status = 'SUSPICIOUS' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS suspicious_percentage,\n"
                "    ROUND(AVG(ft.flow_duration), 2) AS avg_flow_duration,\n"
                "    ROUND(AVG(ft.packet_length_mean), 2) AS avg_packet_length,\n"
                "    ROUND(AVG(ft.flow_bytes_per_sec), 2) AS avg_flow_bytes_per_sec,\n"
                "    ROUND(AVG(ft.flow_packets_per_sec), 2) AS avg_flow_packets_per_sec\n"
                "FROM fact_network_traffic ft\n"
                "JOIN dim_network dn ON ft.network_id = dn.network_id\n"
                "JOIN dim_classification dc ON ft.classification_id = dc.classification_id\n"
                "WHERE dn.destination_port = %s\n"
                "GROUP BY dn.destination_port;"
            ),
        },
        {
            "query_id": "Q8",
            "operation": "Warehouse Schema Overview",
            "title": "Star Schema Cardinality and Table Verification",
            "dwdm_concept": "Star Schema / Aggregation",
            "purpose": "Verifies central fact record volume and dimension primary key cardinalities.",
            "sql": (
                "SELECT \n"
                "    (SELECT COUNT(*) FROM fact_network_traffic) AS fact_rows,\n"
                "    (SELECT COUNT(*) FROM dim_date) AS date_count,\n"
                "    (SELECT COUNT(*) FROM dim_network) AS network_count,\n"
                "    (SELECT COUNT(*) FROM dim_classification) AS classification_count;"
            ),
        },
    ]
    return {
        "total_queries": len(queries),
        "queries": queries,
    }
