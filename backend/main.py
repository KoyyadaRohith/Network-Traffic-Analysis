from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection

try:
    from routers.analytics import router as analytics_router
    from routers.dashboard import router as dashboard_router
    from routers.prediction import router as prediction_router
    from routers.dataset import router as dataset_router
    from routers.model_evaluation import router as model_evaluation_router
    from routers.dwdm_analysis import router as dwdm_analysis_router
except ImportError:
    from backend.routers.analytics import router as analytics_router
    from backend.routers.dashboard import router as dashboard_router
    from backend.routers.prediction import router as prediction_router
    from backend.routers.dataset import router as dataset_router
    from backend.routers.model_evaluation import router as model_evaluation_router
    from backend.routers.dwdm_analysis import router as dwdm_analysis_router

app = FastAPI(
    title="Network Traffic Analysis API",
    description="Backend API for the DWDM Network Traffic Analysis project",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(analytics_router)
app.include_router(dashboard_router)
app.include_router(prediction_router)
app.include_router(dataset_router)
app.include_router(model_evaluation_router)
app.include_router(dwdm_analysis_router)



@app.get("/")
def root():
    return {
        "message": "Network Traffic Analysis API is running",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/db-health")
def db_health_check():
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failed"
        )
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()