# Network Traffic Analysis Using Data Warehousing and Data Mining

### Academic DWDM Project

**DWDM • CICIDS2017**

This web-based academic project provides **Network Traffic Analysis using Data Warehousing and Data Mining (DWDM)**.

The project combines data preprocessing, ETL, MySQL Data Warehousing, Star Schema design, OLAP analysis, Random Forest classification, model evaluation, and report analysis into a single interactive analytical application.

---

## 📌 Project Overview

Network traffic datasets contain a large number of flow-level attributes that can be difficult to analyze directly.

This project provides a structured workflow for transforming network traffic data into useful analytical information.

### Complete Project Pipeline

```text
CICIDS2017 Dataset
        ↓
Data Preprocessing
        ↓
ETL
        ↓
MySQL Data Warehouse
        ↓
Star Schema
        ↓
OLAP Analysis
        ↓
Random Forest Data Mining
        ↓
Model Evaluation
        ↓
Report Analysis
````

The main purpose of the project is to demonstrate how **Data Warehousing, OLAP, and Data Mining techniques can be combined for network traffic analysis**.

---

## 🎯 Objectives

The main objectives of the project are:

* Process and clean CICIDS2017 network traffic data.
* Perform data preprocessing and transformation.
* Implement an ETL workflow.
* Store processed records in a MySQL Data Warehouse.
* Design a Star Schema using fact and dimension tables.
* Perform multidimensional OLAP analysis.
* Demonstrate Slice, Dice, Roll-Up, and Drill-Down operations.
* Apply Random Forest classification to network flow records.
* Evaluate the classification model using standard machine learning metrics.
* Analyze feature importance.
* Provide CSV-based network traffic classification.
* Present analytical results through an interactive web application.
* Provide an academic report-analysis layer based on the generated results.

---

# 🧩 Application Modules

## 1. Dashboard

The Dashboard provides a high-level overview of the complete project.

### Includes

* Total warehouse records
* NORMAL traffic
* SUSPICIOUS traffic
* Number of model features
* Network traffic distribution
* Traffic classification
* Top destination ports
* DWDM analysis pipeline
* Dataset overview
* Project outcomes

The dashboard uses actual project data and backend APIs rather than fabricated values.

---

## 2. Data Warehouse

The Data Warehouse module demonstrates how processed network traffic is stored and organized in MySQL.

### Includes

* MySQL warehouse overview
* Star Schema visualization
* Fact table
* Dimension tables
* Fact-dimension relationships
* ETL workflow
* Dataset-to-warehouse mapping
* SQL examples
* Warehouse statistics

### Warehouse Structure

```text
network_traffic_dw
│
├── dim_date
│
├── dim_network
│
├── dim_classification
│
└── fact_network_traffic
```

---

## 3. OLAP Analysis

The OLAP Analysis module provides multidimensional analysis of the warehouse data.

### Supported OLAP Operations

#### Slice

Filters one dimension.

Example:

```text
Traffic Status = SUSPICIOUS
```

#### Dice

Filters multiple dimensions.

Example:

```text
Traffic Status = SUSPICIOUS
Destination Port = 80
Date = 2017-07-07
```

#### Roll-Up

Aggregates detailed information into a higher-level summary.

```text
Day
 ↓
Month
 ↓
Year
```

#### Drill-Down

Moves from summarized information into greater detail.

```text
Destination Port
        ↓
Traffic Status
        ↓
