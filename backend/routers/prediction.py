import io
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, status
import pandas as pd

try:
    from models import PredictionResponse
    import prediction
except ImportError:
    from backend.models import PredictionResponse
    from backend import prediction

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api",
    tags=["prediction"]
)

# Max records per prediction batch to ensure responsive performance
MAX_PREDICTION_RECORDS = 50000


@router.post("/predict", response_model=PredictionResponse)
@router.post("/predict/file", response_model=PredictionResponse, include_in_schema=False)
async def predict_traffic_records(file: UploadFile = File(...)):
    """
    Accepts a network traffic CSV file, validates the 62 model features,
    and runs inference through the trained Random Forest model.
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid CSV file (.csv)."
        )

    try:
        contents = await file.read()
        if not contents or len(contents.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded CSV file is empty."
            )

        # Read CSV into pandas DataFrame
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except Exception as parse_err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to parse CSV content: {str(parse_err)}"
            )

        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded CSV file contains no data rows."
            )

        if len(df) > MAX_PREDICTION_RECORDS:
            logger.warning(f"Uploaded CSV exceeds {MAX_PREDICTION_RECORDS} rows. Truncating to limit.")
            df = df.iloc[:MAX_PREDICTION_RECORDS]

        # Execute Random Forest prediction
        try:
            result = prediction.predict_traffic(df)
            return result
        except ValueError as val_err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(val_err)
            )
        except Exception as pred_err:
            logger.error(f"Prediction execution error: {type(pred_err).__name__}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Traffic prediction engine encountered an internal error."
            )

    except HTTPException:
        raise
    except Exception as general_err:
        logger.error(f"Unexpected upload handler error: {type(general_err).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process traffic dataset."
        )
    finally:
        await file.close()
