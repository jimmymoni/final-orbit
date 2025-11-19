# FinalApps Orbit - Implementation Notes

## Project Structure

```
finalapps-orbit/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn-style UI components
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── input.jsx
│   │   │   └── textarea.jsx
│   │   ├── layout/
│   │   │   └── DashboardLayout.jsx
│   │   └── dashboard/             # Dashboard-specific components
│   ├── pages/
│   │   ├── LandingPage.jsx        # Public landing page
│   │   ├── LoginPage.jsx          # Authentication
│   │   ├── InquiryDashboard.jsx   # Main inquiry table
│   │   ├── InquiryDetailPage.jsx  # Detailed view + reply
│   │   ├── AppLibraryPage.jsx     # App documentation
│   │   ├── StatsPage.jsx          # Performance graphs
│   │   └── AdminPage.jsx          # Admin panel
│   ├── contexts/
│   │   └── AuthContext.jsx        # Authentication state
│   ├── config/
│   │   └── supabase.js            # Supabase client
│   ├── lib/
│   │   └── utils.js               # Helper functions
│   ├── App.jsx                    # Main app with routing
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Tailwind styles
├── SUPABASE_SCHEMA.sql            # Complete database schema
├── SETUP_GUIDE.md                 # Step-by-step setup
├── README.md                      # Full documentation
└── .env.example                   # Environment template
```

## Key Features Implemented

### 1. Authentication System
- **Context-based auth**: `AuthContext.jsx`
- **Protected routes**: Automatically redirect to login
- **User profiles**: Fetched from `users` table
- **Role-based access**: Admin vs Runner permissions

### 2. Round-Robin Assignment
- **Database function**: `assign_next_runner()`
- **Logic**: Assigns to user with oldest last assignment
- **Skip inactive**: Only assigns to active users
- **Automatic**: Triggered when inquiry is created

### 3. Bandwidth & Deadline System
- **Default**: 240 minutes (4 hours)
- **Auto-calculation**: Deadline set on inquiry creation
- **Visual indicators**: Red text for overdue items
- **Escalation**: Ready to implement (function exists)

### 4. Reply Scoring System
- **Speed Score** (0-10 points):
  - 0-15 min: 10
  - 15-60 min: 8
  - 1-4 hours: 6
  - 4-12 hours: 4
  - 12-24 hours: 2
  - 24+ hours: 0
- **Quality Score**: Default 5 (manual adjustment possible)
- **Outcome Score**:
  - Merchant reply: +2
  - Marked solved: +5
  - App install: +10
- **Total**: Speed + Quality + Outcome

### 5. Real-Time Updates
- **Supabase Realtime**: Subscribed on inquiry changes
- **Automatic refresh**: Dashboard updates without reload
- **Activity log**: All actions tracked instantly

### 6. Performance Dashboard
- **Charts**: Line, Bar, Pie using Recharts
- **Metrics**: Total score, avg time, replies, missed
- **Leaderboard**: Top 5 performers
- **Recent activity**: Last 10 replies with scores

### 7. Admin Panel
- **User management**: Activate/deactivate team members
- **App library**: Manage app documentation
- **Settings**: Configure system defaults
- **Activity**: View global logs

## Database Functions Created

### `assign_next_runner()`
```sql
-- Returns UUID of next user to assign
-- Based on least recently assigned
```

### `calculate_reply_score(p_inquiry_id, p_reply_id)`
```sql
-- Calculates and updates all score fields
-- Returns total score
```

### `update_user_stats(p_user_id)`
```sql
-- Updates user's aggregate statistics
-- Total score, avg time, counts
```

### `escalate_inquiry(p_inquiry_id)`
```sql
-- Reassigns to next user
-- Increments escalation count
-- Logs activity
```

### `set_inquiry_deadline()`
```sql
-- Trigger function
-- Sets deadline_at based on created_at + bandwidth
```

## Supabase RLS Policies

All tables have Row Level Security enabled:

- **Users**: Everyone can view, admins can manage
- **Inquiries**: Everyone can view, assigned users can update
- **Replies**: Everyone can view, users can create their own
- **Apps**: Everyone can view, admins can manage
- **Knowledge Base**: Everyone can view, admins can manage
- **Activity Log**: Everyone can view, system can insert

## UI Component Library

Built with shadcn/ui principles:

- **Notion-style**: Clean, minimal, white background
- **FinalApps Blue**: #2563EB (royal blue)
- **Rounded corners**: All cards and buttons
- **No gradients**: Flat design
- **Shadows**: Minimal, subtle
- **Typography**: System fonts, clear hierarchy

## Color System

```css
White: #FFFFFF (backgrounds)
Black/Grey: #111827, #6B7280 (text)
FinalApps Blue: #2563EB (primary actions, accents)
Success: #10B981 (green - replied status)
Warning: #F59E0B (yellow - escalated)
Danger: #EF4444 (red - missed, overdue)
```

## Routing Structure

