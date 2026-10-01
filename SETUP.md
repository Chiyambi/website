# EPH-B.com — Setup Guide

This guide walks you through setting up the full content management system with Supabase and deploying to Vercel.

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up / log in
2. Click **"New Project"**
3. Name it `ephb-construction` (or any name)
4. Set a database password (save this!)
5. Choose a region closest to you (e.g., `Southeast Asia` or `Africa`)
6. Click **"Create new project"** — wait ~2 minutes for it to provision

---

## Step 2: Run the Database Schema

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Confirm you are in the same Supabase project configured in `js/config.js` (the project URL must match)
4. Open the file `supabase/schema.sql` from this project
5. Copy the **entire contents** and paste into the SQL editor
6. Click **"Run"** (or press `Ctrl+Enter`)
7. You should see "Success" — this creates all tables, indexes, policies, and seed data
8. Run `supabase/harden-admin-policies.sql` in the SQL editor to apply the admin-only write policies to this project

For an existing project, run `supabase/harden-admin-policies.sql` directly; do not rerun the seed-data schema.

---

## Step 3: Create Storage Buckets

The schema SQL already creates the storage buckets, but verify:

1. Go to **"Storage"** in the left sidebar
2. You should see these buckets (all public):
   - `project-images`
   - `project-videos`
   - `hero-images`
   - `general`
3. If any are missing, create them manually with **"New Bucket"** and make them **public**

---

## Step 4: Create an Admin User

1. Go to **"Authentication"** in the left sidebar
2. Click **"Users"** → **"Add User"** → **"Create New User"**
3. Enter:
   - **Email:** your admin email (e.g., `admin@ephb-construction.com`)
   - **Password:** a strong password
   - Check **"Auto Confirm User"**
4. Click **"Create User"**
5. **Save these credentials** — you'll use them to log into the admin panel
6. In Supabase SQL Editor, assign the trusted admin claim to that account (replace the email):

```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
WHERE email = 'admin@example.com';
```

Sign out of the admin panel and sign in again so the new claim is included in the session token. Only assign this claim to trusted administrators.

---

## Step 5: Get Your Supabase Credentials

