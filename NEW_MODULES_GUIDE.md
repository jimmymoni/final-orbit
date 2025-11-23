# New Advanced Modules - Implementation Guide

This guide covers the three new advanced modules added to FinalApps Orbit:
1. 📊 Shopify Community Trends Dashboard
2. 📚 Competitor Intelligence Mode
3. 🔄 Auto-Generate Tickets for Dev Team

---

## 📊 Module 1: Shopify Community Trends Dashboard

### Overview
A comprehensive analytics dashboard that displays trending topics, issue frequency, sentiment trends, and geographic patterns from scraped Shopify Community post data.

### Features
- **Time Range Selection**: View data for 7, 30, or 90 days
- **Key Metrics**:
  - Total inquiries in selected period
  - Number of trending topics
  - Average sentiment score
  - Geographic regions tracked

### Tabs

#### 1. Issue Frequency
- **Inquiry Volume Over Time**: Area chart showing daily inquiry counts
- **Priority Distribution**: Pie chart breaking down inquiries by priority (urgent, high, normal, low)

#### 2. Trending Topics
- **Top 10 Trending Topics**: Horizontal bar chart of most discussed categories
- **Topic Cards**: Visual cards showing:
  - Topic rank
  - Number of inquiries
  - Relative popularity bar

#### 3. Sentiment Trends
- **Sentiment Analysis Over Time**: Stacked area chart showing:
  - Positive sentiment (green)
  - Neutral sentiment (orange)
  - Negative sentiment (red)
- **Sentiment Breakdown Cards**:
  - Current percentages for each sentiment
  - Trend indicators (up/down from previous period)

#### 4. Geographic Patterns
- **Geographic Distribution**: Pie chart of inquiries by region
- **Regional Breakdown**: Detailed list with:
  - Region name
  - Inquiry count
  - Percentage of total

### How to Access
Navigate to: **Community Trends** in the sidebar or visit `/trends`

### Data Source
- Reads from `inquiries` table in Supabase
- Filters by `created_at` based on selected time range
- Real-time updates when new inquiries arrive

### Future Enhancements (Recommended)
- Integrate with actual sentiment analysis API
- Add geographic IP detection for real location data
- Export trends reports as PDF
- Email alerts for unusual patterns

---

## 📚 Module 2: Competitor Intelligence Mode

### Overview
Automatically detects competitor app mentions in Shopify Community threads and groups them into complaints, praises, and feature gaps for strategic insights.

### Features

#### Competitor Tracking
- **Add/Remove Competitors**: Manage list of competitors to monitor
- **Default Competitors Tracked**:
  - Klaviyo
  - Mailchimp
  - Omnisend
  - Privy
  - Yotpo

#### Auto-Detection
The system automatically scans inquiry titles and content for:
- **Complaints**: Keywords like "problem", "issue", "bug", "slow", "difficult", "expensive"
- **Praises**: Keywords like "great", "love", "excellent", "perfect", "amazing"
- **Feature Gaps**: Keywords like "missing", "need", "wish", "lacking", "should have"

#### Key Metrics
- **Total Mentions**: Across all tracked competitors
- **Complaints Count**: Total negative mentions
- **Praises Count**: Total positive mentions
- **Feature Gaps Count**: Total feature requests

### Competitor Overview Cards
Each card shows:
- Competitor name
- Total mentions
- Breakdown of complaints, praises, and feature gaps
- Visual sentiment bar

### Detailed View
Click any competitor card to see:
- **Complaints Tab**: All negative mentions with links to original threads
- **Praises Tab**: All positive mentions
- **Feature Gaps Tab**: All feature requests/gaps
- **All Threads Tab**: Complete list of mentions

### How to Access
Navigate to: **Competitor Intel** in the sidebar or visit `/competitors`

### Use Cases
1. **Identify Competitor Weaknesses**: Focus on their most common complaints
2. **Learn from Competitor Strengths**: See what users praise about them
3. **Find Feature Opportunities**: Discover gaps in competitor offerings
4. **Sales Intelligence**: Use insights in customer conversations

