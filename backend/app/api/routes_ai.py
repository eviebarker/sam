import os
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from backend.app.db.ai_queries import (
    add_ai_message,
    add_ai_memory,
    list_ai_memories,
    list_ai_messages_since,
)

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
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    memory_model = os.getenv("OPENAI_MEMORY_MODEL", model)
    now = datetime.utcnow()
    since = (now - timedelta(days=1)).isoformat(timespec="seconds")

    history = list_ai_messages_since(since)
    memories = list_ai_memories(limit=20)

    system_prompt = os.getenv(
        "AI_SYSTEM_PROMPT",
        "You are Sam, a warm, helpful assistant. Keep responses concise and kind.",
    )

    messages = [{"role": "system", "content": system_prompt}]
    if memories:
        memory_lines = "\n".join(f"- {m['summary']}" for m in memories)
        messages.append({"role": "system", "content": f"Profile memory:\n{memory_lines}"})
    messages.extend({"role": m["role"], "content": m["content"]} for m in history)
    messages.append({"role": "user", "content": prompt})

    try:
        response = client.responses.create(
            model=model,
            input=messages,
            store=False,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI failed: {exc}") from exc

    output_text = response.output_text
    if not output_text:
        raise HTTPException(status_code=500, detail="AI returned empty response")

    add_ai_message("user", prompt, now.isoformat(timespec="seconds"))
    add_ai_message("assistant", output_text, datetime.utcnow().isoformat(timespec="seconds"))

    try:
        memory_prompt = (
            "Extract any long-term memories worth saving about the user or their dad. "
            "Return a JSON array of short sentences. If none, return []."
        )
        memory_resp = client.responses.create(
            model=memory_model,
            input=[
                {"role": "system", "content": memory_prompt},
                {"role": "user", "content": prompt},
            ],
            store=False,
        )
        mem_text = memory_resp.output_text or "[]"
        items = json.loads(mem_text)
        if isinstance(items, list):
            for item in items:
                if isinstance(item, str):
                    cleaned = item.strip()
                    if cleaned:
                        add_ai_memory(cleaned)
    except Exception:
        pass

    return {"text": output_text}
