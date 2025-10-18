# Deployment Guide (SST + AWS + Cloudflare + MongoDB Atlas)

This document outlines the steps to deploy Typi with [SST](https://sst.dev/) on AWS, use Cloudflare to manage the public domain, and connect to a managed MongoDB Atlas cluster. Adjust names and regions to match your AWS/Cloudflare setup.

## 1. Prerequisites

- AWS account and IAM user/role with AdministratorAccess (or equivalent permissions for CloudFront, Lambda, ACM, Route53/Cloudflare integration, and Secrets Manager).
- Cloudflare account with the target zone already added.
- MongoDB Atlas project and cluster (M0+). Create a database user and allow network access from AWS (preferred: VPC peering or set IP access list to `0.0.0.0/0` temporarily while testing).
- `node >= 20`, `npm`, and the `sst` CLI (`npm install -g sst@latest` optional).
- This repository checked out locally.

## 2. Install Dependencies

```bash
npm install
```

> The project now depends on `astro-sst`. If your environment blocks outbound network access (for example, in the Codex IDE), run `npm install` locally instead.

## 3. Configure Astro for SST

`astro.config.mjs` already exports `adapter: aws()` from `astro-sst`. During a build SST will compile a Lambda-ready bundle and provision CloudFront.

## 4. Create `sst.config.ts`

Add a file at the repo root:

```ts
/// <reference path="./.sst/platform/config.d.ts" />
import * as sst from "sst";

export default $config({
  app(_input) {
    return {
      name: "typi",
      home: "aws",
      providers: {
        aws: { region: "us-east-1" },
        cloudflare: "5.37.1"
      }
    };
  },
  async run() {
    const mongoUri = new sst.Secret("MongoDbUri");
    const authSecret = new sst.Secret("AuthSecret");
    const gaMeasurementId = new sst.Config.Parameter("PublicGaMeasurementId", {
      value: "" // override per stage with `sst secret`/`sst config`
    });
    const siteDomain = new sst.Config.Parameter("SiteDomain", {
      value: "app.example.com"
    });

    const site = new sst.aws.Astro("Web", {
      path: ".",
      domain: {
        name: siteDomain.value,
        dns: sst.cloudflare.dns()
      },
      environment: {
        PUBLIC_APP_URL: `https://${siteDomain.value}`,
        PUBLIC_GA_MEASUREMENT_ID: gaMeasurementId.value
      },
      link: [mongoUri, authSecret]
    });

    return {
      url: site.url
    };
  }
});
```

### Notes

- Replace `app.example.com` with your production hostname. For previews, use a convention (e.g., `${$app.stage}.app.example.com`).
- `sst.Secret` and `sst.Config.Parameter` expose strongly-typed handles. They do **not** include values until you set them per stage.

## 5. Set Secrets and Parameters

```bash
# MongoDB connection string from Atlas
sst secret set MongoDbUri "mongodb+srv://<user>:<pass>@cluster0.fao.mongodb.net/typi"

# Better Auth secret (matches AUTH_SECRET expectation)
sst secret set AuthSecret "generate-a-long-random-string"

# Optional GA4 ID for analytics
sst config set PublicGaMeasurementId "G-XXXXXXX"

# Target domain (if you prefer per stage override)
sst config set SiteDomain "app.example.com"
```

> Secrets are encrypted and stored per-stage in SST. Repeat with `--stage production` etc.

## 6. Configure Cloudflare Credentials

Cloudflare DNS management requires an API token with `Zone:DNS Edit` and `Zone:Zone Read` for the target zone. Export before running SST commands:

```bash
export CLOUDFLARE_API_TOKEN=cf_api_token
export CLOUDFLARE_DEFAULT_ACCOUNT_ID=cf_account_id
```

Identify your zone ID (`cf_zone_id`) from the Cloudflare dashboard; if you want to restrict to a single zone:

```ts
dns: sst.cloudflare.dns({ zone: "cf_zone_id" })
```

## 7. MongoDB Atlas Networking

1. In Atlas, open `Network Access` → allow traffic from AWS. Best practice is [VPC Peering](https://www.mongodb.com/docs/atlas/security-vpc-peering/); otherwise add the AWS NAT gateway IP ranges created by SST (visible after first deploy) or temporarily `0.0.0.0/0` for testing.
2. Make sure the user connecting through `MongoDbUri` has read/write roles for the `typi` database.

## 8. Deploy

```bash
# Start a live dev environment
sst dev astro dev

# When ready for production
sst deploy --stage production
```

Deployment creates:

- Lambda function bundle for Astro SSR (`sst.aws.Astro`).
- CloudFront distribution backed by regional Lambda + S3 asset bucket.
- ACM certificate in us-east-1 validated through Cloudflare DNS.
- Environment variables passed to Astro build & runtime.

SST prints the distribution HTTPS URL (and custom domain once DNS validates).

## 9. Post-Deployment Checklist

- Update `.env` locally to mirror `sst secret` values for consistent dev behaviour.
- In Cloudflare, ensure orange-cloud proxy is **off** for the CNAME pointing to CloudFront until ACM validates. Once certificate is issued you can enable proxy if desired.
- In MongoDB Atlas, tighten network access to the AWS NAT IPs or the VPC peering connection.
- Configure Better Auth OAuth callbacks to use the deployed URL.
- Add monitoring/alerts (CloudWatch alarms, Cloudflare health checks) as needed.

## 10. Teardown

```bash
sst remove --stage production
```

This deletes the CloudFront distribution, Lambda functions, and related IAM roles. Cloudflare DNS records created by SST are also removed.

---

For advanced setups (preview environments, multiple domains, infrastructure as code checks), refer to the [SST docs](https://sst.dev/docs) referenced via Context7.
