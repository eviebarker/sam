#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"
STATIC_DIR="${ROOT_DIR}/backend/app/static"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to build the frontend. Please install Node.js/npm." >&2
  exit 1
fi

cd "${FRONTEND_DIR}"
npm ci
npm run build

rm -rf "${STATIC_DIR}"
mkdir -p "${STATIC_DIR}"
cp -R "${FRONTEND_DIR}/dist/." "${STATIC_DIR}/"

echo "Frontend built and copied to ${STATIC_DIR}"
