import sys
from pathlib import Path

# Resolve base directories dynamically and portably
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"

# Ensure backend and root are in Python module search path
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Import main FastAPI application instance
from backend.main import app, health_check, db_health_check

# Ensure /api/health and /api/db-health aliases are available for serverless routing
app.add_api_route("/api/health", health_check, methods=["GET"], include_in_schema=False)
app.add_api_route("/api/db-health", db_health_check, methods=["GET"], include_in_schema=False)
