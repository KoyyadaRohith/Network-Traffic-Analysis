import gzip
import logging
import os
import shutil
import sqlite3
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

# Repository directories
BACKEND_DIR = Path(__file__).resolve().parent
REPO_ROOT = BACKEND_DIR.parent
DB_DIR = REPO_ROOT / "database"

SQLITE_UNCOMPRESSED = DB_DIR / "network_traffic_dw.sqlite"
SQLITE_COMPRESSED = DB_DIR / "network_traffic_dw.sqlite.gz"

_resolved_db_path = None


def get_sqlite_db_path() -> Path:
    """
    Locates or decompresses the read-only SQLite database.
    - If SQLITE_DB_PATH env var is specified, uses that.
    - If database/network_traffic_dw.sqlite exists and is non-empty, uses it directly.
    - In serverless / read-only deployment (e.g., Vercel), extracts
      network_traffic_dw.sqlite.gz to /tmp (or system temp dir) once,
      and reuses it for the lifetime of the execution environment.
    """
    global _resolved_db_path
    if _resolved_db_path and _resolved_db_path.is_file() and _resolved_db_path.stat().st_size > 50_000_000:
        return _resolved_db_path

    # 1. Custom environment variable override
    env_path = os.getenv("SQLITE_DB_PATH")
    if env_path:
        p = Path(env_path).resolve()
        if p.is_file() and p.stat().st_size > 0:
            _resolved_db_path = p
            return p

    # 2. Local uncompressed file in repository
    if SQLITE_UNCOMPRESSED.is_file() and SQLITE_UNCOMPRESSED.stat().st_size > 50_000_000:
        _resolved_db_path = SQLITE_UNCOMPRESSED
        return SQLITE_UNCOMPRESSED

    # 3. Serverless temp file (/tmp on Linux/Vercel or system tempdir)
    is_posix = os.name != "nt"
    target_dir = Path("/tmp") if (is_posix and Path("/tmp").is_dir()) else Path(tempfile.gettempdir())
    extracted_db = target_dir / "network_traffic_dw.sqlite"

    if extracted_db.is_file() and extracted_db.stat().st_size > 50_000_000:
        _resolved_db_path = extracted_db
        return extracted_db

    # 4. Decompress from bundled archive
    source_gz = None
    if SQLITE_COMPRESSED.is_file():
        source_gz = SQLITE_COMPRESSED
    else:
        alt_gz = Path.cwd() / "database" / "network_traffic_dw.sqlite.gz"
        if alt_gz.is_file():
            source_gz = alt_gz

    if not source_gz:
        raise FileNotFoundError(
            f"SQLite analytical database archive not found at {SQLITE_COMPRESSED} or {SQLITE_UNCOMPRESSED}"
        )

    logger.info(f"Decompressing {source_gz} to {extracted_db}...")
    target_dir.mkdir(parents=True, exist_ok=True)
    temp_target = target_dir / "network_traffic_dw.sqlite.tmp"

    with gzip.open(source_gz, "rb") as f_in, open(temp_target, "wb") as f_out:
        shutil.copyfileobj(f_in, f_out)

    os.replace(temp_target, extracted_db)
    logger.info(f"Decompressed SQLite database ready at {extracted_db} ({extracted_db.stat().st_size} bytes)")

    _resolved_db_path = extracted_db
    return extracted_db


class SQLiteCursorWrapper:
    """
    Cursor adapter that supports dictionary=True formatting and converts
    MySQL parameter placeholders (%s) to SQLite parameter placeholders (?).
    """
    def __init__(self, cursor: sqlite3.Cursor, dictionary: bool = False):
        self._cursor = cursor
        self.dictionary = dictionary

    @property
    def rowcount(self) -> int:
        return self._cursor.rowcount

    @property
    def description(self):
        return self._cursor.description

    def execute(self, query: str, params=None):
        if "%s" in query:
            query = query.replace("%s", "?")
        if params is None:
            self._cursor.execute(query)
        elif isinstance(params, (list, tuple)):
            self._cursor.execute(query, params)
        else:
            self._cursor.execute(query, (params,))
        return self

    def executemany(self, query: str, seq_of_params):
        if "%s" in query:
            query = query.replace("%s", "?")
        self._cursor.executemany(query, seq_of_params)
        return self

    def fetchone(self):
        row = self._cursor.fetchone()
        if row is None:
            return None
        return dict(row) if self.dictionary else tuple(row)

    def fetchall(self):
        rows = self._cursor.fetchall()
        if self.dictionary:
            return [dict(r) for r in rows]
        return [tuple(r) for r in rows]

    def fetchmany(self, size=None):
        rows = self._cursor.fetchmany(size) if size is not None else self._cursor.fetchmany()
        if self.dictionary:
            return [dict(r) for r in rows]
        return [tuple(r) for r in rows]

    def close(self):
        self._cursor.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


class SQLiteConnectionWrapper:
    """
    Connection adapter that wraps sqlite3.Connection to provide:
    - connection.cursor(dictionary=True/False)
    - connection.is_connected()
    - connection.close()
    - Read-only protection
    """
    def __init__(self, conn: sqlite3.Connection):
        self._conn = conn

    def cursor(self, dictionary: bool = False):
        if self._conn is None:
            raise RuntimeError("Database connection is closed.")
        cur = self._conn.cursor()
        return SQLiteCursorWrapper(cur, dictionary=dictionary)

    def is_connected(self) -> bool:
        return self._conn is not None

    def close(self):
        if self._conn:
            self._conn.close()
            self._conn = None

    def commit(self):
        pass

    def rollback(self):
        pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


def get_db_connection() -> SQLiteConnectionWrapper:
    """
    Creates and returns a thread-safe read-only connection to the
    analytical SQLite database.
    """
    db_path = get_sqlite_db_path()
    uri_path = f"file:{db_path.resolve().as_posix()}?mode=ro"
    try:
        raw_conn = sqlite3.connect(uri_path, uri=True, check_same_thread=False)
        raw_conn.row_factory = sqlite3.Row
        return SQLiteConnectionWrapper(raw_conn)
    except sqlite3.Error:
        # Fallback to standard connect with PRAGMA query_only
        try:
            raw_conn = sqlite3.connect(str(db_path), check_same_thread=False)
            raw_conn.row_factory = sqlite3.Row
            raw_conn.execute("PRAGMA query_only = ON;")
            return SQLiteConnectionWrapper(raw_conn)
        except sqlite3.Error as fallback_err:
            logger.error(f"SQLite connection error: {fallback_err}")
            raise fallback_err