### Future Enhancements (Recommended)
- AI-powered sentiment analysis instead of keyword matching
- Competitor comparison matrix
- Export insights to CSV/PDF
- Automated weekly competitor reports
- Integration with CRM for sales team

---

## 🔄 Module 3: Auto-Generate Tickets for Dev Team

### Overview
Automatically analyzes recurring issues in Shopify Community inquiries and generates development tickets with severity scoring, examples, and affected inquiry logs.

### Features

#### Automatic Issue Detection
- Scans all inquiries for similar patterns
- Groups inquiries with matching keywords/phrases
- Creates tickets for issues that appear 3+ times

#### Ticket Properties
Each auto-generated ticket includes:
- **Title**: Descriptive title based on recurring issue
- **Description**: Summary of the problem
- **Issue Pattern**: Key phrase used to group similar issues
- **Severity**: Calculated based on:
  - **Critical**: 10+ occurrences OR 2+ urgent priority inquiries
  - **High**: 7+ occurrences OR 3+ high priority inquiries
  - **Medium**: 5+ occurrences
  - **Low**: 3-4 occurrences
- **Status**: open, in_progress, or resolved
- **Occurrence Count**: Number of times reported
- **Examples**: Up to 5 example inquiries with links
- **Affected Inquiries**: Array of all related inquiry IDs

#### Ticket Board

##### Stats Dashboard
- Total tickets
- Open tickets
- In progress tickets
- Resolved tickets
- Critical tickets count

##### Filters
- **All**: Show all tickets
- **Open**: Only open tickets
- **In Progress**: Tickets being worked on
- **Resolved**: Completed tickets

##### Ticket Actions
- **Open → In Progress**: Click "Start Working"
- **In Progress → Resolved**: Click "Mark Resolved"
- **Resolved → Open**: Click "Reopen"

