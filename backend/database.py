import os
from pathlib import Path
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Load environment variables from backend/.env or root .env without overriding host variables
root_env = Path(__file__).resolve().parent.parent / ".env"
backend_env = Path(__file__).resolve().parent / ".env"

if root_env.exists():
    load_dotenv(dotenv_path=root_env, override=False)
if backend_env.exists():
    load_dotenv(dotenv_path=backend_env, override=False)


def get_db_connection():
    """
    Creates and returns a MySQL database connection using configuration
    from environment variables.
    """
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = int(os.getenv("DB_PORT", "3306"))
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "")
    db_name = os.getenv("DB_NAME", "network_traffic_dw")

    try:
        connection = mysql.connector.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name
        )
        return connection
    except Error as err:
        print(f"Database connection error: {err.msg}")
        raise
