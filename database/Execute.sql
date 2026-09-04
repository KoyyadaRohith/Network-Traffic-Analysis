SHOW TABLES;

USE network_traffic_dw;

DESCRIBE dim_date;
DESCRIBE dim_network;
DESCRIBE dim_classification;
DESCRIBE fact_network_traffic;

SELECT 
    COUNT(*) AS total_networks
FROM dim_network;

SELECT * FROM dim_network ORDER BY destination_port
LIMIT 20;

USE network_traffic_dw;

SELECT COUNT(*) AS total_dates
FROM dim_date;

SELECT COUNT(*) AS total_networks
FROM dim_network;

SELECT
    classification_id,
    traffic_status,
    original_label
FROM dim_classification
ORDER BY classification_id;

USE network_traffic_dw;

SELECT COUNT(*) AS total_fact_records
FROM fact_network_traffic;

USE network_traffic_dw;

SELECT COUNT(*) AS total_fact_records
FROM fact_network_traffic;

SELECT
    COUNT(*) AS total_records,
    MIN(flow_duration) AS minimum_flow_duration,
    MAX(flow_duration) AS maximum_flow_duration,
    AVG(flow_duration) AS average_flow_duration
FROM fact_network_traffic;

SELECT
    dc.traffic_status,
    dc.original_label,
    COUNT(*) AS total_records,
    ROUND(
        COUNT(*) * 100.0 /
        (SELECT COUNT(*) FROM fact_network_traffic),
        2
    ) AS percentage
FROM fact_network_traffic f
JOIN dim_classification dc
    ON f.classification_id = dc.classification_id
GROUP BY
    dc.traffic_status,
    dc.original_label
ORDER BY total_records DESC;


USE network_traffic_dw;

SELECT
    dc.traffic_status,
    dc.original_label,
    COUNT(*) AS total_records
FROM fact_network_traffic f
JOIN dim_classification dc
    ON f.classification_id = dc.classification_id
GROUP BY
    dc.traffic_status,
    dc.original_label
WITH ROLLUP;

SELECT
    dn.destination_port,
    dc.traffic_status,
    COUNT(*) AS total_records
FROM fact_network_traffic f
JOIN dim_network dn
    ON f.network_id = dn.network_id
JOIN dim_classification dc
    ON f.classification_id = dc.classification_id
GROUP BY
    dn.destination_port,
    dc.traffic_status
ORDER BY
    total_records DESC
LIMIT 20;

USE network_traffic_dw;

SELECT
    dn.destination_port,
    COUNT(*) AS total_records,
    SUM(
        CASE
            WHEN dc.traffic_status = 'SUSPICIOUS'
            THEN 1
            ELSE 0
        END
    ) AS suspicious_records,
    ROUND(
        SUM(
            CASE
                WHEN dc.traffic_status = 'SUSPICIOUS'
                THEN 1
                ELSE 0
            END
        ) * 100.0 / COUNT(*),
        2
    ) AS suspicious_percentage
FROM fact_network_traffic f
JOIN dim_network dn
    ON f.network_id = dn.network_id
JOIN dim_classification dc
    ON f.classification_id = dc.classification_id
GROUP BY
    dn.destination_port
HAVING
    COUNT(*) >= 10
ORDER BY
    suspicious_percentage DESC,
    total_records DESC
LIMIT 20;

USE network_traffic_dw;

SELECT
    dc.traffic_status,
    COUNT(*) AS total_records,
    ROUND(AVG(f.flow_duration), 2) AS avg_flow_duration,
    ROUND(AVG(f.total_fwd_packets), 2) AS avg_fwd_packets,
    ROUND(AVG(f.total_backward_packets), 2) AS avg_bwd_packets,
    ROUND(AVG(f.packet_length_mean), 2) AS avg_packet_length,
    ROUND(AVG(f.flow_bytes_per_sec), 2) AS avg_flow_bytes_per_sec,
    ROUND(AVG(f.flow_packets_per_sec), 2) AS avg_flow_packets_per_sec
FROM fact_network_traffic f
JOIN dim_classification dc
    ON f.classification_id = dc.classification_id
GROUP BY
    dc.traffic_status
ORDER BY
    total_records DESC;


USE network_traffic_dw;

