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

## Backend / CORS
Backend lives in a separate repo: `D:\military` (Spring Boot on Lambda, API Gateway HTTP API `military-manager`, SAM stack).

Fixed 2026-07-17: all protected endpoints returned 401 on CORS preflight `OPTIONS` because `WebSecurityConfig`'s `anyRequest().authenticated()` blocked preflight before it reached the controllers' `@CrossOrigin`. Fix: permit `HttpMethod.OPTIONS` on `/**` in the security filter chain (`src/main/java/com/military/security/WebSecurityConfig.java`).

Backend build/deploy (code-only update, no CloudFormation changes):
```powershell
# Must use JDK 17 — Lombok annotation processing fails on newer JDKs (e.g. 25) installed as default
cd D:\military
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17.0.18"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
mvn clean package -DskipTests
aws lambda update-function-code --function-name military-manager-api --zip-file fileb://target/military-manager-0.0.1-SNAPSHOT-aws.jar
```
For full infra changes (new resources, params), use `deploy_lambda.ps1` / `sam deploy` per `D:\military\DEPLOY_LAMBDA.md` instead — that needs `JwtSecret` and `S3Bucket` values.
