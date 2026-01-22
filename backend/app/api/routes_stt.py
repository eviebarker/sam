import asyncio
import mimetypes
import os
import tempfile
from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile

from backend.app.services.speech_to_text import STTService

router = APIRouter()

# Single shared model instance to avoid reloading between requests
_stt_service = STTService(
    model_size=os.getenv("WHISPER_MODEL", "small.en"),
    device=os.getenv("WHISPER_DEVICE", "cpu"),
    compute_type=os.getenv("WHISPER_COMPUTE_TYPE", "int8"),
    default_language=os.getenv("WHISPER_LANGUAGE", "en"),
)


@router.post("/api/stt")
async def transcribe_audio(
    background_tasks: BackgroundTasks, file: UploadFile = File(...)
):
    if not file:
        raise HTTPException(status_code=400, detail="audio file is required")

    guessed_ext = mimetypes.guess_extension(file.content_type or "") or ".bin"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=guessed_ext)
    tmp_path = tmp.name
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="empty audio upload")
        tmp.write(contents)
        tmp.close()

        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(
            None, lambda: _stt_service.transcribe_file(tmp_path)
        )
    except HTTPException:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise
    except Exception as exc:  # pragma: no cover - runtime safety
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=f"transcription failed: {exc}") from exc

    background_tasks.add_task(os.remove, tmp_path)
    return {
        "text": result.text,
        "language": result.language,
        "segments": [
            {"start": s.start, "end": s.end, "text": s.text} for s in result.segments
        ],
    }
