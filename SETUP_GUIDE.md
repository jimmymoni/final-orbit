# FinalApps Orbit - Quick Setup Guide

## Step-by-Step Setup (15 minutes)

### 1. Supabase Setup (5 minutes)

1. Go to https://supabase.com and create a free account
2. Click "New Project"
3. Fill in:
   - Project Name: `finalapps-orbit`
   - Database Password: (generate a strong password and save it)
   - Region: Choose closest to you
4. Wait 2-3 minutes for project to initialize

### 2. Get Supabase Credentials (1 minute)

1. Once project is ready, go to Project Settings > API
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 3. Configure Environment Variables (1 minute)

1. In the project folder, create `.env` file:

```bash
cp .env.example .env
```

2. Open `.env` and paste your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Create Database Schema (3 minutes)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `SUPABASE_SCHEMA.sql` from the project folder
4. Copy ALL the contents (it's long - make sure you get everything)
5. Paste into SQL Editor
6. Click **Run** (bottom right)
7. Wait for "Success. No rows returned" message

This creates:
- 6 tables (users, inquiries, replies, apps, knowledge_base, activity_log)
- All functions (round-robin, scoring, escalation, stats)
- All triggers
- All indexes
- Row Level Security policies

### 5. Create Admin User (3 minutes)

#### 5.1 Create Auth User

1. In Supabase Dashboard, go to **Authentication** > **Users**
2. Click **Add User** > **Create new user**
3. Fill in:
   - Email: `admin@finalapps.com` (or your email)
   - Password: Create a strong password
   - Auto Confirm: **YES** (check this)
4. Click **Create User**
5. **IMPORTANT**: Copy the **UUID** shown in the users table (looks like `123e4567-e89b-12d3-a456-426614174000`)

#### 5.2 Add User to Database

1. Go to **Table Editor** > **users** table
2. Click **Insert** > **Insert row**
3. Fill in:
   - `id`: Paste the UUID you copied above
   - `email`: Same email you used in auth (e.g., `admin@finalapps.com`)
   - `name`: `Admin User`
   - `role`: `admin`
   - `active`: `true`
4. Click **Save**

### 6. Start the Application (2 minutes)

```bash
npm run dev
```

The app should open at http://localhost:5173

### 7. Login and Test

1. Go to http://localhost:5173
2. Click **Login to Continue**
3. Enter your admin credentials
4. You should see the Dashboard

## Adding More Team Members

### For Each New User:

1. **Supabase Auth**: Add user in Authentication > Users
2. **Database**: Insert into `users` table:

```sql
INSERT INTO users (id, email, name, role, active)
VALUES (
  'auth-user-uuid-here',
  'employee@finalapps.com',
  'Employee Name',
  'runner',  -- Use 'runner' for regular employees, 'admin' for admins
  true
);
```

## Adding Your First App

Go to Admin Panel > Apps, or run:

```sql
INSERT INTO apps (name, description, shopify_url, pricing, status)
VALUES (
  'Sample App',
  'This is a sample Shopify app for testing',
  'https://apps.shopify.com/your-app',
  'Free',
  'active'
);
```

## Testing the Full Workflow

### Create a Test Inquiry Manually

```sql
INSERT INTO inquiries (title, content, category, link, bandwidth_minutes, priority)
VALUES (
  'Test Inquiry',
  'This is a test post from Shopify Community',
  'Apps',
  'https://community.shopify.com/test',
  240,
  'normal'
);
```

The inquiry will be automatically assigned to your admin user via round-robin.

### Test the Reply Flow

1. Go to Dashboard
2. Click on the test inquiry
3. Write a reply in the text area
4. Click "Mark as Replied"
5. Check Stats page to see your score

## n8n Webhook Setup (Optional)

Once everything works, connect your n8n scraper:

1. **Method**: POST
2. **URL**: `https://your-project.supabase.co/rest/v1/inquiries`
3. **Headers**:
```
apikey: your-anon-key
Authorization: Bearer your-anon-key
Content-Type: application/json
Prefer: return=minimal
```
4. **Body**:
```json
{
  "title": "{{ $json.title }}",
  "content": "{{ $json.content }}",
  "category": "Apps",
  "link": "{{ $json.url }}",
  "bandwidth_minutes": 240,
  "priority": "normal"
}
```

The system will automatically:
- Assign to next available employee
- Set deadline
- Send real-time notification
- Track everything

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists
- Check that values don't have quotes around them
- Restart dev server after creating `.env`

### "User not found" after login
- Make sure you added the user to the `users` table
- Check that the UUID matches exactly with auth user

### "Function assign_next_runner does not exist"
- Run the full `SUPABASE_SCHEMA.sql` again
- Make sure you ran the entire file, not just parts

### Can't see inquiries
- Check that user `active` is `true` in database
- Make sure you're logged in with correct credentials

## Production Deployment

```bash
npm run build
```

Upload `dist/` folder to:
- **Vercel**: Connect GitHub repo, auto-deploy
- **Netlify**: Drag and drop `dist` folder
- **Cloudflare Pages**: Connect repo or upload

Don't forget to add environment variables in your hosting platform settings.

## Next Steps

1. Invite your team members
2. Document your apps in the App Library
3. Connect n8n scraper
4. Monitor performance in Stats Dashboard
5. Adjust bandwidth and scoring in Admin Panel

## Support

Contact FinalApps development team for issues.
