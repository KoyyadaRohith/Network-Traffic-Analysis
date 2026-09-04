from fastapi import APIRouter, HTTPException, status, Query

try:
    from models import (
        DWDMOverviewResponse,
        DWDMClassificationResponse,
        DWDMPortAnalysisResponse,
        DWDMStatusComparisonResponse,
        DWDMRollupResponse,
        DWDMDrillDownDetail,
        DWDMQueryCatalogResponse,
    )
    import dwdm_analysis
except ImportError:
    from backend.models import (
        DWDMOverviewResponse,
        DWDMClassificationResponse,
        DWDMPortAnalysisResponse,
        DWDMStatusComparisonResponse,
        DWDMRollupResponse,
        DWDMDrillDownDetail,
        DWDMQueryCatalogResponse,
    )
    from backend import dwdm_analysis

router = APIRouter(
    prefix="/api/dwdm",
    tags=["dwdm-analysis"]
)


@router.get("/overview", response_model=DWDMOverviewResponse)
def get_dwdm_overview():
    try:
        return dwdm_analysis.get_dwdm_overview()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve DWDM overview: {str(e)}"
        )


@router.get("/classification-summary", response_model=DWDMClassificationResponse)
def get_classification_summary():
    try:
        return dwdm_analysis.get_classification_summary()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve DWDM classification summary: {str(e)}"
        )


@router.get("/port-analysis", response_model=DWDMPortAnalysisResponse)
def get_port_analysis(limit: int = Query(default=15, ge=1, le=100)):
    try:
        return dwdm_analysis.get_port_analysis(limit=limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve DWDM port analysis: {str(e)}"
        )


@router.get("/status-comparison", response_model=DWDMStatusComparisonResponse)
def get_status_comparison():
    try:
        return dwdm_analysis.get_status_comparison()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve DWDM status comparison: {str(e)}"
        )


@router.get("/rollup", response_model=DWDMRollupResponse)
def get_rollup():
    try:
        return dwdm_analysis.get_rollup_analysis()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve DWDM roll-up analysis: {str(e)}"
        )


@router.get("/drilldown/{port}", response_model=DWDMDrillDownDetail)
def get_drilldown(port: int):
    try:
        return dwdm_analysis.get_port_drilldown(port=port)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to drill down into port {port}: {str(e)}"
        )


@router.get("/queries", response_model=DWDMQueryCatalogResponse)
def get_queries():
    try:
        return dwdm_analysis.get_query_catalog()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve query catalog: {str(e)}"
        )