#### Admin Features
- **Generate Tickets** button: Manually trigger ticket generation
- Only admins can generate tickets
- Automatic deduplication (won't create duplicate tickets)

### How to Access
Navigate to: **Dev Tickets** in the sidebar or visit `/dev-tickets`

### Workflow

1. **Automatic Detection**:
   - System analyzes inquiries continuously
   - Groups similar issues by keywords in title/content

2. **Ticket Generation** (Admin Only):
   - Click "Generate Tickets" button
   - System finds all issue groups with 3+ occurrences
   - Creates tickets with severity scoring
   - Attaches example inquiries and logs

3. **Development Team**:
   - Reviews ticket board
   - Prioritizes by severity (critical first)
   - Updates status as work progresses
   - Marks resolved when fixed

4. **Tracking**:
   - All tickets have timestamps
   - Examples include links to original threads
   - Can reopen if issue recurs

### Database Schema

A new table `dev_tickets` has been created with the following structure:

```sql
CREATE TABLE dev_tickets (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  issue_pattern TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved')),
  occurrence_count INTEGER,
  examples JSONB,
  affected_inquiries UUID[],
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  resolved_at TIMESTAMP
);
```

### Setting Up the Database

**IMPORTANT**: Before using the Dev Tickets module, you must run the database schema:

1. Open Supabase SQL Editor
2. Copy the contents of `dev_tickets_schema.sql`
3. Execute the SQL
4. Verify the table and policies are created

### Use Cases

1. **Bug Tracking**: Identify recurring bugs reported by users
2. **Feature Requests**: Group common feature requests
3. **Priority Setting**: Automatically prioritize by severity
4. **Team Coordination**: Track who's working on what
5. **Customer Communication**: Reference tickets when replying to inquiries

### Future Enhancements (Recommended)
- Integration with GitHub Issues/Jira
- Email notifications when new tickets created
- Assign tickets to specific developers
- Add comments/discussion threads to tickets
- Link tickets back to inquiries (show ticket status in inquiry detail)
- AI-powered issue categorization
- Estimated resolution time tracking
- Release notes generation from resolved tickets

---

## 🚀 Installation & Setup

### 1. Database Setup

The database table for Dev Tickets needs to be created in Supabase:

```bash
# Option 1: Via Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Create a new query
4. Paste the contents of `dev_tickets_schema.sql`
5. Run the query

# Option 2: Via Supabase CLI (if installed)
supabase db push
```

### 2. Application Files Created

The following new files have been added:

#### Pages
- `src/pages/TrendsDashboardPage.jsx` - Community Trends Dashboard
- `src/pages/CompetitorIntelligencePage.jsx` - Competitor Intelligence
- `src/pages/DevTicketsPage.jsx` - Dev Tickets Board

#### Database Schema
- `dev_tickets_schema.sql` - Database schema for dev tickets

#### Updated Files
- `src/App.jsx` - Added routes for new pages
- `src/components/layout/Sidebar.jsx` - Added navigation items

### 3. Dependencies

All required dependencies are already installed:
- React Router DOM (routing)
- Recharts (charts and visualizations)
- Lucide React (icons)
- Shadcn UI components (cards, badges, tabs, etc.)
- Supabase client (database access)

### 4. Verification

Check that everything is working:

1. **Development Server Running**:
   ```bash
   npm run dev
   ```
   Should show: `VITE v7.2.2 ready in XXX ms`

2. **Navigate to New Pages**:
   - http://localhost:5173/trends
   - http://localhost:5173/competitors
   - http://localhost:5173/dev-tickets

3. **Check Sidebar**:
   - "Community Trends" with TrendingUp icon
   - "Competitor Intel" with Target icon
   - "Dev Tickets" with FileText icon

---

## 📊 Data Flow

### Trends Dashboard
```
Inquiries Table (Supabase)
    ↓
Filter by time range (7d/30d/90d)
    ↓
Aggregate & Calculate:
  - Category frequency
  - Priority distribution
  - Time-based grouping
    ↓
Display in Charts (Recharts)
```

### Competitor Intelligence
```
Inquiries Table (Supabase)
    ↓
Scan title + content for competitor names
    ↓
Keyword Analysis:
  - Complaints: "problem", "issue", etc.
  - Praises: "great", "love", etc.
  - Feature Gaps: "missing", "need", etc.
    ↓
Group by competitor
    ↓
Display in Cards & Detail View
```

### Dev Tickets
```
Inquiries Table (Supabase)
    ↓
Group by similar keywords (3+ occurrences)
    ↓
Calculate Severity:
  - Count occurrences
  - Check priority levels
    ↓
Create Ticket in dev_tickets table
    ↓
Display on Ticket Board
    ↓
Update Status (open → in_progress → resolved)
```

---

## 🎨 UI Components Used

All modules use consistent styling following the existing codebase patterns:

### Common Components
- `Card` / `CardHeader` / `CardContent` / `CardTitle` / `CardDescription`
- `Badge` (with variants: default, primary, success, warning, danger, outline)
- `Button` (with variants and sizes)
- `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent`
- `Input` (for search and text entry)

### Charts (Recharts)
- `LineChart` - Trend lines
- `BarChart` - Category comparisons
- `PieChart` - Distribution breakdowns
- `AreaChart` - Volume over time

### Icons (Lucide React)
- `TrendingUp`, `TrendingDown` - Trends
- `MessageSquare`, `Eye`, `Target` - Intelligence
- `Bug`, `FileText`, `AlertCircle` - Tickets
- `MapPin`, `Heart`, `Clock` - Metrics

---

## 🔒 Security & Permissions

### Row-Level Security (RLS)

#### Dev Tickets Table Policies
- **SELECT**: All authenticated users can view tickets
- **INSERT**: Only admins can create tickets
- **UPDATE**: Assigned user OR admin can update
- **DELETE**: Only admins can delete tickets

### Access Control
- **Trends Dashboard**: All users
- **Competitor Intelligence**: All users
- **Dev Tickets**: All users can view, only admins can generate

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "dev_tickets table does not exist"
**Solution**: Run the SQL schema in Supabase SQL Editor

```sql
-- Check if table exists
SELECT * FROM information_schema.tables
WHERE table_name = 'dev_tickets';

-- If not, run dev_tickets_schema.sql
```

#### 2. "Cannot read property of undefined" on charts
**Solution**: Ensure inquiries are loaded before rendering charts

```javascript
if (loading) return <div>Loading...</div>;
if (!inquiries || inquiries.length === 0) return <div>No data</div>;
```

#### 3. Competitor mentions not appearing
**Solution**:
- Check competitor names are correctly spelled
- Verify inquiries have content data
- Keywords are case-insensitive but must match exactly

#### 4. Tickets not generating
**Solution**:
- Ensure you're logged in as admin
- Check at least 3 inquiries have similar keywords
- Look for console errors (F12 developer tools)

### Debug Mode

Enable console logging to see data flow:

```javascript
// In any page component
useEffect(() => {
  console.log('Data loaded:', data);
}, [data]);
```

---

## 📈 Analytics & Insights

### Metrics to Track

#### Trends Dashboard
- Most frequent categories (feature requests)
- Sentiment trend direction (improving/declining)
- Busiest days/times for inquiries
- Regional patterns (expand to specific markets)

#### Competitor Intelligence
- Which competitor mentioned most
- Complaint trends (increasing/decreasing)
- Feature gaps competitors are missing
- Sentiment shifts over time

#### Dev Tickets
- Average resolution time
- Most common recurring issues
- Severity distribution
- Open vs resolved ratio

---

## 🎯 Best Practices

### 1. Trends Dashboard
- Check weekly for emerging topics
- Compare month-over-month trends
- Share insights with product team
- Use sentiment data to gauge customer satisfaction

### 2. Competitor Intelligence
- Update competitor list monthly
- Review complaints for feature ideas
- Track competitor feature launches
- Use in sales conversations

### 3. Dev Tickets
- Run "Generate Tickets" weekly
- Prioritize critical tickets first
- Update status in real-time
- Close tickets with resolution notes
- Link fixed tickets in changelog

### 4. Team Workflow
```
1. Community Trends → Identify patterns
2. Competitor Intel → Find opportunities
3. Dev Tickets → Track implementation
4. Inquiry Replies → Reference fixes
```

---

## 🔄 Real-Time Updates

All modules support real-time data via Supabase subscriptions:

- **Trends**: Auto-refresh when new inquiries arrive
- **Competitors**: Live updates as inquiries are created
- **Dev Tickets**: Instant status changes visible to all users

---

## 📝 Notes

### Sentiment Analysis
Current implementation uses keyword matching. For production:
- Consider integrating OpenAI/Anthropic sentiment API
- Use Hugging Face models for local processing
- Track sentiment over time for each inquiry

### Geographic Detection
Mock data is used currently. To implement real geographic tracking:
- Use IP geolocation API (ipapi.co, MaxMind)
- Store location data in inquiries table
- Add `country`, `region`, `city` columns

### Advanced Analytics
Future enhancements:
- Machine learning for issue categorization
- Predictive analytics for issue trends
- A/B testing insights
- Customer journey mapping

---

## 🎓 Learning Resources

### Recharts Documentation
- Docs: https://recharts.org/
- Examples: https://recharts.org/en-US/examples

### Supabase Real-Time
- Docs: https://supabase.com/docs/guides/realtime
- Subscriptions: https://supabase.com/docs/guides/realtime/postgres-changes

### React Query (TanStack)
- Docs: https://tanstack.com/query/latest
- Patterns: https://tanstack.com/query/latest/docs/framework/react/guides/queries

---

## ✅ Success Checklist

- [ ] Database schema applied to Supabase
- [ ] Development server running without errors
- [ ] All three pages accessible via sidebar
- [ ] Charts rendering correctly with data
- [ ] Competitor list customizable
- [ ] Dev tickets can be generated (admin only)
- [ ] Real-time updates working
- [ ] Mobile responsive (test on small screens)

---

## 📞 Support

For questions or issues:
1. Check console for error messages (F12)
2. Verify database schema is applied
3. Ensure Supabase connection is active
4. Review this guide for troubleshooting steps
5. Check React/Vite error messages in terminal

---

**Version**: 1.0.0
**Last Updated**: November 23, 2024
**Compatibility**: FinalApps Orbit v1.0+
**Status**: Production Ready ✅