SELECT
    dc.traffic_status,
    COUNT(*) AS total_records,

    ROUND(MIN(f.packet_length_mean), 2) AS min_packet_length,
    ROUND(MAX(f.packet_length_mean), 2) AS max_packet_length,

    ROUND(MIN(f.flow_bytes_per_sec), 2) AS min_flow_bytes_per_sec,
    ROUND(MAX(f.flow_bytes_per_sec), 2) AS max_flow_bytes_per_sec,

    ROUND(MIN(f.flow_packets_per_sec), 2) AS min_flow_packets_per_sec,
    ROUND(MAX(f.flow_packets_per_sec), 2) AS max_flow_packets_per_sec,

    ROUND(MIN(f.total_fwd_packets), 2) AS min_fwd_packets,
    ROUND(MAX(f.total_fwd_packets), 2) AS max_fwd_packets

FROM fact_network_traffic f
JOIN dim_classification dc
    ON f.classification_id = dc.classification_id

GROUP BY
    dc.traffic_status;


USE network_traffic_dw;

SELECT
    dc.traffic_status,
    COUNT(*) AS negative_flow_records,
    ROUND(MIN(f.flow_bytes_per_sec), 2) AS minimum_value,
    ROUND(MAX(f.flow_bytes_per_sec), 2) AS maximum_negative_value
FROM fact_network_traffic f
JOIN dim_classification dc
    ON f.classification_id = dc.classification_id
WHERE f.flow_bytes_per_sec < 0
GROUP BY
    dc.traffic_status
ORDER BY
    negative_flow_records DESC;


USE network_traffic_dw;

SELECT
    f.traffic_id,
    dn.destination_port,
    dc.traffic_status,
    dc.original_label,
    f.flow_duration,
    f.flow_bytes_per_sec,
    f.flow_packets_per_sec,
    f.total_fwd_packets,
    f.total_backward_packets,
    f.packet_length_mean,
    f.packet_length_variance
FROM fact_network_traffic f
JOIN dim_network dn
    ON f.network_id = dn.network_id
JOIN dim_classification dc
    ON f.classification_id = dc.classification_id
WHERE f.flow_bytes_per_sec < 0
ORDER BY f.traffic_id;

USE network_traffic_dw;

SELECT
    traffic_id,
    destination_port,
    flow_duration,
    total_fwd_packets,
    total_backward_packets,
    total_length_fwd_packets,
    total_length_bwd_packets,
    flow_bytes_per_sec,
    flow_packets_per_sec
FROM fact_network_traffic
WHERE flow_duration < 0;

USE network_traffic_dw;

SELECT
    dd.full_date,
    dd.year,
    dd.month,
    dd.day,
    dd.day_of_week,
    COUNT(*) AS total_records
FROM fact_network_traffic f
JOIN dim_date dd
    ON f.date_id = dd.date_id
GROUP BY
    dd.full_date,
    dd.year,
    dd.month,
    dd.day,
    dd.day_of_week
ORDER BY
    dd.full_date;

USE network_traffic_dw;

SELECT
    dc.traffic_status,
    COUNT(*) AS total_records,

    ROUND(AVG(f.total_fwd_packets), 2) AS avg_fwd_packets,
    ROUND(AVG(f.total_backward_packets), 2) AS avg_bwd_packets,
    ROUND(AVG(f.packet_length_mean), 2) AS avg_packet_length,
    ROUND(AVG(f.packet_length_variance), 2) AS avg_packet_variance,
    ROUND(AVG(f.flow_duration), 2) AS avg_flow_duration

FROM fact_network_traffic f

JOIN dim_classification dc
    ON f.classification_id = dc.classification_id

GROUP BY
    dc.traffic_status

ORDER BY
    total_records DESC;

USE network_traffic_dw;

SELECT
    (SELECT COUNT(*) FROM fact_network_traffic) AS fact_records,

    (SELECT COUNT(*) FROM dim_date) AS date_records,

    (SELECT COUNT(*) FROM dim_network) AS network_records,

    (SELECT COUNT(*) FROM dim_classification) AS classification_records,

    (SELECT COUNT(*)
     FROM fact_network_traffic f
     JOIN dim_classification dc
       ON f.classification_id = dc.classification_id
     WHERE dc.traffic_status = 'NORMAL') AS normal_records,

    (SELECT COUNT(*)
     FROM fact_network_traffic f
     JOIN dim_classification dc
       ON f.classification_id = dc.classification_id
     WHERE dc.traffic_status = 'SUSPICIOUS') AS suspicious_records;