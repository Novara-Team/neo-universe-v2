# AI Universe Admin Guide

## Admin Panel Access

**URL:** `/adminpn`
**Password:** `20102010`

## Database Information

Your website is connected to your Supabase database:
- **URL:** https://vsvikhbjtoweounasjxk.supabase.co
- All data is stored in your Supabase instance
- RLS (Row Level Security) is enabled for data protection

## How It Works

### Admin Panel Features

1. **Dashboard** (`/adminpn/dashboard`)
   - View total tools, reviews, visits
   - See most popular tool
   - Quick links to all admin sections

2. **Manage Tools** (`/adminpn/tools`)
   - ✅ Add new AI tools
   - ✅ Edit existing tools
   - ✅ Delete tools
   - ✅ Toggle featured status
   - ✅ Set categories, pricing, ratings
   - **Changes appear immediately on the website**

3. **AI News Manager** (`/adminpn/news`)
   - ✅ Add news articles
   - ✅ Edit/delete news
   - ✅ Feature news on homepage
   - **Changes appear immediately on the website**

4. **Reviews & Comments** (`/adminpn/reviews`)
   - ✅ View all reviews
   - ✅ Approve/reject reviews
   - ✅ Delete reviews
   - **Only approved reviews show on website**

5. **Submitted Tools** (`/adminpn/submissions`)
   - ✅ View user submissions
   - ✅ Approve submissions (auto-creates tool)
   - ✅ Reject submissions
   - **Approved submissions become published tools**

## Testing the Admin Panel

### Test 1: Add a New Tool
1. Go to `/adminpn` and login with password: `20102010`
2. Click "Manage Tools"
3. Click "Add New Tool"
4. Fill in the form:
   - Name: "Test Tool"
   - Category: Writing
   - Description: "This is a test tool"
   - Website URL: https://example.com
   - Pricing: Free
   - Status: Published
5. Click "Add Tool"
6. Go back to homepage - you should see the new tool!

### Test 2: Feature a Tool
1. In "Manage Tools", click Edit on any tool
2. Check the "Featured Tool" checkbox
3. Click "Update Tool"
4. Go to homepage - tool appears in Featured section!

### Test 3: Add News
1. Click "AI News" in admin sidebar
2. Click "Add News"
3. Fill in title, description, source URL
4. Check "Featured on Homepage"
5. Click "Add News"
6. Go to homepage - news appears in Latest AI News!

### Test 4: Approve a Submission
1. Go to `/submit` (public page)
2. Submit a test tool
3. Go to admin panel → "Submitted Tools"
4. Click "Approve" on the submission
5. It automatically creates a published tool!

## Important Notes

✅ **All changes are REAL-TIME** - no need to refresh the page
✅ **Data persists** - stored in your Supabase database
✅ **RLS Enabled** - data is protected with security policies
✅ **Public read, Admin write** - visitors can see published content, only admins can modify

## Database Tables

Your Supabase has these tables:
- `categories` - AI tool categories (Writing, Image, Video, etc.)
- `ai_tools` - Main tools database
- `ai_news` - News articles
- `tool_reviews` - User reviews
- `tool_submissions` - User-submitted tools
- `site_analytics` - Visit tracking
- `admin_users` - Admin credentials (not currently used)

## Security

- Admin panel uses client-side password protection
- Database uses Row Level Security (RLS)
- All data operations go through Supabase
- Environment variables stored in `.env`

## Troubleshooting

**Problem:** Changes don't appear on website
- **Solution:** Check the tool/news status is "Published"
- **Solution:** Check RLS policies in Supabase dashboard
- **Solution:** Clear browser cache and refresh

**Problem:** Can't login to admin panel
- **Solution:** Password is `20102010` (eight digits)
- **Solution:** Clear browser session storage

**Problem:** Can't save changes
- **Solution:** Check Supabase connection in `.env`
- **Solution:** Check RLS policies allow writes

## Next Steps

To make this production-ready:
1. Change admin password in `/src/lib/auth.ts`
2. Consider implementing proper Supabase Auth
3. Add user roles and permissions
4. Set up backup automation
5. Monitor RLS policies for security
