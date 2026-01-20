from pydantic import BaseModel
from pathlib import Path

class Settings(BaseModel):
    db_path: str = str(Path(__file__).resolve().parents[2] / "data" / "pa.db")

settings = Settings()