1. Go to **"Project Settings"** (gear icon at bottom left)
2. Click **"API"**
3. Copy these two values:
   - **Project URL** (looks like `https://xyzcompany.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
4. Open `js/config.js` in this project
5. Replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://xyzcompany.supabase.co';  // Your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOi...';               // Your anon public key
```

---

## Step 6: Test Locally

1. Open `index.html` in your browser
2. The site should load with content from Supabase
3. Open `admin.html` in your browser
4. Log in with the admin user you created in Step 4
5. Try adding a project, editing hero slides, etc.

---

## Step 7: Deploy to Vercel

### Option A: Using Vercel CLI (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from the project directory)
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: ephb-construction
# - In which directory is your code? ./
# - Want to override settings? No
```

### Option B: Using Vercel Dashboard

1. Go to [https://vercel.com](https://vercel.com) and sign up / log in
2. Click **"Add New"** → **"Project"**
3. Import your Git repository (push this project to GitHub/GitLab first)
4. Or drag-and-drop the project folder
5. Click **"Deploy"**

### After Deployment

1. Your site will be live at `https://your-project.vercel.app`
2. The admin panel will be at `https://your-project.vercel.app/admin.html`
3. **Important:** Go to your Supabase project → **Authentication** → **URL Configuration**
4. Add your Vercel URL to **"Site URL"** and **"Redirect URLs"**
5. This ensures login redirects work correctly on the live site

## Security

- The service-role key must never be placed in browser code. It bypasses row-level security.
- The previously exposed service-role key must be rotated in Supabase immediately. Keep only the anon/public key in `js/config.js`.
- Content and storage writes require `app_metadata.role = 'admin'`; ordinary authenticated users cannot manage site content.
- Auth user creation, listing, and deletion require a secure server-side endpoint. Until one is configured, manage admin accounts in the Supabase dashboard; the admin panel's Users tab is unavailable.

---

## Step 8: Set Up a Custom Domain (Optional)

1. In Vercel, go to your project → **Settings** → **Domains**
2. Add your domain (e.g., `ephb-construction.com`)
3. Update your DNS records as instructed by Vercel
4. In Supabase, update the **Site URL** and **Redirect URLs** to use your custom domain

---

## File Structure

```
EPH-B.com/
├── index.html              # Main website (loads dynamic content)
├── style.css               # Website styles
├── script.js               # Website interactions (slider, animations)
├── admin.html              # Admin panel (content management)
├── admin.css               # Admin panel styles
├── admin.js                # Admin panel logic
├── logo.jpg                # Company logo
├── banner1-3.jpg           # Fallback hero images
├── project1-6.jpg          # Fallback project images
├── js/
│   ├── config.js           # Supabase credentials (EDIT THIS)
│   ├── api.js              # Supabase API layer
│   └── dynamic-content.js  # Fetches & renders content from Supabase
├── supabase/
│   └── schema.sql          # Database schema (run in Supabase SQL editor)
└── SETUP.md                # This file
```

---

## Admin Panel Features

| Section | What You Can Do |
|---------|----------------|
| **Overview** | See counts of all content, quick action buttons |
| **Hero Slides** | Add/edit/delete hero slider images with headlines & CTAs |
| **Projects** | Add/edit/delete projects with images, videos, categories, descriptions |
| **Services** | Add/edit/delete services with icons, descriptions, feature lists |
| **Stats** | Edit the animated counters (50+ Projects, 4+ Years, etc.) |
| **About** | Edit the about section heading, paragraph, image, and features |
| **Contact** | Update phone numbers, email, WhatsApp, location, social links |
| **Settings** | Change site name, tagline, footer credit |

---

## How It Works

```
┌─────────────────────────────────────────────────────┐
│                    Your Website                      │
│  index.html → dynamic-content.js → api.js           │
│         ↓                                            │
│  Fetches data from Supabase                         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                  Supabase Cloud                      │
│  ┌─────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Database   │  │  Storage │  │    Auth       │  │
│  │  (Postgres) │  │  (Files) │  │  (Admin Login)│  │
│  └─────────────┘  └──────────┘  └───────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                  Admin Panel                         │
│  admin.html → admin.js → api.js                     │
│  Login → Manage all content → Saved to Supabase     │
└─────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### "Could not find the table ... in the schema cache"
- Check that the Supabase project URL in `js/config.js` matches the project open in the dashboard
- Run `supabase/schema.sql` in that project's SQL Editor, then run `supabase/harden-admin-policies.sql`
- Refresh the admin page after the SQL completes; Supabase may take a short time to refresh its schema cache

### "Supabase not initialized" error
- Make sure you've edited `js/config.js` with your actual Supabase URL and key
- Check that the Supabase CDN script loads (check browser console for network errors)

### Admin login doesn't work
- Verify the user was created in Supabase Authentication → Users
- Make sure "Auto Confirm User" was checked
- Check that your Supabase URL and anon key are correct in `js/config.js`

### Images not loading
- Verify storage buckets exist and are public
- Check that the `project-images`, `project-videos`, `hero-images`, and `general` buckets exist
- Make sure storage policies allow public read access

### Changes not showing on the main site
- The main site caches data on load — try a hard refresh (`Ctrl+Shift+R`)
- Check browser console for API errors
- Verify RLS policies allow public read access

### CORS errors on Vercel
- Go to Supabase → Authentication → URL Configuration
- Add your Vercel domain to "Site URL" and "Redirect URLs"
- Also add it to "CORS" in Supabase → Settings → API

---

## Next Steps / Ideas

- **Add a blog section** — create a `blog_posts` table and admin tab
- **Add testimonials** — create a `testimonials` table with client reviews
- **Add a contact form** — store form submissions in a `contact_messages` table
- **Add image galleries per project** — create a `project_images` table with foreign key to projects
- **Add SEO meta tags** — dynamically set meta tags from site settings
- **Add multi-language support** — store translations in a `translations` table

---

## Support

- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Vercel Docs: [https://vercel.com/docs](https://vercel.com/docs)
- Font Awesome Icons: [https://fontawesome.com/icons](https://fontawesome.com/icons)
