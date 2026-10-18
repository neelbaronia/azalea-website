# Azalea Website

## Project Structure
- `website/` — Next.js app (run commands from this directory)
- Sibling repo: `~/Code/cc-audiobook-player/` — iOS audiobook player + R2 management scripts

## Rebuilding the Library Manifest (library.json)

When new audiobooks are uploaded to Cloudflare R2 but don't appear on the site, rebuild the library manifest:

```bash
cd ~/Code/cc-audiobook-player
python3 r2-library-manager.py --scan
```

This script:
1. Scans the `azalea-audiobooks` R2 bucket for all `metadata.json` files
2. Extracts book info (id, title, author, cover, duration) from each
3. Writes an updated `library.json` locally and uploads it to R2

**Dependencies:** `boto3`, `python-dotenv` (install with `pip3 install --break-system-packages boto3 python-dotenv`)
**Config:** Uses `.env` file in `cc-audiobook-player/` with R2 credentials (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`)

### Preparing a new audiobook for R2

```bash
cd ~/Code/cc-audiobook-player
python3 r2-prepper.py <source_dir> <r2_url> --output r2-final [--author "Name"] [--title "Title"] [--cover "path"]
```

This organizes audio files, generates `metadata.json`, and prepares the book directory for upload to R2.

## Development

```bash
cd website
nvm use 20   # Requires Node >= 20.9.0
npm run dev
```

Site runs at http://localhost:3000

## Production deployments

- Vercel project: `azalea-website` (`prj_YXQzVw9Zb3QeICNRJoTg2RQg5GXa`).
- Team: `neel-baronias-projects` (`team_PDiwQYR3Ixic1anRPHyj7suF`).
- Root directory: `website`.
- Production branch: `main`.
- Production domains: `azalea-labs.com`, `www.azalea-labs.com`, and
  `publishing.azalea-labs.com`.

### Normal release

Commit the intended changes and push to `main`. Let Vercel's Git integration
build and release production. Do not use `vercel alias set`, or a manual
`vercel --prod` followed by alias commands, to release these custom domains.

After the deployment reaches `READY`, verify that its Git commit matches the
push and that **all three custom domains** point to that deployment:

```bash
vercel list azalea-website -m githubCommitSha=<full-commit-sha> --format=json
vercel alias ls --limit 100 | rg 'azalea-labs\.com'
```

Run Vercel commands in a checkout linked to the project above; verify the
resolved project with `vercel project inspect --non-interactive`. A GitHub
success status or movement of the two `*.vercel.app` aliases alone does not
confirm that the public site has updated. Check a changed public route too.
The Vercel `aliases-assigned` activity events can also confirm which domains
were assigned.

### Recovery and intentional pinning

If the custom domains do not follow a successful Git deployment, inspect the
project dashboard for a rollback or paused auto-assignment banner. Recover
through the dashboard's promotion flow, or promote the verified production
deployment explicitly:

```bash
vercel promote https://<verified-production-deployment>.vercel.app --yes
```

Use promotion or Instant Rollback only when intentionally selecting a
production build or recovering a stalled release. Recheck all three domains
afterward and verify automatic movement on the next push to `main`.

On October 17, 2026, Git builds were succeeding while custom domains remained
on older deployments. A promotion of commit `aaf9be8` restored all three domain
assignments. Settings appeared correct (`autoAssignCustomDomains = true`,
production branch `main`, and no recorded rollback target); manual domain
pinning was suspected, not confirmed as the root cause. Avoid manual alias
updates and verify the public domain assignments after each release.
