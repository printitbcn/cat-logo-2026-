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
  echo "WARN: PRINTIT_SERVE_HOST=$HOST — other devices on the LAN cannot reach this." >&2
  echo "      Use 0.0.0.0 in .env (or remove PRINTIT_SERVE_HOST) for LAN access." >&2
  echo "" >&2
fi

echo "Root:       $ROOT"
echo "Directory:  (serving from repo root)"
echo "Bind:       $HOST:$PORT"
echo ""

echo "Open from this Mac:"
echo "  http://127.0.0.1:${PORT}/"
echo ""

echo "Open from phones / tablets / other PCs (same Wi?Fi, not mobile data):"
found=0
while read -r ifc ip; do
  [[ -z "$ip" ]] && continue
  echo "  http://${ip}:${PORT}/   (interface ${ifc})"
  found=1
done < <(ifconfig 2>/dev/null | awk '
  /^[a-z0-9]/ { sub(/:/, "", $1); iface = $1 }
  $1 == "inet" && $2 != "127.0.0.1" && $2 !~ /^169\.254\./ { print iface, $2 }
' | sort -u)

if [[ "$found" -eq 0 ]]; then
  echo "  (no LAN IPv4 found — check Wi?Fi / Ethernet is up)"
fi

echo ""
echo "If another device still cannot load the page:"
echo "  • Same network as this Mac (avoid Guest Wi?Fi; some routers block device-to-device)."
echo "  • Use http:// not https://"
echo "  • Turn off VPN on the Mac or on the other device."
echo "  • From the other device, try: ping <one-of-the-IPs-above>"
echo ""
echo "Starting server (Ctrl+C to stop)..."
echo ""

exec python3 -m http.server "$PORT" --bind "$HOST" --directory "$ROOT"
