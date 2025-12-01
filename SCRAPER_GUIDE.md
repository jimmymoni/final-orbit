# Shopify Community Scraper Guide

## Overview

The Shopify Community Scraper automatically imports new topics from community.shopify.com into FinalApps Orbit as trackable inquiries.

## How It Works

### Data Source
- **Platform**: Discourse (community.shopify.com)
- **API**: Public JSON endpoints (no authentication required)
- **Categories**: Shopify Apps (#10), Apps & Themes (#5)

### Process Flow

```
1. Fetch latest topics from Discourse API
   ↓
2. Filter for app-related categories
   ↓
3. Transform to inquiry format
   - Auto-categorize based on keywords
   - Determine priority based on engagement
   - Generate database-ready record
   ↓
4. Check for duplicates (by URL)
   ↓
5. Insert new inquiries into database
   ↓
6. Database trigger auto-assigns to team member
   ↓
7. Database trigger sets deadline
```

## Using the Scraper

### Via Admin Panel (Recommended)

1. **Navigate to Admin Panel**
   - Login as admin user
   - Go to `/admin`
   - Click "Scraper" tab

2. **View Stats**
   - Total inquiries in database
   - Inquiries from last 24 hours
   - Last scrape timestamp

3. **Run Scraper**
   - Click "Scrape New Topics" button
   - Wait for completion (usually 5-15 seconds)
   - View results (success/failed counts)

4. **Review Results**
   - Success count: New inquiries imported
   - Failed count: Errors encountered
   - Error details: Click to expand if any failures

### Via Code

```javascript
import { scraperModel } from '@/models';

// Scrape and import all new topics
const result = await scraperModel.scrapeAndImport({
  limit: 30,  // Number of topics to fetch
});

// Scrape only topics since last import
const result = await scraperModel.scrapeNewTopics();

// Get scraping statistics
const stats = await scraperModel.getScrapingStats();
```

## API Endpoints Used

### Discourse REST API

```bash
# Latest topics (all categories)
GET https://community.shopify.com/latest.json

# Specific category
GET https://community.shopify.com/c/{category_id}.json
# Example: /c/10.json (Shopify Apps category)

# Single topic details
GET https://community.shopify.com/t/{topic_id}.json

# Search
GET https://community.shopify.com/search.json?q={query}
```

### Response Structure

```json
{
  "topic_list": {
    "topics": [
      {
        "id": 123456,
        "title": "Looking for shipping app",
        "slug": "looking-for-shipping-app",
        "category_id": 10,
        "views": 45,
        "posts_count": 3,
        "like_count": 2,
        "created_at": "2024-11-23T12:00:00Z",
        "excerpt": "Need help finding..."
      }
    ]
  }
}
```

## Data Transformation

### Category Mapping

Keywords in title → Category:
- `app`, `plugin` → Apps
- `theme`, `design` → Themes
- `shipping`, `delivery` → Shipping
- `payment`, `checkout` → Payments
- `product`, `inventory` → Products
- `order`, `fulfillment` → Orders
- `marketing`, `seo` → Marketing
- Default → General

### Priority Assignment

Based on engagement metrics:
- **Urgent**: Contains keywords (`urgent`, `emergency`, `critical`, `down`, `broken`)
- **High**: Views > 1000 OR Replies > 20 OR Likes > 10
- **Normal**: Views > 500 OR Replies > 10 OR Likes > 5
- **Low**: Everything else

### Inquiry Record

```javascript
{
  title: topic.title,
  content: topic.excerpt,
  category: "Apps", // Auto-detected
  link: "https://community.shopify.com/t/slug/123456",
  bandwidth_minutes: 240, // 4 hours default
  priority: "normal", // Auto-calculated
  // assigned_to: Set by database trigger
  // deadline_at: Set by database trigger
}
```

## Configuration

### Customizable Options

In `/src/services/shopifyScraper.js`:

```javascript
// Category IDs
const CATEGORIES = {
  SHOPIFY_APPS: 10,
  APPS_AND_THEMES: 5,
  SHOPIFY_DISCUSSIONS: 3,
  SHOPIFY_PLUS: 31,
};

// Scraping options
await scrapeAndTransform({
  categoryIds: [10, 5],      // Categories to scrape
  limit: 30,                  // Max topics to fetch
  sinceDate: new Date(),      // Only after this date
  defaultPriority: 'normal',  // Fallback priority
  defaultBandwidthMinutes: 240, // Default deadline
});
```

## Features

### Duplicate Detection
- Checks if inquiry with same URL already exists
- Skips duplicates automatically
- Only imports new topics

### Auto-Assignment
- Database trigger assigns to next runner via round-robin
- Based on `assign_next_runner()` function
- Considers active status and last assignment

### Smart Categorization
- Analyzes title keywords
- Maps to predefined categories
- Extensible category mapping

### Priority Calculation
- Engagement-based (views, replies, likes)
- Keyword-based (urgent, emergency)
- Customizable thresholds

## Automation Options

### Option 1: Manual Scraping
- Use Admin Panel button
- Run when needed
- Full control over timing

### Option 2: Scheduled Task (Recommended)
Create a cron job or scheduled task:

```bash
# Every 30 minutes
*/30 * * * * curl -X POST http://localhost:3000/api/scrape
```

### Option 3: n8n Workflow
Already implemented in your setup:
1. n8n scrapes community
2. Transforms data
3. POSTs to Supabase webhook
4. Supabase inserts via API

### Option 4: Supabase Edge Function
Create scheduled Edge Function:

```javascript
// supabase/functions/scraper/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  // Fetch from Discourse API
  // Transform data
  // Insert into inquiries table
  return new Response(JSON.stringify({ success: true }));
});
```

Schedule via cron:
```sql
SELECT cron.schedule(
  'scrape-community',
  '*/30 * * * *', -- Every 30 min
  'SELECT net.http_post(
    url:=''https://your-project.supabase.co/functions/v1/scraper'',
    headers:=''{"Authorization": "Bearer YOUR_ANON_KEY"}''::jsonb
  );'
);
```

## Rate Limiting & Best Practices

### Discourse API Guidelines
- No official rate limit for public endpoints
- Recommended: Poll every 5-10 minutes
- Use `If-Modified-Since` headers to reduce load
- Cache responses locally
- Be respectful of server resources

### Implementation
```javascript
// Add caching
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache(url) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }

  const data = await fetch(url).then(r => r.json());
  cache.set(url, { data, time: Date.now() });
  return data;
}
```

## Monitoring & Debugging

### Check Scraper Stats
```javascript
const stats = await scraperModel.getScrapingStats();
console.log(stats);
// {
//   totalInquiries: 150,
//   todayInquiries: 12,
//   lastScrapeDate: "2024-11-24T12:00:00Z"
// }
```

### View Scrape Results
Check Admin Panel → Scraper tab for:
- Success/failure counts
- Error messages
- Last scrape timestamp

### Database Logs
```sql
-- Recently imported inquiries
SELECT * FROM inquiries
ORDER BY created_at DESC
LIMIT 10;

-- Inquiries from scraper (check link pattern)
SELECT * FROM inquiries
WHERE link LIKE '%community.shopify.com%';
```

## Troubleshooting

### No Topics Imported
- **Check date filter**: May be no new topics since last scrape
- **Check categories**: Verify category IDs are correct
- **Check duplicates**: Topics may already exist
- **Solution**: Run with `limit` increased or without `sinceDate`

### Import Errors
- **Database errors**: Check RLS policies, user permissions
- **Validation errors**: Verify required fields (title, content, link)
- **Network errors**: Check internet connection, API availability

### Duplicate Detection Not Working
- **URL format**: Ensure link format is consistent
- **Database query**: Check `eq('link', inquiry.link)` query

### Categories Wrong
- **Update keyword mapping**: Edit `determineCategoryFromTitle()`
- **Add custom mapping**: Pass `categoryMap` option

## Advanced Usage

### Custom Category Mapping
```javascript
await scrapeAndTransform({
  categoryMap: {
    10: 'FinalApps Apps',    // Custom category names
    5: 'Third Party Apps',
    3: 'General Support',
  }
});
```

### Filter by Keywords
```javascript
import { searchTopics } from '@/services/shopifyScraper';

const topics = await searchTopics('aftership', { limit: 10 });
// Returns topics mentioning "aftership"
```

### Fetch Specific Categories
```javascript
import { fetchFromMultipleCategories } from '@/services/shopifyScraper';

const topics = await fetchFromMultipleCategories([10, 5, 31], {
  limit: 50
});
```

## Security Considerations

### Public API
- ✅ No authentication required
- ✅ Read-only access
- ✅ Safe to use from frontend

### Rate Limiting
- Implement client-side throttling
- Respect server resources
- Cache responses

### Data Privacy
- Topics are public community posts
- No private user data scraped
- Follow Shopify Community ToS

## Future Enhancements

1. **Real-time Webhooks**: Subscribe to Discourse webhooks
2. **Sentiment Analysis**: Analyze tone of inquiries
3. **Auto-tagging**: ML-based tag suggestions
4. **Competitor Detection**: Identify mentioned competitors
5. **Email Notifications**: Alert team of high-priority imports
6. **Custom Filters**: User-defined scraping rules
7. **Scrape History**: Track all scrape operations

## Resources

- [Discourse API Docs](https://docs.discourse.org/)
- [Discourse Meta - API Topics](https://meta.discourse.org/c/dev/api/17)
- [Shopify Community](https://community.shopify.com)

## Support

For issues or questions:
1. Check Admin Panel → Scraper tab for error details
2. Review browser console for client-side errors
3. Check Supabase logs for database errors
4. Verify API endpoints are accessible

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Status**: Production Ready
