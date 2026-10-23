#!/usr/bin/env python3
"""ebay_prices.py — weekly price refresh for the curated parts on de-clouding.com.

Reads site/data/parts.yaml, asks the eBay Browse API for current US fixed-price listings of each
part, filters out junk (parts-only, outside the sanity band), and writes site/data/prices.json:

    good     the cheaper quarter of eligible listings, price + shipping (what a patient buyer pays)
    typical  the median
    n        eligible listings behind those two numbers
    udlo/udhi  a plausible price window (kept for tooling; the site shows no links)

Anything that looks wrong is NOT published: a part with too few listings, or whose "good" price
moved more than --max-move since last week, keeps last week's numbers and is written to --flags for a
human look. The wrapper (refresh-prices.sh) decides what to do with flags.

Environment: EBAY_APP_ID, EBAY_CERT_ID (production keyset, Browse API; client-credentials grant).
Optional: EBAY_ZIP (shipping estimate destination, default 20001), EBAY_SANDBOX=1.

Stdlib only, plus PyYAML (python3-yaml).
"""
from __future__ import annotations

import argparse
import base64
import signal
import json
import os
import statistics
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import yaml

API = "https://api.sandbox.ebay.com" if os.environ.get("EBAY_SANDBOX") == "1" else "https://api.ebay.com"
TOKEN_URL = f"{API}/identity/v1/oauth2/token"
SEARCH_URL = f"{API}/buy/browse/v1/item_summary/search"
SCOPE = "https://api.ebay.com/oauth/api_scope"
CACHE = Path(os.environ.get("XDG_CACHE_HOME", Path.home() / ".cache")) / "declouding" / "ebay-token.json"
UA = "de-clouding.com price refresh (+https://github.com/sbezos/de-clouding)"


# ---------------------------------------------------------------- eBay client