Detailed Analysis
```

### Available Dimensions

* Traffic Status
* Destination Port
* Date

---

# 4. Data Mining

The Data Mining module applies a **Random Forest Classifier** to the processed network flow features.

### Classification Classes

```text
NORMAL
SUSPICIOUS
```

### Model Configuration

```text
Algorithm:       Random Forest
Trees:           100
Features:        62
Classes:         2
Train/Test:      80% / 20%
Random State:    42
Parallel Jobs:   -1
```

### Dataset Split

```text
Total Records:       223,112
Training Records:    178,489
Testing Records:      44,623
```

---

# 📊 Dataset

## CICIDS2017

The project uses the **CICIDS2017** network intrusion detection dataset provided by the Canadian Institute for Cybersecurity at the University of New Brunswick.

The selected dataset file used for this project is:

```text
Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv
```

The selected subset contains:

```text
BENIGN
DDoS
```

For this application, the labels are represented as:

```text
BENIGN → NORMAL
DDoS   → SUSPICIOUS
```

---

## 🧹 Data Preprocessing

The preprocessing workflow includes:

* Column name cleanup
* Infinite-value handling
* Missing-value handling
* Duplicate-row removal
* Label transformation
* Constant-feature removal
* Duplicate-feature removal

### Final Clean Dataset

```text
Records:             223,112
Numerical Features:  62
Classes:             2
Missing Values:      0
Infinite Values:     0
Duplicate Rows:      0
```

### Class Distribution

| Class      |     Records | Percentage |
| ---------- | ----------: | ---------: |
| NORMAL     |      95,096 |     42.62% |
| SUSPICIOUS |     128,016 |     57.38% |
| **Total**  | **223,112** |   **100%** |

> This distribution represents the selected CICIDS2017 subset and should not be treated as representative of general network traffic.

---

# 🏗️ Data Warehouse Architecture

The project uses a **MySQL Star Schema**.

```text
                         ┌─────────────────────┐
                         │      dim_date       │
                         ├─────────────────────┤
                         │ date_id             │
                         │ full_date           │
                         │ year                │
                         │ month               │
                         │ day                 │
                         │ day_of_week         │
                         └──────────┬──────────┘
                                    │
                                    │
┌─────────────────────┐             │             ┌────────────────────────┐
│     dim_network     │             │             │  dim_classification    │
├─────────────────────┤             │             ├────────────────────────┤
│ network_id          │             │             │ classification_id       │
│ destination_port    │             │             │ traffic_status          │
└──────────┬──────────┘             │             │ original_label          │
           │                        │             └────────────┬───────────┘
           │                        │                          │
           └────────────────────────┼──────────────────────────┘
                                    │
                         ┌──────────▼──────────────┐
                         │ fact_network_traffic    │
                         ├─────────────────────────┤
                         │ traffic_id              │
                         │ date_id                 │
                         │ network_id              │
                         │ classification_id       │
                         │ network flow measures   │
                         └─────────────────────────┘
```

---

## 📦 Warehouse Statistics

```text
Database:
network_traffic_dw

Fact Table:
fact_network_traffic
223,112 records

Dimension Tables:

dim_date
1 row

dim_network
23,950 rows

dim_classification
2 rows
```

---

# 🔄 ETL Process

The project follows a structured ETL workflow.

## Extract

The selected CICIDS2017 CSV file is loaded as the source dataset.

## Transform

The data is cleaned and transformed through:

* Missing-value handling
* Infinite-value handling
* Duplicate removal
* Label conversion
* Feature cleaning
* Data preparation

## Load

The processed records are loaded into the MySQL Star Schema.

```text
CICIDS2017
     ↓
Preprocessing
     ↓
ETL
     ↓
dim_date
dim_network
dim_classification
     ↓
fact_network_traffic
```

---

# 📈 OLAP Analysis

The warehouse enables multidimensional analysis using:

```text
Traffic Status
Destination Port
Date
```

These dimensions can be combined to create different analytical views.

### Example OLAP Operations

```text
SLICE
Filter Traffic Status

DICE
Filter Status + Destination Port + Date

ROLL-UP
Aggregate detailed records

DRILL-DOWN
Move from summary to detailed information
```

---

## 🔎 Example OLAP Finding

One of the major observations from the analyzed warehouse data is Destination Port 80.

```text
Destination Port: 80

Total Records:      136,562
NORMAL:               8,549
SUSPICIOUS:         128,013

