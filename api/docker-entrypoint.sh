#!/bin/sh
set -e

# Download iroh binary if missing
if [ ! -x "/usr/local/bin/iroh" ]; then
  echo "[entrypoint] iroh not found, attempting to download latest release..."
  # NOTE: Adjust OS/ARCH as needed; this is a best-effort example.
  # You may pin a version instead of 'latest' for reproducibility.
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64|amd64) DL_ARCH="x86_64" ;;
    aarch64|arm64) DL_ARCH="aarch64" ;;
    *) DL_ARCH="x86_64" ;;
  esac
  # Placeholder URL — replace with the official asset URL naming if it changes.
  # This is here as documentation; network may be blocked in your infra.
  URL="https://github.com/n0-computer/iroh/releases/latest/download/iroh-${DL_ARCH}-unknown-linux-gnu"
  echo "[entrypoint] Downloading: $URL"
  if curl -L "$URL" -o /usr/local/bin/iroh ; then
    chmod +x /usr/local/bin/iroh
    echo "[entrypoint] iroh installed."
  else
    echo "[entrypoint] WARN: Failed to download iroh. Please COPY a trusted binary into the image."
  fi
fi

# Prisma migrate
npx prisma migrate deploy

# Start iroh node in background
echo "[entrypoint] Starting iroh node..."
iroh start &
IROH_PID=$!

# Wait a bit for iroh to be ready
sleep 3

echo "[entrypoint] iroh node started (PID: $IROH_PID)"

# Start NestJS
echo "[entrypoint] Starting NestJS API..."
node dist/main.js 2>&1
