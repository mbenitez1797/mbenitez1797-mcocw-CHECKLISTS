# AGM Housekeeping Forecast Inventory System

A comprehensive solution for parsing, validating, and managing housekeeping forecasting reports with a focus on data integrity and accurate number mapping between AGM checklist uploads and inventory records.

## 🎯 Problem Statement

Organizations using Agilysys housekeeping management systems often face challenges with:
- **Inaccurate number mapping** from PDF reports to database records
- **Duplicate or conflicting data** from multiple uploads
- **Missing validation** of numeric fields
- **Lack of audit trails** for data changes
- **No reconciliation mechanisms** to detect discrepancies

This system addresses all these issues with automated parsing, comprehensive validation, reconciliation reports, and complete audit trails.

## ✨ Key Features

### 1. **Intelligent PDF Parsing**
- Automatic date and room type detection
- Robust number parsing with error recovery
- Support for multiple number formats (currency, percentages, locale variants)
- Configurable column mapping
- Complete audit trail of raw parsed data

### 2. **Data Validation**
- Pre-upload validation (file format, date recognition, column structure)
- Post-upload validation (data type checking, logical consistency)
- Automatic detection of negative values, guest/room mismatches, missing fields

### 3. **Duplicate Prevention**
- File hash checking to prevent re-uploading same file
- UNIQUE database constraints on (date, room_type)
- UPSERT logic: automatically updates if exists, inserts if new

### 4. **Reconciliation & Audit Trail**
- Automatic comparison of current vs previous uploads
- Identifies exactly which fields changed and by how much
- Complete audit log of every data change

### 5. **Real-Time Monitoring**
- Data validation dashboard
- Reconciliation reports with detailed change tracking
- Integrity verification checks

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Start development server
pnpm dev

# Open http://localhost:3000
```

## 📊 System Architecture

**Data Flow**: Upload PDF → Parse → Validate → Database (UPSERT) → Audit Log → Dashboard

**Key Components**:
- `lib/pdf-parser.ts` - Intelligent PDF text extraction and number parsing
- `app/api/upload/route.ts` - Upload endpoint with validation
- `app/api/validate/route.ts` - Data quality checks
- `app/api/reconcile/route.ts` - Compare uploads and detect changes
- Database: 3 tables (room_types, housekeeping_forecasts, upload_logs)

## 📁 Key Files

- **docs/IMPLEMENTATION_GUIDE.md** - Database schema, data flow, API endpoints
- **docs/TROUBLESHOOTING_PROCEDURES.md** - Diagnosis and correction procedures
- **docs/DATA_INTEGRITY_ASSURANCE.md** - ACID compliance, audit trails, monitoring
- **docs/agm-inventory-troubleshooting-plan.md** - Comprehensive problem analysis

## 🔐 Data Integrity Features

✓ Atomic transactions (all or nothing)  
✓ Unique constraints on (date, room_type)  
✓ Pre/post-insert validation  
✓ Trigger-based validation  
✓ Complete audit trail  
✓ Duplicate prevention via file hash  
✓ UPSERT logic for safe updates  
✓ Reconciliation verification  

## 🧪 Testing

```bash
# Build project
pnpm build

# Verify all routes compile
pnpm dev  # Check http://localhost:3000/api/validate
```

## 📈 Features by Tab

- **Upload Report** - Parse PDFs and populate database
- **Dashboard** - View forecast by date with summary cards
- **All Data** - Complete table view with all records
- **Data Validation** - Check data quality and integrity
- **Reconciliation** - Compare current vs previous uploads

## 🔧 Configuration

Edit `lib/pdf-parser.ts` to customize:
- Date format patterns
- Column header variations
- Number locale handling
- Error recovery thresholds

## 📞 Support & Documentation

See `docs/` folder for:
1. **IMPLEMENTATION_GUIDE.md** - How everything works
2. **TROUBLESHOOTING_PROCEDURES.md** - How to fix issues
3. **DATA_INTEGRITY_ASSURANCE.md** - How data stays accurate
4. **agm-inventory-troubleshooting-plan.md** - Problem catalog

---

**Version**: 1.0.0 | **Status**: Production Ready
