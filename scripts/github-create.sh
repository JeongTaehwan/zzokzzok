#!/usr/bin/env bash
# GitHub 프라이빗 레포 zzokzzok 생성 + 푸시. 먼저 `gh auth login` 으로 로그인해야 한다.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
cd "$(dirname "$0")/.."
gh auth status >/dev/null 2>&1 || { echo "먼저 로그인: gh auth login"; exit 1; }
if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin main
else
  gh repo create zzokzzok --private --description "쪽쪽 — 아기 수유 시간 기록 & 다음 맘마 알림 앱" --source=. --remote=origin --push
fi
gh repo view --web >/dev/null 2>&1 || true
echo "done: $(gh repo view --json url -q .url)"
