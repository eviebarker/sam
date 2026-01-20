import wave
import random
import threading
import queue
from piper import PiperVoice, SynthesisConfig

# Init voice model
MODEL_PATH = "backend/app/services/voice_model/en_GB-northern_english_male-medium.onnx"
BASE_LENGTH_SCALE = 1.04
BASE_NOISE_SCALE = 0.8
BASE_NOISE_W_SCALE = 0.8
voice = PiperVoice.load(MODEL_PATH)


def generate_audio_file(input_text: str, output_filename: str):
    syn_config = SynthesisConfig(
        length_scale=BASE_LENGTH_SCALE * random.uniform(0.98, 1.03),
        noise_scale=BASE_NOISE_SCALE * random.uniform(0.9, 1.1),
        noise_w_scale=BASE_NOISE_W_SCALE * random.uniform(0.9, 1.1),
    )

    # Force trailing pause to avoid cut-offs
    if not input_text.endswith("\n"):
        input_text += "\n"

    with wave.open(output_filename, "wb") as wav_file:
        voice.synthesize_wav(
            input_text,
            wav_file,
            syn_config=syn_config,
        )


# This queues jobs so backend doesn't get overloaded
tts_queue = queue.Queue()


def tts_worker():
    while True:
        job = tts_queue.get()  # blocks

        try:
            generate_audio_file(job["text"], job["output"])
        except Exception as e:
            job["error"] = e
        finally:
            job["done"].set()
            tts_queue.task_done()


worker_thread = threading.Thread(target=tts_worker, daemon=True)
worker_thread.start()


# API Hook
def synthesize_blocking(input_text: str, output_filename: str):
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


generate_audio_file("test", "test.wav")
