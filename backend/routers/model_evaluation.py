from fastapi import APIRouter, HTTPException, status

try:
    from models import (
        ModelEvaluationResponse,
        FeatureImportanceResponse,
    )
    import model_evaluation
except ImportError:
    from backend.models import (
        ModelEvaluationResponse,
        FeatureImportanceResponse,
    )
    from backend import model_evaluation

router = APIRouter(
    prefix="/api/model",
    tags=["model-evaluation"]
)


@router.get("/evaluation", response_model=ModelEvaluationResponse)
def get_model_evaluation():
    try:
        return model_evaluation.get_model_evaluation()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve model evaluation metrics: {str(e)}"
        )


@router.get("/feature-importance", response_model=FeatureImportanceResponse)
@router.get("/features", response_model=FeatureImportanceResponse, include_in_schema=False)
def get_feature_importance():
    try:
        return model_evaluation.get_feature_importance_data()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve feature importances: {str(e)}"
        )
