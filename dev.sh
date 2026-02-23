#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -d "${ROOT_DIR}/.venv" ]]; then
  echo "Missing .venv at ${ROOT_DIR}/.venv"
  echo "Create it first (e.g., python -m venv .venv) and install backend deps."
  exit 1
fi

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "${BACKEND_PID}" 2>/dev/null || true
  fi
  if [[ -n "${FRONTEND_PID:-}" ]]; then
    kill "${FRONTEND_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

source "${ROOT_DIR}/.venv/bin/activate"
uvicorn backend.app.main:app --reload --port 8000 &
BACKEND_PID=$!

cd "${ROOT_DIR}/frontend"
npm install
npm run dev &
FRONTEND_PID=$!

wait
