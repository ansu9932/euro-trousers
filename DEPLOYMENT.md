# EURO TROUSERS Customs System — Deployment Runbook

## 1. Required accounts and information

Prepare a GitHub repository, an Oracle Cloud account with an Ampere A1 Ubuntu 22.04 VM, a Cloudflare account and domain, and an SMTP mailbox. Optional connections are OCI Object Storage for off-server backups and Meta WhatsApp Cloud API.

Obtain the client logo, SAIF Zone address/letterhead, existing Excel registers, report formats, staff names/emails, and the final approval threshold before UAT.

## 2. Push the repository to GitHub

In v0, connect a GitHub repository from **Settings → Git**, then create or select a branch. v0 pushes the project files to that branch; use **Create pull request** in the same Git settings when ready to merge.

## 3. Create the Oracle Cloud backend host

Create an Ampere A1 VM in UAE East when capacity is available, otherwise Mumbai. Use Ubuntu 22.04, reserve a public IP, add ingress rules for TCP 22, 80, and 443, and point `api.yourdomain.com` to the public IP in Cloudflare DNS.

Connect to the VM using SSH, install Docker Engine and the Compose plugin, clone the GitHub repository, then copy `.env.example` to `.env`. Replace every placeholder secret. Use independent random values of at least 32 characters for JWT secrets and strong unique PostgreSQL and MinIO passwords. Set `CUSTOM_DOMAIN=api.yourdomain.com` and `CORS_ORIGIN=https://customs.yourdomain.com`.

Start the stack with `docker compose up -d --build`. Apply the committed schema with `docker compose exec api pnpm db:migrate`, then seed roles, permissions, company settings, Incoterms, SAIF Customs, and the initial administrator with `docker compose exec api pnpm db:seed`. Immediately sign in and replace the bootstrap password.

Verify `https://api.yourdomain.com/health` and Swagger at `https://api.yourdomain.com/api/docs`. Caddy obtains and renews TLS automatically after DNS resolves and ports 80/443 are reachable.

## 4. Connect MinIO document storage

MinIO is private inside the Docker network; the API connects with `MINIO_ENDPOINT=minio` and creates `MINIO_BUCKET`. Keep port 9000 closed publicly. Documents are returned through short-lived signed links only.

Back up both PostgreSQL and the `minio_data` Docker volume nightly. Configure OCI CLI credentials on the VM, upload encrypted backup archives to a private OCI Object Storage bucket, retain daily/monthly copies according to the five-year policy, and test restore quarterly.

## 5. Configure email and WhatsApp

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in `.env`, then restart the API with `docker compose up -d api`. Configure per-role notification events in Administration. Leave WhatsApp disabled until Meta provides a Business phone ID and permanent token; then set `WHATSAPP_PHONE_ID` and `WHATSAPP_TOKEN` and enable that channel.

## 6. Deploy the frontend to Cloudflare

Create a Cloudflare Worker/Pages project connected to the same GitHub repository with root directory `frontend`. Add `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api` as a production environment variable. The build command is `pnpm install --frozen-lockfile && pnpm exec opennextjs-cloudflare build`; deployment uses `pnpm exec wrangler deploy`.

Attach `customs.yourdomain.com` as the frontend custom domain. Confirm the API `.env` CORS origin exactly matches this HTTPS URL, then restart the API. Never expose database, MinIO, JWT, SMTP, or WhatsApp secrets to the frontend.

## 7. Migrate and verify client data

Import HS codes, items, customers/suppliers, opening customs stock, opening warehouse stock, historical declarations, refunds, and guarantees in that order. Review each row-level error log and have the responsible department approve each imported total.

Run a controlled UAT lifecycle: create import → L1 → L2 → L3 when duty/VAT applies → L4 above threshold → record SAIF reference → inspection/hold if needed → clearance → generate release/exit/gate documents → close → verify customs stock → reconcile warehouse stock. Repeat for export, all transfer types, rejection, amendment, cancellation, refund, expired guarantee, container detention, and document expiry.

## 8. Go-live controls

Create named users for all staff and assign one of the ten roles; never share administrator credentials. Confirm audit entries, Arabic RTL, generated bilingual PDFs, QR verification, Excel/PDF reports, Tally XML, notification delivery, backups, restore, TLS, account lockout, and session expiry.

Run parallel operations with the existing process for an agreed UAT period. After client sign-off, freeze legacy edits, import final opening balances, take a pre-go-live backup, switch the production DNS, and monitor API logs, disk usage, notification failures, expiring guarantees/documents, and nightly backups daily for the first week.
