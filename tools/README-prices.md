# Weekly used-market prices for the parts tables

`site/data/parts.yaml` is the curation (what the Box and Tiers pages recommend, with an eBay search,
accepted condition ids and a sanity band per part). `tools/ebay_prices.py` reads it once a week on
RNUbuntuVM, asks eBay's public Browse API for current US fixed-price listings, drops junk, and writes
`site/data/prices.json` (good = 25th percentile incl. shipping, typical = median, n = listings).
`tools/refresh-prices.sh` commits and deploys when the numbers are clean, and sends a Home Assistant
push instead when something needs a human look (too few listings, a >35% weekly move, an API error).

The site shows numbers only. No links, no affiliate tags, no tracking — the site earns nothing.

## One-time setup (RNUbuntuVM)

1. eBay developer account → create a **production** keyset for an application named `declouding-prices`
   (Browse API uses the client-credentials grant; no user login).
2. `mkdir -p ~/.config/declouding && cp tools/ebay.env.example ~/.config/declouding/ebay.env && chmod 600 ~/.config/declouding/ebay.env`
   and fill in `EBAY_APP_ID`, `EBAY_CERT_ID` (and the HA_* lines if you want the push).
3. `sudo apt install -y python3-yaml`
4. Dry runs: `python3 tools/ebay_prices.py --print-urls` (no API; eyeball the 20 searches), then
   `set -a; . ~/.config/declouding/ebay.env; set +a; python3 tools/ebay_prices.py --parts site/data/parts.yaml --out /tmp/prices.json --flags /tmp/flags --only t1-optiplex-micro && cat /tmp/prices.json`
5. First real run: `tools/refresh-prices.sh` (commits, pushes, deploys).
6. Timer: `sudo cp tools/systemd/declouding-prices.{service,timer} /etc/systemd/system/ && sudo mkdir -p /mnt/homelab/logs/declouding && sudo systemctl daemon-reload && sudo systemctl enable --now declouding-prices.timer`
   — Sundays 06:40 ET, log at `/mnt/homelab/logs/declouding/prices.log`.

Before trusting it: check eBay's API license terms permit publishing derived price summaries, and confirm
the condition ids (1000 new; 2000/2010/2020/2030 refurbished grades; 2500 seller refurbished; 3000 used).
