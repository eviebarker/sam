#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_BIN="${ROOT_DIR}/.venv/bin"

if [ ! -d "${VENV_BIN}" ]; then
  echo "Virtualenv not found at ${VENV_BIN}. Run ./install.sh first." >&2
  exit 1
fi

source "${VENV_BIN}/activate"
exec uvicorn backend.app.main:app --host "${HOST:-0.0.0.0}" --port "${PORT:-8000}"
