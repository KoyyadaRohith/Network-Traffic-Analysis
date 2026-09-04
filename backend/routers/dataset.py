from fastapi import APIRouter, HTTPException, status

try:
    from models import (
        DatasetSummaryResponse,
        DatasetClassDistributionResponse,
        FeaturesResponse,
    )
    import dataset
except ImportError:
    from backend.models import (
        DatasetSummaryResponse,
        DatasetClassDistributionResponse,
        FeaturesResponse,
    )
    from backend import dataset

router = APIRouter(
    prefix="/api/dataset",
    tags=["dataset"]
)


@router.get("/summary", response_model=DatasetSummaryResponse)
def get_dataset_summary():
    try:
        return dataset.get_dataset_summary()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dataset summary: {str(e)}"
        )


@router.get("/class-distribution", response_model=DatasetClassDistributionResponse)
def get_dataset_class_distribution():
    try:
        return dataset.get_dataset_class_distribution()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dataset class distribution: {str(e)}"
        )


@router.get("/features", response_model=FeaturesResponse)
def get_dataset_features():
    try:
        return dataset.get_dataset_features()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dataset features: {str(e)}"
        )
