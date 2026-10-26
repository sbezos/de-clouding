#!/usr/bin/env bash
# canonical-urls.sh — one-time CloudFront change so every page has exactly one URL, for search engines and humans:
#   * https://www.<domain>/anything  -> 301 -> https://<domain>/anything   (www was serving a full duplicate)
#   * /path with no trailing slash and no file extension -> 301 -> /path/   (was a silent rewrite = duplicate)
#   * /kits/* (raw compose files) get "X-Robots-Tag: noindex" so the index points at /box/, not at the YAML.
#
# Usage:
#   canonical-urls.sh policy   print the IAM policy JSON this script needs (attach it as a temporary inline policy
#                              to the deploy user, e.g. "declouding-cdnconfig-temp", delete it afterwards)
#   canonical-urls.sh apply    make the change (default). Tests the new function on six sample requests in the
#                              DEVELOPMENT stage and only publishes if all six behave; clones the default behavior
#                              for kits/* with one policy swapped. Idempotent.
#   canonical-urls.sh verify   curl the live site and show status / Location / X-Robots-Tag for the cases above
#
# Needs AWS_PROFILE with the rights printed by `policy` (the scoped deploy user has them only while the temporary
# inline policy is attached) or any admin session (CloudShell). DIST_ID is read from the environment
# (deploy.env on RNUbuntuVM) or discovered from the distribution alias.
# Reversal: republish the old function body (git history of aws/bootstrap.sh) and remove the kits/* behavior.
set -euo pipefail
DOMAIN="${DOMAIN:-de-clouding.com}"
BUCKET="${BUCKET:-de-clouding-site}"
FUNC="${BUCKET}-index-rewrite"
RHP_NAME="${BUCKET}-kits-noindex"
aws() { command aws --region us-east-1 --output json "$@"; }
need() { command -v "$1" >/dev/null || { echo "missing: $1" >&2; exit 1; }; }
need aws; need jq
W=$(mktemp -d)

find_dist() {
  if [ -z "${DIST_ID:-}" ]; then
    DIST_ID=$(aws cloudfront list-distributions | jq -r --arg d "$DOMAIN" \
      '.DistributionList.Items[] | select(.Aliases.Items != null and (.Aliases.Items | index($d))) | .Id')
  fi
  [ -n "${DIST_ID:-}" ] || { echo "no distribution with alias $DOMAIN (set DIST_ID)"; exit 1; }
}

cmd_policy() {
  find_dist
  ACCOUNT=$(aws sts get-caller-identity | jq -r .Account)
  cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {"Sid": "ViewerFunction", "Effect": "Allow",
     "Action": ["cloudfront:DescribeFunction", "cloudfront:GetFunction", "cloudfront:UpdateFunction",
                "cloudfront:TestFunction", "cloudfront:PublishFunction"],
     "Resource": "arn:aws:cloudfront::${ACCOUNT}:function/${FUNC}"},
    {"Sid": "ThisDistribution", "Effect": "Allow",
     "Action": ["cloudfront:GetDistributionConfig", "cloudfront:UpdateDistribution"],
     "Resource": "arn:aws:cloudfront::${ACCOUNT}:distribution/${DIST_ID}"},
    {"Sid": "ResponseHeadersPolicies", "Effect": "Allow",
     "Action": ["cloudfront:ListResponseHeadersPolicies", "cloudfront:CreateResponseHeadersPolicy",
                "cloudfront:GetResponseHeadersPolicy"],
     "Resource": "*"}
  ]
}
EOF
}

