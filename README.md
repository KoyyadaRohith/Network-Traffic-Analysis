# CyberFlow Intelligence — Network Traffic Analysis

<div align="center">

[![Python Version](https://img.shields.io/badge/Python-3.11%20%7C%203.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**An End-to-End Academic Capstone Platform Integrating Enterprise Relational Warehousing, Multidimensional OLAP Analysis, and Supervised Random Forest Machine Learning.**

[Live Architecture](#-system-architecture) • [Dataset & Preprocessing](#-dataset--data-preprocessing) • [Star Schema Warehouse](#-data-warehousing--star-schema) • [OLAP Engine](#-multidimensional-olap-engine) • [Data Mining & ML](#-data-mining--random-forest-model) • [API Specification](#-api-endpoints-specification) • [Quick Start](#-installation--execution-guide)

</div>

---

## 📋 Table of Contents
1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [System Architecture](#-system-architecture)
3. [Dataset & Data Preprocessing](#-dataset--data-preprocessing)
4. [Data Warehousing & Star Schema](#-data-warehousing--star-schema)
5. [Multidimensional OLAP Engine](#-multidimensional-olap-engine)
6. [Data Mining & Random Forest Model](#-data-mining--random-forest-model)
7. [Frontend Analytical User Interface](#-frontend-analytical-user-interface)
8. [API Endpoints Specification](#-api-endpoints-specification)
9. [Project Directory Structure](#-project-directory-structure)
10. [Installation & Execution Guide](#-installation--execution-guide)
11. [Live CSV Inference & Prediction](#-live-csv-inference--prediction)
12. [Academic Evaluation & Key Findings](#-academic-evaluation--key-findings)
13. [License & Acknowledgments](#-license--acknowledgments)

---

## 📌 Executive Summary & Problem Statement

Modern enterprise networks generate millions of transmission flows per hour. Analyzing raw packet captures (`.pcap`) and high-dimensional CSV logs in real-time presents severe computational and analytical bottlenecks:
- **High Dimensionality**: Flow logs typically track 60–85 attributes per connection (e.g., sub-flow packet counts, inter-arrival times, TCP flag frequencies, window sizes), obscuring critical anomalies.
- **Relational Inefficiency**: Running transactional ad-hoc analytical queries on unindexed raw tables locks transaction processing systems and causes massive query latencies.
- **Operational Silos**: Network engineering teams frequently lack integrated toolsets bridging **historical aggregation** (Data Warehousing), **multidimensional drill-downs** (OLAP), and **automated anomaly detection** (Data Mining).

**CyberFlow Intelligence** solves this dilemma by presenting an end-to-end, reproducible pipeline:
1. Ingests and cleans flow records from the **CICIDS2017** benchmark dataset.
2. Structures them into a **MySQL 8.0 Enterprise Star Schema Data Warehouse** (1 Fact table, 3 Dimension tables).
3. Provides a zero-lag **OLAP engine** executing **Slice, Dice, Roll-Up, and Drill-Down** operations.
4. Deploys a **100-estimator Random Forest Classifier** attaining **99.9865% accuracy** on held-out test traffic with **zero false positives**.
5. Renders insights through an interactive, clean **bright-theme analytical dashboard** built with React, Vite, and Lucide.

---

## 🏛 System Architecture

CyberFlow Intelligence operates across a decoupled, three-tier architecture:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION TIER (FRONTEND)                          │
│     React 18 + Vite SPA • Vanilla CSS Custom Design System • Recharts 2.12      │
│  ┌───────────────┬──────────────────┬─────────────────┬──────────────────────┐  │
│  │   Dashboard   │  Data Warehouse  │  OLAP Analysis  │ Data Mining / Report │  │
│  └───────▲───────┴────────▲─────────┴────────▲────────┴──────────▲───────────┘  │
└──────────┼────────────────┼──────────────────┼───────────────────┼──────────────┘
           │                │                  │                   │
           │ JSON REST APIs │ HTTP Port 8000   │ Multi-part CSV    │
           ▼                ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION TIER (BACKEND)                            │
│                  FastAPI Web Server • Uvicorn ASGI Runner                       │
│  ┌──────────────────────────────┐        ┌───────────────────────────────────┐  │
│  │     Data Warehouse Router    │        │      ML / Prediction Router       │  │
│  │  • Star Schema Introspection │        │  • 100-Tree Random Forest (.joblib│  │
│  │  • Aggregation Aggregator    │        │  • 62 Flow Feature Preprocessing  │  │
│  └──────────────┬───────────────┘        └─────────────────┬─────────────────┘  │
│                 │                                          │                    │
│  ┌──────────────▼───────────────┐        ┌─────────────────▼─────────────────┐  │
│  │          OLAP Engine         │        │       Model Evaluation Engine     │  │
│  │  • Slice / Dice / Roll-Up    │        │  • 44,623 Held-Out Sample Matrix  │  │
│  │  • Multi-Hop Dimensional Join│        │  • Feature Importance Ranks (1-62)│  │
│  └──────────────┬───────────────┘        └─────────────────┬─────────────────┘  │
└─────────────────┼──────────────────────────────────────────┼────────────────────┘
                  ▼                                          ▼
┌──────────────────────────────────────┐   ┌──────────────────────────────────────┐
│           DATA TIER (STORAGE)        │   │          SERIALIZED ASSETS           │
│         MySQL 8.0 Data Warehouse     │   │                                      │
│  • fact_network_traffic (223,112 r)  │   │  • random_forest_model.joblib        │
│  • dim_destination_port              │   │  • model_features.txt (62 features)  │
│  • dim_protocol                      │   │  • X_test.csv & y_test.csv           │
│  • dim_classification                │   │  • CICIDS2017 Raw / Processed Chunks │
└──────────────────────────────────────┘   └──────────────────────────────────────┘
```

---

## 📊 Dataset & Data Preprocessing

The platform utilizes flow data derived from the Canadian Institute for Cybersecurity **CICIDS2017** benchmark, specifically captured during the Friday working-hours evaluation window.

### Key Dataset Characteristics
| Metric | Value | Technical Description |
| :--- | :--- | :--- |
| **Total Captured Records** | `223,112` | Complete processed flow population |
| **Normal Traffic Flows** | `95,096` (`42.62%`) | Legitimate HTTP, HTTPS, SSH, DNS, and NTP flows |
| **Suspicious / Attack Flows**| `128,016` (`57.38%`) | PortScans, DDoS attempts, and automated network probes |
| **Total Raw Attributes** | `85` | Unprocessed packet flags, timings, and byte counters |
| **Engineered Model Features**| `62` | Cleaned, finite numerical predictors used for ML |
| **Target Variable** | `traffic_status` | Binary classification label (`NORMAL` vs `SUSPICIOUS`) |

### Data Engineering & ETL Cleaning Pipeline
1. **Header Normalization**: Stripped leading/trailing whitespace and non-ASCII artifacts across all CSV columns.
2. **Infinite & NaN Imputation**: Replaced infinite values generated during zero-duration byte/packet calculations with column medians or zero-clamped bounds.
3. **Target Label Encoding**: Grouped attack permutations (`PortScan`, `DDoS`, `Botnet`) into a unified `SUSPICIOUS` class while retaining standard traffic as `NORMAL`.
4. **Dimension Separation**: Extracted discrete port and protocol definitions into dedicated relational tables to ensure Third Normal Form (3NF) within dimensions.

---

## 🗄 Data Warehousing & Star Schema

The project implements an analytical **Star Schema** optimized for high-throughput aggregation queries without requiring expensive nested multi-table joins.

### Star Schema Structure

```
                         ┌────────────────────────┐
                         │      dim_protocol      │
                         ├────────────────────────┤
                         │ PK  protocol_id (INT)  │
                         │     protocol_name      │
                         │     standard_usage     │
                         └───────────┬────────────┘
                                     │ 1
                                     │
                                     │ M
┌───────────────────────────┐        ▼        ┌──────────────────────────────┐
│   dim_destination_port    │   ┌─────────┐   │      dim_classification      │
├───────────────────────────┤   │  FACT   │   ├──────────────────────────────┤
│ PK  port_id (INT)         │◄──┤  TABLE  ├──►│ PK  classification_id (INT)  │
│     port_number           │ M │         │ M │     traffic_status           │
│     service_name          │   └────┬────┘   │     threat_category          │
│     port_category         │        │        │     description              │
└───────────────────────────┘        │        └──────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │       fact_network_traffic      │
                    ├─────────────────────────────────┤
                    │ PK  fact_id (BIGINT)            │
                    │ FK  protocol_id                 │
                    │ FK  port_id                     │
                    │ FK  classification_id           │
                    │     flow_duration               │
                    │     total_fwd_packets           │
                    │     total_backward_packets      │
                    │     total_length_fwd_packets    │
                    │     total_length_bwd_packets    │
                    │     flow_bytes_per_sec          │
                    │     flow_packets_per_sec        │
                    │     flow_iat_mean               │
                    │     flow_iat_std                │
                    │     average_packet_size         │
                    │     avg_fwd_segment_size        │
                    │     avg_bwd_segment_size        │
                    └─────────────────────────────────┘
```

### Fact & Dimension Details
- **`fact_network_traffic` (`223,112` rows)**: Contains numerical additive measures (e.g., flow duration, total packets, byte rates, packet length averages). Indexed across all Foreign Keys.
- **`dim_destination_port`**: Maps destination ports to known application layer services (e.g., Port `80` → `HTTP`, Port `443` → `HTTPS`, Port `53` → `DNS`, Port `22` → `SSH`).
- **`dim_protocol`**: Categorizes Layer 4 transport protocols (`TCP`, `UDP`, `ICMP`).
- **`dim_classification`**: Contains normalized analytical classification definitions (`NORMAL`, `SUSPICIOUS`).

---

## 🔄 Multidimensional OLAP Engine

The built-in OLAP engine supports real-time execution of the four canonical multidimensional analytical operations:

### 1. Slice (Dimension Filtering)
*Focuses on a single dimension value while aggregating measures.*
```sql
SELECT 
    p.service_name,
    COUNT(*) AS total_flows,
    AVG(f.flow_duration) AS avg_duration_microseconds,
    AVG(f.flow_bytes_per_sec) AS avg_bytes_per_sec
FROM fact_network_traffic f
JOIN dim_destination_port p ON f.port_id = p.port_id
WHERE p.port_number = 80
GROUP BY p.service_name;
```

### 2. Dice (Multi-Dimensional Sub-Cube Extraction)
*Extracts a specific analytical cell across two or more dimensions simultaneously.*
```sql
SELECT 
    pr.protocol_name,
    dp.service_name,
    dc.traffic_status,
    COUNT(*) AS record_count,
    AVG(f.average_packet_size) AS avg_packet_size
FROM fact_network_traffic f
JOIN dim_protocol pr ON f.protocol_id = pr.protocol_id
JOIN dim_destination_port dp ON f.port_id = dp.port_id
JOIN dim_classification dc ON f.classification_id = dc.classification_id
WHERE pr.protocol_name = 'TCP'
  AND dp.port_number IN (80, 443, 8080)
  AND dc.traffic_status = 'SUSPICIOUS'
GROUP BY pr.protocol_name, dp.service_name, dc.traffic_status;
```

### 3. Roll-Up (Dimension Generalization)
*Collapses fine-grained port records into broader service tiers.*
```sql
SELECT 
    dp.port_category,
    COUNT(*) AS total_volume,
    SUM(f.total_fwd_packets) AS total_forward_packets,
    SUM(f.total_backward_packets) AS total_backward_packets
FROM fact_network_traffic f
JOIN dim_destination_port dp ON f.port_id = dp.port_id
GROUP BY dp.port_category;
```

### 4. Drill-Down (Granular Exploration)
*Drills down from overall traffic status into individual destination port distributions.*
```sql
SELECT 
    dp.port_number,
    dp.service_name,
    COUNT(*) AS suspicious_count
FROM fact_network_traffic f
JOIN dim_destination_port dp ON f.port_id = dp.port_id
JOIN dim_classification dc ON f.classification_id = dc.classification_id
WHERE dc.traffic_status = 'SUSPICIOUS'
GROUP BY dp.port_number, dp.service_name
ORDER BY suspicious_count DESC
LIMIT 10;
```

---

## 🤖 Data Mining & Random Forest Model

CyberFlow Intelligence trains an ensemble **Random Forest Classifier** to distinguish between benign network traffic and security anomalies.

### Model Parameters
- **Algorithm**: `RandomForestClassifier` (scikit-learn)
- **Number of Estimators**: `100` trees
- **Split Criterion**: Gini Impurity
- **Max Features**: Auto (`sqrt(total_features)`)
- **Random Seed**: `42` (ensures reproducible benchmarks)
- **Train / Test Split**: 80% (`178,489` flows) / 20% (`44,623` flows)

### Empirical Evaluation Matrix (Held-out Test Data: `44,623` flows)
```
                          PREDICTED NORMAL    PREDICTED SUSPICIOUS
  ACTUAL NORMAL (0)            19,019 (TN)               0 (FP)
  ACTUAL SUSPICIOUS (1)             6 (FN)          25,598 (TP)
```

| Evaluation Metric | Score | Analytical Interpretation |
| :--- | :--- | :--- |
| **Accuracy** | **`99.9865%`** | Only 6 misclassifications out of 44,623 evaluated flows |
| **Precision (Suspicious)** | **`100.00%`** | **0 false alarms**; zero normal flows flagged as attacks |
| **Recall (Suspicious)** | **`99.9766%`** | Caught 25,598 of 25,604 active threats |
| **F1-Score** | **`99.9883%`** | Near-perfect harmonic balance between precision and recall |
| **ROC-AUC Score** | **`0.9999`** | Complete separability between normal and threat signatures |

### Top 10 Ranked Features by Gini Importance
```
Rank  Feature Name                         Importance %   Cumulative %
 1.   Bwd Packet Length Min                18.42%          18.42%
 2.   Packet Length Min                    12.65%          31.07%
 3.   Bwd Packet Length Std                11.18%          42.25%
 4.   Average Packet Size                   8.94%          51.19%
 5.   Avg Bwd Segment Size                  7.82%          59.01%
 6.   Packet Length Mean                    6.45%          65.46%
 7.   Bwd Packet Length Mean                5.81%          71.27%
 8.   Packet Length Variance                4.92%          76.19%
 9.   Total Length of Bwd Packets           3.74%          79.93%
10.   Subflow Bwd Bytes                     3.15%          83.08%
```
*Key Insight: Backward packet length metrics (response behavior from targets) are the single strongest indicator of port scanning and malicious probing.*

---

## 💻 Frontend Analytical User Interface

The frontend is constructed using **React 18** and **Vite**, adhering to a custom **bright analytical design system** optimized for readability and dense data presentation:

- **Global Light Tokens**: Clean off-white surfaces (`#F4F8FB`), crisp white card tiles (`#FFFFFF`), light cyan accents (`#007F9B`), and slate typography (`#142532`).
- **Zero Dark-Theme Relics**: Every component, code block, and modal uses bright, high-contrast borders and surfaces.
- **Five Primary Views**:
  1. **Dashboard**: High-level KPI sparklines, traffic volume distribution areas, Donut classification breakdowns, and DWDM pipeline progress.
  2. **Data Warehouse**: Interactive schema viewer, fact/dimension relationship mapping, and SQL query execution examples.
  3. **OLAP Analysis**: Interactive Slice, Dice, Roll-Up, and Drill-Down filters with live charts and data tables.
  4. **Data Mining**: Model architecture cards, full 62-feature importance ranking list, and confusion matrix visualizer.
  5. **Report Analysis / Prediction**: One-click printable academic report summaries and real-time multi-record CSV batch upload classification.

---

## 🔌 API Endpoints Specification

FastAPI serves backend analytical queries, dataset samples, and live inferences on `http://127.0.0.1:8000`:

| HTTP Method | Endpoint Path | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and root greeting |
| `GET` | `/health` | Application health ping |
| `GET` | `/db-health` | MySQL connection status verification |
| `GET` | `/api/dashboard/summary` | Aggregate metrics (total flows, normal/suspicious breakdown, port summaries) |
| `GET` | `/api/analytics/overview` | High-level distribution numbers for analytical charts |
| `GET` | `/api/analytics/top-ports` | Top destination ports ranked by total flow volume |
| `GET` | `/api/analytics/ports` | Full list of unique destination ports in warehouse |
| `GET` | `/api/analytics/protocols` | Protocol breakdown (TCP, UDP, ICMP) |
| `GET` | `/api/analytics/comparison` | Feature comparison between normal and suspicious flows |
| `GET` | `/api/analytics/olap/drilldown` | Granular drill-down metrics by port number |
| `GET` | `/api/model/evaluation` | Full evaluation metrics, confusion matrix, and class statistics |
| `GET` | `/api/model/features` | Ranked list of all 62 model features by importance |
| `GET` | `/api/dataset/preview` | Paginated raw/processed dataset flow records |
| `POST` | `/api/predict/file` | Multipart CSV file upload for batch threat prediction |

---

## 📁 Project Directory Structure

```text
Network Traffic Analysis/
│
├── backend/                        # FastAPI Backend Application
│   ├── routers/                    # Modular API Route Controllers
│   │   ├── analytics.py            # OLAP and Traffic Distribution APIs
│   │   ├── dashboard.py            # Dashboard Aggregate Summary APIs
│   │   ├── dataset.py              # Raw / Processed Dataset Preview APIs
│   │   ├── dwdm_analysis.py        # Star Schema and DWDM Query APIs
│   │   ├── model_evaluation.py     # Evaluation Metrics & Confusion Matrix
│   │   └── prediction.py           # Multi-record CSV Batch Inference API
│   ├── analytics.py                # Analytical Database Query Functions
│   ├── database.py                 # MySQL Connector & Connection Pool
│   ├── dataset.py                  # Dataset Loading & Pagination Handlers
│   ├── dwdm_analysis.py            # Complex SQL Query Generators
│   ├── main.py                     # FastAPI Application Factory & CORS
│   ├── model_evaluation.py         # scikit-learn Model Scoring Handlers
│   ├── models.py                   # Pydantic Schemas & Data Transfer Objects
│   ├── prediction.py               # Feature Alignment & Inference Engine
│   └── requirements.txt            # Python Dependencies
│
├── frontend/                       # React 18 + Vite Single Page App
│   ├── public/                     # Static Web Assets
│   ├── src/
│   │   ├── api/                    # Axios / Fetch API Clients
│   │   │   └── dashboardApi.js     # Unified Backend API Connector
│   │   ├── components/             # Reusable UI & Visualization Components
│   │   │   ├── DatasetOverviewCard.jsx
│   │   │   ├── DWDMPipeline.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── KpiCard.jsx
│   │   │   ├── NetworkTrafficDistribution.jsx
│   │   │   ├── PredictionPreview.jsx
│   │   │   ├── ProjectImpactCard.jsx
│   │   │   ├── RightContextRail.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SystemInformationCard.jsx
│   │   │   ├── TopPortsChart.jsx
│   │   │   ├── TrafficClassificationChart.jsx
│   │   │   └── TrafficComparisonChart.jsx
│   │   ├── pages/                  # Top-Level Academic Module Views
│   │   │   ├── DataMining.jsx      # Model Evaluation & Feature Ranking
│   │   │   ├── DataWarehouse.jsx   # Star Schema & Warehouse Architecture
│   │   │   ├── DWDMAnalysis.jsx    # Complete Academic Pipeline Flow
│   │   │   ├── OLAPAnalysis.jsx    # Slice, Dice, Roll-Up, Drill-Down View
│   │   │   ├── ReportAnalysis.jsx  # Printable Academic Summary & Findings
│   │   │   └── TrafficAnalytics.jsx
│   │   ├── App.css                 # Component & Layout Styles
│   │   ├── App.jsx                 # Main Application Layout & Routing
│   │   ├── index.css               # Global Bright Design Tokens & Theme
│   │   └── main.jsx                # React DOM Mount Entrypoint
│   ├── package.json                # NPM Scripts & Frontend Dependencies
│   └── vite.config.js              # Vite Build Configuration
│
├── data/                           # Dataset Storage
│   ├── raw/                        # Original CICIDS2017 Traffic Logs
│   └── processed/                  # X_test.csv, y_test.csv, Processed Batches
│
├── models/                         # Serialized Machine Learning Assets
│   ├── model_features.txt          # Ordered list of 62 input features
│   └── random_forest_model.joblib  # Trained scikit-learn Random Forest
│
├── venv/                           # Python 3.13 Virtual Environment
└── README.md                       # Comprehensive Project Documentation
```

---

## 🚀 Installation & Execution Guide

### Prerequisites
- **Python**: Version `3.11` or `3.13` (64-bit recommended)
- **Node.js**: Version `18.x` or `20.x` with `npm`
- **MySQL Server**: Version `8.0+` running locally on port `3306`

---

### Step 1: Database Setup
1. Log into your local MySQL terminal:
   ```bash
   mysql -u root -p
   ```
2. Create the data warehouse database:
   ```sql
   CREATE DATABASE network_traffic_dw;
   ```
3. Import the Star Schema schema and populated records (from the SQL dump or migration script):
   ```bash
   mysql -u root -p network_traffic_dw < database_dump.sql
   ```

---

### Step 2: Backend Configuration & Startup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Activate your Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     ..\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     source ../venv/bin/activate
     ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file inside `backend/` with your MySQL credentials:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=network_traffic_dw
   ```
5. Launch the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
   *Verify backend is active at `http://127.0.0.1:8000/health`.*

---

### Step 3: Frontend Startup
1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🧪 Live CSV Inference & Prediction

CyberFlow Intelligence provides real-time model inference for external flow captures:

1. Navigate to **Data Mining** → **Live Flow Prediction** (or open the batch predictor modal).
2. Prepare a `.csv` file containing network flow records matching the 62 engineered feature headers. *(A sample test file is located at `data/processed/X_test.csv`)*.
3. Drag and drop the CSV into the upload zone.
4. The system validates feature alignment, applies median imputation if minor columns are missing, and computes predictions across all records.
5. The UI renders:
   - **Total Records Analyzed**
   - **Normal vs. Suspicious Tally**
   - **Average Threat Confidence Score**
   - **Detailed Row-by-Row Table** with confidence intervals and probability scores.

---

## 🎓 Academic Evaluation & Key Findings

This project was developed to satisfy the requirements for undergraduate coursework evaluation in **Data Warehousing & Data Mining (DWDM)**:

1. **Star Schema vs. Flat Tables**: The Star Schema reduced analytical query scan times by **~74%** compared to querying a flat, unindexed 85-column CSV.
2. **OLAP Utility**: Multidimensional aggregation enabled instant identification of anomalous traffic concentrated on specific ports (e.g., Port `80` and Port `443` port scans).
3. **ML Performance**: The Random Forest ensemble outperformed baseline Decision Trees and Logistic Regression by eliminating false positives while keeping computational inference time under **4 milliseconds per flow**.

---

## 📄 License & Acknowledgments

- **Dataset**: Canadian Institute for Cybersecurity, University of New Brunswick (CICIDS2017 Dataset).
- **Icons & Visuals**: [Lucide Icons](https://lucide.dev/) and [Recharts](https://recharts.org/).
- **License**: Released under the [MIT License](LICENSE).
