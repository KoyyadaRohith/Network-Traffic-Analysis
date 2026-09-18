from fastapi import APIRouter, HTTPException, status

try:
    from models import DashboardResponse
    import analytics
except ImportError:
    from backend.models import DashboardResponse
    from backend import analytics

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)


@router.get("", response_model=DashboardResponse)
@router.get("/", response_model=DashboardResponse, include_in_schema=False)
def get_dashboard_data():
    try:
        return {
            "summary": analytics.get_summary(),
            "classification": analytics.get_classification_distribution(),
            "ports": analytics.get_top_ports(),
            "statistics": analytics.get_statistics(),
            "comparison": analytics.get_classification_comparison(),
            "date_summary": analytics.get_date_summary(),
        }
    except Exception as e:
        return {
            "summary": analytics.get_summary(),
            "classification": analytics.get_classification_distribution(),
            "ports": analytics.get_top_ports(),
            "statistics": analytics.get_statistics(),
            "comparison": analytics.get_classification_comparison(),
            "date_summary": analytics.get_date_summary(),
        }
