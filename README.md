# Meridian Post v3 — Complete Edition
# Founded & Edited by J. Asghar

## IMPORTANT — Run this SQL in Supabase FIRST

Go to: https://supabase.com/dashboard/project/fioilphrakfblmvcseef/sql/new

Paste and run:

```sql
alter table articles add column if not exists is_draft boolean default false;
alter table articles add column if not exists views integer default 0;
alter table articles add column if not exists scheduled_at timestamptz;
update articles set is_draft = false where is_draft is null;
update articles set views = 0 where views is null;
```

## Files (11 total)
- index.html
- geopolitics.html
- world-politics.html
- markets.html
- technology.html
- news-article.html
- article.html
- admin.html
- style.css
- app.js
- README.md

## How to update GitHub
1. Go to github.com/jawwad2910/Who
2. Click "Add file" → "Upload files"
3. Drag all 11 files
4. Click "Commit changes"
5. Wait 1-2 minutes → site updates live

## Passwords
- Editor (+ button): Haider@123
- Admin panel: same password

## Supabase
- URL: https://fioilphrakfblmvcseef.supabase.co
- Table: articles
