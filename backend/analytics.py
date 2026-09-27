import logging
from database import get_db_connection

logger = logging.getLogger(__name__)


def get_summary():
    """
    Retrieves overall traffic summary: total, normal, suspicious counts,
    and their respective percentages.
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT 
                COUNT(*) AS total_records,
                SUM(CASE WHEN c.traffic_status = 'NORMAL' THEN 1 ELSE 0 END) AS normal_records,
                SUM(CASE WHEN c.traffic_status = 'SUSPICIOUS' THEN 1 ELSE 0 END) AS suspicious_records
            FROM fact_network_traffic f
            JOIN dim_classification c ON f.classification_id = c.classification_id;
        """
        cursor.execute(query)
        result = cursor.fetchone()

        total = int(result["total_records"] or 0)
        normal = int(result["normal_records"] or 0)
        suspicious = int(result["suspicious_records"] or 0)

        normal_pct = round((normal / total) * 100, 2) if total > 0 else 0.0
        suspicious_pct = round((suspicious / total) * 100, 2) if total > 0 else 0.0

        return {
            "total_records": total,
            "normal_records": normal,
            "suspicious_records": suspicious,
            "normal_percentage": normal_pct,
            "suspicious_percentage": suspicious_pct
        }
    except Exception as e:
        logger.error(f"Error in get_summary: {type(e).__name__}")
        raise
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def get_classification_distribution():
    """
    Retrieves distribution of traffic classifications with record counts
    and percentages against total fact records.
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Get total records for percentage calculation
        cursor.execute("SELECT COUNT(*) AS total FROM fact_network_traffic;")
        total_row = cursor.fetchone()
        total = int(total_row["total"] or 0)

        query = """
            SELECT 
                c.traffic_status,
                c.original_label,
                COUNT(*) AS total_records
            FROM fact_network_traffic f
            JOIN dim_classification c ON f.classification_id = c.classification_id
            GROUP BY c.traffic_status, c.original_label
            ORDER BY total_records DESC;
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        data = []
        for row in rows:
            rec_count = int(row["total_records"] or 0)
            percentage = round((rec_count / total) * 100, 2) if total > 0 else 0.0
            data.append({
                "traffic_status": row["traffic_status"],
                "original_label": row["original_label"],
                "total_records": rec_count,
                "percentage": percentage
            })

        return {"data": data}
    except Exception as e:
        logger.error(f"Error in get_classification_distribution: {type(e).__name__}")
        raise
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def get_top_ports(limit: int = 10):
    """
    Retrieves the most frequently observed destination ports grouped
    by port and traffic classification status.
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT 
                n.destination_port,
                c.traffic_status,
                COUNT(*) AS total_records
            FROM fact_network_traffic f
            JOIN dim_network n ON f.network_id = n.network_id
            JOIN dim_classification c ON f.classification_id = c.classification_id
            GROUP BY n.destination_port, c.traffic_status
            ORDER BY total_records DESC
            LIMIT %s;
        """
        cursor.execute(query, (limit,))
        rows = cursor.fetchall()

        data = [
            {
                "destination_port": int(row["destination_port"]),
                "traffic_status": row["traffic_status"],
                "total_records": int(row["total_records"])
            }
            for row in rows
        ]

        return {"data": data}
    except Exception as e:
        logger.error(f"Error in get_top_ports: {type(e).__name__}")
        raise
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def get_statistics():
    """
    Computes overall aggregate metrics (min, max, average) for core
    flow and packet length features.
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT
                MIN(flow_duration) AS min_flow_duration,
                MAX(flow_duration) AS max_flow_duration,
                AVG(flow_duration) AS avg_flow_duration,

                MIN(total_fwd_packets) AS min_total_fwd_packets,
                MAX(total_fwd_packets) AS max_total_fwd_packets,
                AVG(total_fwd_packets) AS avg_total_fwd_packets,

                MIN(total_backward_packets) AS min_total_backward_packets,
                MAX(total_backward_packets) AS max_total_backward_packets,
                AVG(total_backward_packets) AS avg_total_backward_packets,

                MIN(flow_bytes_per_sec) AS min_flow_bytes_per_sec,
                MAX(flow_bytes_per_sec) AS max_flow_bytes_per_sec,
                AVG(flow_bytes_per_sec) AS avg_flow_bytes_per_sec,

                MIN(flow_packets_per_sec) AS min_flow_packets_per_sec,
                MAX(flow_packets_per_sec) AS max_flow_packets_per_sec,
                AVG(flow_packets_per_sec) AS avg_flow_packets_per_sec,

                MIN(packet_length_mean) AS min_packet_length_mean,
                MAX(packet_length_mean) AS max_packet_length_mean,
                AVG(packet_length_mean) AS avg_packet_length_mean,

                MIN(packet_length_variance) AS min_packet_length_variance,
                MAX(packet_length_variance) AS max_packet_length_variance,
                AVG(packet_length_variance) AS avg_packet_length_variance
            FROM fact_network_traffic;
        """
        cursor.execute(query)
        row = cursor.fetchone()

        def _format_stat(min_val, max_val, avg_val):
            return {
                "minimum": round(float(min_val or 0.0), 2),
                "maximum": round(float(max_val or 0.0), 2),
                "average": round(float(avg_val or 0.0), 2)
            }

        return {
            "data": {
                "flow_duration": _format_stat(
                    row["min_flow_duration"],
                    row["max_flow_duration"],
                    row["avg_flow_duration"]
                ),
                "total_fwd_packets": _format_stat(
                    row["min_total_fwd_packets"],
                    row["max_total_fwd_packets"],
                    row["avg_total_fwd_packets"]
                ),
                "total_backward_packets": _format_stat(
                    row["min_total_backward_packets"],
                    row["max_total_backward_packets"],
                    row["avg_total_backward_packets"]
                ),
                "flow_bytes_per_sec": _format_stat(
                    row["min_flow_bytes_per_sec"],
                    row["max_flow_bytes_per_sec"],
                    row["avg_flow_bytes_per_sec"]
                ),
                "flow_packets_per_sec": _format_stat(
                    row["min_flow_packets_per_sec"],
                    row["max_flow_packets_per_sec"],
                    row["avg_flow_packets_per_sec"]
                ),
                "packet_length_mean": _format_stat(
                    row["min_packet_length_mean"],
                    row["max_packet_length_mean"],
                    row["avg_packet_length_mean"]
                ),
                "packet_length_variance": _format_stat(
                    row["min_packet_length_variance"],
                    row["max_packet_length_variance"],
                    row["avg_packet_length_variance"]
                )
            }
        }
    except Exception as e:
        logger.error(f"Error in get_statistics: {type(e).__name__}")
        raise
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def get_classification_comparison():
    """
    Compares feature averages and volume between NORMAL and SUSPICIOUS
    traffic.
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT 
                c.traffic_status,
                COUNT(*) AS total_records,
                AVG(f.flow_duration) AS average_flow_duration,
                AVG(f.total_fwd_packets) AS average_fwd_packets,
                AVG(f.total_backward_packets) AS average_backward_packets,
                AVG(f.packet_length_mean) AS average_packet_length,
                AVG(f.flow_bytes_per_sec) AS average_flow_bytes_per_sec,
                AVG(f.flow_packets_per_sec) AS average_flow_packets_per_sec
            FROM fact_network_traffic f
            JOIN dim_classification c ON f.classification_id = c.classification_id
            GROUP BY c.traffic_status
            ORDER BY CASE WHEN c.traffic_status = 'SUSPICIOUS' THEN 1 ELSE 2 END;
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        data = [
            {
                "traffic_status": row["traffic_status"],
                "total_records": int(row["total_records"] or 0),
                "average_flow_duration": round(float(row["average_flow_duration"] or 0.0), 2),
                "average_fwd_packets": round(float(row["average_fwd_packets"] or 0.0), 2),
                "average_backward_packets": round(float(row["average_backward_packets"] or 0.0), 2),
                "average_packet_length": round(float(row["average_packet_length"] or 0.0), 2),
                "average_flow_bytes_per_sec": round(float(row["average_flow_bytes_per_sec"] or 0.0), 2),
                "average_flow_packets_per_sec": round(float(row["average_flow_packets_per_sec"] or 0.0), 2)
            }
            for row in rows
        ]

        return {"data": data}
    except Exception as e:
        logger.error(f"Error in get_classification_comparison: {type(e).__name__}")
        raise
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def get_date_summary():
    """
    Retrieves traffic record aggregations grouped chronologically by date.
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT 
                d.full_date AS `date`,
                d.year,
                d.month,
                d.day,
                d.day_of_week,
                COUNT(*) AS total_records
            FROM fact_network_traffic f
            JOIN dim_date d ON f.date_id = d.date_id
            GROUP BY d.full_date, d.year, d.month, d.day, d.day_of_week
            ORDER BY d.full_date ASC;
        """
        cursor.execute(query)
        rows = cursor.fetchall()

        data = [
            {
                "date": str(row["date"]),
                "year": int(row["year"]),
                "month": int(row["month"]),
                "day": int(row["day"]),
                "day_of_week": row["day_of_week"],
                "total_records": int(row["total_records"] or 0)
            }
            for row in rows
        ]

        return {"data": data}
    except Exception as e:
        logger.error(f"Error in get_date_summary: {type(e).__name__}")
        raise
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


import math

FEATURE_DISPLAY_NAMES = {
    "destination_port": "Destination Port",
    "flow_duration": "Flow Duration",
    "total_fwd_packets": "Total Fwd Packets",
    "total_backward_packets": "Total Backward Packets",
    "total_length_fwd_packets": "Total Length of Fwd Packets",
    "total_length_bwd_packets": "Total Length of Bwd Packets",
    "fwd_packet_length_max": "Fwd Packet Length Max",
    "fwd_packet_length_min": "Fwd Packet Length Min",
    "fwd_packet_length_mean": "Fwd Packet Length Mean",
    "fwd_packet_length_std": "Fwd Packet Length Std",
    "bwd_packet_length_max": "Bwd Packet Length Max",
    "bwd_packet_length_min": "Bwd Packet Length Min",
    "bwd_packet_length_mean": "Bwd Packet Length Mean",
    "bwd_packet_length_std": "Bwd Packet Length Std",
    "flow_bytes_per_sec": "Flow Bytes/s",
    "flow_packets_per_sec": "Flow Packets/s",
    "flow_iat_mean": "Flow IAT Mean",
    "flow_iat_std": "Flow IAT Std",
    "flow_iat_max": "Flow IAT Max",
    "flow_iat_min": "Flow IAT Min",
    "fwd_iat_total": "Fwd IAT Total",
    "fwd_iat_mean": "Fwd IAT Mean",
    "fwd_iat_std": "Fwd IAT Std",
    "fwd_iat_max": "Fwd IAT Max",
    "fwd_iat_min": "Fwd IAT Min",
    "bwd_iat_total": "Bwd IAT Total",
    "bwd_iat_mean": "Bwd IAT Mean",
    "bwd_iat_std": "Bwd IAT Std",
    "bwd_iat_max": "Bwd IAT Max",
    "bwd_iat_min": "Bwd IAT Min",
    "fwd_psh_flags": "Fwd PSH Flags",
    "fwd_header_length": "Fwd Header Length",
    "bwd_header_length": "Bwd Header Length",
    "fwd_packets_per_sec": "Fwd Packets/s",
    "bwd_packets_per_sec": "Bwd Packets/s",
    "min_packet_length": "Min Packet Length",
    "max_packet_length": "Max Packet Length",
    "packet_length_mean": "Packet Length Mean",
    "packet_length_std": "Packet Length Std",
    "packet_length_variance": "Packet Length Variance",
    "fin_flag_count": "FIN Flag Count",
    "syn_flag_count": "SYN Flag Count",
    "rst_flag_count": "RST Flag Count",
    "psh_flag_count": "PSH Flag Count",
    "ack_flag_count": "ACK Flag Count",
    "urg_flag_count": "URG Flag Count",
    "ece_flag_count": "ECE Flag Count",
    "down_up_ratio": "Down/Up Ratio",
    "average_packet_size": "Average Packet Size",
    "avg_bwd_segment_size": "Avg Bwd Segment Size",
    "init_win_bytes_forward": "Init_Win_bytes_forward",
    "init_win_bytes_backward": "Init_Win_bytes_backward",
    "act_data_pkt_fwd": "act_data_pkt_fwd",
    "min_seg_size_forward": "min_seg_size_forward",
    "active_mean": "Active Mean",
    "active_std": "Active Std",
    "active_max": "Active Max",
    "active_min": "Active Min",
    "idle_mean": "Idle Mean",
    "idle_std": "Idle Std",
    "idle_max": "Idle Max",
    "idle_min": "Idle Min",
}


def _format_traffic_record(row):
    all_feats = {}
    for col, display_name in FEATURE_DISPLAY_NAMES.items():
        if col in row and row[col] is not None:
            val = row[col]
            if isinstance(val, (int, float)):
                all_feats[display_name] = round(float(val), 4) if isinstance(val, float) else val
            else:
                all_feats[display_name] = val

    return {
        "traffic_id": int(row["traffic_id"]),
        "destination_port": int(row.get("destination_port", 0)),
        "traffic_status": row.get("traffic_status", "UNKNOWN"),
        "original_label": row.get("original_label"),
        "date": str(row.get("date", "2017-07-07")),
        "flow_duration": round(float(row.get("flow_duration") or 0.0), 2),
        "total_fwd_packets": round(float(row.get("total_fwd_packets") or 0.0), 2),
        "total_backward_packets": round(float(row.get("total_backward_packets") or 0.0), 2),
        "total_length_fwd_packets": round(float(row.get("total_length_fwd_packets") or 0.0), 2),
        "total_length_bwd_packets": round(float(row.get("total_length_bwd_packets") or 0.0), 2),
        "packet_length_mean": round(float(row.get("packet_length_mean") or 0.0), 2),
        "min_packet_length": round(float(row.get("min_packet_length") or 0.0), 2),
        "max_packet_length": round(float(row.get("max_packet_length") or 0.0), 2),
        "packet_length_std": round(float(row.get("packet_length_std") or 0.0), 2),
        "packet_length_variance": round(float(row.get("packet_length_variance") or 0.0), 2),
        "flow_bytes_per_sec": round(float(row.get("flow_bytes_per_sec") or 0.0), 2),
        "flow_packets_per_sec": round(float(row.get("flow_packets_per_sec") or 0.0), 2),
        "all_features": all_feats,
    }


def get_traffic_record_by_id(traffic_id: int):
    """
    Retrieves a single complete network flow record by traffic_id from MySQL.
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT 
                f.*,
                c.traffic_status,
                c.original_label,
                d.full_date AS `date`
            FROM fact_network_traffic f
            JOIN dim_classification c ON f.classification_id = c.classification_id
            JOIN dim_network n ON f.network_id = n.network_id
            JOIN dim_date d ON f.date_id = d.date_id
            WHERE f.traffic_id = %s
            LIMIT 1;
        """
        cursor.execute(query, (int(traffic_id),))
        row = cursor.fetchone()
        if not row:
            return None
        return _format_traffic_record(row)
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def get_filtered_traffic_analytics(
    status: str = None,
    destination_port: int = None,
    date: str = None,
    page: int = None,
    page_size: int = 25,
    search: str = None,
    sort_by: str = None,
    sort_order: str = "asc",
):
    """
    OLAP analysis query performing parameterized server-side SQL aggregation
    across fact_network_traffic joined with dim_classification, dim_network, and dim_date.
    Supports optional slicing by status, destination_port, date, search, and pagination.
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        where_clauses = []
        params = []

        if status:
            cleaned_status = status.strip().upper()
            if cleaned_status in ("NORMAL", "SUSPICIOUS"):
                where_clauses.append("c.traffic_status = %s")
                params.append(cleaned_status)

        if destination_port is not None:
            where_clauses.append("n.destination_port = %s")
            params.append(int(destination_port))

        if date:
            where_clauses.append("d.full_date = %s")
            params.append(date.strip())

        if search:
            search_str = search.strip()
            if search_str:
                if search_str.isdigit():
                    where_clauses.append("(f.traffic_id = %s OR n.destination_port = %s)")
                    params.extend([int(search_str), int(search_str)])
                else:
                    search_upper = search_str.upper()
                    if "SUSP" in search_upper:
                        where_clauses.append("c.traffic_status = 'SUSPICIOUS'")
                    elif "NORM" in search_upper or "BENIGN" in search_upper:
                        where_clauses.append("c.traffic_status = 'NORMAL'")
                    else:
                        where_clauses.append("(c.traffic_status LIKE %s OR c.original_label LIKE %s)")
                        params.extend([f"%{search_str}%", f"%{search_str}%"])

        where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

        # 1. Summary & Aggregate Metrics Query
        summary_query = f"""
            SELECT 
                COUNT(*) AS total_records,
                SUM(CASE WHEN c.traffic_status = 'NORMAL' THEN 1 ELSE 0 END) AS normal_records,
                SUM(CASE WHEN c.traffic_status = 'SUSPICIOUS' THEN 1 ELSE 0 END) AS suspicious_records,
                AVG(f.flow_duration) AS avg_flow_duration,
                AVG(f.total_fwd_packets) AS avg_total_fwd_packets,
                AVG(f.total_backward_packets) AS avg_total_backward_packets,
                AVG(f.packet_length_mean) AS avg_packet_length_mean,
                AVG(f.flow_bytes_per_sec) AS avg_flow_bytes_per_sec,
                AVG(f.flow_packets_per_sec) AS avg_flow_packets_per_sec
            FROM fact_network_traffic f
            JOIN dim_classification c ON f.classification_id = c.classification_id
            JOIN dim_network n ON f.network_id = n.network_id
            JOIN dim_date d ON f.date_id = d.date_id
            {where_sql};
        """
        cursor.execute(summary_query, tuple(params))
        summary_row = cursor.fetchone()

        total = int(summary_row["total_records"] or 0)
        normal = int(summary_row["normal_records"] or 0)
        suspicious = int(summary_row["suspicious_records"] or 0)

        normal_pct = round((normal / total) * 100, 2) if total > 0 else 0.0
        suspicious_pct = round((suspicious / total) * 100, 2) if total > 0 else 0.0

        stats = {
            "average_flow_duration": round(float(summary_row["avg_flow_duration"] or 0.0), 2),
            "average_fwd_packets": round(float(summary_row["avg_total_fwd_packets"] or 0.0), 2),
            "average_backward_packets": round(float(summary_row["avg_total_backward_packets"] or 0.0), 2),
            "average_packet_length": round(float(summary_row["avg_packet_length_mean"] or 0.0), 2),
            "average_flow_bytes_per_sec": round(float(summary_row["avg_flow_bytes_per_sec"] or 0.0), 2),
            "average_flow_packets_per_sec": round(float(summary_row["avg_flow_packets_per_sec"] or 0.0), 2),
        }

        # 2. Classification distribution with applied filters
        class_query = f"""
            SELECT 
                c.traffic_status,
                c.original_label,
                COUNT(*) AS total_records
            FROM fact_network_traffic f
            JOIN dim_classification c ON f.classification_id = c.classification_id
            JOIN dim_network n ON f.network_id = n.network_id
            JOIN dim_date d ON f.date_id = d.date_id
            {where_sql}
            GROUP BY c.traffic_status, c.original_label
            ORDER BY total_records DESC;
        """
        cursor.execute(class_query, tuple(params))
        class_rows = cursor.fetchall()

        classification_data = []
        for cr in class_rows:
            cnt = int(cr["total_records"] or 0)
            classification_data.append({
                "traffic_status": cr["traffic_status"],
                "original_label": cr["original_label"],
                "total_records": cnt,
                "percentage": round((cnt / total) * 100, 2) if total > 0 else 0.0
            })

        # 3. Top destination ports with applied filters
        ports_query = f"""
            SELECT 
                n.destination_port,
                c.traffic_status,
                COUNT(*) AS total_records
            FROM fact_network_traffic f
            JOIN dim_network n ON f.network_id = n.network_id
            JOIN dim_classification c ON f.classification_id = c.classification_id
            JOIN dim_date d ON f.date_id = d.date_id
            {where_sql}
            GROUP BY n.destination_port, c.traffic_status
            ORDER BY total_records DESC
            LIMIT 15;
        """
        cursor.execute(ports_query, tuple(params))
        port_rows = cursor.fetchall()

        ports_data = []
        for pr in port_rows:
            cnt = int(pr["total_records"] or 0)
            ports_data.append({
                "destination_port": int(pr["destination_port"]),
                "traffic_status": pr["traffic_status"],
                "total_records": cnt,
                "percentage": round((cnt / total) * 100, 2) if total > 0 else 0.0
            })

        # 4. Metadata: available capture dates and top ports for filter options
        cursor.execute("SELECT DISTINCT full_date FROM dim_date ORDER BY full_date ASC;")
        date_rows = cursor.fetchall()
        available_dates = [str(r["full_date"]) for r in date_rows]

        cursor.execute("""
            SELECT n.destination_port, COUNT(*) as cnt
            FROM fact_network_traffic f
            JOIN dim_network n ON f.network_id = n.network_id
            GROUP BY n.destination_port
            ORDER BY cnt DESC
            LIMIT 20;
        """)
        top_port_rows = cursor.fetchall()
        available_ports = [int(r["destination_port"]) for r in top_port_rows]

        single_date_notice = (
            "Single capture date (2017-07-07) in current CICIDS2017 DWDM subset."
            if len(available_dates) == 1 else None
        )

        # 5. Paginated Fact Records (queried when page is requested)
        records_data = None
        pagination_data = None

        if page is not None and int(page) > 0:
            page_num = max(1, int(page))
            p_size = max(1, min(100, int(page_size)))
            offset = (page_num - 1) * p_size

            SORT_COLUMNS = {
                "traffic_id": "f.traffic_id",
                "destination_port": "f.destination_port",
                "traffic_status": "c.traffic_status",
                "flow_duration": "f.flow_duration",
                "total_fwd_packets": "f.total_fwd_packets",
                "fwd_packets": "f.total_fwd_packets",
                "total_backward_packets": "f.total_backward_packets",
                "bwd_packets": "f.total_backward_packets",
                "packet_length": "f.packet_length_mean",
                "packet_length_mean": "f.packet_length_mean",
                "flow_bytes_per_sec": "f.flow_bytes_per_sec",
                "flow_packets_per_sec": "f.flow_packets_per_sec",
            }
            order_col = SORT_COLUMNS.get((sort_by or "").lower().strip(), "f.traffic_id")
            order_dir = "DESC" if (sort_order or "").lower().strip() == "desc" else "ASC"

            records_query = f"""
                SELECT 
                    f.*,
                    c.traffic_status,
                    c.original_label,
                    d.full_date AS `date`
                FROM fact_network_traffic f
                JOIN dim_classification c ON f.classification_id = c.classification_id
                JOIN dim_network n ON f.network_id = n.network_id
                JOIN dim_date d ON f.date_id = d.date_id
                {where_sql}
                ORDER BY {order_col} {order_dir}
                LIMIT %s OFFSET %s;
            """
            cursor.execute(records_query, tuple(params + [p_size, offset]))
            raw_records = cursor.fetchall()
            records_data = [_format_traffic_record(r) for r in raw_records]

            total_pages = max(1, math.ceil(total / p_size)) if total > 0 else 1
            pagination_data = {
                "page": page_num,
                "page_size": p_size,
                "total_records": total,
                "total_pages": total_pages,
                "has_next": page_num < total_pages,
                "has_prev": page_num > 1,
            }

        return {
            "filters_applied": {
                "status": status,
                "destination_port": destination_port,
                "date": date,
                "search": search,
                "sort_by": sort_by,
                "sort_order": sort_order,
                "page": page,
                "page_size": page_size,
            },
            "summary": {
                "total_records": total,
                "normal_records": normal,
                "suspicious_records": suspicious,
                "normal_percentage": normal_pct,
                "suspicious_percentage": suspicious_pct
            },
            "classification": classification_data,
            "ports": ports_data,
            "statistics": stats,
            "available_dates": available_dates,
            "available_ports": available_ports,
            "single_date_notice": single_date_notice,
            "records": records_data,
            "pagination": pagination_data,
        }
    except Exception as e:
        logger.error(f"Error in get_filtered_traffic_analytics: {type(e).__name__}")
        raise
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


