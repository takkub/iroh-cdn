#!/bin/sh
set -e

echo "[entrypoint] Starting API container..."

# Docker healthcheck ensures DB is ready, but add small wait for safety
echo "[entrypoint] Waiting for database to be fully ready..."
sleep 5

echo "[entrypoint] Generating Prisma Client..."
npx prisma generate

# Apply schema to database (creates tables if they don't exist)
echo "[entrypoint] Syncing database schema..."
npx prisma db push --accept-data-loss --skip-generate

echo "[entrypoint] Database setup complete!"

# Start iroh node in background
echo "[entrypoint] Starting iroh node..."
iroh start &
IROH_PID=$!

# Wait for iroh to initialize
sleep 3

echo "[entrypoint] Iroh node started (PID: $IROH_PID)"

# Start NestJS (use exec to replace shell process)
echo "[entrypoint] Starting NestJS API..."
exec node dist/main.js
