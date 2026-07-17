# Deployment

## Platform: AWS S3 (static website hosting)

## Bucket: `military-manager-fe` (ap-southeast-2)

## URL: http://military-manager-fe.s3-website-ap-southeast-2.amazonaws.com

## Build Command
```bash
npm run build
```
Outputs a static export to `./out` (see `next.config.mjs`: `output: "export"`, `trailingSlash: true`).

## Deploy Command
```bash
aws s3 sync ./out s3://military-manager-fe --delete
```

## Bucket Configuration (one-time, already applied)
- Static website hosting enabled: index document `index.html`, error document `404.html`
- Block Public Access: disabled (all 4 settings off)
- Bucket policy: public `s3:GetObject` on `arn:aws:s3:::military-manager-fe/*`

## Environment Variables
- `NEXT_PUBLIC_BASE_API` — backend API base URL, read at build time from `.env.local` (not committed). Currently: `https://xgour62062.execute-api.ap-southeast-2.amazonaws.com`

## Custom Domain / HTTPS
Not configured. The S3 website endpoint is HTTP-only. To add HTTPS/custom domain, put a CloudFront distribution (with Origin Access Control) in front of the bucket and re-enable Block Public Access on the bucket (CloudFront would fetch privately via OAC instead of the public bucket policy).

## Rollback
Previous versions are not retained (`--delete` removes stale files on each sync and bucket versioning is off). To roll back, rebuild from the desired git commit and re-run the deploy command.
