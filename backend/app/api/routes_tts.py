import os
import tempfile
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from backend.app.services.voice_service import synthesize_blocking

router = APIRouter()


class TtsRequest(BaseModel):
    text: str


@router.post("/api/tts")
def tts_speak(payload: TtsRequest, background_tasks: BackgroundTasks):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    tmp = tempfile.NamedTemporaryFile(suffix=".ogg", delete=False)
    tmp.close()

    try:
        synthesize_blocking(text, tmp.name)
    except Exception as exc:
        if os.path.exists(tmp.name):
            os.remove(tmp.name)
        raise HTTPException(status_code=500, detail=f"TTS failed: {exc}") from exc

    background_tasks.add_task(os.remove, tmp.name)
    return FileResponse(tmp.name, media_type="audio/ogg", filename="speech.ogg")
