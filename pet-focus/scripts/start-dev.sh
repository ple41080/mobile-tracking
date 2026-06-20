#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

has_usb_device() {
  adb devices 2>/dev/null | awk 'NR>1 && $2=="device" { found=1 } END { exit !found }'
}

if has_usb_device; then
  echo "→ USB/emulator detected: adb reverse + localhost"
  adb reverse tcp:8081 tcp:8081
  exec npx expo start --dev-client --localhost "$@"
fi

echo "→ No USB device: LAN mode (phone must be on same Wi‑Fi as this Mac)"
echo "  If it still fails, try: npm run start:tunnel"
exec npx expo start --dev-client --lan "$@"
