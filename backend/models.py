from pydantic import BaseModel
from typing import List, Optional


class SummaryResponse(BaseModel):
    total_records: int
    normal_records: int
    suspicious_records: int
    normal_percentage: float
    suspicious_percentage: float


class ClassificationItem(BaseModel):
    traffic_status: str
    original_label: str
    total_records: int
    percentage: float


class ClassificationResponse(BaseModel):
    data: List[ClassificationItem]


class PortItem(BaseModel):
    destination_port: int
    traffic_status: str
    total_records: int


class PortResponse(BaseModel):
    data: List[PortItem]


class StatisticItem(BaseModel):
    minimum: float
    maximum: float
    average: float


class StatisticsData(BaseModel):
    flow_duration: StatisticItem
    total_fwd_packets: StatisticItem
    total_backward_packets: StatisticItem
    flow_bytes_per_sec: StatisticItem
    flow_packets_per_sec: StatisticItem
    packet_length_mean: StatisticItem
    packet_length_variance: StatisticItem


class StatisticsResponse(BaseModel):
    data: StatisticsData


class ComparisonItem(BaseModel):
    traffic_status: str
    total_records: int
    average_flow_duration: float
    average_fwd_packets: float
    average_backward_packets: float
    average_packet_length: float
    average_flow_bytes_per_sec: float
    average_flow_packets_per_sec: float


class ComparisonResponse(BaseModel):
    data: List[ComparisonItem]


class DateSummaryItem(BaseModel):
    date: str
    year: int
    month: int
    day: int
    day_of_week: str
    total_records: int


class DateSummaryResponse(BaseModel):
    data: List[DateSummaryItem]


class DashboardResponse(BaseModel):
    summary: SummaryResponse
    classification: ClassificationResponse
    ports: PortResponse
    statistics: StatisticsResponse
    comparison: ComparisonResponse
    date_summary: DateSummaryResponse


class PredictionItem(BaseModel):
    row_number: int
    prediction: str
    confidence: float
    normal_probability: float
    suspicious_probability: float


class AnalysisDetail(BaseModel):
    overall_status: str
    summary: str
    observations: List[str]
    recommendation: str
    average_confidence: Optional[float] = None
    min_confidence: Optional[float] = None
    max_confidence: Optional[float] = None
    normal_average_confidence: Optional[float] = None
    suspicious_average_confidence: Optional[float] = None


class ReportOverview(BaseModel):
    total_records: int
    normal_records: int
    suspicious_records: int
    normal_percentage: float
    suspicious_percentage: float


class ReportClassification(BaseModel):
    normal_count: int
    normal_percentage: float
    suspicious_count: int
    suspicious_percentage: float


class ReportConfidence(BaseModel):
    average_confidence: float
    minimum_confidence: float
    maximum_confidence: float
    normal_average_confidence: Optional[float] = None
    suspicious_average_confidence: Optional[float] = None


class ReportTrafficProfile(BaseModel):
    average_flow_duration: float
    average_fwd_packets: float
    average_backward_packets: float
    average_packet_length: float
    average_flow_bytes_per_sec: float
    average_flow_packets_per_sec: float
    most_common_destination_port: Optional[int] = None


class ReportClassMetric(BaseModel):
    count: int
    percentage: float
    average_confidence: Optional[float] = None
    average_flow_duration: Optional[float] = None
    average_fwd_packets: Optional[float] = None
    average_backward_packets: Optional[float] = None
    average_packet_length: Optional[float] = None
    average_flow_bytes_per_sec: Optional[float] = None
    average_flow_packets_per_sec: Optional[float] = None


class ReportClassBreakdown(BaseModel):
    normal: ReportClassMetric
    suspicious: ReportClassMetric


class ReportRiskAssessment(BaseModel):
    risk_level: str
    framework: str
    threshold_applied: str
    description: str


class TrafficReport(BaseModel):
    overview: ReportOverview
    classification: ReportClassification
    confidence: ReportConfidence
    traffic_profile: ReportTrafficProfile
    class_metrics: ReportClassBreakdown
    risk_assessment: ReportRiskAssessment
    observations: List[str]
    recommendation: str


class PredictionResponse(BaseModel):
    total_records: int
    normal_records: int
    suspicious_records: int
    normal_percentage: float
    suspicious_percentage: float
    predictions: List[PredictionItem]
    analysis: AnalysisDetail
    report: Optional[TrafficReport] = None


class TrafficFilterSummary(BaseModel):
    total_records: int
    normal_records: int
    suspicious_records: int
    normal_percentage: float
    suspicious_percentage: float


class TrafficFilterStatistics(BaseModel):
    average_flow_duration: float
    average_fwd_packets: float
    average_backward_packets: float
    average_packet_length: float
    average_flow_bytes_per_sec: float
    average_flow_packets_per_sec: float


class PortDistributionItem(BaseModel):
    destination_port: int
    traffic_status: str
    total_records: int
    percentage: float


class PortDrillDownDetail(BaseModel):
    destination_port: int
    total_records: int
    normal_records: int
    suspicious_records: int
    normal_percentage: float
    suspicious_percentage: float
    average_flow_duration: float
    average_fwd_packets: float
    average_backward_packets: float
    average_packet_length: float
    average_flow_bytes_per_sec: float
    average_flow_packets_per_sec: float