Suspicious Ratio:     93.74%
```

Other high-volume destination ports include:

```text
Port 53   → 30,302
Port 443  → 13,114
```

These observations apply to the selected CICIDS2017 subset and are not general statements about those network services.

---

# 🤖 Random Forest Data Mining

The project uses a **Random Forest Classifier** for binary network traffic classification.

## Model Configuration

```text
Algorithm:       Random Forest
Trees:           100
Features:        62
Classes:         2
Train/Test:      80% / 20%
Random State:    42
```

### Training and Testing Data

```text
Total Records:       223,112
Training Records:    178,489
Testing Records:      44,623
```

---

# 📊 Model Evaluation

The Random Forest model was evaluated using a held-out test set.

| Metric    |    Result |
| --------- | --------: |
| Accuracy  |  99.9866% |
| Precision | 100.0000% |
| Recall    |  99.9766% |
| F1 Score  |  99.9883% |

### Rounded Results

```text
Accuracy:   99.99%
Precision:  100.00%
Recall:     99.98%
F1 Score:   99.99%
```

---

## Confusion Matrix

```text
                         Predicted
                    NORMAL    SUSPICIOUS

Actual NORMAL        19,019          0

Actual SUSPICIOUS         6     25,598
```

### Prediction Summary

```text
Correct Predictions:
44,617 / 44,623

Incorrect Predictions:
6 / 44,623
```

The model correctly classified most of the held-out test records.

> These results apply specifically to the selected CICIDS2017 DDoS-vs-BENIGN test set. They do not guarantee the same performance on other datasets, network environments, or attack types.

---

# 🔎 Feature Importance

The Random Forest model uses 62 network flow features.

The leading features in the evaluated model include:

| Rank | Feature                     |
| ---: | --------------------------- |
|    1 | Fwd Packet Length Max       |
|    2 | Fwd Packet Length Mean      |
|    3 | Fwd IAT Std                 |
|    4 | Total Length of Fwd Packets |
|    5 | Init_Win_bytes_forward      |
|    6 | act_data_pkt_fwd            |
|    7 | Bwd Packet Length Min       |
|    8 | Destination Port            |
|    9 | Fwd IAT Max                 |
|   10 | Fwd Header Length           |

Feature importance represents the relative contribution of input features to the Random Forest's decision process.

It should not be interpreted as proof that an individual feature directly causes a particular traffic class.

---

# 🧪 Prediction Interface

The Data Mining module provides CSV-based prediction functionality.

### Prediction Workflow

```text
Upload CSV
    ↓
Validate Features
    ↓
Arrange 62 Model Features
    ↓
Random Forest
    ↓
Prediction
    ↓
NORMAL / SUSPICIOUS
```

### Prediction API

```text
POST /api/predict
```

### Supported Features

* CSV upload
* Drag-and-drop upload
* Sample records
* Batch prediction
* Prediction confidence
* NORMAL probability
* SUSPICIOUS probability
* Prediction result table

The current implementation supports up to:

```text
50,000 records
```

per prediction request.

---

# 📑 Report Analysis

The Report Analysis module provides an academic interpretation of the project's results.

It combines findings from:

```text
Data Warehouse
       +
OLAP Analysis
       +
Data Mining
       ↓
Report Analysis
```

### Includes

* Executive Summary
* Traffic Distribution
* OLAP Findings
* Data Mining Findings
* Feature Importance
* Key Findings
* Project Conclusion
* Limitations and Scope
* Academic Learning Outcomes
* Data Sources

The Report Analysis module interprets existing analytical results rather than replacing the underlying Data Warehousing, OLAP, or Data Mining methods.

---

# 🛠️ Technology Stack

## Frontend

* React
* Vite
* JavaScript
* CSS
* Recharts
* Lucide React

## Backend

* Python
* FastAPI
* Pydantic
* MySQL Connector
* python-dotenv

## Database

* MySQL 8
* InnoDB
* Star Schema

## Data Mining

* Python
* scikit-learn
* Random Forest
* joblib

## Dataset

* CICIDS2017

---

# 📁 Project Structure

```text
Network-Traffic-DWDM/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── analytics.py
│   ├── models.py
│   ├── prediction.py
│   ├── dataset.py
│   ├── model_evaluation.py
│   │
│   └── routers/
│       ├── analytics.py
│       ├── dashboard.py
│       ├── prediction.py
│       ├── dataset.py
│       └── model_evaluation.py
│
├── models/
│   ├── random_forest_model.joblib
│   └── model_features.txt
│
├── README.md
└── .gitignore
```

> Raw CICIDS2017 datasets, environment secrets, virtual environments, dependencies, and generated build files should not be committed to the repository unless intentionally required.

---

# 🔌 Backend API

## Dashboard

```text
GET /api/dashboard
```

## Analytics

```text
GET /api/analytics/summary
GET /api/analytics/classification
GET /api/analytics/ports
GET /api/analytics/statistics
GET /api/analytics/comparison
GET /api/analytics/date-summary
GET /api/analytics/traffic
```

## Data Warehouse / DWDM

```text
GET /api/dwdm/overview
GET /api/dwdm/classification-summary
GET /api/dwdm/port-analysis
GET /api/dwdm/status-comparison
GET /api/dwdm/rollup
GET /api/dwdm/drilldown/{port}
GET /api/dwdm/queries
```

## Model Evaluation

```text
GET /api/model/evaluation
GET /api/model/feature-importance
```

## Prediction

```text
POST /api/predict
```

---

# 🚀 Local Installation

## Prerequisites

Install the following:

* Node.js
* npm
* Python
* MySQL 8
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/KoyyadaRohith/Network-Traffic-DWDM.git
cd Network-Traffic-DWDM
```