def get_port_drilldown(port: int):
    """
    Retrieves OLAP drill-down statistics for a specific destination port.
    Returns record counts (NORMAL vs SUSPICIOUS) and average performance metrics.
    """
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT 
                COUNT(*) AS total_records,
                SUM(CASE WHEN c.traffic_status = 'NORMAL' THEN 1 ELSE 0 END) AS normal_records,
                SUM(CASE WHEN c.traffic_status = 'SUSPICIOUS' THEN 1 ELSE 0 END) AS suspicious_records,
                AVG(f.flow_duration) AS avg_flow_duration,
                AVG(f.total_fwd_packets) AS avg_total_fwd_packets,
                AVG(f.total_backward_packets) AS avg_total_backward_packets,
                AVG(f.packet_length_mean) AS avg_packet_length_mean,
                AVG(f.flow_bytes_per_sec) AS avg_flow_bytes_per_sec,
                AVG(f.flow_packets_per_sec) AS avg_flow_packets_per_sec
            FROM fact_network_traffic f
            JOIN dim_classification c ON f.classification_id = c.classification_id
            JOIN dim_network n ON f.network_id = n.network_id
            WHERE n.destination_port = %s;
        """
        cursor.execute(query, (port,))
        row = cursor.fetchone()

        total = int(row["total_records"] or 0)
        normal = int(row["normal_records"] or 0)
        suspicious = int(row["suspicious_records"] or 0)

        normal_pct = round((normal / total) * 100, 2) if total > 0 else 0.0
        suspicious_pct = round((suspicious / total) * 100, 2) if total > 0 else 0.0

        return {
            "destination_port": port,
            "total_records": total,
            "normal_records": normal,
            "suspicious_records": suspicious,
            "normal_percentage": normal_pct,
            "suspicious_percentage": suspicious_pct,
            "average_flow_duration": round(float(row["avg_flow_duration"] or 0.0), 2),
            "average_fwd_packets": round(float(row["avg_total_fwd_packets"] or 0.0), 2),
            "average_backward_packets": round(float(row["avg_total_backward_packets"] or 0.0), 2),
            "average_packet_length": round(float(row["avg_packet_length_mean"] or 0.0), 2),
            "average_flow_bytes_per_sec": round(float(row["avg_flow_bytes_per_sec"] or 0.0), 2),
            "average_flow_packets_per_sec": round(float(row["avg_flow_packets_per_sec"] or 0.0), 2),
        }
    except Exception as e:
        logger.error(f"Error in get_port_drilldown: {type(e).__name__}")
        raise
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

