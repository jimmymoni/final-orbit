#!/bin/bash

# Shopify Community Scraper - Shell Wrapper for Cron
# This script loads environment variables and runs the Node.js scraper

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR" || exit 1

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Check if required env vars are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "Error: Missing environment variables"
  echo "Make sure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  exit 1
fi

# Log file location
LOG_FILE="$PROJECT_DIR/logs/scraper.log"
mkdir -p "$(dirname "$LOG_FILE")"

# Run the scraper with logging
echo "========================================" >> "$LOG_FILE"
echo "Scrape started at: $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

node scripts/scrape.js >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

echo "Scrape finished at: $(date)" >> "$LOG_FILE"
echo "Exit code: $EXIT_CODE" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

exit $EXIT_CODE