def _token() -> str:
    try:
        c = json.loads(CACHE.read_text())
        if c.get("exp", 0) - 120 > time.time():
            return c["token"]
    except (OSError, ValueError, KeyError):
        pass
    app, cert = os.environ.get("EBAY_APP_ID"), os.environ.get("EBAY_CERT_ID")
    if not (app and cert):
        sys.exit("EBAY_APP_ID / EBAY_CERT_ID not set")
    body = urllib.parse.urlencode({"grant_type": "client_credentials", "scope": SCOPE}).encode()
    req = urllib.request.Request(TOKEN_URL, data=body, method="POST", headers={
        "Authorization": "Basic " + base64.b64encode(f"{app}:{cert}".encode()).decode(),
        "Content-Type": "application/x-www-form-urlencoded",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        tok = json.load(r)
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    CACHE.write_text(json.dumps({"token": tok["access_token"], "exp": time.time() + int(tok.get("expires_in", 7200))}))
    CACHE.chmod(0o600)
    return tok["access_token"]


def search(q: str, conds: list[int], band: tuple[int, int], limit: int = 100) -> list[dict]:
    """One Browse API call: fixed-price, US-located, deliverable to the US, within the sanity band."""
    flt = ",".join([
        "buyingOptions:{FIXED_PRICE}",
        "conditionIds:{" + "|".join(str(c) for c in conds) + "}",
        "itemLocationCountry:US",
        "deliveryCountry:US",
        f"price:[{band[0]}..{band[1]}]",
        "priceCurrency:USD",
    ])
    params = {"q": q, "filter": flt, "sort": "price", "limit": str(limit),
              "fieldgroups": "MATCHING_ITEMS"}
    req = urllib.request.Request(SEARCH_URL + "?" + urllib.parse.urlencode(params), headers={
        "Authorization": "Bearer " + _token(),
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        "X-EBAY-C-ENDUSERCTX": f"contextualLocation=country=US,zip={os.environ.get('EBAY_ZIP', '20001')}",
        "Accept": "application/json",
        "User-Agent": UA,
    })
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.load(r).get("itemSummaries", []) or []


# ---------------------------------------------------------------- curation

def total_cost(it: dict) -> float | None:
    try:
        price = float(it["price"]["value"])
    except (KeyError, TypeError, ValueError):
        return None
    ship = 0.0
    for so in it.get("shippingOptions") or []:
        cost = (so or {}).get("shippingCost") or {}
        if cost.get("value") is not None:
            try:
                ship = float(cost["value"])
            except ValueError:
                ship = 0.0
            break
    return round(price + ship, 2)


def eligible(items: list[dict], exclude: list[str], band: tuple[int, int]) -> list[float]:
    seen, out = set(), []
    ex = [e.lower() for e in exclude]
    for it in items:
        iid = it.get("itemId")
        if not iid or iid in seen:
            continue
        seen.add(iid)
        title = (it.get("title") or "").lower()
        if any(e in title for e in ex):
            continue
        if "FIXED_PRICE" not in (it.get("buyingOptions") or ["FIXED_PRICE"]):
            continue
        tc = total_cost(it)
        if tc is None or not (band[0] <= tc <= band[1]):
            continue
        out.append(tc)
    return sorted(out)


def r5(x: float) -> int:
    """Round to the nearest $5; prices on a guide page shouldn't look like quotes."""
    return max(5, int(round(x / 5.0) * 5))


def summarize(costs: list[float]) -> dict:
    """costs must be sorted ascending."""
    n = len(costs)
    if n == 0:
        return {"good": None, "typical": None, "min": None, "n": 0, "udlo": None, "udhi": None}
    good = costs[int(0.25 * (n - 1))]          # 25th percentile, nearest rank
    typical = statistics.median(costs)
    return {
        "good": r5(good),
        "typical": r5(typical),
        "min": r5(costs[0]),
        "n": n,
        "udlo": r5(good * 0.6),                # search link window: hides junk below…
        "udhi": r5(typical * 1.35),            # …and gouging above
    }


# ---------------------------------------------------------------- main

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--parts", default="site/data/parts.yaml")
    ap.add_argument("--out", default="site/data/prices.json")
    ap.add_argument("--flags", default=None, help="write human-attention lines here (one per part)")
    ap.add_argument("--min-n", type=int, default=8, help="fewer eligible listings than this → keep last week, flag")
    ap.add_argument("--max-move", type=float, default=0.35, help="|Δgood| above this fraction → keep last week, flag")
    ap.add_argument("--only", default=None, help="comma-separated part ids (testing)")
    ap.add_argument("--print-urls", action="store_true", help="no API: print the curated eBay search URL per part and exit")
    ap.add_argument("--sleep", type=float, default=0.6, help="seconds between API calls")
    a = ap.parse_args()

    cat = yaml.safe_load(Path(a.parts).read_text())
    defaults = cat.get("defaults", {})
    parts: dict = cat["parts"]
    ids = [p.strip() for p in a.only.split(",")] if a.only else list(parts)

    if a.print_urls:
        for pid in ids:
            p = parts[pid]
            conds = p.get("cond") or defaults.get("cond")
            u = ("https://www.ebay.com/sch/i.html?" + urllib.parse.urlencode({"_nkw": p["q"]}) +
                 "&LH_BIN=1&LH_PrefLoc=1&LH_ItemCondition=" + "%7C".join(str(c) for c in conds) + "&_sop=15")
            print(f"{pid:22s} band ${p['band'][0]}–{p['band'][1]:<5} {u}")
        return 0

    try:
        prev = json.loads(Path(a.out).read_text()).get("parts", {}) or {}
    except (OSError, ValueError):
        prev = {}

    out, flags = {}, []
    for pid in ids:
        p = parts[pid]
        conds = [int(c) for c in (p.get("cond") or defaults.get("cond"))]
        band = (int(p["band"][0]), int(p["band"][1]))
        exclude = list(defaults.get("exclude", [])) + list(p.get("exclude", []))
        old = prev.get(pid)
        try:
            items = search(p["q"], conds, band)
        except urllib.error.HTTPError as e:
            msg = e.read()[:200].decode(errors="replace")
            flags.append(f"{pid}: API error {e.code} {msg}")
            if old:
                out[pid] = old
            continue
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            flags.append(f"{pid}: network error {e}")
            if old:
                out[pid] = old
            continue
        costs = eligible(items, exclude, band)
        s = summarize(costs)
        if s["n"] < a.min_n:
            flags.append(f"{pid}: only {s['n']} eligible listings (raw {len(items)}) — check q/band/exclude")
            if old:
                out[pid] = old
            continue
        if old and old.get("good") and abs(s["good"] - old["good"]) / old["good"] > a.max_move:
            flags.append(f"{pid}: good moved {old['good']} → {s['good']} ({s['n']} listings) — look before publishing")
            out[pid] = old
            continue
        s["as_of"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        out[pid] = s
        print(f"{pid:22s} good ${s['good']:<5} typical ${s['typical']:<5} min ${s['min']:<5} n={s['n']:<3} (raw {len(items)})")
        time.sleep(a.sleep)

    doc = {"generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
           "source": "eBay Browse API, US fixed-price listings; see tools/ebay_prices.py", "parts": out}
    Path(a.out).write_text(json.dumps(doc, indent=1, sort_keys=True) + "\n")
    if a.flags:
        Path(a.flags).write_text("".join(f"{f}\n" for f in flags))
    for f in flags:
        print("FLAG", f, file=sys.stderr)
    return 0


if __name__ == "__main__":
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)   # clean `| head`
    sys.exit(main())
