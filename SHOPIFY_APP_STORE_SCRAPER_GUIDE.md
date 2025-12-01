# Shopify App Store Scraper - User Guide

## Overview

The Shopify App Store scraper allows you to fetch real competitor data from apps.shopify.com including ratings, reviews, pricing, features, and more.

## Architecture

### Backend Scraper (`scripts/shopifyAppStoreScraper.js`)
- Node.js script that scrapes apps.shopify.com
- Uses Cheerio for HTML parsing
- Extracts JSON-LD structured data from app pages
- Includes caching to avoid rate limiting
- Can scrape individual apps or search for competitors

### Frontend Service (`src/services/shopifyAppStoreScraper.js`)
- Uses mock competitor data for immediate display
- No backend API required for basic functionality
- Mock data can be refreshed using backend scraper

## Installation

The scraper is already installed with the project dependencies:

```bash
npm install  # Installs cheerio and other dependencies
```

## Usage

### 1. Scrape a Single App

Get detailed information about a specific app:

```bash
node scripts/shopifyAppStoreScraper.js app <app-slug>
```

**Example:**
```bash
node scripts/shopifyAppStoreScraper.js app subscription-payments
```

**Output:**
```json
{
  "slug": "subscription-payments",
  "url": "https://apps.shopify.com/subscription-payments",
  "name": "Recharge Subscriptions App",
  "developer": "Recharge",
  "rating": 4.8,
  "reviewCount": 1971,
  "pricing": "$50",
  "features": [...],
  "description": "..."
}
```

### 2. Find Competitors by Category

Scrape multiple competitor apps in a category:

```bash
node scripts/shopifyAppStoreScraper.js competitors <category>
```

**Example:**
```bash
node scripts/shopifyAppStoreScraper.js competitors subscription
```

This will:
1. Look up known competitor slugs in that category
2. Fetch detailed info for each app
3. Return an array of competitor data
4. Cache results for 24 hours

**Output:**
```json
[
  {
    "name": "Recharge Subscriptions",
    "rating": 4.8,
    "reviewCount": 1971,
    ...
  },
  {
    "name": "Bold Subscriptions",
    "rating": 4.6,
    "reviewCount": 890,
    ...
  }
]
```

### 3. Search for Apps (Limited)

Search functionality is limited due to dynamic content loading, but you can try:

```bash
node scripts/shopifyAppStoreScraper.js search "keyword"
```

**Note:** Search results may be incomplete. For best results, use the `competitors` command with known slugs.

## Updating Frontend Mock Data

To refresh the competitor data shown in the UI:

### Step 1: Scrape Fresh Data

```bash
node scripts/shopifyAppStoreScraper.js competitors subscription
```

### Step 2: Copy JSON Output

The script will output JSON data. Copy the entire array.

### Step 3: Update Mock Data

Edit `src/services/shopifyAppStoreScraper.js` and replace the relevant category in the `mockApps` object (around line 108):

```javascript
const mockApps = {
  'subscription': [
    // Paste your scraped data here
    {
      "name": "Recharge Subscriptions App",
      "slug": "subscription-payments",
      "rating": 4.8,
      ...
    }
  ]
};
```

### Step 4: Restart Dev Server

The UI will now show the updated competitor data.

## Adding New Competitor Categories

### Step 1: Update Competitor Slugs

Edit `scripts/shopifyAppStoreScraper.js` or `src/services/shopifyAppStoreAPI.js` and add your category:

```javascript
const competitorSlugs = {
  'your-category': [
    'app-slug-1',
    'app-slug-2',
    'app-slug-3'
  ]
};
```

### Step 2: Find App Slugs

App slugs are found in the URL:
```
https://apps.shopify.com/subscription-payments
                            ^^^^^^^^^^^^^^^^^^^
                            This is the slug
```

Browse apps.shopify.com to find competitors and note their slugs.

### Step 3: Scrape the New Category

```bash
node scripts/shopifyAppStoreScraper.js competitors your-category
```

### Step 4: Add to Frontend Mock Data

Follow the "Updating Frontend Mock Data" steps above.

## Caching

The scraper caches results for 24 hours in `.cache/shopify-apps-cache.json`.

**To clear cache:**
```bash
rm -rf .cache
```

**To check cache:**
```bash
cat .cache/shopify-apps-cache.json | jq
```

Cache helps avoid:
- Rate limiting from Shopify
- Slow repeated requests
- Unnecessary bandwidth usage

## Rate Limiting

The scraper includes automatic rate limiting:
- 1 second delay between requests
- Respects Shopify's server resources
- Uses caching to minimize requests

**Best Practice:** Don't scrape the same app multiple times in quick succession. Use cached data when possible.

