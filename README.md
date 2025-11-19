# FinalApps Orbit

> Internal platform for managing Shopify Community opportunities

FinalApps Orbit transforms Shopify Community inquiries into actionable, trackable, high-performance tasks for the FinalApps team.

## Features

- **Round-Robin Assignment**: Automatic inquiry distribution to team members
- **Bandwidth System**: Deadline tracking with automatic escalation
- **Reply Scoring**: Track speed, quality, and outcome metrics
- **Performance Dashboard**: Real-time stats and leaderboards
- **App Library**: Complete documentation for all FinalApps Shopify apps
- **Admin Panel**: Team management and system configuration
- **Activity Logging**: Full audit trail of all actions

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Recharts
- **State Management**: TanStack Query
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- n8n setup for scraping Shopify Community (optional)

### Installation

1. **Clone and Install**

```bash
cd finalapps-orbit
npm install
```

2. **Set up Supabase**

   - Create a new Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Create a `.env` file:

```bash
cp .env.example .env
```

   - Fill in your Supabase credentials in `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. **Run Database Schema**

   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `SUPABASE_SCHEMA.sql`
   - Click "Run" to create all tables, functions, and policies

4. **Create First User**

   - Go to Authentication > Users in Supabase Dashboard
   - Click "Add User"
   - Create an admin user with email/password
   - After creation, go to Table Editor > users
   - Manually insert a row for this user:

```sql
INSERT INTO users (id, email, name, role, active)
VALUES (
  'paste-supabase-auth-user-id-here',
  'admin@finalapps.com',
  'Admin User',
  'admin',
  true
);
```

5. **Start Development Server**

```bash
npm run dev
```

6. **Access the Application**

   - Open http://localhost:5173
   - Login with your admin credentials

## Database Schema

The platform uses 6 main tables:

1. **users** - Team members with stats
2. **inquiries** - Shopify Community posts
3. **replies** - User responses with scores
4. **apps** - FinalApps app documentation
5. **knowledge_base** - Internal documentation
6. **activity_log** - Audit trail

See `SUPABASE_SCHEMA.sql` for complete schema.

## Key Functions

### Round-Robin Assignment

```sql
assign_next_runner()
```

Automatically assigns inquiries to the user who was assigned least recently.

### Reply Scoring

```sql
calculate_reply_score(inquiry_id, reply_id)
```

Calculates scores based on:
- **Speed**: 0-15 min = 10 pts, 15-60 min = 8 pts, etc.
- **Quality**: Default 5 pts (can be adjusted manually)
- **Outcome**: +2 for merchant reply, +5 for solved, +10 for install

### Escalation

```sql
escalate_inquiry(inquiry_id)
```

Triggered when deadline is missed. Reassigns to next user and logs activity.

### Stats Update

```sql
update_user_stats(user_id)
```

Updates user's total score, average reply time, and counts.

## n8n Integration

To connect your n8n Shopify Community scraper:

1. **Webhook URL**: `https://your-project.supabase.co/rest/v1/inquiries`
2. **Headers**:
   - `apikey`: Your Supabase anon key
   - `Authorization`: Bearer [anon key]
   - `Content-Type`: application/json
3. **Payload**:

```json
{
  "title": "Post title from Shopify",
  "content": "Post content",
  "category": "Apps",
  "link": "https://community.shopify.com/...",
  "assigned_to": null,
  "bandwidth_minutes": 240,
  "priority": "normal"
}
```

The `assign_next_runner()` function will be called automatically via a trigger.

## Adding Apps to the Library

As an admin:

1. Go to Admin Panel > Apps tab
2. Click "Add App"
3. Fill in details:
   - Name
   - Description
   - Shopify URL
   - Pricing
   - Features (JSON array)
   - Competitors (JSON array)
   - Reply templates (JSON array)
   - Use cases
   - Screenshots

Or insert directly via SQL:

```sql
INSERT INTO apps (name, description, shopify_url, pricing, status)
VALUES (
  'Your App Name',
  'Brief description',
  'https://apps.shopify.com/your-app',
  'Free / $9.99/mo',
  'active'
);
```

## Workflow

1. **n8n scrapes** Shopify Community post
2. **Webhook sends** data to Supabase
3. **Inquiry created** and assigned via round-robin
4. **Employee sees** task in dashboard
5. **Employee replies** on Shopify Community
6. **Employee logs** reply in Orbit
7. **Score calculated** automatically
8. **Stats updated** in real-time
9. **If missed** → escalated to next employee

## Customization

### Bandwidth Defaults

Edit in `SUPABASE_SCHEMA.sql`:

```sql
bandwidth_minutes INTEGER DEFAULT 240  -- Change 240 to your preferred minutes
```

### Scoring Algorithm

Edit in `calculate_reply_score()` function to adjust point values.

### Branding

The FinalApps Blue color is defined in `tailwind.config.js`:

```js
colors: {
  'finalapps-blue': '#2563EB',
}
```

## Build for Production

```bash
npm run build
```

Deploy the `dist` folder to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting

## Support

For issues or questions, contact the FinalApps development team.

## License

Internal use only - FinalApps, Inc.
