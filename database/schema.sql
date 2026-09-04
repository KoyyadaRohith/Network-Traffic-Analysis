CREATE DATABASE IF NOT EXISTS network_traffic_dw;

USE network_traffic_dw;

-- ============================================
-- 1. DATE DIMENSION
-- ============================================
CREATE TABLE IF NOT EXISTS dim_date (
    date_id INT PRIMARY KEY,
    full_date DATE NOT NULL,
    year SMALLINT NOT NULL,
    month TINYINT NOT NULL,
    day TINYINT NOT NULL,
    day_of_week VARCHAR(10) NOT NULL
) ENGINE = InnoDB;

-- ============================================
-- 2. NETWORK DIMENSION
-- ============================================
CREATE TABLE IF NOT EXISTS dim_network (
    network_id INT AUTO_INCREMENT PRIMARY KEY,
    destination_port INT NOT NULL,
    UNIQUE KEY uk_destination_port (destination_port)
) ENGINE = InnoDB;

-- ============================================
-- 3. CLASSIFICATION DIMENSION
-- ============================================
CREATE TABLE IF NOT EXISTS dim_classification (
    classification_id INT AUTO_INCREMENT PRIMARY KEY,
    traffic_status VARCHAR(20) NOT NULL,
    original_label VARCHAR(50) NOT NULL,
    UNIQUE KEY uk_classification (traffic_status, original_label)
) ENGINE = InnoDB;

-- ============================================
-- 4. NETWORK TRAFFIC FACT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS fact_network_traffic (
    traffic_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date_id INT NOT NULL,
    network_id INT NOT NULL,
    classification_id INT NOT NULL,
    -- Network traffic features
    destination_port INT,
    flow_duration DOUBLE,
    total_fwd_packets DOUBLE,
    total_backward_packets DOUBLE,
    total_length_fwd_packets DOUBLE,
    total_length_bwd_packets DOUBLE,
    fwd_packet_length_max DOUBLE,
    fwd_packet_length_min DOUBLE,
    fwd_packet_length_mean DOUBLE,
    fwd_packet_length_std DOUBLE,
    bwd_packet_length_max DOUBLE,
    bwd_packet_length_min DOUBLE,
    bwd_packet_length_mean DOUBLE,
    bwd_packet_length_std DOUBLE,
    flow_bytes_per_sec DOUBLE,
    flow_packets_per_sec DOUBLE,
    flow_iat_mean DOUBLE,
    flow_iat_std DOUBLE,
    flow_iat_max DOUBLE,
    flow_iat_min DOUBLE,
    fwd_iat_total DOUBLE,
    fwd_iat_mean DOUBLE,
    fwd_iat_std DOUBLE,
    fwd_iat_max DOUBLE,
    fwd_iat_min DOUBLE,
    bwd_iat_total DOUBLE,
    bwd_iat_mean DOUBLE,
    bwd_iat_std DOUBLE,
    bwd_iat_max DOUBLE,
    bwd_iat_min DOUBLE,
    fwd_psh_flags DOUBLE,
    fwd_header_length DOUBLE,
    bwd_header_length DOUBLE,
    fwd_packets_per_sec DOUBLE,
    bwd_packets_per_sec DOUBLE,
    min_packet_length DOUBLE,
    max_packet_length DOUBLE,
    packet_length_mean DOUBLE,
    packet_length_std DOUBLE,
    packet_length_variance DOUBLE,
    fin_flag_count DOUBLE,
    syn_flag_count DOUBLE,
    rst_flag_count DOUBLE,
    psh_flag_count DOUBLE,
    ack_flag_count DOUBLE,
    urg_flag_count DOUBLE,
    ece_flag_count DOUBLE,
    down_up_ratio DOUBLE,
    average_packet_size DOUBLE,
    avg_bwd_segment_size DOUBLE,
    init_win_bytes_forward DOUBLE,
    init_win_bytes_backward DOUBLE,
    act_data_pkt_fwd DOUBLE,
    min_seg_size_forward DOUBLE,
    active_mean DOUBLE,
    active_std DOUBLE,
    active_max DOUBLE,
    active_min DOUBLE,
    idle_mean DOUBLE,
    idle_std DOUBLE,
    idle_max DOUBLE,
    idle_min DOUBLE,
    -- ========================================
    -- FOREIGN KEYS
    -- ========================================
    CONSTRAINT fk_fact_date FOREIGN KEY (date_id) REFERENCES dim_date (date_id),
    CONSTRAINT fk_fact_network FOREIGN KEY (network_id) REFERENCES dim_network (network_id),
    CONSTRAINT fk_fact_classification FOREIGN KEY (classification_id) REFERENCES dim_classification (classification_id),
    -- ========================================
    -- INDEXES
    -- ========================================
    INDEX idx_date_id (date_id),
    INDEX idx_network_id (network_id),
    INDEX idx_classification_id (classification_id),
    INDEX idx_destination_port (destination_port)
) ENGINE = InnoDB;



