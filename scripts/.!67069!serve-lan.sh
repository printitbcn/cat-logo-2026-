#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

HOST="${PRINTIT_SERVE_HOST:-0.0.0.0}"
PORT="${PRINTIT_SERVE_PORT:-8080}"

if [[ "$HOST" == "127.0.0.1" || "$HOST" == "localhost" ]]; then
