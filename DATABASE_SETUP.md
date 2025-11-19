# FinalApps Orbit - Database Setup Guide

## Step 1: Run the Database Schema

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/hojodntyhijvsjrfplxz

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy the Schema**
   - Open the file: `SUPABASE_SCHEMA.sql` in this project
   - Select ALL the contents (Cmd+A)
   - Copy it (Cmd+C)

4. **Paste and Run**
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd+Enter)
   - Wait for "Success. No rows returned" message

This creates:
- ✅ 6 database tables (users, inquiries, replies, apps, knowledge_base, activity_log)
- ✅ All database functions (round-robin, scoring, escalation, stats)
- ✅ All triggers and indexes
- ✅ Row Level Security policies

---

## Step 2: Add Auto-Assignment Trigger

After running the main schema, run this additional SQL:

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

This ensures new inquiries are automatically assigned to team members.

---

## Step 3: Create Your Admin User

### 3.1 Create Auth User

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **"Add User"** → **"Create new user"**
3. Fill in:
   - **Email**: your-email@finalapps.com (use your actual email)
   - **Password**: (create a strong password)
   - **Auto Confirm User**: ✅ CHECK THIS BOX
4. Click **"Create User"**
5. **IMPORTANT**: Copy the UUID shown in the users list (looks like `123e4567-e89b-12d3-a456-426614174000`)

### 3.2 Add User to Database

1. Go to **Table Editor** → **users** table
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   - `id`: Paste the UUID you copied above
   - `email`: Same email you used in step 3.1
   - `name`: Your name (e.g., "Admin User")
   - `role`: `admin`
   - `active`: `true`
4. Click **"Save"**

---

## Step 4: Restart Dev Server

The dev server needs to restart to pick up the new .env file:

1. Stop the current dev server (press Ctrl+C in terminal)
2. Restart it:
   ```bash
   npm run dev
   ```

---

## Step 5: Test Login

1. Open http://localhost:5173 (or whatever port is shown)
2. Click **"Get Started"** or **"Login to Continue"**
3. Enter your email and password from Step 3.1
4. You should see the Dashboard!

---

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Restart dev server after creating `.env`

### "User not found" after login
- Make sure you inserted the user in the `users` table (Step 3.2)
- Verify the UUID matches exactly between Auth and users table

### "Invalid credentials"
- Double-check email and password
- Make sure you checked "Auto Confirm User" when creating auth user

### Can't see any data in dashboard
- Make sure user's `active` field is `true`
- Make sure `role` is set to `admin` or `runner`

---

## What's Next?

After successful login, you can:
- ✅ Create test inquiries
- ✅ Add more team members
- ✅ Document your apps
- ✅ Connect n8n webhook
- ✅ Deploy to production

See `README.md` for full documentation.
