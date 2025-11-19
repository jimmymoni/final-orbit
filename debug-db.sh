#!/bin/bash

echo "=== Checking Inquiries ==="
curl -s "https://hojodntyhijvsjrfplxz.supabase.co/rest/v1/inquiries?select=*" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvam9kbnR5aGlqdnNqcmZwbHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Njk2MzgsImV4cCI6MjA3OTE0NTYzOH0.DjicKs5w0QZefAwBSaZxN_9TGE_TQ8dIinXJXSNoB4A" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvam9kbnR5aGlqdnNqcmZwbHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Njk2MzgsImV4cCI6MjA3OTE0NTYzOH0.DjicKs5w0QZefAwBSaZxN_9TGE_TQ8dIinXJXSNoB4A" | jq .

echo ""
echo "=== Checking Users ==="
curl -s "https://hojodntyhijvsjrfplxz.supabase.co/rest/v1/users?select=*" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvam9kbnR5aGlqdnNqcmZwbHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Njk2MzgsImV4cCI6MjA3OTE0NTYzOH0.DjicKs5w0QZefAwBSaZxN_9TGE_TQ8dIinXJXSNoB4A" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvam9kbnR5aGlqdnNqcmZwbHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Njk2MzgsImV4cCI6MjA3OTE0NTYzOH0.DjicKs5w0QZefAwBSaZxN_9TGE_TQ8dIinXJXSNoB4A" | jq .
