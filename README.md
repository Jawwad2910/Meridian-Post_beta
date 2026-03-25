# Meridian Post v2 — Complete Edition

**Founded & Edited by J. Asghar**

## Setup — Run this SQL in Supabase first

Go to your Supabase SQL Editor and run:

```sql
-- Add new columns to existing articles table
alter table articles add column if not exists is_draft boolean default false;
alter table articles add column if not exists views integer default 0;
alter table articles add column if not exists scheduled_at timestamptz;

-- Update existing articles to not be drafts
update articles set is_draft = false where is_draft is null;
update articles set views = 0 where views is null;
```

## Files
- `index.html` — Homepage with live news, featured, trending, country spotlight
- `geopolitics.html` — Geopolitics section
- `world-politics.html` — World Politics section
- `markets.html` — Markets section with live prices
- `technology.html` — Technology section
- `news-article.html` — Live news article page (opens source)
- `article.html` — Published article page (from Supabase)
- `admin.html` — Admin panel (password protected)
- `style.css` — Complete stylesheet
- `app.js` — Complete shared logic

## Features
- Live news from BBC, Al Jazeera, Reuters
- Supabase articles visible globally
- Password: Haider@123 (for + button and admin panel)
- Admin panel: write, edit, delete, drafts, breaking news, view counts
- Dark/light theme, world clock, currency converter, share buttons
- Reading progress bar, back to top, breadcrumbs, search
