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


def get_filtered_traffic_analytics(
    status: str = None,
    destination_port: int = None,
    date: str = None
):
    """
    OLAP analysis query performing parameterized server-side SQL aggregation
    across fact_network_traffic joined with dim_classification, dim_network, and dim_date.
    Supports optional slicing by status, destination_port, and date.
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

        return {
            "filters_applied": {
                "status": status,
                "destination_port": destination_port,
                "date": date
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
            "single_date_notice": single_date_notice
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