---

## 2. Configure MySQL

Create the project database:

```text
network_traffic_dw
```

Configure the backend database connection using environment variables.

Example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=network_traffic_dw
```

> Never commit the real `.env` file or database password.

---

# 🐍 Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Start FastAPI

```bash
uvicorn main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# ⚛️ Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔐 Environment Security

Do not commit sensitive information to GitHub.

The following should remain outside Git:

```text
.env
.env.*
database passwords
API keys
access tokens
private keys
node_modules/
venv/
.venv/
raw datasets
generated build files
temporary IDE files
```

Use an `.env.example` file with placeholder values if environment configuration needs to be documented.

Example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=network_traffic_dw
```

---

# 🧪 Testing

The application has been tested across the following viewport sizes:

```text
1536px
1280px
1024px
768px
390px
```

Testing areas include:

* Application navigation
* Dashboard rendering
* Data Warehouse rendering
* OLAP filtering
* Slice
* Dice
* Roll-Up
* Drill-Down
* Data Mining
* Model evaluation
* Feature importance
* CSV prediction
* Report Analysis
* Responsive behavior
* Browser console
* Production build

### Build Command

```bash
npm run build
```

---

# 🎓 Academic Concepts Demonstrated

## Data Warehousing

* ETL
* Star Schema
* Fact tables
* Dimension tables
* Relational storage
* Data organization

## OLAP

* Multidimensional analysis
* Aggregation
* Slice
* Dice
* Roll-Up
* Drill-Down

## Data Mining

* Feature preparation
* Supervised classification
* Random Forest
* Confusion Matrix
* ROC Curve
* Precision
* Recall
* F1 Score
* Feature Importance

## Application Development

* React frontend
* FastAPI backend
* MySQL integration
* REST APIs
* Interactive data visualization
* Responsive web design

---

# 📚 Learning Outcomes

This project demonstrates practical understanding of:

* Data preprocessing
* ETL
* Data Warehouse design
* Star Schema
* Fact and dimension tables
* MySQL
* OLAP
* Slice
* Dice
* Roll-Up
* Drill-Down
* Data aggregation
* Feature preparation
* Random Forest classification
* Confusion Matrix
* ROC Curve
* Feature Importance
* Model evaluation
* Full-stack application integration

---

# 🖥️ Complete Application Workflow

```text
                  ┌──────────────────────┐
                  │     CICIDS2017       │
                  │       Dataset        │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   Preprocessing      │
                  │ Cleaning & Transform │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │        ETL           │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   MySQL Warehouse    │
                  │     Star Schema      │
                  └──────────┬───────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
        ┌──────────────────┐   ┌──────────────────┐
        │  OLAP Analysis   │   │   Data Mining    │
        │                  │   │                  │
        │ Slice            │   │ Random Forest    │
        │ Dice             │   │ Classification   │
        │ Roll-Up          │   │ Evaluation       │
        │ Drill-Down       │   │ Feature Analysis │
        └────────┬─────────┘   └────────┬─────────┘
                 │                      │
                 └──────────┬───────────┘
                            ▼
                 ┌──────────────────────┐
                 │   Report Analysis    │
                 │ Findings & Conclusion│
                 └──────────────────────┘
