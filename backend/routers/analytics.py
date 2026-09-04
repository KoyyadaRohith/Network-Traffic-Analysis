from fastapi import APIRouter, HTTPException, status

try:
    from models import (
        SummaryResponse,
        ClassificationResponse,
        PortResponse,
        StatisticsResponse,
        ComparisonResponse,
        DateSummaryResponse,
        TrafficAnalyticsResponse,
        PortDrillDownDetail,
    )
    import analytics
except ImportError:
    from backend.models import (
        SummaryResponse,
        ClassificationResponse,
        PortResponse,
        StatisticsResponse,
        ComparisonResponse,
        DateSummaryResponse,
        TrafficAnalyticsResponse,
        PortDrillDownDetail,
    )
    from backend import analytics

router = APIRouter(
    prefix="/api/analytics",
    tags=["analytics"]
)


@router.get("/summary", response_model=SummaryResponse)
def get_analytics_summary():
    try:
        return analytics.get_summary()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analytics database query failed"
        )


@router.get("/classification", response_model=ClassificationResponse)
def get_analytics_classification():
    try:
        return analytics.get_classification_distribution()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analytics database query failed"
        )


@router.get("/ports", response_model=PortResponse)
def get_analytics_ports():
    try:
        return analytics.get_top_ports()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analytics database query failed"
        )


@router.get("/statistics", response_model=StatisticsResponse)
def get_analytics_statistics():
    try:
        return analytics.get_statistics()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analytics database query failed"
        )


@router.get("/comparison", response_model=ComparisonResponse)
def get_analytics_comparison():
    try:
        return analytics.get_classification_comparison()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analytics database query failed"
        )


@router.get("/date-summary", response_model=DateSummaryResponse)
def get_analytics_date_summary():
    try:
        return analytics.get_date_summary()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analytics database query failed"
        )


@router.get("/traffic", response_model=TrafficAnalyticsResponse)
def get_analytics_traffic(
    status: str = None,
    destination_port: int = None,
    date: str = None
):
    try:
        return analytics.get_filtered_traffic_analytics(
            status=status,
            destination_port=destination_port,
            date=date
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Filtered traffic analytics query failed"
        )


@router.get("/port-drilldown/{port}", response_model=PortDrillDownDetail)
def get_analytics_port_drilldown(port: int):
    try:
        return analytics.get_port_drilldown(port=port)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Drill-down query failed for port {port}"
        )

