# Competitor Intelligence - Updated Implementation

## What Changed

The Competitor Intelligence module has been updated to **automatically pull competitors from your FinalApps apps** in the database, instead of using a hardcoded list.

## Key Improvements

### 1. **Dynamic Competitor Tracking**
- Competitors are now pulled from the `apps` table
- Each FinalApps app can have its own list of competitors
- Shows which FinalApps app each competitor is competing against

### 2. **App-Based Filtering**
Instead of manually managing a competitor list, you can now:
- View all competitors across all apps
- Filter by specific FinalApps app to see only its competitors
- See competitor counts per app

### 3. **Enhanced Competitor Cards**
Each competitor card now shows:
- Competitor name
- Total mentions in Shopify Community
- **"Competes with:" badges** showing which FinalApps apps
- Complaints, praises, and feature gaps breakdown
- Sentiment visualization bar
- Optional link to competitor website (if stored in database)

### 4. **Detailed Competitor View**
When clicking on a competitor, you'll see:
- Which FinalApps apps it competes with (with icons)
- Link to competitor website
- All complaints, praises, feature gaps, and threads
- Links to original Shopify Community threads

---

## How to Set Up Competitors

### Option 1: Via Admin Panel (Recommended)

1. Navigate to **Admin Panel** → **Apps Tab**
2. Click on an app to edit
3. Add competitors in the `competitors` field as JSON:

```json
[
  { "name": "Klaviyo", "url": "https://www.klaviyo.com" },
  { "name": "Mailchimp", "url": "https://mailchimp.com" },
  { "name": "Omnisend", "url": "https://www.omnisend.com" }
]
```

### Option 2: Via Supabase Dashboard

1. Go to Supabase Dashboard
2. Navigate to **Table Editor** → **apps**
3. Edit an app row
4. Update the `competitors` column (JSONB format):

```json
[
  { "name": "Competitor 1", "url": "https://example.com" },
  { "name": "Competitor 2", "url": "https://example2.com" }
]
```

### Option 3: Via SQL

```sql
UPDATE apps
SET competitors = '[
  {"name": "Klaviyo", "url": "https://www.klaviyo.com"},
  {"name": "Mailchimp", "url": "https://mailchimp.com"}
]'::jsonb
WHERE name = 'Your App Name';
```

---

## Data Structure

### Apps Table - Competitors Column

The `competitors` field is JSONB and supports two formats:

#### Format 1: Array of Strings (Simple)
```json
["Klaviyo", "Mailchimp", "Omnisend"]
```

#### Format 2: Array of Objects (Recommended)
```json
[
  {
    "name": "Klaviyo",
    "url": "https://www.klaviyo.com"
  },
  {
    "name": "Mailchimp",
    "url": "https://mailchimp.com"
  }
]
```

**Note**: Format 2 is recommended because it allows you to:
- Store competitor website URLs
- Add additional metadata in the future (pricing, features, etc.)

---

## How It Works

### Detection Algorithm

1. **Fetch Data**:
   - Loads all active apps from `apps` table
   - Extracts competitors from each app's `competitors` field
   - Loads recent inquiries from `inquiries` table

2. **Build Competitor Map**:
   - Creates a map of unique competitors
   - Associates each competitor with the FinalApps apps they compete with
   - Handles both string and object formats

3. **Scan Inquiries**:
   - Searches inquiry titles and content for competitor mentions
   - Case-insensitive keyword matching
   - Categorizes mentions into:
     - **Complaints**: "problem", "issue", "bug", "slow", "expensive", "doesn't work"
     - **Praises**: "great", "love", "excellent", "perfect", "amazing", "recommend"
     - **Feature Gaps**: "missing", "need", "wish", "lacking", "doesn't have"

4. **Display Results**:
   - Shows competitors sorted by mention count (most mentioned first)
   - Allows filtering by FinalApps app
   - Provides detailed view with all threads

---

## Use Cases

### 1. **Product Strategy**
Filter by your FinalApps app to see:
- Which competitors are being discussed most
- What users complain about in competitor products
- Feature gaps in competitor offerings (opportunities!)

### 2. **Sales Intelligence**
When responding to inquiries:
- Reference competitor weaknesses in your reply
- Highlight features you have that competitors lack
- Use praise data to understand what users value

### 3. **Market Research**
Track trends over time:
- Are competitor mentions increasing/decreasing?
- What new complaints are emerging?
- Are users switching to/from competitors?

### 4. **Competitive Positioning**
- Identify your strongest differentiators
- Find underserved market segments
- Discover feature ideas from gaps

---

## Example Workflow

### Setting Up Competitors for "Email Marketing App"

1. **Add App in Admin Panel**:
   ```
   Name: FinalApps Email Pro
   Description: Email marketing for Shopify
   Status: Active
   ```

2. **Add Competitors**:
   ```json
   [
     {"name": "Klaviyo", "url": "https://www.klaviyo.com"},
     {"name": "Mailchimp", "url": "https://mailchimp.com"},
     {"name": "Omnisend", "url": "https://www.omnisend.com"}
   ]
   ```

3. **Navigate to Competitor Intel**:
   - Go to **Competitor Intel** in sidebar
   - Click "FinalApps Email Pro" filter button
   - See only competitors relevant to this app

4. **Analyze Results**:
   - Click on "Klaviyo" card
   - Review complaints (e.g., "expensive pricing")
   - Check feature gaps (e.g., "missing SMS integration")
   - Use insights in product development

---

## Metrics Dashboard

The key metrics section shows:

| Metric | Description |
|--------|-------------|
| **Total Mentions** | All competitor mentions across all apps |
| **Complaints** | Negative mentions detected |
| **Praises** | Positive mentions detected |
| **Feature Gaps** | Feature requests/gaps identified |

