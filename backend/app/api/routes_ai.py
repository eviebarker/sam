import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI

router = APIRouter()


class AiRequest(BaseModel):
    text: str


def get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)


@router.post("/api/ai/respond")
def ai_respond(body: AiRequest):
    prompt = body.text.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="text is required")

    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-5")

    try:
        response = client.responses.create(
            model=model,
            input=prompt,
            store=False,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI failed: {exc}") from exc

    output_text = response.output_text
    if not output_text:
        raise HTTPException(status_code=500, detail="AI returned empty response")

    return {"text": output_text}