cmd_apply() {
  find_dist
  echo "distribution: $DIST_ID"

  echo "== 1. viewer-request function: index rewrite + www/slash redirects"
  cat > "$W/fn.js" <<'EOF'
function handler(event) {
  var r = event.request;
  var u = r.uri;
  var h = r.headers.host ? r.headers.host.value : '';
  var q = qs(r.querystring);
  if (h.indexOf('www.') === 0) {
    return redirect('https://' + h.slice(4) + u + q);
  }
  if (!u.endsWith('/') && u.lastIndexOf('.') <= u.lastIndexOf('/')) {
    return redirect(u + '/' + q);
  }
  if (u.endsWith('/')) { r.uri = u + 'index.html'; }
  return r;
}
function redirect(loc) {
  return { statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value: loc } } };
}
function qs(o) {
  var parts = [];
  for (var k in o) {
    if (o[k].multiValue) { for (var i = 0; i < o[k].multiValue.length; i++) { parts.push(k + '=' + o[k].multiValue[i].value); } }
    else { parts.push(o[k].value ? k + '=' + o[k].value : k); }
  }
  return parts.length ? '?' + parts.join('&') : '';
}
EOF
  etag=$(aws cloudfront describe-function --name "$FUNC" | jq -r .ETag)
  aws cloudfront update-function --name "$FUNC" --if-match "$etag" \
    --function-config "Comment=dir index rewrite + www/slash 301,Runtime=cloudfront-js-2.0" \
    --function-code "fileb://$W/fn.js" >/dev/null
  etag=$(aws cloudfront describe-function --name "$FUNC" --stage DEVELOPMENT | jq -r .ETag)

  t() { # t <host> <uri> <querystring-json> <expected-regex>
    jq -n --arg h "$1" --arg u "$2" --argjson q "$3" \
      '{version:"1.0",context:{eventType:"viewer-request"},viewer:{ip:"203.0.113.1"},
        request:{method:"GET",uri:$u,querystring:$q,headers:{host:{value:$h}},cookies:{}}}' > "$W/ev.json"
    out=$(aws cloudfront test-function --name "$FUNC" --if-match "$etag" --stage DEVELOPMENT --event-object "fileb://$W/ev.json")
    err=$(echo "$out" | jq -r '.TestResult.FunctionErrorMessage // empty')
    got=$(echo "$out" | jq -r '.TestResult.FunctionOutput' | jq -c '(.response // .request) | {statusCode, uri, location: .headers.location.value}')
    if [ -n "$err" ] || ! echo "$got" | grep -Eq "$4"; then
      echo "  TEST FAILED: $1$2 $3 -> $got $err"; echo "  (nothing published; the live function is unchanged)"; exit 1
    fi
    echo "  ok  $1$2 $3 -> $got"
  }
  t "$DOMAIN"     "/about/"       '{}'                         '"uri":"/about/index.html"'
  t "$DOMAIN"     "/about"        '{}'                         '"statusCode":301.*"location":"/about/"'
  t "$DOMAIN"     "/guides"       '{"depth":{"value":"deep"}}' '"location":"/guides/\?depth=deep"'
  t "$DOMAIN"     "/kits/dns.yml" '{}'                         '"uri":"/kits/dns.yml"'
  t "$DOMAIN"     "/"             '{}'                         '"uri":"/index.html"'
  t "www.$DOMAIN" "/tiers/"       '{}'                         "\"location\":\"https://$DOMAIN/tiers/\""
  aws cloudfront publish-function --name "$FUNC" --if-match "$etag" >/dev/null
  echo "  published (live within seconds)"

  echo "== 2. X-Robots-Tag: noindex for /kits/*"
  RHP_ID=$(aws cloudfront list-response-headers-policies --type custom | jq -r --arg n "$RHP_NAME" \
    '.ResponseHeadersPolicyList.Items[]? | select(.ResponseHeadersPolicy.ResponseHeadersPolicyConfig.Name==$n) | .ResponseHeadersPolicy.Id')
  if [ -z "$RHP_ID" ]; then
    cat > "$W/rhp.json" <<EOF
{"Name":"$RHP_NAME","Comment":"same security headers as the managed policy, plus X-Robots-Tag noindex for raw kit files",
 "SecurityHeadersConfig":{
   "StrictTransportSecurity":{"Override":true,"AccessControlMaxAgeSec":31536000,"IncludeSubdomains":false,"Preload":false},
   "ContentTypeOptions":{"Override":true},
   "FrameOptions":{"Override":true,"FrameOption":"SAMEORIGIN"},
   "ReferrerPolicy":{"Override":true,"ReferrerPolicy":"strict-origin-when-cross-origin"},
   "XSSProtection":{"Override":true,"Protection":true,"ModeBlock":true}},
 "CustomHeadersConfig":{"Quantity":1,"Items":[{"Header":"X-Robots-Tag","Value":"noindex","Override":true}]}}
EOF
    RHP_ID=$(aws cloudfront create-response-headers-policy --response-headers-policy-config "file://$W/rhp.json" | jq -r .ResponseHeadersPolicy.Id)
  fi
  echo "  policy $RHP_NAME: $RHP_ID"

  cfg=$(aws cloudfront get-distribution-config --id "$DIST_ID")
  ETAG=$(echo "$cfg" | jq -r .ETag)
  if echo "$cfg" | jq -e '.DistributionConfig.CacheBehaviors.Items[]? | select(.PathPattern=="kits/*")' >/dev/null; then
    echo "  behavior kits/* already present"
  else
    echo "$cfg" | jq --arg rhp "$RHP_ID" '
      .DistributionConfig
      | .CacheBehaviors.Items = ((.CacheBehaviors.Items // []) + [ (.DefaultCacheBehavior + {PathPattern:"kits/*", ResponseHeadersPolicyId:$rhp}) ])
      | .CacheBehaviors.Quantity = (.CacheBehaviors.Items | length)' > "$W/dist.json"
    aws cloudfront update-distribution --id "$DIST_ID" --if-match "$ETAG" --distribution-config "file://$W/dist.json" >/dev/null
    echo "  behavior kits/* added (CloudFront rolls it out over a few minutes)"
  fi
  echo
  echo "done. In ~5 minutes: $0 verify"
}

cmd_verify() {
  for u in "https://www.$DOMAIN/" "https://$DOMAIN/about" "https://$DOMAIN/guides?depth=deep" "https://$DOMAIN/about/" \
           "https://$DOMAIN/kits/dns.yml" "http://$DOMAIN/" "https://$DOMAIN/404.html" "https://$DOMAIN/guides/index.xml"; do
    printf '%-44s ' "$u"
    curl -sI "$u" | grep -iE '^(HTTP|location|x-robots-tag)' | tr -d '\r' | tr '\n' ' '; echo
  done
  echo "expect: www and /about and /guides -> 301 with Location; /about/ 200; kits -> 200 + x-robots-tag: noindex;"
  echo "        http -> 301 https; /404.html 200 (noindex is in its HTML); /guides/index.xml -> 404 after the deploy"
}

case "${1:-apply}" in
  policy) cmd_policy ;;
  apply)  cmd_apply ;;
  verify) cmd_verify ;;
  *) sed -n '2,20p' "$0"; exit 1 ;;
esac
