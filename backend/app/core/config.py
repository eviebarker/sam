"""Application configuration (env-driven settings)."""

from pydantic import BaseModel
from pathlib import Path

class Settings(BaseModel):
    """Static defaults for the MVP; extend with env vars as the app grows."""
    db_path: str = str(Path(__file__).resolve().parents[2] / "data" / "pa.db")

settings = Settings()
