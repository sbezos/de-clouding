#!/usr/bin/env bash
# bootstrap.sh — one-time AWS setup for a static site: private S3 + CloudFront (OAC) + ACM + scoped deploy user.
#
# Usage (run with an ADMIN profile; the deploy user it creates is the only thing deploy.sh needs):
#   ./bootstrap.sh cert      # phase 1: bucket, ACM request. Prints DNS validation CNAMEs to add at Namecheap.
#   ./bootstrap.sh site      # phase 2 (after cert ISSUED): CloudFront, bucket policy, IAM deploy user, alarm.
#   ./bootstrap.sh status    # show cert + distribution state
#
# Idempotent-ish: safe to re-run; it reads back IDs it already created from ./state.env.
set -euo pipefail
cd "$(dirname "$0")"

# ---- config ---------------------------------------------------------------
DOMAIN="${DOMAIN:-de-clouding.com}"
BUCKET="${BUCKET:-de-clouding-site}"          # S3 bucket names are global; change if taken
LOG_BUCKET="${LOG_BUCKET:-${BUCKET}-logs}"
REGION="us-east-1"                            # ACM certs for CloudFront MUST be in us-east-1
PROFILE="${AWS_PROFILE:-default}"
DEPLOY_USER="${DEPLOY_USER:-de-clouding-deploy}"
ALARM_EMAIL="${ALARM_EMAIL:-}"                # set to get a $10/month billing alarm email
ALARM_USD="${ALARM_USD:-10}"
PRICE_CLASS="${PRICE_CLASS:-PriceClass_100}"  # NA+EU edges only (cheapest). PriceClass_All for global.
# ---------------------------------------------------------------------------

STATE=./state.env
touch "$STATE"; . "$STATE"
save() { grep -v "^$1=" "$STATE" > "$STATE.tmp" || true; echo "$1=$2" >> "$STATE.tmp"; mv "$STATE.tmp" "$STATE"; export "$1=$2"; }
aws() { command aws --profile "$PROFILE" --region "$REGION" --output json "$@"; }
need() { command -v "$1" >/dev/null || { echo "missing: $1" >&2; exit 1; }; }
need aws; need jq
ACCOUNT=$(aws sts get-caller-identity | jq -r .Account)

phase_cert() {
  echo "== S3 buckets"
  for b in "$BUCKET" "$LOG_BUCKET"; do
    if ! aws s3api head-bucket --bucket "$b" 2>/dev/null; then
      aws s3api create-bucket --bucket "$b" >/dev/null
    fi
    aws s3api put-public-access-block --bucket "$b" --public-access-block-configuration \
      BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
  done
  # CloudFront standard logging needs ACLs enabled on the log bucket
  aws s3api put-bucket-ownership-controls --bucket "$LOG_BUCKET" \
    --ownership-controls 'Rules=[{ObjectOwnership=BucketOwnerPreferred}]'
  aws s3api put-bucket-acl --bucket "$LOG_BUCKET" --grant-write 'id=c4c1ede66af53448b93c283ce9448c4ba468c9432aa01d700d3878632f77d2d0' \
    --grant-read-acp 'id=c4c1ede66af53448b93c283ce9448c4ba468c9432aa01d700d3878632f77d2d0' \
    --grant-full-control "id=$(aws s3api list-buckets | jq -r .Owner.ID)"
  aws s3api put-bucket-lifecycle-configuration --bucket "$LOG_BUCKET" --lifecycle-configuration \
    '{"Rules":[{"ID":"expire-logs","Status":"Enabled","Filter":{},"Expiration":{"Days":90}}]}'

  echo "== ACM certificate ($DOMAIN, www.$DOMAIN)"
  if [ -z "${CERT_ARN:-}" ]; then
    CERT_ARN=$(aws acm request-certificate --domain-name "$DOMAIN" \
      --subject-alternative-names "www.$DOMAIN" --validation-method DNS \
      --options CertificateTransparencyLoggingPreference=ENABLED | jq -r .CertificateArn)
    save CERT_ARN "$CERT_ARN"
    sleep 5
  fi
  echo
  echo "Add these CNAME records at Namecheap (Advanced DNS). Host = the part before .$DOMAIN."
  aws acm describe-certificate --certificate-arn "$CERT_ARN" \
    | jq -r '.Certificate.DomainValidationOptions[] | "  \(.ResourceRecord.Name)  CNAME  \(.ResourceRecord.Value)"' | sort -u
  echo
  echo "Then run:  ./bootstrap.sh status   until Status=ISSUED, then  ./bootstrap.sh site"
}

