#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATIC_DIR="${ROOT_DIR}/backend/app/static"
INDEX_FILE="${STATIC_DIR}/index.html"
PYTHON_BIN="${PYTHON:-python3}"

if ! command -v "${PYTHON_BIN}" >/dev/null 2>&1; then
  echo "Python not found (tried '${PYTHON_BIN}'). Set PYTHON to your interpreter path." >&2
  exit 1
fi

if [ ! -d "${ROOT_DIR}/.venv" ]; then
  "${PYTHON_BIN}" -m venv "${ROOT_DIR}/.venv"
fi

source "${ROOT_DIR}/.venv/bin/activate"
python -m pip install --upgrade pip
python -m pip install -r "${ROOT_DIR}/backend/requirements.txt"

if [ ! -f "${INDEX_FILE}" ]; then
  echo "Frontend assets not found at ${INDEX_FILE}. Attempting to build..."
  if command -v npm >/dev/null 2>&1; then
    "${ROOT_DIR}/scripts/build_frontend.sh"
  else
    echo "npm not available; skipping frontend build. API will run without UI until assets are built." >&2
  fi
fi

echo
echo "Setup complete."
echo "To run the app:"
echo "  source .venv/bin/activate"
echo "  uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"
