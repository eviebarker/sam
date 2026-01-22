# Note: This requires ffmpeg to be installed on the system
from __future__ import annotations

import os
import subprocess
import tempfile
import threading
from dataclasses import dataclass
from typing import Optional, List, Dict, Any, Tuple

from faster_whisper import WhisperModel


@dataclass(frozen=True)
class STTSegment:
    start: float
    end: float
    text: str


@dataclass(frozen=True)
class STTResult:
    text: str
    segments: List[STTSegment]
    language: Optional[str] = None


class STTService:
    """
    Core STT service:
      - Converts input audio to 16kHz mono wav (PCM) via ffmpeg
      - Transcribes with faster-whisper
    """

    def __init__(
        self,
        model_size: str = "small.en",
        device: str = "cpu",          # "cpu" or "cuda"
        compute_type: str = "int8",   # cpu: "int8" is usually best
        default_language: Optional[str] = "en",
        vad_filter: bool = True,
    ):
        self.model_size = model_size
        self.device = device
        self.compute_type = compute_type
        self.default_language = default_language
        self.vad_filter = vad_filter

        self._model = WhisperModel(
            model_size, device=device, compute_type=compute_type)
        self._lock = threading.Lock()

    def transcribe_file(self, input_path: str, language: Optional[str] = None) -> STTResult:
        """
        Transcribe an audio file path (webm/ogg/m4a/wav/etc).
        Returns final text + segments + detected language (if available).
        """
        lang_arg = language if language is not None else self.default_language

        with tempfile.TemporaryDirectory() as td:
            wav_path = os.path.join(td, "audio_16k_mono.wav")
            self._convert_to_wav_16k_mono(input_path, wav_path)

            # model.transcribe returns (segments_iterator, info)
            with self._lock:
                segments_iter, info = self._model.transcribe(
                    wav_path,
                    language=lang_arg,
                    vad_filter=self.vad_filter,
                )

                segments: List[STTSegment] = []
                text_parts: List[str] = []

                for s in segments_iter:
                    t = (s.text or "").strip()
                    if not t:
                        continue
                    segments.append(STTSegment(start=float(
                        s.start), end=float(s.end), text=t))
                    text_parts.append(t)

            detected_lang = getattr(info, "language", None)
            return STTResult(text=" ".join(text_parts).strip(), segments=segments, language=detected_lang)

    @staticmethod
    def _convert_to_wav_16k_mono(input_path: str, output_wav_path: str) -> None:
        """
        Uses ffmpeg to normalise audio. This is the key step that makes browser audio painless.
        """
        ffmpeg_bin = os.getenv("FFMPEG_PATH", "ffmpeg")
        cmd = [
            ffmpeg_bin,
            "-y",
            "-loglevel", "error",
            "-i", input_path,
            "-ac", "1",
            "-ar", "16000",
            "-f", "wav",
            output_wav_path,
        ]
        try:
            subprocess.run(cmd, check=True, capture_output=True)
        except FileNotFoundError as e:
            raise RuntimeError(
                "ffmpeg not found. Install ffmpeg and ensure it is on PATH.") from e
        except subprocess.CalledProcessError as e:
            err = (e.stderr or b"").decode("utf-8", errors="ignore").strip()
            raise RuntimeError(
                f"ffmpeg conversion failed: {err or 'unknown error'}") from e


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python stt_service.py /path/to/audio.webm")
        raise SystemExit(2)

    audio_path = sys.argv[1]

    # Simple defaults; override later with env vars if you want.
    svc = STTService(
        model_size=os.getenv("WHISPER_MODEL", "small.en"),
        device=os.getenv("WHISPER_DEVICE", "cpu"),
        compute_type=os.getenv("WHISPER_COMPUTE_TYPE", "int8"),
        default_language=os.getenv("WHISPER_LANGUAGE", "en"),
    )

    result = svc.transcribe_file(audio_path)
    print("\n--- TRANSCRIPT ---")
    print(result.text)
    print("\n--- SEGMENTS ---")
    for seg in result.segments:
        print(f"[{seg.start:6.2f} -> {seg.end:6.2f}] {seg.text}")
    print("\n--- LANGUAGE ---")
    print(result.language)
