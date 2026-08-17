#!/bin/sh

echo "Applying database migrations/schema..."
npx prisma db push --accept-data-loss

echo "Seeding database..."
npx prisma db seed

echo "Starting backend server..."
npm start
