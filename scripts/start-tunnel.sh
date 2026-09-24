#!/usr/bin/env bash
# WSL / 다른 네트워크에서도 폰이 접속되도록 cloudflared 터널 + Expo 개발 서버 실행
# 사용: npm run start:tunnel   (터미널에 QR 이 뜬다 → Expo Go 로 스캔)
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${PORT:-8081}"

CF="$HOME/.local/bin/cloudflared"
if [ ! -x "$CF" ]; then
  echo "cloudflared 내려받는 중..."
  mkdir -p "$HOME/.local/bin"
  curl -fsSL -o "$CF" "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
  chmod +x "$CF"
fi

if command -v ss >/dev/null && ss -ltn 2>/dev/null | grep -q ":$PORT "; then
  echo "포트 $PORT 가 이미 사용 중이에요. 다른 expo/metro 를 끄거나 PORT=8082 npm run start:tunnel 로 실행하세요."
  exit 1
fi

LOG="$(mktemp)"
"$CF" tunnel --url "http://localhost:$PORT" --no-autoupdate >"$LOG" 2>&1 &
CFPID=$!
trap 'kill $CFPID 2>/dev/null || true' EXIT

HOST=""
for _ in $(seq 1 40); do
  HOST="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" | head -1 | sed 's#https://##')"
  [ -n "$HOST" ] && break
  sleep 1
done
if [ -z "$HOST" ]; then
  echo "터널을 만들지 못했어요:"; cat "$LOG"; exit 1
fi

echo
echo "  📱 Expo Go 링크:  exp://$HOST"
echo "     (아래 QR 이나 Expo 가 출력하는 QR 아무거나 스캔하면 돼요)"
echo
node -e "require('qrcode-terminal').generate('exp://$HOST', { small: true })" 2>/dev/null || true
echo

# Expo 가 만드는 QR/링크도 터널 주소를 쓰도록 프록시 URL 지정
EXPO_PACKAGER_PROXY_URL="http://$HOST" npx expo start --port "$PORT"
