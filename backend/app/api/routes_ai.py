import os
import json
import math
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from backend.app.db.ai_queries import (
    add_ai_message,
    add_ai_memory,
    list_ai_memories,
    list_ai_messages_since,
    list_ai_memories_with_embeddings,
    prune_ai_memories,
)

router = APIRouter()


class AiRequest(BaseModel):
    text: str


def get_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not set")
    return OpenAI(api_key=api_key)

def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


def _embed_text(client: OpenAI, text: str, model: str) -> list[float]:
    response = client.embeddings.create(model=model, input=text)
    return response.data[0].embedding


@router.post("/api/ai/respond")
def ai_respond(body: AiRequest):
    prompt = body.text.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="text is required")

    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    memory_model = os.getenv("OPENAI_MEMORY_MODEL", model)
    embedding_model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
    top_k = int(os.getenv("AI_MEMORY_TOP_K", "8"))
    now = datetime.utcnow()
    since = (now - timedelta(days=1)).isoformat(timespec="seconds")

    history = list_ai_messages_since(since)
    memories = []
    memories_with_embeddings = list_ai_memories_with_embeddings()
    if memories_with_embeddings:
        try:
            prompt_embedding = _embed_text(client, prompt, embedding_model)
            scored = []
            for memory in memories_with_embeddings:
                try:
                    emb = json.loads(memory["embedding"])
                except Exception:
                    continue
                score = _cosine_similarity(prompt_embedding, emb)
                scored.append((score, memory))
            scored.sort(key=lambda item: item[0], reverse=True)
            memories = [m for _, m in scored[:top_k]]
        except Exception:
            memories = []
    if not memories:
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
            "Extract long-term memories worth saving about projects, relationships, "
            "preferences (likes/dislikes), or ongoing goals. Do NOT save schedules, "
            "calendar details, or workday swaps. Return a JSON array of sentences; "
            "short memories should be under 50 words. Longer memories can be any length. "
            "If none, return []."
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
                        try:
                            emb = _embed_text(client, cleaned, embedding_model)
                        except Exception:
                            emb = None
                        add_ai_memory(cleaned, embedding=emb)
            prune_ai_memories("short", 300)
            prune_ai_memories("long", 200)
    except Exception:
        pass

    return {"text": output_text}
