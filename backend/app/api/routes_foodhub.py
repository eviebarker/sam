from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
from fastapi.responses import Response
from urllib.parse import urlparse
from urllib.request import urlopen, Request
from backend.app.db.conn import get_conn
from backend.app.db.foodhub_queries import (
    list_foodhub_by_category,
    list_foodhub_all,
    set_foodhub_rating,
    set_foodhub_accessed,
)

router = APIRouter(prefix="/api/foodhub", tags=["foodhub"])

class FoodHubRateReq(BaseModel):
    recipe_id: int = Field(..., ge=1)
    rating: int = Field(..., ge=1, le=5)

class FoodHubAccessReq(BaseModel):
    recipe_id: int = Field(..., ge=1)

@router.get("")
def get_foodhub(category_id: int = Query(..., ge=1)):
    with get_conn() as conn:
        recipes = list_foodhub_by_category(conn, category_id)
    return {"recipes": recipes}

@router.get("/all")
def get_foodhub_all():
    with get_conn() as conn:
        recipes = list_foodhub_all(conn)
    return {"recipes": recipes}

@router.post("/rate")
def rate_foodhub(req: FoodHubRateReq):
    with get_conn() as conn:
        set_foodhub_rating(conn, req.recipe_id, req.rating)
        conn.commit()
    return {"ok": True}

@router.post("/accessed")
def accessed_foodhub(req: FoodHubAccessReq):
    ts = datetime.utcnow().isoformat()
    with get_conn() as conn:
        set_foodhub_accessed(conn, req.recipe_id, ts)
        conn.commit()
    return {"ok": True, "last_accessed_at": ts}

@router.get("/image")
def get_foodhub_image(url: str = Query(..., min_length=8)):
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Invalid image url")
    req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urlopen(req, timeout=8) as resp:
            data = resp.read()
            content_type = resp.headers.get("Content-Type", "image/jpeg")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return Response(content=data, media_type=content_type)
