# Automated Scraper - Cron Setup Guide

This guide will help you set up hourly automated scraping from Shopify Community.

## Prerequisites

Before setting up the cron job, complete these steps:

### 1. Create Database Function (Required)

The scraper needs a special database function to bypass Row-Level Security policies.

**Steps:**
1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `SCRAPER_RPC_FUNCTION.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see: "Success. No rows returned"

**Verify it worked:**
```sql
SELECT scraper_import_inquiry(
  'Test Inquiry',
  'This is a test',
  'Apps',
  'https://test.com/unique-' || now()::text,
  240,
  'normal'
);
```

You should see a JSON response like:
```json
{"success": true, "duplicate": false, "inquiry_id": "...", "assigned_to": "..."}
```

### 2. Test the Scraper Manually

Before automating, test the scraper works:

```bash
cd "/Users/finalapps/Documents/fnalapps orbit/finalapps-orbit"
npm run scrape
```

You should see output like:
```
🚀 Starting Shopify Community scrape...
📥 Fetching category 10...
   Found 15 topics
   ✅ Imported: Topic title...
   ⏭️ Skipped (duplicate): Another topic...
📊 Scrape Summary:
   Total topics found: 15
   ✅ Successfully imported: 5
   ⏭️ Skipped (duplicates): 10
   ❌ Failed: 0
✨ Scrape complete!
```

---

## Option 1: Cron Job (macOS/Linux) - RECOMMENDED

### Step 1: Create Log Directory

```bash
cd "/Users/finalapps/Documents/fnalapps orbit/finalapps-orbit"
mkdir -p logs
```

### Step 2: Test the Shell Script

```bash
./scripts/scrape.sh
```

Check the log file:
```bash
tail -f logs/scraper.log
```

### Step 3: Edit Crontab

```bash
crontab -e
```

This opens your cron configuration in your default editor (usually vim or nano).

### Step 4: Add Cron Entry

**For hourly scraping (at minute 0 of every hour):**

```bash
# Shopify Community Scraper - Runs every hour
0 * * * * /Users/finalapps/Documents/fnalapps\ orbit/finalapps-orbit/scripts/scrape.sh
```

**Alternative schedules:**

```bash
# Every 30 minutes
*/30 * * * * /Users/finalapps/Documents/fnalapps\ orbit/finalapps-orbit/scripts/scrape.sh

# Every 2 hours
0 */2 * * * /Users/finalapps/Documents/fnalapps\ orbit/finalapps-orbit/scripts/scrape.sh

# Every day at 9 AM
0 9 * * * /Users/finalapps/Documents/fnalapps\ orbit/finalapps-orbit/scripts/scrape.sh

# Every weekday at 9 AM and 5 PM
0 9,17 * * 1-5 /Users/finalapps/Documents/fnalapps\ orbit/finalapps-orbit/scripts/scrape.sh
```

**Cron Format Reference:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

### Step 5: Save and Exit

- **Vim**: Press `Esc`, type `:wq`, press `Enter`
- **Nano**: Press `Ctrl+X`, press `Y`, press `Enter`

### Step 6: Verify Cron is Set

```bash
crontab -l
```

You should see your cron entry listed.

### Step 7: Monitor the Logs

```bash
# Watch logs in real-time
tail -f "/Users/finalapps/Documents/fnalapps orbit/finalapps-orbit/logs/scraper.log"

# View last 50 lines
tail -n 50 "/Users/finalapps/Documents/fnalapps orbit/finalapps-orbit/logs/scraper.log"

# Search for errors
grep -i error "/Users/finalapps/Documents/fnalapps orbit/finalapps-orbit/logs/scraper.log"
```

---

## Option 2: LaunchAgent (macOS) - More Reliable

LaunchAgent is more reliable than cron on macOS and survives reboots.

### Step 1: Create LaunchAgent plist

```bash
nano ~/Library/LaunchAgents/com.finalapps.scraper.plist
```

### Step 2: Paste this content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.finalapps.scraper</string>

    <key>ProgramArguments</key>
    <array>
        <string>/Users/finalapps/Documents/fnalapps orbit/finalapps-orbit/scripts/scrape.sh</string>
    </array>

    <key>StartInterval</key>
    <integer>3600</integer> <!-- 3600 seconds = 1 hour -->

    <key>StandardOutPath</key>
    <string>/Users/finalapps/Documents/fnalapps orbit/finalapps-orbit/logs/scraper.log</string>

    <key>StandardErrorPath</key>
    <string>/Users/finalapps/Documents/fnalapps orbit/finalapps-orbit/logs/scraper-error.log</string>

    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

**Note:** Change the interval:
- 1 hour: `3600`
- 30 minutes: `1800`
- 2 hours: `7200`

### Step 3: Load the LaunchAgent

```bash
launchctl load ~/Library/LaunchAgents/com.finalapps.scraper.plist
```

### Step 4: Start it immediately

```bash
launchctl start com.finalapps.scraper
```

### Step 5: Verify it's running

```bash
launchctl list | grep finalapps
```

You should see `com.finalapps.scraper` in the list.

### Managing LaunchAgent

```bash
# Stop the scraper
launchctl stop com.finalapps.scraper

# Unload (disable) the scraper
launchctl unload ~/Library/LaunchAgents/com.finalapps.scraper.plist