```

---

# 📊 Project Highlights

| Component               |  Result |
| ----------------------- | ------: |
| Network Traffic Records | 223,112 |
| Network Flow Features   |      62 |
| Warehouse Dimensions    |       3 |
| Fact Tables             |       1 |
| OLAP Operations         |       4 |
| Random Forest Trees     |     100 |
| Held-Out Test Records   |  44,623 |
| Approx. Test Accuracy   |  99.99% |

---

# ⚠️ Limitations

1. The model uses a selected CICIDS2017 DDoS-vs-BENIGN subset rather than every traffic category in the complete dataset.

2. Model performance is evaluated using a held-out test set from the selected dataset.

3. High test accuracy does not guarantee identical performance on unseen datasets or different network environments.

4. The class distribution in this dataset should not be considered representative of general network traffic.

5. The project is an academic implementation of Data Warehousing, OLAP, Data Mining, and Machine Learning techniques.

6. The Report Analysis module interprets existing analytical results and does not replace the underlying Data Warehousing, OLAP, or Data Mining methods.

---

# 📌 Project Scope

The project focuses on:

```text
Network Traffic Analysis
        +
Data Warehousing
        +
OLAP Analysis
        +
Data Mining
        +
Machine Learning
```

The project is primarily intended for **academic and educational demonstration**.

It is not presented as a production SOC, incident-response system, or enterprise threat-intelligence platform.

---

# 🏆 Project Outcome

The project demonstrates an end-to-end analytical workflow for converting network traffic data into structured information and analytical results.

```text
Raw Data
   ↓
Cleaned Data
   ↓
ETL
   ↓
Data Warehouse
   ↓
Star Schema
   ↓
OLAP Analysis
   ↓
Data Mining
   ↓
Model Evaluation
   ↓
Report Analysis
```

The project shows how **Data Warehousing provides the structured foundation for analysis while Data Mining techniques can be applied to identify patterns and classify network flow records**.

---

# 📖 Academic Summary

The project demonstrates the integration of multiple Data Warehousing and Data Mining concepts in one application.

CICIDS2017 traffic is first cleaned and transformed through preprocessing. The processed records are then loaded into a MySQL Star Schema containing a fact table and three dimension tables.

The warehouse data is analyzed using OLAP operations such as Slice, Dice, Roll-Up, and Drill-Down. After this, a Random Forest classifier is applied to 62 network flow features to classify records into NORMAL and SUSPICIOUS categories.

Finally, the results from the Data Warehouse, OLAP analysis, and Data Mining stages are combined in the Report Analysis module to provide an academic interpretation of the project findings.

---

# 🙏 Acknowledgement

This project uses the **CICIDS2017 dataset** provided by the **Canadian Institute for Cybersecurity at the University of New Brunswick**.

The dataset should be obtained from its official source and used according to its applicable terms.

---

# 📄 License

This project is intended primarily for academic and educational purposes.

Before distributing this repository under an open-source license, verify the licensing requirements of:

* Project source code
* CICIDS2017 dataset
* Third-party libraries
* External assets

---

# 👨‍💻 Project Information

**Project Name:** Network Traffic Analysis Using Data Warehousing and Data Mining

**Application:** Network Traffic Analytics

**Academic Area:** Data Warehousing and Data Mining

**Dataset:** CICIDS2017

**Database:** MySQL

**ML Algorithm:** Random Forest

**Classification:** NORMAL / SUSPICIOUS

**Project Type:** B.Tech Academic Project

---

# ⭐ Final Summary

The project demonstrates a complete Data Warehousing and Data Mining workflow:

```text
CICIDS2017
     ↓
Preprocessing
     ↓
ETL
     ↓
Data Warehouse
     ↓
Star Schema
     ↓
OLAP Analysis
     ↓
Random Forest Data Mining
     ↓
Model Evaluation
     ↓
Report Analysis
```

> **Transform network traffic data into structured warehouse information, analyze it through OLAP, apply Data Mining techniques, and interpret the resulting findings.**

```
