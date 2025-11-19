# FinalApps Orbit - Quick Start

## 5-Minute Setup

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Database Schema
- Open Supabase Dashboard → SQL Editor
- Copy/paste `SUPABASE_SCHEMA.sql`
- Click Run

### 4. Create Admin User

**In Supabase Auth:**
- Add user: `admin@finalapps.com`
- Copy the user's UUID

**In Supabase Table Editor (users table):**
```sql
INSERT INTO users (id, email, name, role, active)
VALUES ('paste-uuid-here', 'admin@finalapps.com', 'Admin', 'admin', true);
```

### 5. Start App
```bash
npm run dev
```

Visit http://localhost:5173 and login!

---

## Key Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Project URLs

- **Landing**: http://localhost:5173
- **Login**: http://localhost:5173/login
- **Dashboard**: http://localhost:5173/dashboard
- **Apps**: http://localhost:5173/apps
- **Stats**: http://localhost:5173/stats
- **Admin**: http://localhost:5173/admin

---

## Important Files

- `SUPABASE_SCHEMA.sql` - Complete database setup
- `SETUP_GUIDE.md` - Detailed setup instructions
- `README.md` - Full documentation
- `IMPLEMENTATION_NOTES.md` - Technical details
- `.env.example` - Environment variables template

---

## Supabase Functions

```sql
assign_next_runner()                    -- Round-robin assignment
calculate_reply_score(inquiry, reply)   -- Score calculation
update_user_stats(user_id)              -- Update user stats
escalate_inquiry(inquiry_id)            -- Escalate overdue
```

---

## Default Values

- **Bandwidth**: 240 minutes (4 hours)
- **Priority**: normal
- **Status**: assigned
- **Quality Score**: 5 points

---

## n8n Webhook

**URL**: `https://your-project.supabase.co/rest/v1/inquiries`

**Headers**:
```
apikey: your-anon-key
Authorization: Bearer your-anon-key
Content-Type: application/json
```

**Body**:
```json
{
  "title": "Post title",
  "content": "Post content",
  "category": "Apps",
  "link": "https://community.shopify.com/...",
  "bandwidth_minutes": 240,
  "priority": "normal"
}
```

---

## User Roles

- **admin**: Full access, can manage users and apps
- **runner**: Standard employee, can reply to inquiries

---

## Scoring System

**Speed Score** (0-10):
- 0-15 min: 10 pts
- 15-60 min: 8 pts
- 1-4 hrs: 6 pts
- 4-12 hrs: 4 pts
- 12-24 hrs: 2 pts
- 24+ hrs: 0 pts

**Quality**: 5 pts (default)
**Outcome**: 0-10 pts (merchant interaction)

---

## Troubleshooting

**Can't login?**
- Check user exists in both Auth and users table
- Verify UUID matches exactly

**No inquiries showing?**
- Check user is `active: true`
- Verify RLS policies ran correctly

**Server won't start?**
- Delete node_modules and reinstall
- Check .env file exists and is valid

---

## Support

See `SETUP_GUIDE.md` for detailed troubleshooting
See `README.md` for complete documentation
See `IMPLEMENTATION_NOTES.md` for technical details

---

Built with React + Vite + Supabase + Tailwind CSS
