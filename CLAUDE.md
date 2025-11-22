# FinalApps Orbit - Complete Project Guide

**Project**: FinalApps Orbit - Internal platform for managing Shopify Community opportunities
**Version**: 1.0.0
**Last Updated**: November 2024
**Status**: Active Development

---

## Table of Contents

1. [Quick Overview](#quick-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Design Patterns](#architecture--design-patterns)
5. [Database Schema](#database-schema)
6. [Build & Development](#build--development)
7. [Key Features & Implementation](#key-features--implementation)
8. [Data Flow Patterns](#data-flow-patterns)
9. [State Management](#state-management)
10. [API Integration](#api-integration)
11. [Authentication & Authorization](#authentication--authorization)
12. [Important Patterns & Conventions](#important-patterns--conventions)

---

## Quick Overview

FinalApps Orbit transforms Shopify Community inquiries into actionable, trackable tasks for the team. It features:

- **Round-robin assignment** of inquiries to team members
- **Bandwidth/deadline system** with automatic escalation
- **Reply scoring system** tracking speed, quality, and outcomes
- **Performance dashboard** with real-time statistics and leaderboards
- **AI-powered reply suggestions** using Replicate
- **App library** documentation and knowledge base
- **Admin panel** for team and system management
- **Full audit trail** of all actions via activity logging

The platform is **internal-only** and focused on high-performance inquiry management for the FinalApps support team.

---

## Tech Stack

### Frontend
- **React 19.2.0** - UI framework with hooks and latest features
- **Vite 7.2.2** - Build tool and dev server (ESM-based)
- **React Router DOM 7.9.6** - Client-side routing and navigation
- **TanStack React Query 5.90.10** - Server state management and caching
- **React Hook Form 7.66.1** - Form state and validation
- **Zod 4.1.12** - Schema validation and TypeScript-like types

### Styling & UI
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **Shadcn/ui** - Radix UI + Tailwind component library (pattern-based)
- **Radix UI** - Headless UI primitives (buttons, dialogs, dropdowns, etc.)
- **Lucide React 0.554.0** - Icon library
- **Sonner 2.0.7** - Toast notifications
- **date-fns 4.1.0** - Date manipulation

### Backend & Data
- **Supabase 2.83.0** - PostgreSQL database, Auth, Real-time
- **@supabase/supabase-js** - JavaScript client library
- **Replicate 1.4.0** - AI model API for reply generation

### Additional Libraries
- **clsx 2.1.1** + **tailwind-merge 3.4.0** - Class name utilities
- **react-markdown 10.1.0** - Markdown rendering
- **recharts 3.4.1** - Charts and visualization
- **@dnd-kit** - Drag and drop functionality

---

## Project Structure

```
finalapps-orbit/
├── src/
│   ├── pages/                    # Route-level pages
│   │   ├── LandingPage.jsx      # Public landing page
│   │   ├── LoginPage.jsx        # Auth entry point
│   │   ├── TeamDashboard.jsx    # Main team overview (new layout)
│   │   ├── InquiryDashboard.jsx # Inquiry list/table
│   │   ├── InquiryDetailPage.jsx # Single inquiry detail + reply form
│   │   ├── AppLibraryPage.jsx   # App documentation browser
│   │   ├── StatsPage.jsx        # Performance statistics
│   │   └── AdminPage.jsx        # Admin panel (users, apps, settings)
│   │
│   ├── components/
│   │   ├── ui/                  # Shadcn-style reusable UI components
│   │   │   ├── button.jsx, card.jsx, badge.jsx, input.jsx
│   │   │   ├── dialog.jsx, dropdown-menu.jsx, select.jsx
│   │   │   ├── tabs.jsx, table.jsx, avatar.jsx, etc.
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── AppLayout.jsx    # Main app layout (sidebar + topbar)
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   └── TopBar.jsx       # Top navigation and user menu
│   │   │
│   │   ├── inquiries/           # Inquiry-specific components
│   │   │   ├── RepliesSection.jsx    # Display replies for an inquiry
│   │   │   └── SmartReplyPanel.jsx   # AI reply suggestions UI
│   │   │
│   │   ├── dashboard/           # Dashboard-specific components
│   │   ├── admin/               # Admin panel components
│   │   └── apps/                # App library components
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx      # Authentication state + hooks
│   │
│   ├── config/
│   │   └── supabase.js          # Supabase client initialization
│   │
│   ├── models/                  # Data access layer (Supabase queries)
│   │   ├── index.js             # Exports all models
│   │   ├── inquiries.js         # Inquiry CRUD + queries
│   │   ├── replies.js           # Reply CRUD + scoring
│   │   ├── users.js             # User queries + stats
│   │   ├── apps.js              # App CRUD + search
│   │   ├── activity.js          # Activity log queries
│   │   └── knowledge.js         # Knowledge base queries
│   │
│   ├── hooks/                   # React Query-based custom hooks
│   │   ├── index.js
│   │   ├── useInquiries.js      # Inquiry queries and mutations
│   │   ├── useUsers.js          # User queries
│   │   ├── useReplies.js        # Reply mutations
│   │   ├── useApps.js           # App queries
│   │   ├── useActivity.js       # Activity log queries
│   │   ├── useKnowledge.js      # Knowledge base queries
│   │   └── useAIReplies.js      # AI reply generation mutations
│   │
│   ├── services/                # Business logic services
│   │   ├── aiReply.js           # AI reply generation service
│   │   └── replicate.js         # Replicate API wrapper
│   │
│   ├── lib/
│   │   └── utils.js             # Utility functions (formatDate, timeAgo, etc.)
│   │
│   ├── utils/
│   ├── assets/
│   ├── App.jsx                  # Main app component with routing
│   ├── App.css
│   ├── main.jsx                 # Entry point
│   └── index.css                # Tailwind imports
│
├── public/
├── .env.example                 # Environment variables template
├── .env                         # Actual env vars (git-ignored)
├── SUPABASE_SCHEMA.sql          # Complete database schema
├── SETUP_GUIDE.md               # Step-by-step setup instructions
├── QUICK_START.md               # Quick 5-minute setup
├── README.md                    # Full documentation
├── IMPLEMENTATION_NOTES.md      # Technical implementation details
├── DATABASE_SETUP.md            # Database setup guide
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── eslint.config.js             # ESLint configuration
├── index.html                   # Entry HTML file
├── package.json                 # Dependencies and scripts
└── postcss.config.js            # PostCSS configuration
```

---

## Architecture & Design Patterns

### Overall Architecture

The application follows a **layered architecture**:

```
┌─────────────────────────────────┐
│   Pages (Route Components)      │
├─────────────────────────────────┤
│   Components (UI Composition)   │
├─────────────────────────────────┤
│   Hooks (React Query + Custom)  │
├─────────────────────────────────┤
│   Models (Data Access Layer)    │
├─────────────────────────────────┤
│   Services (Business Logic)     │
├─────────────────────────────────┤
│   Supabase Client               │
├─────────────────────────────────┤
│   Backend: PostgreSQL + Auth    │
└─────────────────────────────────┘
```

### Design Patterns Used

#### 1. **Model-View-Controller (MVC) variant**
- **Models** (`/models`): Pure data access functions for each entity
- **Views** (`/pages`): React components that render UI
- **Controllers** (`/hooks`): React Query hooks that orchestrate data flow

#### 2. **Separation of Concerns**
- **Models**: Raw Supabase queries (no business logic)
- **Hooks**: React Query integration + mutations (caching + state)
- **Services**: Business logic (AI replies, context building)
- **Components**: Presentation only (no direct data fetching)

#### 3. **Custom Hooks Pattern**
All data fetching uses React Query hooks:
```javascript
// useInquiries.js
export function useInquiries(filters = {}) {
  return useQuery({
    queryKey: ['inquiries', filters],
    queryFn: () => inquiriesModel.getAll(filters),
  });
}

export function useCreateInquiry() {
  return useMutation({
    mutationFn: (data) => inquiriesModel.create(data),
    onSuccess: () => queryClient.invalidateQueries(...)
  });
}
```

#### 4. **Shadcn/ui Component Pattern**
- Radix UI primitives with Tailwind styling
- Consistent, reusable UI components
- Located in `/components/ui`
- Follow Notion-style minimal design

#### 5. **Context API for Authentication**
```javascript
// AuthContext provides:
- user (Supabase auth user)
- userProfile (from users table)
- loading state
- signIn/signOut methods
- isAdmin computed property
```

#### 6. **Protected Routes**
Routes wrapped with `<ProtectedRoute>` that redirects to login if not authenticated.

---

## Database Schema

### Tables

#### 1. **users**
```sql
id UUID PRIMARY KEY
email TEXT UNIQUE NOT NULL
name TEXT NOT NULL
role TEXT ('admin' | 'runner') NOT NULL
active BOOLEAN DEFAULT true
total_score INTEGER DEFAULT 0
avg_reply_time INTEGER (minutes) DEFAULT 0
total_missed INTEGER DEFAULT 0
total_replied INTEGER DEFAULT 0
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Purpose**: Team member profiles with statistics
**Indexes**: `(active)`, `(role)`

#### 2. **inquiries**
```sql
id UUID PRIMARY KEY
title TEXT NOT NULL
content TEXT NOT NULL
category TEXT
link TEXT NOT NULL (Shopify Community URL)
assigned_to UUID REFERENCES users(id)
bandwidth_minutes INTEGER DEFAULT 240 (4 hours)
deadline_at TIMESTAMP (auto-calculated)
status TEXT ('assigned' | 'replied' | 'escalated' | 'missed')
escalation_count INTEGER DEFAULT 0
priority TEXT ('low' | 'normal' | 'high' | 'urgent')
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Purpose**: Shopify Community posts to handle
**Indexes**: `(assigned_to)`, `(status)`, `(created_at DESC)`
**Triggers**: 
- `set_deadline_on_inquiry_create` - calculates deadline_at

#### 3. **replies**
```sql
id UUID PRIMARY KEY
inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE
user_id UUID REFERENCES users(id)
reply_text TEXT NOT NULL
score_speed INTEGER DEFAULT 0 (0-10 points)
score_quality INTEGER DEFAULT 0 (0-5 points)
score_outcome INTEGER DEFAULT 0 (0-10 points)
score_total INTEGER DEFAULT 0
replied_at TIMESTAMP DEFAULT NOW()
created_at TIMESTAMP
```

**Purpose**: User responses to inquiries
**Indexes**: `(inquiry_id)`, `(user_id)`
**Related Functions**: `calculate_reply_score()`

#### 4. **apps**
```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
description TEXT
logo_url TEXT
shopify_url TEXT
pricing TEXT
status TEXT ('active' | 'updating' | 'deprecated')
features JSONB (array of strings)
competitors JSONB (array of objects)
reply_templates JSONB (array of templates)
use_cases JSONB (array of strings)
screenshots JSONB (array of URLs)
known_issues TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Purpose**: FinalApps product documentation
**Usage**: Shown in reply panel, referenced in AI context

#### 5. **knowledge_base**
```sql
id UUID PRIMARY KEY
category TEXT NOT NULL
title TEXT NOT NULL
markdown_content TEXT
tags JSONB (array of strings)
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Purpose**: Internal documentation and guides
**Usage**: Context for AI reply generation

#### 6. **activity_log**
```sql
id UUID PRIMARY KEY
inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE
user_id UUID REFERENCES users(id)
type TEXT ('assigned' | 'replied' | 'escalated' | 'reassigned' | 'status_changed')
message TEXT NOT NULL
metadata JSONB
timestamp TIMESTAMP DEFAULT NOW()
```

**Purpose**: Audit trail for compliance and debugging
**Realtime**: Subscribed to for live updates

### Row-Level Security (RLS)

All tables have RLS enabled:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| users | All users | Only admins | Only admins | Only admins |
| inquiries | All users | - | Assigned user OR admin | - |
| replies | All users | Own user only | - | - |
| apps | All users | Only admins | Only admins | Only admins |
| knowledge_base | All users | Only admins | Only admins | Only admins |
| activity_log | All users | System/function only | - | - |

### Database Functions

#### `assign_next_runner()` -> UUID
Implements **round-robin assignment**:
- Finds active 'runner' users
- Sorts by most recent assignment (ascending)
- Returns UUID of user with NULLS FIRST (never assigned gets priority)

```sql
SELECT id FROM users
WHERE active = true AND role = 'runner'
ORDER BY (SELECT MAX(created_at) FROM inquiries WHERE assigned_to = users.id) ASC NULLS FIRST
LIMIT 1;
```

#### `calculate_reply_score(inquiry_id, reply_id)` -> INTEGER
Calculates reply score in three components:

**Speed Score (0-10 points)**:
- 0-15 min: 10 points
- 15-60 min: 8 points
- 1-4 hours: 6 points
- 4-12 hours: 4 points
- 12-24 hours: 2 points
- 24+ hours: 0 points

**Quality Score**: Default 5 points (manually adjustable later)

**Outcome Score**:
- Merchant reply: +2 points
- Marked solved: +5 points
- App installed: +10 points

Updates `replies` table with individual scores and total.

#### `update_user_stats(user_id)` -> VOID
Aggregates user statistics:
- `total_score`: SUM of all reply score_totals
- `avg_reply_time`: AVG of (replied_at - created_at)
- `total_replied`: COUNT of replies
- `total_missed`: COUNT of inquiries with status='escalated'

Called after each reply is created.

#### `escalate_inquiry(inquiry_id)` -> VOID
Handles missed deadline escalations:
1. Finds current assigned user
2. Gets next user via `assign_next_runner()`
3. Updates inquiry: reassigns, sets status='escalated', increments escalation_count
4. Resets deadline_at to NOW() + bandwidth_minutes
5. Logs activity entry
6. Updates old user's stats

#### `set_inquiry_deadline()` (TRIGGER)
**Fires on**: INSERT into inquiries
**Logic**: Sets `deadline_at = created_at + (bandwidth_minutes || ' minutes')::INTERVAL`

### Indexes

All created for performance:
```sql
idx_inquiries_assigned_to     -- For filtering by user
idx_inquiries_status          -- For filtering by status
idx_inquiries_created_at      -- For time-based queries
idx_replies_inquiry_id        -- For finding replies
idx_replies_user_id           -- For user statistics
idx_activity_log_inquiry_id   -- For activity lookup
idx_activity_log_user_id      -- For user activity
idx_users_active              -- For active users only
```

---

## Build & Development

### Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

### Development Server

```bash
npm run dev
```
- **URL**: http://localhost:5173
- **Auto-reload**: On file changes
- **Port**: 5173 (configurable in vite.config.js)
- **Protocol**: Vite uses ES modules

### Production Build

```bash
npm run build
```
- **Output**: `dist/` folder
- **Optimization**: Tree-shaking, minification, code splitting
- **Deployment ready** for: Vercel, Netlify, Cloudflare Pages, static hosting

### Linting

```bash
npm run lint
```
- **Tool**: ESLint 9.39.1
- **Plugins**: react-hooks, react-refresh
- **Config**: eslint.config.js

### Environment Setup

Create `.env` file (copy from `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Important**: Prefix all env vars with `VITE_` to expose them to frontend.

---

## Key Features & Implementation

### 1. Authentication System

**Location**: `/src/contexts/AuthContext.jsx`

**Flow**:
1. User enters email/password on LoginPage
2. `signIn()` calls `supabase.auth.signInWithPassword()`
3. Auth user returned, ID stored in context
4. Fetch user profile from `users` table using auth ID
5. Store in `userProfile` context state
6. Set `isAdmin` computed property from `userProfile.role`
7. Protected routes check `user` before rendering

**Features**:
- Session persistence (Supabase handles)
- Auth state listener for login/logout
- User profile with role and stats
- Admin flag for conditional UI

**Protected Routes**:
```javascript
<ProtectedRoute>
  <page>
</ProtectedRoute>
```

### 2. Round-Robin Assignment

**Database Function**: `assign_next_runner()`

**Trigger**: When inquiry is created, `auto_assign_inquiry()` trigger calls this function.

**Algorithm**:
1. Find all active users with role='runner'
2. For each user, find MAX(created_at) of their inquiries
3. Order by this timestamp ASC (oldest first)
4. NULLS FIRST (never assigned users get priority)
5. Return ID of first result

**Result**: Load distribution across team members

### 3. Bandwidth & Deadline System

**Default**: 240 minutes (4 hours)

**Workflow**:
1. When inquiry created, `set_inquiry_deadline()` trigger fires
2. Calculates: `deadline_at = created_at + (bandwidth_minutes || ' minutes')::INTERVAL`
3. Dashboard shows red text if deadline passed (`isOverdue()` utility)
4. If deadline missed, `escalate_inquiry()` function:
   - Reassigns to next user
   - Sets status='escalated'
   - Increments escalation_count
   - Resets deadline to NOW() + bandwidth

**Frontend**: 
- Shows countdown timer in InquiryDetailPage
- Visually highlights overdue items in red
- Color-coded badges for status

### 4. Reply Scoring System

**Location**: `/src/models/replies.js` -> `calculateScore()`

**Triggered**: Automatically after reply creation via RPC

**Three Components**:

1. **Speed Score** (0-10 points)
   - Based on time between inquiry creation and reply
   - Calculated in database function
   - Incentivizes quick responses

2. **Quality Score** (0-5 points)
   - Default: 5 points
   - Can be manually adjusted in future
   - Represents professional quality

3. **Outcome Score** (0-10 points)
   - Merchant reply: +2
   - Marked solved: +5
   - App installed: +10
   - Tracks business impact

**Display**:
- Shown in RepliesSection
- Total score displayed per reply
- Aggregate scores on user leaderboard

### 5. Real-Time Updates

**Subscriptions**: Set up in models using Supabase real-time channels

```javascript
// From inquiries.js
subscribe(callback) {
  const subscription = supabase
    .channel('inquiries_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'inquiries',
    }, callback)
    .subscribe();
}

// From activity.js
subscribe(callback) {
  const subscription = supabase
    .channel('activity_changes')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'activity_log',
    }, callback)
    .subscribe();
}
```

**Used by**: Dashboard components can subscribe for live stat updates

### 6. Performance Dashboard (TeamDashboard)

**Location**: `/src/pages/TeamDashboard.jsx`

**Components**:
- **Summary Tiles**: Inquiries this week, total replies, avg reply time, escalations, active employees
- **Charts**:
  - Bar chart: Inquiries per employee (workload distribution)
  - Pie chart: Inquiries by category
  - Line chart: Avg reply time trend (mock data)
- **Leaderboard**: Top 5 performers by total score
- **Recent Activity**: Last 10 replies with scores

**Data Source**:
```javascript
useInquiries()              // All inquiries
useInquiryStats()           // Stats by status/priority/category
useUsersWithWorkload()      // Users + current_workload count
useLeaderboard(5)           // Top 5 by total_score
```

**Metrics Calculated**:
```javascript
thisWeekInquiries = inquiries.filter(inq => 
  new Date(inq.created_at) >= weekAgo
).length

totalReplies = stats.byStatus.replied

avgReplyTime = users.reduce((sum, u) => 
  sum + (u.avg_reply_time || 0)
) / users.length

totalEscalations = stats.byStatus.escalated

activeEmployees = users.filter(u => u.active).length
```

### 7. Inquiry Management

**Pages**:
- **InquiryDashboard** (`/inquiries`): Table view of all inquiries
  - Filterable by status, priority, assignee
  - Sortable columns
  - Click to detail
  
- **InquiryDetailPage** (`/inquiry/:id`): Single inquiry detail
  - Full inquiry text
  - Assigned user info
  - Deadline with countdown
  - RepliesSection with all replies and scores
  - SmartReplyPanel for AI suggestions
  - Manual reply input form
  - Activity log timeline

**Key Queries**:
```javascript
inquiriesModel.getAll(filters)      // All inquiries
inquiriesModel.getById(id)          // Single inquiry
inquiriesModel.getByUserId(userId)  // User's inquiries
inquiriesModel.getStats()           // Aggregate stats
```

### 8. AI-Powered Reply Suggestions

**Location**: `/src/services/aiReply.js`

**Trigger**: User clicks "Generate Replies" in SmartReplyPanel

**Flow**:
1. Build context from:
   - Knowledge base (search for relevant articles)
   - Apps (find mentioned products)
   - Reply templates (category-specific)

2. Create 3 system prompts for different styles:
   - Professional: Formal, detailed
   - Friendly: Warm, conversational
   - Concise: Brief, to-the-point

3. Call Replicate AI in parallel for each style

4. Return structured suggestions with metadata

**Context Building**:
```javascript
// Keyword matching against knowledge articles
const scored = articles.map(article => {
  const text = `${article.title} ${article.markdown_content}`.toLowerCase();
  const score = keywords.reduce((sum, keyword) =>
    sum + (text.includes(keyword.toLowerCase()) ? 1 : 0)
  );
  return { ...article, score };
});

// Sort by relevance, return top 3
const results = scored
  .filter(a => a.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);
```

**Fallback**: Returns pre-written suggestions if AI unavailable

**API**: Uses Replicate for model inference (configurable model)

### 9. Admin Panel

**Location**: `/src/pages/AdminPage.jsx`

**Accessible**: Only to users with role='admin'

**Features**:
- **Users Tab**: List all users, toggle active status, view stats
- **Apps Tab**: CRUD for apps library
- **Settings Tab**: System configuration (bandwidth defaults, etc.)
- **Activity Tab**: View global activity log
- **Knowledge Tab**: Manage knowledge base articles

**Restricted Operations**:
- Only admins can create/edit/delete apps
- Only admins can manage users
- Only admins can modify knowledge base
- RLS policies enforce these restrictions at database level

### 10. App Library

**Location**: `/src/pages/AppLibraryPage.jsx`

**Data Structure** (apps table):
```javascript
{
  id, name, description, logo_url, shopify_url, pricing,
  status, features: ['feat1', 'feat2'],
  competitors: [{name, url}],
  reply_templates: [{category, template}],
  use_cases: ['usecase1', 'usecase2'],
  screenshots: ['url1', 'url2']
}
```

**Display**:
- Search/filter apps
- Show details with markdown rendering
- Link to Shopify app store
- Pricing info
- Features list
- Competitors comparison

**Usage in AI**: Templates auto-populated in reply suggestions

---

## Data Flow Patterns

### Inquiry Creation Flow

```
1. n8n scrapes Shopify Community post
   ↓
2. POST to /rest/v1/inquiries (Supabase webhook)
   {
     title, content, category, link,
     bandwidth_minutes: 240, priority: "normal"
   }
   ↓
3. Database trigger: set_inquiry_deadline()
   deadline_at = created_at + 240 minutes
   ↓
4. Auto-trigger (to be implemented): auto_assign_inquiry()
   assigned_to = assign_next_runner()
   ↓
5. Real-time update sent to all clients
   ↓
6. Assigned user sees it in InquiryDashboard
```

### Reply Flow

```
1. User views inquiry detail page
   ↓
2. Option A: User writes custom reply
   Option B: Clicks "Generate Replies" → AI suggestions
   ↓
3. User clicks "Mark as Replied"
   ↓
4. INSERT into replies table
   {
     inquiry_id, user_id, reply_text, replied_at: NOW()
   }
   ↓
5. RPC call: calculate_reply_score(inquiry_id, reply_id)
   - Calculates speed score based on timing
   - Sets quality score (default 5)
   - Updates reply with all scores
   ↓
6. RPC call: update_user_stats(user_id)
   - Sums total_score
   - Calculates avg_reply_time
   - Increments total_replied count
   ↓
7. Manual: Update inquiry status to 'replied'
   ↓
8. Activity log entry created
   ↓
9. Real-time updates propagate
   ↓
10. Leaderboard refreshes
    Dashboard stats update
```

### React Query Data Flow

```
Component needs data
   ↓
useQuery hook called
   ↓
queryKey checked in cache
   ↓
If fresh: return cached data instantly
If stale: return cached + refetch in background
If missing: fetch from server
   ↓
Model function calls Supabase
   ↓
Data returned and cached
   ↓
Component re-renders with new data
```

### Mutation Flow

```
User action (form submit)
   ↓
useMutation hook: mutationFn called
   ↓
Model function creates/updates data
   ↓
Optimistic update (optional)
   ↓
onSuccess callback
   - Toast notification
   - Invalidate related query keys
   - Redirect (if needed)
   ↓
Component re-renders with fresh data
```

---

## State Management

### Global State (Context)

**AuthContext** (`/src/contexts/AuthContext.jsx`):
- `user` - Supabase auth user object
- `userProfile` - User profile from database
- `loading` - Initial auth loading state
- `signIn(email, password)` - Login function
- `signOut()` - Logout function
- `isAdmin` - Computed boolean from role

### Server State (React Query)

All queries use TanStack React Query:

```javascript
// Queries
const inquiries = useInquiries(filters)
const stats = useInquiryStats(filters)
const users = useUsers()
const apps = useApps()
const leaderboard = useLeaderboard(limit)

// Mutations
const createInquiry = useCreateInquiry()
const updateInquiry = useUpdateInquiry()
const deleteInquiry = useDeleteInquiry()
const createReply = useCreateReply()
```

**Query Client Configuration**:
```javascript
const queryClient = new QueryClient();

// Defaults:
// - staleTime: 0 (immediate stale)
// - cacheTime: 5 minutes
// - retry: 1 (on failure)
```

### Local Component State

Used for:
- Form input values (with React Hook Form)
- UI toggles (modal open, sidebar collapsed)
- Temporary selections
- Loading/error states local to component

### Form State (React Hook Form)

Example from ReplyForm:
```javascript
const { register, handleSubmit, watch } = useForm({
  defaultValues: { replyText: '' }
});

const onSubmit = async (data) => {
  const reply = await repliesModel.create({
    inquiry_id: inquiryId,
    user_id: userProfile.id,
    reply_text: data.replyText
  });
};
```

---

## API Integration

### Supabase Client

**Location**: `/src/config/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

**Key Methods Used**:

1. **Query Building**:
```javascript
supabase
  .from('table_name')
  .select('column1, column2')
  .eq('filter', value)
  .order('created_at', { ascending: false })
  .limit(10)
```

2. **Mutations**:
```javascript
// Insert
.insert(data).select().single()

// Update
.update(updates).eq('id', id).select().single()

// Delete
.delete().eq('id', id)
```

3. **RPC Calls** (Stored Procedures):
```javascript
supabase.rpc('function_name', {
  p_param1: value1,
  p_param2: value2
})
```

4. **Real-time Subscriptions**:
```javascript
supabase
  .channel('channel_name')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'table_name'
  }, (payload) => {
    // Handle change
  })
  .subscribe()
```

5. **Auth Methods**:
```javascript
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signOut()
supabase.auth.getSession()
supabase.auth.onAuthStateChange(callback)
```

### N8N Integration

**Purpose**: Scrape Shopify Community and POST to Orbit

**Webhook URL**:
```
https://your-project.supabase.co/rest/v1/inquiries
```

**Headers**:
```
apikey: YOUR_ANON_KEY
Authorization: Bearer YOUR_ANON_KEY
Content-Type: application/json
```

**Payload**:
```json
{
  "title": "Customer question title",
  "content": "Full question text",
  "category": "Apps",
  "link": "https://community.shopify.com/c/...",
  "bandwidth_minutes": 240,
  "priority": "normal"
}
```

**Result**: Inquiry created, auto-assigned via trigger

### Replicate AI API

**Service**: `/src/services/replicate.js`

**Purpose**: Generate AI reply suggestions

**Usage**:
```javascript
const reply = await generateCompletion(prompt, {
  systemPrompt: "You are a helpful assistant...",
  temperature: 0.7
});
```

**Models**: Configurable (default: llama2-7b or equivalent)

**Cost**: Per-token billing on Replicate

---

## Authentication & Authorization

### Authentication Flow

```
1. User lands on / (public landing page)
2. Clicks "Login" → navigate to /login
3. Enters email + password
4. AuthContext.signIn() called
5. Supabase returns auth token
6. Token stored in browser (Supabase handles)
7. Fetch user profile from users table
8. Store in userProfile state
9. Redirect to /dashboard
```

### Session Persistence

- Supabase automatically restores session from localStorage on page reload
- AuthContext.useEffect checks session on mount
- Subscription to auth state changes catches login/logout

### Role-Based Access Control

**Roles**:
- `admin` - Full system access
- `runner` - Standard employee

**Admin-Only Pages**:
- `/admin` - Admin panel (checked in component)

**Conditional UI**:
```javascript
const { isAdmin } = useAuth();

{isAdmin && <AdminButton />}
```

**Database-Level RLS**:
- All admin operations protected by RLS policies
- `SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'`

### User Active Status

**Purpose**: Only assign to active runners

**Feature**: Admin can toggle `active` status in admin panel

**Query Filter**:
```javascript
.eq('active', true)  // Only include in assignment
```

---

## Important Patterns & Conventions

### 1. Naming Conventions

**Files**:
- Components: PascalCase (Button.jsx, InquiryDetail.jsx)
- Models: camelCase with descriptive names (inquiries.js)
- Hooks: camelCase with 'use' prefix (useInquiries.js)
- Utilities: camelCase (utils.js, helpers.js)

**Variables**:
- State: camelCase (const [userName, setUserName])
- Constants: UPPER_SNAKE_CASE (const MAX_RETRIES = 3)
- Functions: camelCase (const handleSubmit = ...)

**Database**:
- Tables: snake_case (users, inquiries, activity_log)
- Columns: snake_case (created_at, assigned_to)
- Functions: snake_case (assign_next_runner())

### 2. File Organization

- One component per file
- Related utilities grouped in same folder
- Index files for batch exports
- Co-locate constants near usage

### 3. Import Aliases

```javascript
// vite.config.js sets up alias
import { useAuth } from '@/contexts/AuthContext'
import { inquiriesModel } from '@/models'
// Instead of ../../../contexts/...
```

### 4. Error Handling

**Models**: Throw errors, let caller handle
```javascript
const { data, error } = await supabase.from('table').select()
if (error) throw error;
return data;
```

**Hooks**: Return error in query object
```javascript
const { data, error, isError } = useInquiries()
if (isError) return <ErrorComponent error={error} />
```

**Components**: Show toast notifications
```javascript
import { toast } from 'sonner'
toast.error('Failed to create inquiry')
```

### 5. Loading States

**Pattern**: Show skeleton while loading
```javascript
if (isLoading) return <DashboardSkeleton />
return <Dashboard data={data} />
```

**Component**: /components/ui/skeleton.jsx

### 6. Date/Time Utilities

**Location**: `/src/lib/utils.js`

```javascript
formatDate(date)              // "Nov 20, 2024 2:30 PM"
timeAgo(date)                 // "5 minutes ago"
calculateDeadline(date, mins) // Returns new Date
isOverdue(deadline)           // boolean
```

### 7. Class Name Utilities

```javascript
import { cn } from '@/lib/utils'

cn(
  'px-4 py-2',
  isActive && 'bg-blue-500',
  disabled && 'opacity-50'
)
// Merges Tailwind classes without duplicates
```

### 8. Component Props Pattern

```javascript
interface CardProps {
  title: string
  children: ReactNode
  variant?: 'default' | 'outline'
  className?: string
}

export function Card({ title, children, variant = 'default', className }) {
  return <div className={cn(baseStyles, variants[variant], className)} />
}
```

### 9. TypeScript (Optional)

Project is vanilla JavaScript but can be enhanced with TypeScript types.

### 10. Testing (Not Yet Implemented)

No test files currently, but structure allows for:
- Jest for unit tests
- React Testing Library for components
- Vitest for Vite integration

---

## Configuration Files

### `.env.example`
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### `vite.config.js`
- React plugin enabled
- @ alias for src/
- ESM module type

### `tailwind.config.js`
- Content paths for scanning
- Custom colors (finalapps-blue: #2563EB)
- Radix UI extends defaults

### `postcss.config.js`
- Autoprefixer for browser compatibility
- Tailwind CSS processing

### `eslint.config.js`
- Recommended rules
- React Hooks rules
- React Refresh rules

---

## Development Workflow

### 1. Adding a New Page

1. Create file in `/src/pages/NewPage.jsx`
2. Import in `App.jsx` routes
3. Add route definition

```javascript
import NewPage from './pages/NewPage';

// In App.jsx routes:
<Route path="/new" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
```

### 2. Adding a New Component

1. Create file in `/src/components/[category]/NewComponent.jsx`
2. Import and use in page/parent component

### 3. Adding a New Data Model

1. Create function in `/src/models/newentity.js`
2. Export from `/src/models/index.js`
3. Create hook in `/src/hooks/useNewEntity.js`
4. Export from `/src/hooks/index.js`
5. Use in components via hook

### 4. Adding a Query Parameter or Filter

1. Update model function to accept filter
2. Update hook queryKey to include filter
3. Pass filters from component

```javascript
// In component
const { data } = useInquiries({ status: 'replied' })

// In hook
export function useInquiries(filters = {}) {
  return useQuery({
    queryKey: ['inquiries', filters],  // Filter in key!
    queryFn: () => inquiriesModel.getAll(filters),
  });
}
```

### 5. Adding a Database Function

1. Write SQL function in SUPABASE_SCHEMA.sql
2. Test in Supabase SQL Editor
3. Call via supabase.rpc() in model
4. Wrap in mutation or service function

---

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**: Vite auto-splits at route boundaries
2. **Lazy Loading**: Routes are lazy-loaded by React Router
3. **React Query Caching**: Automatic caching prevents refetches
4. **Real-time Selective**: Only inquiries and activity tables subscribed
5. **Indexes**: Database indexes on frequently queried columns
6. **RLS**: Enforced at database level (no extra filtering needed)

### Known Bottlenecks

1. **Large Dataset Pagination**: Not yet implemented
   - Solution: Add pagination to models and components

2. **AI Generation Latency**: Replicate API calls can be slow
   - Solution: Show loading state, allow cancellation

3. **Real-time Subscriptions**: Can be expensive at scale
   - Solution: Subscribe selectively, unsubscribe when not viewing

---

## Security Considerations

### 1. Row-Level Security (RLS)
- **All tables protected** with database-level policies
- Users can only see/modify own data (with exceptions)
- Admins have full access
- Enforced at database level - can't bypass from frontend

### 2. Environment Variables
- **Never commit** `.env` file
- Prefix with `VITE_` to expose to frontend
- Supabase anon key safe to expose (only ANON operations)
- Service role key never in frontend code

### 3. Authentication
- **Supabase handles** password hashing, JWT tokens
- Sessions stored securely in localStorage
- HTTPS required for Supabase in production
- Automatic CSRF protection from Supabase

### 4. API Rate Limiting
- **Supabase free tier**: 500 req/sec limit
- Real-time subscriptions count against this
- In production, monitor and consider upgrade

### 5. XSS Protection
- **React escapes** all string values by default
- Markdown rendered with react-markdown (be careful with user input)
- Never use `dangerouslySetInnerHTML` without sanitization

---

## Deployment

### Prerequisites
- Production Supabase project
- Supabase schema deployed
- Environment variables configured
- Domain (optional)

### Hosting Options
- **Vercel** (recommended, free tier available)
- **Netlify** (free tier available)
- **Cloudflare Pages** (free tier available)
- Any static hosting (Render, Railway, etc.)

### Build & Deploy
```bash
npm run build    # Creates dist/
# Deploy dist/ folder to hosting
```

### Post-Deployment
- Test full workflow
- Configure email templates in Supabase Auth
- Set up monitoring/logging
- Document for team
- Schedule escalation cron job (Supabase Edge Function)

---

## Troubleshooting

### Common Issues

**Login not working**
- Check user exists in both Supabase Auth AND users table
- Verify UUID matches exactly
- Check email matches

**No inquiries showing**
- Verify user is active: true
- Check RLS policies applied correctly
- Try creating test inquiry manually

**AI replies not generating**
- Check Replicate API key configured
- Verify API rate limits not exceeded
- Check Replicate model availability

**Real-time not updating**
- Verify Supabase real-time enabled
- Check WebSocket connection in browser DevTools
- Try hard refresh of page

---

## Future Enhancements

From IMPLEMENTATION_NOTES.md:

1. **Auto-Assignment Trigger** - Auto-assign on inquiry creation
2. **Escalation Cron Job** - Run every 15 minutes via Supabase Edge Function
3. **App Detail Pages** - Full documentation pages for each app
4. **Notifications** - Slack webhooks, email, in-app badges
5. **Manual Quality Adjustment** - Admin ability to adjust quality scores
6. **Category Auto-Detection** - AI-powered categorization
7. **Pagination** - For large datasets (100+ inquiries)
8. **Sentiment Analysis** - Track positive/negative responses
9. **Install Tracking** - Webhook integration with Shopify
10. **Gamification** - Badges, achievements, streaks

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run lint            # Check code quality

# Building
npm run build           # Production build
npm run preview         # Preview build locally

# Supabase
# (Use CLI for advanced operations)
npm install -g supabase-cli
supabase login
supabase projects list
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `SUPABASE_SCHEMA.sql` | Complete database schema |
| `src/App.jsx` | Main app routing |
| `src/contexts/AuthContext.jsx` | Authentication state |
| `src/models/*` | Data access layer |
| `src/hooks/*` | React Query integration |
| `src/pages/*` | Route components |
| `src/components/ui/*` | Reusable UI components |
| `src/services/aiReply.js` | AI reply generation |
| `.env` | Environment configuration |
| `vite.config.js` | Build configuration |

---

## Contact & Support

For questions about the codebase, refer to:
1. IMPLEMENTATION_NOTES.md - Technical deep dives
2. SETUP_GUIDE.md - Setup troubleshooting
3. README.md - Feature documentation
4. Code comments - Implementation details

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Status**: Active
**Maintainer**: FinalApps Development Team
