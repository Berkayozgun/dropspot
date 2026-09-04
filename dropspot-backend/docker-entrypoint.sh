#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
node dist/prisma/seed.js

echo "Starting backend server..."
exec node dist/src/index.js
