# Deployment Guide - AGM Housekeeping Forecast System

## Overview

This guide covers deploying the AGM Housekeeping Forecast system to production on Vercel with Supabase database integration.

---

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Prerequisites
- GitHub account with repository access
- Vercel account (free tier works)
- Supabase project already created

### Steps

1. **Go to Vercel Dashboard**
   - Navigate to https://vercel.com/dashboard
   - Click "New Project"

2. **Import Git Repository**
   - Select "Import Git Repository"
   - Connect your GitHub account
   - Select `mbenitez1797/mbenitez1797-mcocw-CHECKLISTS` repository
   - Click "Import"

3. **Configure Project Settings**
   - **Project Name**: `agm-housekeeping-forecast` (or your preference)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `.` (current directory)

4. **Set Environment Variables**
   - Add these variables in the "Environment Variables" section:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Access your live application

---

## Option 2: Deploy via Vercel CLI

### Prerequisites
- Node.js 18+ and pnpm installed
- Vercel CLI: `npm i -g vercel`

### Steps

```bash
# 1. Navigate to project directory
cd /vercel/share/v0-project

# 2. Link project to Vercel
vercel link --scope team_tIrsUAYRZjLWw626d1UAq9r7

# 3. Create .env.local with Supabase credentials
echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" > .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env.local

# 4. Deploy to production
vercel --prod
```

---

## Option 3: Manual Git Push (CI/CD)

If your repository has CI/CD configured:

```bash
# 1. Commit changes
git add .
git commit -m "AGM Housekeeping Forecast System - Production Ready"

# 2. Push to main branch
git push origin v0/inventory-number-mapping-08339221

# 3. Create pull request to main
# 4. Merge when tests pass
# 5. Vercel auto-deploys on merge
```

---

## Environment Variables Setup

### In Vercel Dashboard

1. Go to Project Settings → Environment Variables
2. Add these variables:

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |

### Get Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon (public) key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Testing Environment Variables

After deployment:
```bash
curl https://your-vercel-url.vercel.app/api/forecasts
```

Should return JSON (not error about missing env vars).

---

## Database Setup for Production

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Choose your organization, project name, database password, region
4. Click "Create new project"
5. Wait 2-3 minutes for setup

### Step 2: Apply Database Schema

Once Supabase is set up, the schema is already created (from earlier migration). Verify:

```bash
# In Supabase dashboard, go to SQL Editor
# Run this to verify tables exist:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should return:
- `room_types`
- `housekeeping_forecasts`
- `upload_logs`

### Step 3: Create Admin User (Optional)

For accessing Supabase dashboard:

1. Go to your Supabase project → Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Enable email confirmation if needed

---

## Post-Deployment Verification

### Checklist

- [ ] Application loads at `https://your-vercel-url.vercel.app`
- [ ] Upload tab appears and loads
- [ ] Can navigate between all 5 tabs
- [ ] API endpoints respond:
  - [ ] `/api/forecasts` returns data or empty array
  - [ ] `/api/summary` returns summary stats
  - [ ] `/api/validate` returns validation result
  - [ ] `/api/reconcile` returns reconciliation report

### Test Upload

1. Download the sample PDF
2. Go to "Upload Report" tab
3. Upload the PDF
4. Verify success message
5. Check "Dashboard" tab - new data should appear
6. Go to "All Data" tab - should see the records

### Monitor Errors

```bash
# View Vercel logs
vercel logs --prod

# View Supabase logs
# Go to https://app.supabase.com → Logs → Recent Errors
```

---

## Rollback & Troubleshooting

### If Deployment Fails

1. **Check Vercel logs**:
   ```bash
   vercel logs --prod
   ```

2. **Common issues**:
   - Missing env vars → Add to Vercel dashboard
   - Build error → Check TypeScript errors locally with `pnpm build`
   - Database error → Verify Supabase credentials are correct

3. **Rollback** to previous version:
   - Go to Vercel Dashboard → Deployments
   - Find stable version
   - Click "Redeploy"

### Quick Fixes

**"Cannot find module" error**:
```bash
cd /vercel/share/v0-project
pnpm install
pnpm build
# Then push to git
```

**Database connection fails**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` format: `https://xxxxx.supabase.co`
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` length and format
- Check Supabase project is not paused

**Uploads not working**:
- Check `/api/upload` endpoint in Vercel logs
- Verify database tables exist in Supabase
- Test with small PDF first

---

## Performance Optimization

### Vercel Settings

1. **Go to Project Settings**
2. **Build & Development**
   - Build Command: `pnpm build`
   - Output Directory: `.next`

3. **Serverless Functions**
   - Memory: 1024 MB (default)
   - Max Duration: 60 seconds

### Database Optimization

Already done:
- ✅ Indexes on frequently queried columns
- ✅ UNIQUE constraints for duplicate prevention
- ✅ Triggers for automatic validation

### Content Delivery

- Vercel automatically caches:
  - Static assets (.js, .css, .json)
  - API responses (configurable)
  - Images (with Next.js Image optimization)

---

## Monitoring & Alerts

### Vercel Analytics

1. Go to Project Dashboard
2. Click "Analytics"
3. Monitor:
   - Page loads, response times
   - Errors and exceptions
   - Function execution time

### Set Alerts (Pro Only)

1. Settings → Alerts
2. Create alerts for:
   - Build failures
   - Function errors
   - High latency

### Manual Monitoring

```bash
# Check deployment status
vercel projects --scope team_tIrsUAYRZjLWw626d1UAq9r7

# View recent builds
vercel list deployments --prod --scope team_tIrsUAYRZjLWw626d1UAq9r7

# Monitor logs in real-time
vercel logs --follow --prod
```

---

## Scaling & Growth

### When Traffic Increases

Vercel auto-scales serverless functions - no action needed.

### When Database Gets Large

In Supabase dashboard:
1. Monitor storage usage → Settings → Billing
2. Enable database backups → Settings → Backups
3. Consider database replication for higher availability

---

## Security Checklist

- ✅ Environment variables not committed to git
- ✅ Supabase Row Level Security (RLS) configured
- ✅ API routes validate input
- ✅ Database constraints prevent bad data
- ✅ HTTPS enforced (Vercel automatic)
- ✅ No hardcoded secrets in code

### Additional Security Steps

1. **Enable 2FA on Supabase account**
   - Settings → Authentication → 2FA

2. **Restrict API keys** (Supabase):
   - Settings → API → API Keys → Restrict to specific IPs (optional)

3. **Monitor API usage**
   - Supabase dashboard → Usage

---

## Maintenance

### Regular Tasks

- **Weekly**: Check error logs
- **Monthly**: Review database size
- **Quarterly**: Update dependencies
- **Yearly**: Review security settings

### Update Process

```bash
# 1. Update dependencies locally
pnpm update

# 2. Test locally
pnpm dev
pnpm build

# 3. Push to git
git add .
git commit -m "Update dependencies"
git push origin v0/inventory-number-mapping-08339221

# 4. Create PR and merge
# 5. Vercel auto-deploys
```

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **API Reference**: See IMPLEMENTATION_GUIDE.md

---

## Success!

Your production deployment is now live. 

Next steps:
1. Share deployment URL with team
2. Start uploading housekeeping reports
3. Monitor dashboard for data
4. Use validation and reconciliation reports

Happy forecasting! 🚀