phase_site() {
  [ -n "${CERT_ARN:-}" ] || { echo "run 'cert' first"; exit 1; }
  st=$(aws acm describe-certificate --certificate-arn "$CERT_ARN" | jq -r .Certificate.Status)
  [ "$st" = ISSUED ] || { echo "certificate is $st, not ISSUED yet"; exit 1; }

  echo "== CloudFront function (index.html rewrite for directory URLs)"
  if [ -z "${FUNC_ARN:-}" ]; then
    cat > /tmp/cf-fn.js <<'EOF'
function handler(event) {
  var r = event.request; var u = r.uri;
  if (u.endsWith('/')) { r.uri = u + 'index.html'; }
  else if (!u.includes('.')) { r.uri = u + '/index.html'; }
  return r;
}
EOF
    FUNC_ARN=$(aws cloudfront create-function --name "${BUCKET}-index-rewrite" \
      --function-config Comment="dir index rewrite",Runtime=cloudfront-js-2.0 \
      --function-code fileb:///tmp/cf-fn.js | jq -r .FunctionSummary.FunctionMetadata.FunctionARN)
    etag=$(aws cloudfront describe-function --name "${BUCKET}-index-rewrite" | jq -r .ETag)
    aws cloudfront publish-function --name "${BUCKET}-index-rewrite" --if-match "$etag" >/dev/null
    save FUNC_ARN "$FUNC_ARN"
  fi

  echo "== Origin access control"
  if [ -z "${OAC_ID:-}" ]; then
    OAC_ID=$(aws cloudfront create-origin-access-control --origin-access-control-config \
      "Name=${BUCKET}-oac,SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3" \
      | jq -r .OriginAccessControl.Id)
    save OAC_ID "$OAC_ID"
  fi

  echo "== CloudFront distribution"
  if [ -z "${DIST_ID:-}" ]; then
    ORIGIN="${BUCKET}.s3.${REGION}.amazonaws.com"
    cat > /tmp/cf-dist.json <<EOF
{
  "CallerReference": "${BUCKET}-$(date +%s)",
  "Comment": "$DOMAIN static site",
  "Enabled": true,
  "HttpVersion": "http2and3",
  "IsIPV6Enabled": true,
  "PriceClass": "$PRICE_CLASS",
  "DefaultRootObject": "index.html",
  "Aliases": {"Quantity": 2, "Items": ["$DOMAIN", "www.$DOMAIN"]},
  "Origins": {"Quantity": 1, "Items": [{
    "Id": "s3", "DomainName": "$ORIGIN", "OriginAccessControlId": "$OAC_ID",
    "S3OriginConfig": {"OriginAccessIdentity": ""}
  }]},
  "DefaultCacheBehavior": {
    "TargetOriginId": "s3",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "AllowedMethods": {"Quantity": 2, "Items": ["GET","HEAD"], "CachedMethods": {"Quantity": 2, "Items": ["GET","HEAD"]}},
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "ResponseHeadersPolicyId": "67f7725c-6f97-4210-82d7-5512b31e9d03",
    "FunctionAssociations": {"Quantity": 1, "Items": [{"EventType": "viewer-request", "FunctionARN": "$FUNC_ARN"}]}
  },
  "CustomErrorResponses": {"Quantity": 2, "Items": [
    {"ErrorCode": 403, "ResponsePagePath": "/404.html", "ResponseCode": "404", "ErrorCachingMinTTL": 60},
    {"ErrorCode": 404, "ResponsePagePath": "/404.html", "ResponseCode": "404", "ErrorCachingMinTTL": 60}
  ]},
  "Logging": {"Enabled": true, "IncludeCookies": false, "Bucket": "${LOG_BUCKET}.s3.amazonaws.com", "Prefix": "cf/"},
  "ViewerCertificate": {"ACMCertificateArn": "$CERT_ARN", "SSLSupportMethod": "sni-only", "MinimumProtocolVersion": "TLSv1.2_2021"}
}
EOF
    out=$(aws cloudfront create-distribution --distribution-config file:///tmp/cf-dist.json)
    DIST_ID=$(echo "$out" | jq -r .Distribution.Id)
    save DIST_ID "$DIST_ID"
    save DIST_DOMAIN "$(echo "$out" | jq -r .Distribution.DomainName)"
  fi
  # Cache policy above = managed CachingOptimized; response headers policy = managed SecurityHeadersPolicy.

  echo "== Bucket policy (CloudFront only)"
  cat > /tmp/bucket-policy.json <<EOF
{"Version":"2012-10-17","Statement":[{"Sid":"AllowCloudFrontOAC","Effect":"Allow",
 "Principal":{"Service":"cloudfront.amazonaws.com"},"Action":"s3:GetObject","Resource":"arn:aws:s3:::${BUCKET}/*",
 "Condition":{"StringEquals":{"AWS:SourceArn":"arn:aws:cloudfront::${ACCOUNT}:distribution/${DIST_ID}"}}}]}
EOF
  aws s3api put-bucket-policy --bucket "$BUCKET" --policy file:///tmp/bucket-policy.json

  echo "== IAM deploy user (scoped to this bucket + this distribution's invalidations)"
  if ! aws iam get-user --user-name "$DEPLOY_USER" >/dev/null 2>&1; then
    aws iam create-user --user-name "$DEPLOY_USER" >/dev/null
  fi
  cat > /tmp/deploy-policy.json <<EOF
{"Version":"2012-10-17","Statement":[
 {"Effect":"Allow","Action":["s3:ListBucket"],"Resource":"arn:aws:s3:::${BUCKET}"},
 {"Effect":"Allow","Action":["s3:PutObject","s3:DeleteObject","s3:GetObject"],"Resource":"arn:aws:s3:::${BUCKET}/*"},
 {"Effect":"Allow","Action":["cloudfront:CreateInvalidation","cloudfront:GetInvalidation"],
  "Resource":"arn:aws:cloudfront::${ACCOUNT}:distribution/${DIST_ID}"}]}
EOF
  aws iam put-user-policy --user-name "$DEPLOY_USER" --policy-name "${BUCKET}-deploy" --policy-document file:///tmp/deploy-policy.json
  if [ -z "${DEPLOY_KEY_MADE:-}" ]; then
    key=$(aws iam create-access-key --user-name "$DEPLOY_USER")
    save DEPLOY_KEY_MADE 1
    echo
    echo "Add this profile to ~/.aws/credentials on the deploying host (shown ONCE):"
    echo "[de-clouding-deploy]"
    echo "aws_access_key_id = $(echo "$key" | jq -r .AccessKey.AccessKeyId)"
    echo "aws_secret_access_key = $(echo "$key" | jq -r .AccessKey.SecretAccessKey)"
    echo
  fi

  if [ -n "$ALARM_EMAIL" ] && [ -z "${ALARM_MADE:-}" ]; then
    echo "== Billing alarm (\$$ALARM_USD/month). NOTE: 'Receive Billing Alerts' must be enabled once in the"
    echo "   Billing console preferences or the EstimatedCharges metric never populates."
    topic=$(aws sns create-topic --name "${BUCKET}-billing" | jq -r .TopicArn)
    aws sns subscribe --topic-arn "$topic" --protocol email --notification-endpoint "$ALARM_EMAIL" >/dev/null
    aws cloudwatch put-metric-alarm --alarm-name "${BUCKET}-billing-${ALARM_USD}usd" \
      --namespace AWS/Billing --metric-name EstimatedCharges --dimensions Name=Currency,Value=USD \
      --statistic Maximum --period 21600 --evaluation-periods 1 --threshold "$ALARM_USD" \
      --comparison-operator GreaterThanThreshold --alarm-actions "$topic"
    save ALARM_MADE 1
    echo "   Confirm the SNS subscription email."
  fi

  cat > deploy.env <<EOF
BUCKET=$BUCKET
DIST_ID=$DIST_ID
AWS_PROFILE=de-clouding-deploy
EOF
  echo
  echo "== DNS at Namecheap (Advanced DNS):"
  echo "  @    ALIAS  $DIST_DOMAIN"
  echo "  www  CNAME  $DIST_DOMAIN"
  echo "CloudFront takes ~5-10 min to deploy. Then run ../deploy.sh"
}

phase_status() {
  [ -n "${CERT_ARN:-}" ] && echo "cert: $(aws acm describe-certificate --certificate-arn "$CERT_ARN" | jq -r .Certificate.Status)"
  [ -n "${DIST_ID:-}" ] && echo "dist: $DIST_ID $(aws cloudfront get-distribution --id "$DIST_ID" | jq -r '.Distribution | "\(.Status) \(.DomainName)"')"
  cat "$STATE"
}

case "${1:-}" in
  cert) phase_cert ;;
  site) phase_site ;;
  status) phase_status ;;
  *) sed -n '2,10p' "$0"; exit 1 ;;
esac
