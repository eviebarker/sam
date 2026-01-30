#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"${ROOT_DIR}/scripts/build_frontend.sh"

cd "${ROOT_DIR}"
python -m pip install --upgrade build
rm -rf "${ROOT_DIR}/dist"
python -m build

echo "Release artifacts are in ${ROOT_DIR}/dist"
