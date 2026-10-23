#!/usr/bin/env bash
# refresh-prices.sh — weekly: pull eBay prices for the curated parts, publish if clean, ask if not.
# Runs on RNUbuntuVM from declouding-prices.timer (see tools/systemd). Safe to run by hand.
#
#   clean   → commit site/data/prices.json, push (best effort), deploy
#   flags   → publish nothing; Home Assistant push (if HA_* set) listing what needs a look
#
# Env (EnvironmentFile ~/.config/declouding/ebay.env): EBAY_APP_ID EBAY_CERT_ID [EBAY_ZIP]
#   optional HA_URL HA_TOKEN HA_NOTIFY (same names as /etc/podd/env).
set -euo pipefail
cd "$(dirname "$0")/.."
FLAGS=$(mktemp)
trap 'rm -f "$FLAGS"' EXIT

echo "== $(date '+%F %T') refresh start"
python3 tools/ebay_prices.py --parts site/data/parts.yaml --out site/data/prices.json --flags "$FLAGS" "$@"

notify() {  # $1 title, $2 message
  [ -n "${HA_URL:-}" ] && [ -n "${HA_TOKEN:-}" ] && [ -n "${HA_NOTIFY:-}" ] || return 0
  curl -fsS -m 15 -o /dev/null -X POST "$HA_URL/api/services/notify/${HA_NOTIFY#notify.}" \
    -H "Authorization: Bearer $HA_TOKEN" -H 'Content-Type: application/json' \
    -d "$(python3 -c 'import json,sys; print(json.dumps({"title": sys.argv[1], "message": sys.argv[2]}))' "$1" "$2")" \
    || echo "(HA notify failed)"
}

if [ -s "$FLAGS" ]; then
  echo "== flags — not publishing:"; cat "$FLAGS"
  git checkout -q -- site/data/prices.json 2>/dev/null || true
  notify "de-clouding prices: needs a look" "$(head -c 900 "$FLAGS")"
  exit 0
fi

if git diff --quiet -- site/data/prices.json; then
  echo "== no change"; exit 0
fi

git add site/data/prices.json
git -c user.name="${GIT_AUTHOR_NAME:-price refresh}" -c user.email="${GIT_AUTHOR_EMAIL:-prices@de-clouding.com}" \
  commit -q -m "prices: weekly eBay refresh $(date +%F)"
git push -q || echo "(push failed — commit is local; push by hand next time you're in the repo)"
./deploy.sh
echo "== $(date '+%F %T') refresh done"