# Reload after editing plist
launchctl unload ~/Library/LaunchAgents/com.finalapps.scraper.plist
launchctl load ~/Library/LaunchAgents/com.finalapps.scraper.plist
```

---

## Option 3: PM2 Process Manager - Advanced

PM2 is a production process manager for Node.js applications.

### Step 1: Install PM2 globally

```bash
npm install -g pm2
```

### Step 2: Create PM2 ecosystem file

```bash
cd "/Users/finalapps/Documents/fnalapps orbit/finalapps-orbit"
nano ecosystem.config.js
```

### Step 3: Add this content:

```javascript
module.exports = {
  apps: [{
    name: 'shopify-scraper',
    script: './scripts/scrape.js',
    cron_restart: '0 * * * *',  // Every hour at minute 0
    autorestart: false,  // Don't restart on completion
    watch: false,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### Step 4: Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save  # Save the process list
pm2 startup  # Enable PM2 to start on system boot
```

### Step 5: Monitor

```bash
# List processes
pm2 list

# View logs
pm2 logs shopify-scraper

# Monitor in real-time
pm2 monit
```

---

## Troubleshooting

### Cron job not running

1. **Check cron is enabled:**
   ```bash
   sudo launchctl list | grep cron
   ```

2. **Check system logs:**
   ```bash
   grep CRON /var/log/system.log
   ```

3. **Verify script permissions:**
   ```bash
   ls -la scripts/scrape.sh
   # Should show: -rwxr-xr-x (executable)
   ```

4. **Test script manually:**
   ```bash
   ./scripts/scrape.sh
   ```

### Environment variables not loading

1. **Check .env file exists:**
   ```bash
   ls -la .env
   ```

2. **Verify .env has correct values:**
   ```bash
   cat .env
   ```

3. **Test with explicit env vars:**
   ```bash
   VITE_SUPABASE_URL=your_url VITE_SUPABASE_ANON_KEY=your_key npm run scrape
   ```

### Database function not found

**Error:** `function scraper_import_inquiry does not exist`

**Solution:** Run the SQL from `SCRAPER_RPC_FUNCTION.sql` in Supabase SQL Editor

### No topics being imported

1. **Check category IDs are correct:**
   - Visit https://community.shopify.com
   - Navigate to a category
   - Check the URL: `/c/category-name/{id}`
   - Update `CATEGORIES` object in `scripts/scrape.js`

2. **Verify topics exist in category:**
   ```bash
   curl https://community.shopify.com/c/10.json | jq '.topic_list.topics | length'
   ```

### All topics showing as duplicates

This is normal! It means the scraper has already imported those topics.
- Duplicates are skipped automatically
- Only new topics since last scrape are imported

---

## Monitoring & Maintenance

### Check Scraper Status

```bash
# View recent logs
tail -n 100 logs/scraper.log

# Check last scrape time
ls -lt logs/scraper.log

# Count successful imports today
grep "✅ Successfully imported" logs/scraper.log | grep "$(date +%Y-%m-%d)" | wc -l

# View all errors
grep "❌" logs/scraper.log
```

### Log Rotation

To prevent log files from growing too large:

```bash
# Create log rotation config
sudo nano /etc/newsyslog.d/shopify-scraper.conf
```

Add:
```
# logfilename          [owner:group]    mode count size when  flags [/pid_file] [sig_num]
/Users/finalapps/Documents/fnalapps orbit/finalapps-orbit/logs/*.log    644  7    10240  *     J
```

### Alerts on Failures

Add to `scripts/scrape.sh` before the node command:

```bash
# Send email on error (requires mailutils)
if [ $EXIT_CODE -ne 0 ]; then
  echo "Scraper failed at $(date)" | mail -s "Scraper Alert" your@email.com
fi

# Or Slack webhook
if [ $EXIT_CODE -ne 0 ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"Scraper failed!"}' \
    YOUR_SLACK_WEBHOOK_URL
fi
```

---

## Best Practices

1. **Start with hourly scraping** and adjust based on volume
2. **Monitor logs daily** for the first week
3. **Check database growth** to ensure no runaway imports
4. **Rotate logs** to prevent disk space issues
5. **Set up alerts** for scraper failures
6. **Update category IDs** if Shopify changes their structure
7. **Test after Supabase updates** to ensure compatibility

---

## Disabling the Scraper

### Cron
```bash
crontab -e
# Comment out the line by adding # at the beginning
# 0 * * * * /path/to/scrape.sh
```

### LaunchAgent
```bash
launchctl unload ~/Library/LaunchAgents/com.finalapps.scraper.plist
```

### PM2
```bash
pm2 stop shopify-scraper
pm2 delete shopify-scraper
```

---

## Next Steps

After setup is complete:

1. ✅ Verify cron is running by checking logs after the next hour
2. ✅ Monitor the Admin Panel → Scraper tab for stats
3. ✅ Check Inquiry Dashboard to see imported topics
4. ✅ Set up email/Slack notifications for high-priority inquiries
5. ✅ Adjust scraping frequency based on team bandwidth

---

**Need Help?**
- Check `SCRAPER_GUIDE.md` for detailed scraper documentation
- Check `logs/scraper.log` for execution logs
- Check Supabase logs for database errors

---

**Last Updated:** November 2024
**Version:** 1.0.0
