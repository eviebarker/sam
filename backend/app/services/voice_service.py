"""
Lightweight text-to-speech helpers built around Piper with a background worker
queue to prevent blocking the API process.
"""

import tempfile
import wave
import random
import threading
import queue
import soundfile as sf
import os
import shutil
import subprocess
import re
from math import gcd
from scipy.signal import resample_poly
from pathlib import Path
from piper import PiperVoice, SynthesisConfig
from backend.app.db.pronunciation_queries import list_pronunciations

# Init voice model
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "voice_model" / \
    "en_GB-northern_english_male-medium.onnx"
BASE_LENGTH_SCALE = 1.04
BASE_NOISE_SCALE = 0.8
BASE_NOISE_W_SCALE = 0.8
voice = PiperVoice.load(str(MODEL_PATH))


def generate_wav_file(input_text: str, wav_path: str):
    """Synthesize `input_text` into a WAV file written to `wav_path`."""
    input_text = apply_pronunciations(input_text)
    syn_config = SynthesisConfig(
        length_scale=BASE_LENGTH_SCALE * random.uniform(0.98, 1.03),
        noise_scale=BASE_NOISE_SCALE * random.uniform(0.9, 1.1),
        noise_w_scale=BASE_NOISE_W_SCALE * random.uniform(0.9, 1.1),
    )

    if not input_text.endswith("\n"):
        input_text += "\n"

    with wave.open(wav_path, "wb") as wav_file:
        voice.synthesize_wav(
            input_text,
            wav_file,
            syn_config=syn_config,
        )


OPUS_SAMPLE_RATE = 24000


def wav_to_ogg(wav_path: str, ogg_path: str):
    data, samplerate = sf.read(wav_path)

    # Ensure mono
    if data.ndim > 1:
        data = data.mean(axis=1)

    # Resample if needed
    if samplerate != OPUS_SAMPLE_RATE:
        g = gcd(samplerate, OPUS_SAMPLE_RATE)
        up = OPUS_SAMPLE_RATE // g
        down = samplerate // g
        data = resample_poly(data, up, down)
        samplerate = OPUS_SAMPLE_RATE

    sf.write(
        ogg_path,
        data,
        samplerate,
        format="OGG",
        subtype="OPUS",
    )


def generate_speech_ogg(input_text: str, ogg_path: str):
    """Generate speech audio as OGG (Opus) by piping a temporary WAV through conversion."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav_path = tmp.name

    try:
        generate_wav_file(input_text, wav_path)
        wav_to_ogg(wav_path, ogg_path)
    finally:
        if os.path.exists(wav_path):
            os.remove(wav_path)


# This queues jobs so backend doesn't get overloaded
tts_queue = queue.Queue()


def tts_worker():
    """Continuously pull TTS jobs off the queue and process them."""
    while True:
        job = tts_queue.get()  # blocks

        try:
            generate_speech_ogg(job["text"], job["output"])
        except Exception as e:
            job["error"] = e
        finally:
            job["done"].set()
            tts_queue.task_done()


worker_thread = threading.Thread(target=tts_worker, daemon=True)
worker_thread.start()


# API Hook
def synthesize_blocking(input_text: str, output_filename: str):
    """Submit a TTS job and block until the output file has been written."""
    done_event = threading.Event()

    job = {
        "text": input_text,
        "output": output_filename,
        "done": done_event,
        "error": None,
    }

    tts_queue.put(job)

    # Block until this job finishes
    done_event.wait()

    if job["error"]:
        raise job["error"]


def _detect_player_cmd() -> list[str] | None:
    override = os.getenv("TTS_PLAYER_CMD")
    if override:
        return override.split()
    for cmd in ("afplay", "aplay", "paplay"):
        if shutil.which(cmd):
            return [cmd]
    return None


def apply_pronunciations(text: str) -> str:
    pronunciations = list_pronunciations()
    if not pronunciations:
        return text
    updated = text
    for entry in pronunciations:
        term = entry["term"]
        pronunciation = entry["pronunciation"]
        if not term or not pronunciation:
            continue
        escaped = re.escape(term)
        if " " in term:
            pattern = re.compile(escaped, flags=re.IGNORECASE)
        else:
            pattern = re.compile(rf"\b{escaped}\b", flags=re.IGNORECASE)
        updated = pattern.sub(pronunciation, updated)
    return updated


def synthesize_and_play(input_text: str) -> None:
    player_cmd = _detect_player_cmd()
    if not player_cmd:
        raise RuntimeError("No audio player found. Set TTS_PLAYER_CMD.")

    input_text = apply_pronunciations(input_text)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav_path = tmp.name

    try:
        generate_wav_file(input_text, wav_path)
        subprocess.run(player_cmd + [wav_path], check=False)
    finally:
        if os.path.exists(wav_path):
            os.remove(wav_path)


def synthesize_and_play_async(input_text: str) -> None:
    thread = threading.Thread(
        target=synthesize_and_play, args=(input_text,), daemon=True
    )
    thread.start()


def apply_pronunciations(text: str) -> str:
    pronunciations = list_pronunciations()
    if not pronunciations:
        return text
    updated = text
    for item in pronunciations:
        term = item.get("term")
        pronunciation = item.get("pronunciation")
        if not term or not pronunciation:
            continue
        pronunciation = _format_pronunciation(pronunciation)
        pattern = re.compile(rf"\b{re.escape(term)}\b", re.IGNORECASE)
        updated = pattern.sub(pronunciation, updated)
    return updated


def _format_pronunciation(pronunciation: str) -> str:
    cleaned = pronunciation.strip()
    tokens = cleaned.split()
    if len(tokens) >= 2 and all(len(t) <= 2 for t in tokens):
        return ", ".join(tokens)
    return cleaned