```
/ - Landing page (public)
/login - Login page (public)
/dashboard - Inquiry dashboard (protected)
/inquiry/:id - Inquiry detail (protected)
/apps - App library (protected)
/apps/:id - App detail (protected, future)
/stats - Performance stats (protected)
/admin - Admin panel (protected, admin only)
```

## Data Flow

### New Inquiry Flow
1. n8n scrapes Shopify Community
2. POST to `/rest/v1/inquiries`
3. Row inserted in `inquiries` table
4. Trigger calls `set_inquiry_deadline()`
5. Trigger should call `assign_next_runner()` (add this)
6. Real-time update sent to all connected clients
7. Assigned user sees it in their dashboard

### Reply Flow
1. User views inquiry detail
2. Writes reply text
3. Clicks "Mark as Replied"
4. Insert into `replies` table
5. Update inquiry status to 'replied'
6. Call `calculate_reply_score()`
7. Call `update_user_stats()`
8. Insert activity log
9. Real-time updates propagate

## Missing Pieces (Optional Enhancements)

### 1. Auto-Assignment Trigger
Currently assignment is manual. Add this trigger:

```sql
CREATE OR REPLACE FUNCTION auto_assign_inquiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS NULL THEN
    NEW.assigned_to := assign_next_runner();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_assign_on_insert
BEFORE INSERT ON inquiries
FOR EACH ROW EXECUTE FUNCTION auto_assign_inquiry();
```

### 2. Escalation Cron Job
Set up a Supabase Edge Function to check for overdue inquiries:

```typescript
// supabase/functions/check-escalations/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Find overdue inquiries
  const { data: overdue } = await supabase
    .from('inquiries')
    .select('id')
    .eq('status', 'assigned')
    .lt('deadline_at', new Date().toISOString())

  // Escalate each one
  for (const inquiry of overdue || []) {
    await supabase.rpc('escalate_inquiry', { p_inquiry_id: inquiry.id })
  }

  return new Response(JSON.stringify({ escalated: overdue?.length || 0 }))
})
```

Schedule via Supabase Cron (Database Webhooks) to run every 15 minutes.

### 3. App Detail Pages
Create `AppDetailPage.jsx` to show full documentation:
- Features list
- Competitor comparison
- Reply templates
- Screenshots
- Use cases

### 4. Notification System
- Slack webhook on escalation
- Email notifications
- In-app notifications badge

### 5. Quality Score Manual Adjustment
Add admin ability to manually adjust quality scores after review.

### 6. Category Auto-Detection
Use AI or keywords to auto-categorize inquiries.

## Performance Considerations

- **Indexes**: Already created on frequently queried columns
- **Real-time**: Limited to inquiries table only
- **Pagination**: Add for large datasets (100+ inquiries)
- **Caching**: Consider React Query for user stats

## Security Notes

- **RLS**: All tables protected
- **Service role**: Only use server-side for admin operations
- **Anon key**: Safe to expose in frontend
- **Password auth**: Supabase handles hashing
- **API rate limits**: Supabase free tier: 500 req/sec

## Deployment Checklist

- [ ] Create production Supabase project
- [ ] Run SUPABASE_SCHEMA.sql in production
- [ ] Add production env vars to hosting platform
- [ ] Set up domain (optional)
- [ ] Configure email templates in Supabase Auth
- [ ] Test full workflow end-to-end
- [ ] Set up monitoring/logging
- [ ] Schedule escalation cron job
- [ ] Document for team

## Testing Checklist

- [ ] Create test user
- [ ] Create test inquiry manually
- [ ] Reply to inquiry
- [ ] Check score calculation
- [ ] View stats dashboard
- [ ] Test admin panel
- [ ] Test app library
- [ ] Test real-time updates
- [ ] Test escalation function
- [ ] Test round-robin assignment

## Maintenance

### Regular Tasks
- Monitor Supabase usage (storage, bandwidth)
- Review user stats for anomalies
- Update app documentation
- Adjust bandwidth defaults if needed
- Archive old inquiries (optional)

### Database Backup
Supabase handles automatic backups. For manual:
```sql
pg_dump -h db.project.supabase.co -U postgres finalapps_orbit > backup.sql
```

## Future Enhancements

1. **AI-Powered Suggestions**: Use OpenAI to suggest replies
2. **Merchant Sentiment**: Track positive/negative responses
3. **Install Tracking**: Webhook from Shopify when app installed
4. **Team Goals**: Set weekly/monthly targets
5. **Gamification**: Badges, achievements, streaks
6. **Mobile App**: React Native version
7. **Slack Integration**: Post new inquiries, reply from Slack
8. **Analytics**: Conversion rates, response quality trends

## Contact

For questions or support, contact FinalApps development team.

---

**Built with**: React, Vite, Tailwind CSS, Supabase, Recharts
**License**: Internal use only - FinalApps, Inc.
**Version**: 1.0.0
**Last Updated**: November 2024