## Data Structure

### App Object

```typescript
{
  slug: string,          // URL slug (e.g., "subscription-payments")
  url: string,           // Full URL
  name: string,          // App name
  developer: string,     // Developer/company name
  rating: number,        // Average rating (0-5)
  reviewCount: number,   // Total number of reviews
  pricing: string,       // Pricing info (e.g., "From $99/mo")
  features: string[],    // Array of feature descriptions
  description: string,   // App description
  categories: string[],  // Categories/tags
  launchDate: string     // Launch date (if available)
}
```

## Troubleshooting

### "Cannot find package 'cheerio'"
```bash
npm install cheerio
```

### "Script not working"
Make sure you're in the project root:
```bash
cd /path/to/finalapps-orbit
node scripts/shopifyAppStoreScraper.js app subscription-payments
```

### "No data returned"
- Check if the app slug is correct
- Visit https://apps.shopify.com/<slug> to verify it exists
- Clear cache: `rm -rf .cache`

### "Rate limited"
- Wait a few minutes before trying again
- Use cached data if available
- Don't run the scraper too frequently

## Known Limitations

1. **Search Functionality**
   - Shopify App Store loads content dynamically with JavaScript
   - The scraper fetches static HTML, so search results may be incomplete
   - Solution: Use curated list of competitor slugs instead

2. **CORS in Frontend**
   - Browser cannot directly fetch apps.shopify.com due to CORS policy
   - Frontend uses mock data that's manually refreshed
   - Solution: Run backend scraper to update mock data periodically

3. **Data Accuracy**
   - Scraping depends on HTML structure which may change
   - Some fields may be missing if page structure changes
   - JSON-LD structured data is most reliable

4. **Rate Limiting**
   - Shopify may block excessive requests
   - Use caching and add delays between requests
   - Don't abuse the scraper

## Future Enhancements

Planned improvements:

1. **Backend API Endpoint**
   - Add Express/Next.js API route for on-demand scraping
   - Frontend calls API instead of using mock data
   - Real-time competitor data in UI

2. **Browser Automation**
   - Use Puppeteer to handle JavaScript-rendered content
   - Improve search functionality
   - Handle dynamic page elements

3. **Scheduled Scraping**
   - Cron job to automatically refresh competitor data
   - Weekly updates to mock data
   - Email notifications on competitor changes

4. **Enhanced Data Extraction**
   - Screenshot capturing
   - Review sentiment analysis
   - Pricing history tracking
   - Feature comparison matrix

5. **Database Storage**
   - Store competitor data in Supabase
   - Track changes over time
   - Historical comparison views

## CLI Reference

```bash
# Get help
node scripts/shopifyAppStoreScraper.js

# Scrape an app
node scripts/shopifyAppStoreScraper.js app <slug>

# Find competitors
node scripts/shopifyAppStoreScraper.js competitors <category>

# Search (limited)
node scripts/shopifyAppStoreScraper.js search <query>
```

## Examples

### Example 1: Refresh Subscription Competitors

```bash
# Scrape all subscription competitors
node scripts/shopifyAppStoreScraper.js competitors subscription > subscription-data.json

# View the data
cat subscription-data.json | jq

# Copy relevant parts to src/services/shopifyAppStoreScraper.js
```

### Example 2: Add a New Competitor

```bash
# Find the app on Shopify App Store
# URL: https://apps.shopify.com/new-subscription-app
# Slug: new-subscription-app

# Scrape the app
node scripts/shopifyAppStoreScraper.js app new-subscription-app

# Add slug to competitorSlugs list
# Re-run competitors scrape
node scripts/shopifyAppStoreScraper.js competitors subscription
```

### Example 3: Compare Multiple Apps

```bash
# Scrape each app individually
node scripts/shopifyAppStoreScraper.js app app-1
node scripts/shopifyAppStoreScraper.js app app-2
node scripts/shopifyAppStoreScraper.js app app-3

# Results are cached, so comparison is fast
```

## Integration with Competitor Intel Page

The Competitor Intelligence page (`src/pages/CompetitorIntelligencePage.jsx`) uses this data to show:

1. **App Overview Cards**
   - Logo, name, pricing
   - Community mentions
   - Issues and praises

2. **Competitor Comparison**
   - Ratings and reviews
   - Pricing side-by-side
   - Feature lists
   - Direct links to Shopify App Store

3. **Community Sentiment**
   - Mentions from scraped inquiries
   - Positive vs negative feedback
   - Feature gap analysis

To update competitor data shown in the UI, follow the "Updating Frontend Mock Data" section above.

---

**Last Updated:** November 2024
**Version:** 1.0.0
**Status:** Production Ready