class AppliedFilters(BaseModel):
    status: Optional[str] = None
    destination_port: Optional[int] = None
    date: Optional[str] = None


class TrafficAnalyticsResponse(BaseModel):
    filters_applied: AppliedFilters
    summary: TrafficFilterSummary
    classification: List[ClassificationItem]
    ports: List[PortDistributionItem]
    statistics: TrafficFilterStatistics
    available_dates: List[str]
    available_ports: List[int]
    single_date_notice: Optional[str] = None


class DatasetFileInfo(BaseModel):
    filename: str
    file_size_bytes: int
    file_size_mb: float
    row_count: int
    column_count: int


class PreprocessingStats(BaseModel):
    rows_before_cleaning: int
    rows_after_cleaning: int
    rows_removed: int
    columns_before_cleaning: int
    columns_after_cleaning: int
    columns_removed: int
    missing_values_before_cleaning: int
    missing_values_after_cleaning: int
    infinite_values_handled: int
    duplicate_rows_removed: int
    constant_features_removed: int
    constant_features_list: List[str]
    duplicate_features_removed: int
    duplicate_features_list: List[str]


class DatasetSummaryResponse(BaseModel):
    dataset_name: str
    dataset_type: str
    source_description: str
    capture_date: str
    raw_file: DatasetFileInfo
    clean_file: DatasetFileInfo
    preprocessing: PreprocessingStats
    normal_records: int
    suspicious_records: int
    normal_percentage: float
    suspicious_percentage: float
    original_features: int
    model_features: int
    warehouse_fact_rows: int
    warehouse_date_count: int
    warehouse_port_count: int


class DatasetClassItem(BaseModel):
    traffic_status: str
    original_label: str
    total_records: int
    percentage: float


class DatasetClassDistributionResponse(BaseModel):
    total_records: int
    data: List[DatasetClassItem]


class FeatureItem(BaseModel):
    feature_id: int
    feature_name: str
    data_type: str
    role: str
    description: str


class FeaturesResponse(BaseModel):
    total_features: int
    features: List[FeatureItem]


class ConfusionMatrixData(BaseModel):
    tn: int
    fp: int
    fn: int
    tp: int
    total: int


class ClassMetricItem(BaseModel):
    class_name: str
    precision: float
    recall: float
    f1_score: float
    support: int


class FeatureImportanceItem(BaseModel):
    rank: int
    feature_name: str
    importance: float
    percentage: float


class ModelEvaluationResponse(BaseModel):
    model_name: str
    algorithm: str
    n_estimators: int
    random_state: int
    total_records: int
    training_records: int
    testing_records: int
    feature_count: int
    class_names: List[str]
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: ConfusionMatrixData
    class_metrics: List[ClassMetricItem]
    top_features: List[FeatureImportanceItem]
    evaluation_scope: str
    limitations: List[str]


class FeatureImportanceResponse(BaseModel):
    total_features: int
    features: List[FeatureImportanceItem]
    top_10: List[FeatureImportanceItem]


# --- DWDM Analysis & OLAP Models ---
class DWDMOverviewResponse(BaseModel):
    database_name: str
    fact_table: str
    dimension_tables: List[str]
    fact_rows: int
    dimension_counts: dict
    date_count: int
    network_count: int
    classification_count: int


class DWDMClassificationItem(BaseModel):
    traffic_status: str
    original_label: str
    record_count: int
    percentage: float
    average_flow_duration: float
    average_packet_length: float
    average_flow_bytes_per_sec: float
    average_flow_packets_per_sec: float


class DWDMClassificationResponse(BaseModel):
    total_records: int
    data: List[DWDMClassificationItem]


class DWDMPortItem(BaseModel):
    destination_port: int
    total_records: int
    normal_records: int
    suspicious_records: int
    suspicious_percentage: float


class DWDMPortAnalysisResponse(BaseModel):
    total_analyzed_ports: int
    data: List[DWDMPortItem]


class DWDMStatusComparisonItem(BaseModel):
    traffic_status: str
    record_count: int
    percentage: float
    avg_flow_duration: float
    avg_fwd_packets: float
    avg_bwd_packets: float
    avg_packet_length: float
    avg_flow_bytes_per_sec: float
    avg_flow_packets_per_sec: float
    min_flow_duration: float
    max_flow_duration: float


class DWDMStatusComparisonResponse(BaseModel):
    data: List[DWDMStatusComparisonItem]


class DWDMRollupItem(BaseModel):
    capture_date: str
    traffic_status: str
    record_count: int
    avg_flow_duration: float
    avg_packet_length: float
    is_date_rollup: int
    is_status_rollup: int
    level: str


class DWDMRollupResponse(BaseModel):
    scope_notice: str
    data: List[DWDMRollupItem]


class DWDMDrillDownDetail(BaseModel):
    destination_port: int
    service_name: str
    total_records: int
    normal_records: int
    suspicious_records: int
    suspicious_percentage: float
    avg_flow_duration: float
    avg_packet_length: float
    avg_flow_bytes_per_sec: float
    avg_flow_packets_per_sec: float


class DWDMQueryItem(BaseModel):
    query_id: str
    operation: str
    title: str
    sql: str
    purpose: str
    dwdm_concept: str


class DWDMQueryCatalogResponse(BaseModel):
    total_queries: int
    queries: List[DWDMQueryItem]