---

## Filter Options

### By App
- **All Apps**: View all competitors from all FinalApps products
- **Individual Apps**: Filter to see only competitors of a specific app
- Shows competitor count per app in button labels

### By Search
- Search by competitor name
- Real-time filtering
- Case-insensitive

---

## Sentiment Analysis

### Current Implementation (Keyword-Based)

**Complaints Keywords**:
- problem, issue, bug, slow, difficult, expensive
- doesn't work, not working

**Praises Keywords**:
- great, love, excellent, perfect, amazing, recommend

**Feature Gaps Keywords**:
- missing, need, wish, lacking, should have
- doesn't have, no support for

### Future Enhancement (Recommended)

For more accurate sentiment analysis, consider integrating:
- OpenAI GPT-4 Sentiment API
- Hugging Face Transformers
- Google Cloud Natural Language API
- Custom ML model trained on Shopify Community data

---

## Advanced Features

### Competitor Intelligence + AI Replies

When generating AI reply suggestions:
1. System can reference competitor weaknesses
2. Highlight your advantages
3. Address feature gaps proactively

**Example**:
```
User asks: "Does your app support SMS like Klaviyo?"

AI Reply: "Yes! Our SMS feature is included in all plans,
unlike Klaviyo which charges separately. Plus, we offer..."
```

### Competitor Intelligence + Dev Tickets

Link recurring competitor-related issues to dev tickets:
- If users frequently mention "missing feature X that Competitor has"
- Auto-generate dev ticket to build that feature
- Prioritize based on mention frequency

---

## Data Export (Future)

Potential export formats:
- CSV: All competitor mentions with timestamps
- PDF: Weekly competitor intelligence report
- JSON: API endpoint for external tools

---

## Real-Time Updates

The competitor intelligence data updates automatically when:
- New inquiries are scraped from Shopify Community
- Apps are added/updated in the database
- Competitor lists are modified in app settings

Uses Supabase real-time subscriptions for instant updates.

---

## Performance Optimization

### Current Limits
- Fetches last 500 inquiries (adjustable)
- Scans in-memory (fast for this volume)
- No caching (always fresh data)

### For Large Scale (1000+ inquiries)
Consider:
- Server-side full-text search
- PostgreSQL materialized views
- Caching competitor data (refresh every hour)
- Pagination for thread lists

---

## Troubleshooting

### No Competitors Showing

**Possible Causes**:
1. Apps table has no competitors defined
2. Competitors array is empty or malformed
3. No inquiries mention those competitor names

**Solutions**:
1. Add competitors to apps via Admin Panel
2. Verify JSON format is correct
3. Check competitor names match exactly (case-insensitive)

### Mentions Not Detected

**Possible Causes**:
1. Competitor name spelling differs in inquiries
2. Competitor mentioned using abbreviations
3. Inquiry content is empty

**Solutions**:
1. Add common variations to competitor list
2. Use broader keyword matching
3. Verify inquiries have content populated

### Filter Not Working

**Possible Causes**:
1. App has no competitors defined
2. No mentions found for that app's competitors

**Solutions**:
1. Check app has competitors array populated
2. Try "All Apps" filter to see if any competitors detected

---

## Security & Permissions

### Data Access
- All authenticated users can view competitor intelligence
- No special permissions required
- RLS policies ensure proper access control

### Data Privacy
- Only shows publicly available Shopify Community data
- Competitor URLs stored securely in database
- No personal user information exposed

---

## Best Practices

### 1. Keep Competitor Lists Updated
- Review quarterly
- Add new competitors as they emerge
- Remove defunct competitors
- Update competitor URLs if changed

### 2. Regular Analysis
- Weekly review of top competitors
- Monthly trend analysis
- Track sentiment shifts
- Share insights with product team

### 3. Action on Insights
- Feature gaps → Product roadmap
- Complaints → Marketing materials
- Praises → Understand what users value
- Trends → Strategic planning

### 4. Combine with Other Modules
- Use Trends Dashboard to see patterns
- Create Dev Tickets for high-priority gaps
- Reference in inquiry replies

---

## Next Steps

### Immediate Actions
1. Add competitors to your FinalApps apps in Admin Panel
2. Navigate to Competitor Intel page
3. Filter by your app
4. Review top competitor mentions
5. Click competitors for detailed view

### Ongoing Usage
1. Check weekly for new insights
2. Share reports with team
3. Track competitor sentiment trends
4. Update product strategy based on data

---

## API Structure (For Developers)

### Apps Table Query
```javascript
const { data: apps } = await supabase
  .from('apps')
  .select('id, name, logo_url, competitors')
  .eq('status', 'active')
  .order('name');
```

### Competitor Data Structure
```javascript
{
  name: "Klaviyo",
  url: "https://www.klaviyo.com",
  apps: [
    { id: "uuid", name: "FinalApps Email Pro", logo_url: "..." }
  ],
  total: 15,
  complaints: [...],
  praises: [...],
  featureGaps: [...],
  threads: [...]
}
```

---

## Summary

The updated Competitor Intelligence module:
✅ Pulls competitors from your apps database
✅ Shows which FinalApps app each competitor competes with
✅ Allows filtering by app
✅ Displays competitor URLs
✅ Enhanced sentiment detection
✅ Real-time data updates

This makes competitor tracking more dynamic, accurate, and aligned with your actual product lineup!

---

**Version**: 2.0.0
**Last Updated**: November 23, 2024
**Breaking Changes**: None (backward compatible)
**Migration Required**: Add competitors to apps table
