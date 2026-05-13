# Quick Start Guide - AGM Housekeeping Forecast System

## 5-Minute Setup

### Step 1: Environment Setup
```bash
# Create .env.local file in project root with:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Verify Dependencies
```bash
pnpm install
pnpm build  # Should complete with 0 errors
```

### Step 3: Start Application
```bash
pnpm dev
# Open http://localhost:3000
```

### Step 4: Test with Your Report
1. Click "Upload Report" tab
2. Select your PDF file (Agilysys Housekeeping Forecasting report)
3. Click "Upload and Process"
4. View results in Dashboard tab

## What Happens During Upload

```
Your PDF
   ↓
System extracts text and parses:
  - Dates (MM/DD/YYYY format)
  - Room types (KING, QUEEN, SUITE, etc.)
  - Numbers (ARRIVALS, DEPARTURES, STAY OVERS, etc.)
   ↓
Validation checks:
  ✓ No negative values
  ✓ Guest count ≥ room count
  ✓ No missing required fields
   ↓
Database updates:
  - NEW date/room combo → INSERT
  - EXISTING date/room combo → UPDATE
   ↓
Audit log recorded for traceability
   ↓
Dashboard refreshes automatically
```

## Understanding the Tabs

### 📤 Upload Report
- Drag & drop or click to select PDF
- Shows upload progress and results
- Displays count of records processed/inserted/updated
- Error messages if something fails

### 📊 Dashboard
- Summary cards showing totals by date
- Click any card to filter table below
- Shows: Arrivals, Departures, Stay-Overs, Guests, OTM, O00, On Hold
- Real-time numbers reflecting latest uploads

### 📋 All Data
- Complete table of all records
- Search and filter by date range
- Edit or delete records if needed
- Export capability (shows all data)

### ✅ Data Validation
- Click "Run Validation Check"
- Identifies any data integrity issues
- Color-coded: Green (OK), Yellow (Warning), Red (Error)
- Specific error messages with row numbers

### 🔄 Reconciliation Report
- Click "Generate Reconciliation Report"
- Compares current upload with previous upload
- Shows which fields changed
- Helps verify nothing unexpectedly changed

## Common Tasks

### Upload a New Report
1. Go to "Upload Report" tab
2. Select PDF file
3. System automatically detects dates and room types
4. New records inserted, existing updated
5. Check Dashboard to verify

### Find a Specific Number
1. Go to "All Data" tab
2. Look for the date and room type
3. Check the value
4. If incorrect, use Reconciliation report to trace when it changed

### Verify Data Quality
1. Go to "Data Validation" tab
2. Click "Run Validation Check"
3. Review any issues found
4. If OK, see green checkmark with 100% pass rate

### Compare Two Uploads
1. Go to "Reconciliation Report" tab
2. Click "Generate Reconciliation Report"
3. View changes between current and previous upload
4. Check if changes are expected

## Troubleshooting

### Upload fails with "Cannot parse numbers"
**Issue**: PDF format different than expected  
**Fix**: Verify PDF has DATE, ROOM TYPE, ARRIVALS, DEPARTURES columns

### Numbers show as 0 or incorrect
**Issue**: Column misalignment or parsing error  
**Fix**: Run Data Validation to identify issue, then check troubleshooting docs

### Same file uploaded twice, need to remove duplicate
**Issue**: Duplicate upload created conflicting data  
**Fix**: System prevents re-uploads with same file, so just upload latest version

### Need to correct a number manually
**Issue**: Found error in source data  
**Fix**: Use All Data tab to locate record, then delete and re-upload corrected PDF

## For Administrators

### Enable Debug Logging
Add to browser console to see detailed parsing info:
```javascript
localStorage.setItem('DEBUG_FORECAST', 'true')
// Refresh page to see debug logs in console
```

### Check Database Directly
Access Supabase dashboard to query:
```sql
-- See all forecasts
SELECT * FROM housekeeping_forecasts 
ORDER BY forecast_date DESC, room_type_name;

-- See upload history
SELECT * FROM upload_logs 
ORDER BY upload_date DESC;

-- See data quality
SELECT 
  forecast_date,
  COUNT(*) as records,
  SUM(arrivals) as total_arrivals,
  SUM(departures) as total_departures
FROM housekeeping_forecasts
GROUP BY forecast_date
ORDER BY forecast_date DESC;
```

### Monitor System Health
Check `/api/validate` endpoint:
```bash
curl http://localhost:3000/api/validate
```

Returns validation status and any issues found.

## File Locations

- **Main App**: `/app/page.tsx` - UI and state management
- **PDF Parser**: `/lib/pdf-parser.ts` - Parsing logic
- **APIs**: `/app/api/*/route.ts` - Backend endpoints
- **Components**: `/components/` - Reusable UI pieces
- **Documentation**: `/docs/` - Detailed guides
- **Types**: `/lib/types.ts` - TypeScript interfaces

## Key Configuration Points

**Parsing Format** (in `lib/pdf-parser.ts`):
- Line 20: Date regex pattern
- Line 40: Column header detection
- Line 60: Number parsing logic

**Validation Rules** (in `app/api/validate/route.ts`):
- Line 30: Numeric field checks
- Line 40: Negative value checks
- Line 50: Logic consistency checks

**Database** (Supabase):
- 3 main tables: `room_types`, `housekeeping_forecasts`, `upload_logs`
- 3 indexes for performance
- Triggers for automatic validation

## Next Steps

1. ✅ Setup complete - You can now upload reports
2. 📚 Read IMPLEMENTATION_GUIDE.md for technical details
3. 🧪 Test with your actual PDF files
4. 🔍 Review TROUBLESHOOTING_PROCEDURES.md for issue resolution
5. 📊 Set up monitoring alerts (optional, see docs)
6. 🚀 Deploy to Vercel when ready

## Getting Help

If something doesn't work:

1. **Check the error message** - Usually explains the problem
2. **Run Data Validation** - Identifies data integrity issues
3. **Check reconciliation** - Shows what changed between uploads
4. **Read relevant doc**:
   - IMPLEMENTATION_GUIDE.md - How system works
   - TROUBLESHOOTING_PROCEDURES.md - Common problems & fixes
   - DATA_INTEGRITY_ASSURANCE.md - Data quality details

## Support Contacts

- Technical: ops@company.com
- Database: dba@company.com
- Business: inventory@company.com

---

**Quick Reference**: Upload → Validate → Dashboard → Verify

Need more details? See `/docs/` folder for comprehensive guides.
