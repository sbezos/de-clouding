#!/usr/bin/env bash
# deploy.sh — build with Hugo, sync to S3, invalidate CloudFront. Uses the scoped deploy profile only.
set -euo pipefail
cd "$(dirname "$0")"
. aws/deploy.env
export AWS_PROFILE

hugo --source site --minify --cleanDestinationDir --quiet

# Long cache for fingerprint-less assets is risky; keep assets at 1 day, HTML at 5 min, and invalidate anyway.
aws s3 sync site/public/ "s3://$BUCKET/" --delete --no-progress \
  --exclude '*.html' --exclude '*.xml' --exclude '*.txt' \
  --cache-control 'public, max-age=86400'
aws s3 sync site/public/ "s3://$BUCKET/" --delete --no-progress \
  --exclude '*' --include '*.html' --include '*.xml' --include '*.txt' \
  --cache-control 'public, max-age=300'

inv=$(aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths '/*' --query 'Invalidation.Id' --output text)
echo "deployed; invalidation $inv"
