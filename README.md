# SEIS Website — Swimming Eagles Invitational Series

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. **Name:** `seis-website`
3. **Region:** Central EU (Frankfurt)
4. **Plan:** Free
5. Wait for provisioning (~2 min)

### 2. Run Database Migration
1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy the entire contents of `database/seis_migration.sql`
4. Click **Run**
5. Verify: Check **Table Editor** — you should see 9 tables with seed data

### 3. Create Admin Users
1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User** → **Create New User**
3. Enter email and password for each admin (2–3 users)

### 4. Get Supabase Credentials
1. Go to **Settings** → **API** in Supabase Dashboard
2. Copy **Project URL** and **anon public** key
3. Create `.env` file in project root:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Install & Run Locally
```bash
npm install
npm run dev
```
- Public site: http://localhost:5173
- Admin panel: http://localhost:5173/admin

### 6. Deploy to Vercel
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy
5. Your site will be at: `swimming-eagles-series.vercel.app`

## Project Structure
```
src/
├── lib/                    # Supabase client, contexts, hooks
├── components/
│   ├── public/             # Navbar, Footer, PageHeader, SeasonToggle
│   └── admin/              # AdminLayout, AdminNav
├── pages/
│   ├── public/             # 11 public pages + 404
│   └── admin/              # 12 admin pages (login + 11 sections)
├── styles/                 # Tailwind + custom CSS
├── App.jsx                 # Router
└── main.jsx                # Entry point
```

## Tech Stack
- React 18 + Vite
- Tailwind CSS 3
- Supabase (PostgreSQL + Auth)
- Vercel (hosting)
- Google Drive (images, logos, PDFs)

## Admin Panel
Access at `/admin` — email/password login required.
- **Dashboard** — overview, quick actions
- **Settings** — site title, badges, fee, emails
- **Seasons** — manage Fall/Spring, set active
- **Pages** — toggle visibility, edit metadata
- **Content** — edit text blocks per page
- **Events** — full event order table
- **Scoring** — point tables
- **Media** — Google Drive URLs for images/logos
- **Programs** — psych sheets, heat sheets, entry files
- **Fees** — bank details, payment info
- **Integrations** — results URL, stream URL, form URLs
