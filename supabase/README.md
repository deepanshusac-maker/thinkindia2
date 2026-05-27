# Think India Bihar — Supabase Setup Guide

This directory contains SQL migrations to set up your Supabase project.

## Quick Start

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) → New Project → create your project.

### 2. Run the Migrations

Open the **SQL Editor** in your Supabase dashboard and run these scripts **in order**:

1. **`migrations/001_initial_schema.sql`** — Creates `institutes` and `content` tables with RLS policies.
2. **`migrations/002_storage_bucket.sql`** — Creates the `institute-assets` storage bucket with policies.
3. *(Optional)* **`seed.sql`** — Inserts sample data for testing.

### 3. Create an Admin User

In the Supabase Dashboard → Authentication → Users → **Add User**:
- Email: `admin@thinkindia.org` (or your preferred email)
- Password: your choice
- Auto-confirm: ✅ Yes

This user will be able to sign in via `/admin/login` and manage content.

### 4. Set Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Find your keys in: Supabase Dashboard → Settings → API.

## Database Schema

### `institutes` table
| Column      | Type        | Description                     |
|-------------|-------------|---------------------------------|
| id          | UUID (PK)   | Auto-generated                  |
| name        | TEXT         | Institute name                  |
| slug        | TEXT (UNIQUE)| URL-friendly identifier         |
| about_text  | TEXT         | Description/about section       |
| created_at  | TIMESTAMPTZ | Auto-set on insert              |
| updated_at  | TIMESTAMPTZ | Auto-updated on change          |

### `content` table
| Column        | Type          | Description                        |
|---------------|---------------|------------------------------------|
| id            | UUID (PK)     | Auto-generated                     |
| institute_id  | UUID (FK)     | Links to `institutes.id`           |
| type          | ENUM          | `'team'` / `'event'` / `'gallery'` |
| title         | TEXT          | Content title                      |
| description   | TEXT          | Optional description               |
| image_url     | TEXT          | URL or storage path to image       |
| metadata      | JSONB         | Flexible extra data (dates, etc.)  |
| sort_order    | INTEGER       | Display ordering                   |
| created_at    | TIMESTAMPTZ   | Auto-set on insert                 |
| updated_at    | TIMESTAMPTZ   | Auto-updated on change             |

### Storage Bucket: `institute-assets`
- **Public**: Yes (anyone can view images)
- **Max file size**: 5 MB
- **Allowed types**: JPEG, PNG, WebP, GIF, SVG
- **Write access**: Authenticated users only
