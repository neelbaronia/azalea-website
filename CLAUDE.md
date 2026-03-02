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
