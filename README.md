# de-clouding.com

Static Hugo site → private S3 bucket → CloudFront. No backend. Deploy = one script.

```
site/        Hugo source (content/, layouts/, static/). No theme dependency; layouts are self-contained.
aws/         bootstrap.sh (one-time), state.env + deploy.env (generated)
deploy.sh    hugo build + s3 sync + CloudFront invalidation
```

## Prereqs on the deploying host (RNUbuntuVM)

- `hugo` (extended) ≥ 0.140 — `.deb` from https://github.com/gohugoio/hugo/releases (the Ubuntu apt package is too old)
- `aws` CLI v2 with an **admin** profile for bootstrap; `jq`

## One-time setup

```
cd aws
AWS_PROFILE=<admin-profile> ALARM_EMAIL=you@example.com ./bootstrap.sh cert
#   → add the printed CNAME(s) at Namecheap → Advanced DNS
AWS_PROFILE=<admin-profile> ./bootstrap.sh status      # until cert: ISSUED (minutes to an hour)
AWS_PROFILE=<admin-profile> ./bootstrap.sh site
#   → paste the printed [de-clouding-deploy] block into ~/.aws/credentials
#   → add @ ALIAS and www CNAME at Namecheap pointing at the printed dxxxx.cloudfront.net
```

One-way doors in bootstrap: none destructive. Everything it makes can be deleted. The IAM access key is printed once.

## Every deploy

```
./deploy.sh
```

## Editing

- Guides live in `site/content/guides/*.md`; front matter `weight` orders them, `replaces` is the card subtitle,
  `moves` is the layer-chip row. Two shortcodes: `{{< tiers t0=… t1=… t2=… t3=… >}}` and
  `{{< prompt title="…" >}}…{{< /prompt >}}`.
- `site/content/start.md` + `static/js/prompt-builder.js` is the in-browser prompt builder.
- Local preview: `hugo --source site server` → http://localhost:1313

## TODO before launch

- `content/about.md`: author line; contact is GitHub Issues (no email by design).
- Re-check prices in `content/tiers.md`; they're rough and dated Oct 2026.
- Decide `PRICE_CLASS` (default PriceClass_100 = NA/EU edges; set PriceClass_All for global before bootstrap `site`).
