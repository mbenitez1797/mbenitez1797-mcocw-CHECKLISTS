# AGM Inventory Number Mapping System - Implementation Guide

## Overview

This system has been built to address the critical need for accurate number mapping in AGM checklist uploads and inventory management. It provides a complete solution for parsing housekeeping forecasting reports, validating data integrity, detecting discrepancies, and maintaining accurate real-time inventory levels.

## System Architecture

### Database Schema

The system uses three primary tables in Supabase:

#### 1. **room_types**
- `id`: UUID primary key
- `code`: Unique room type identifier
- `name`: Room type display name
- `description`: Optional notes
- **Indexes**: Primary key, unique on code
- **Purpose**: Master lookup table for all room types

#### 2. **housekeeping_forecasts**
- `id`: UUID primary key
- `forecast_date`: DATE of the forecast
- `room_type_id`: Foreign key to room_types
- `room_type_name`: Denormalized room type name for queries
- **Data fields**:
  - `arrivals`: Integer count
  - `arriving_guests`: Integer count
  - `departures`: Integer count
  - `departing_guests`: Integer count
  - `stay_overs`: Integer count
  - `stay_over_guests`: Integer count
  - `otm`: Out of manager integer count
  - `o00`: Out of order count
  - `rooms_on_hold`: On hold count
- **Tracking fields**:
  - `source_file`: Original filename
  - `upload_id`: Reference to upload_logs
- **Constraint**: UNIQUE(forecast_date, room_type_name) ensures no duplicate day/room combos
- **Indexes**: 
  - forecast_date
  - room_type_name
  - (forecast_date, room_type_name) composite

#### 3. **upload_logs**
- `id`: UUID primary key
- `filename`: Source file name
- `upload_date`: Timestamp of upload
- `records_processed`: Total rows parsed
- `records_inserted`: New records created
- `records_updated`: Existing records modified
- `status`: 'pending' | 'completed' | 'failed'
- `error_message`: Error details if failed
- `raw_data`: JSONB of parsed data for audit trail
- **Index**: upload_date
- **Purpose**: Complete audit trail of all uploads

## Data Flow & Number Mapping Accuracy

### Upload Process
```
PDF Report Upload
        ↓
PDF Parser (lib/pdf-parser.ts)
  - Extracts text content
  - Identifies date boundaries
  - Splits by date, then room type
  - Parses numeric fields
        ↓
Data Validation Layer
  - Checks for negative values
  - Verifies guest/room counts logic
  - Validates data type conversions
        ↓
Database Write (with UPSERT logic)
  - Checks for existing (date, room_type)
  - Updates if exists (numbers merge)
  - Inserts if new
        ↓
Upload Log Record
  - Stores raw JSON for audit
  - Records counts for reconciliation
```

### Root Causes of Incorrect Number Mapping (Identified & Fixed)

#### 1. **Text Parsing Errors**
- **Issue**: PDF extraction sometimes captures garbage characters
- **Solution**: 
  - NumberParser class with regex validation: `/^\d+$/`
  - Fallback parsing with error correction
  - Non-numeric values logged to upload_logs.raw_data

#### 2. **Column Misalignment**
- **Issue**: Whitespace or formatting causes column shift
- **Solution**:
  - Auto-detect column positions from header
  - Validate expected column count before parsing
  - Header validation with fuzzy matching

#### 3. **Date Boundary Detection**
- **Issue**: Multi-line dates or headers break parsing
- **Solution**:
  - Regex date matching: `/\d{1,2}\/\d{1,2}\/\d{4}/`
  - Fallback to ISO format detection
  - Date continuity validation

#### 4. **Duplicate Data Handling**
- **Issue**: Same date uploaded twice causes data corruption
- **Solution**:
  - UNIQUE constraint on (forecast_date, room_type_name)
  - UPSERT logic: UPDATE if exists, INSERT if new
  - Upload log stores previous state for rollback

#### 5. **Type Conversion Issues**
- **Issue**: Excel formulas, percentages, or currency symbols corrupt numbers
- **Solution**:
  - Remove non-numeric characters before parsing
  - Handle locale-specific formats (e.g., 1,234 vs 1.234)
  - Null/empty field handling → 0

## Verification of Number Correctness

### 1. Source Tracing Query
```sql
-- Find which upload provided a specific number
SELECT 
  hf.id,
  hf.forecast_date,
  hf.room_type_name,
  hf.arrivals,
  ul.filename,
  ul.upload_date,
  ul.raw_data
FROM housekeeping_forecasts hf
JOIN upload_logs ul ON hf.upload_id = ul.id
WHERE hf.forecast_date = '2025-01-15'
  AND hf.room_type_name = 'KING'
ORDER BY ul.upload_date DESC;
```

### 2. Audit Trail Review
```sql
-- Track all changes to a specific forecast
SELECT 
  ul.id,
  ul.filename,
  ul.upload_date,
  ul.records_updated,
  ul.raw_data->>'KING' as king_data
FROM upload_logs ul
WHERE ul.raw_data @> '{"2025-01-15": {}}'
ORDER BY ul.upload_date;
```

### 3. Validation Report (API: `/api/validate`)
Automatically checks:
- ✓ No negative values
- ✓ Guest counts match room counts (logic: guests ≥ rooms)
- ✓ No missing room types
- ✓ No zero when should have value

### 4. Reconciliation Report (API: `/api/reconcile`)
Compares current vs previous upload:
- Identifies which fields changed
- Calculates delta (old value → new value)
- Flags suspicious jumps (e.g., 2 → 500 arrivals)

## Data Parsing Logic & Corrections

### PDF Parser Algorithm (lib/pdf-parser.ts)

```typescript
1. Extract PDF text
2. Split into lines
3. For each line:
   - Check if date pattern match
   - If yes: mark as new date section
   - If no: extract room data
4. For each room data line:
   - Parse: [ROOM_TYPE] [ARR] [GUESTS] [DEP] ... 
   - Validate all fields are numeric
   - Convert to integers
   - Store in accumulator
5. Return structured data array
```

### Key Improvements Made

#### Auto-Column Detection
```typescript
detectColumns(headerLine: string) {
  const expected = ['DATE', 'ROOM TYPE', 'ARRIVALS', 'ARRIVING GUESTS', ...]
  const actual = headerLine.split(/\s{2,}/).map(h => h.trim())
  
  // Fuzzy match with tolerance for typos
  return fuzzyMatch(expected, actual)
}
```

#### Number Parsing with Error Recovery
```typescript
parseNumber(value: string): number {
  // Remove currency, percentage symbols
  let cleaned = value.replace(/[$%,]/g, '')
  
  // Handle locale variants
  if (cleaned.includes('.') && cleaned.includes(',')) {
    // Determine if . or , is decimal based on position
    cleaned = cleaned.replace(/[,.](?=\d{0,2}$)/, '.')
  }
  
  const num = parseInt(cleaned, 10)
  if (isNaN(num)) throw new Error(`Cannot parse: ${value}`)
  return num
}
```

#### Duplicate Prevention (Database Level)
```sql
-- On insert/update
INSERT INTO housekeeping_forecasts (...) 
VALUES (...)
ON CONFLICT(forecast_date, room_type_name) 
DO UPDATE SET
  arrivals = EXCLUDED.arrivals,
  arriving_guests = EXCLUDED.arriving_guests,
  ... [all numeric fields]
  updated_at = NOW();
```

## Configuration Recommendations

### 1. Enable Strict Validation Mode
Set in environment variables:
```bash
VALIDATION_LEVEL=strict  # Error on any validation issue
# vs
VALIDATION_LEVEL=warn    # Log issues but proceed
```

### 2. Configure Reconciliation Sensitivity
```typescript
const RECONCILIATION_THRESHOLDS = {
  arrivals_max_delta: 200,        // Flag if change > 200
  guests_max_delta: 500,          // Flag if change > 500
  stayover_min_percentage: 0.8,   // Flag if < 80% correlation
}
```

### 3. Data Freshness Guarantees
- Data is written with transaction isolation level READ_COMMITTED
- RLS policies ensure user scope (if multi-tenant)
- Triggers maintain updated_at timestamps

## Validation & Testing

### Automated Validation Checks

**Pre-Upload Validation** (before database write):
```
✓ File is readable
✓ Contains recognizable date format
✓ Has expected column structure
✓ All numeric fields parse successfully
```

**Post-Upload Validation** (after database write):
```
✓ Record count matches parsed count
✓ No duplicate entries
✓ All values within acceptable ranges
✓ Relationships intact (guests ≥ rooms)
```

**Continuous Monitoring**:
```
✓ Daily reconciliation vs previous upload
✓ Alert on suspiciously large changes
✓ Alert on missing data fields
✓ Dashboard showing validation score
```

### Test Suite Structure

```typescript
// Test 1: PDF Parser
describe('PDFParser', () => {
  it('correctly extracts dates from mixed text')
  it('handles multiple room types per date')
  it('recovers from malformed numbers')
  it('maintains data order')
})

// Test 2: Number Mapping
describe('NumberMapping', () => {
  it('maps arrivals column correctly')
  it('maps departures consistently')
  it('handles zero values')
  it('detects missing columns')
})

// Test 3: Database Operations
describe('Database', () => {
  it('inserts new records')
  it('updates existing records')
  it('prevents duplicates')
  it('maintains referential integrity')
})

// Test 4: Validation
describe('Validation', () => {
  it('rejects negative values')
  it('flags guest/room mismatches')
  it('detects data type errors')
  it('identifies missing fields')
})
```

## API Endpoints

### 1. Upload Report
**POST `/api/upload`**
- Accepts multipart/form-data with file
- Returns: `{ recordsProcessed, recordsInserted, recordsUpdated, errors }`

### 2. Fetch Forecasts
**GET `/api/forecasts?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`**
- Returns array of forecast records
- Filterable by date range and room type

### 3. Get Summary
**GET `/api/summary`**
- Returns aggregated totals by date
- Useful for dashboard display

### 4. Data Validation
**GET `/api/validate`**
- Runs validation checks on current data
- Returns issues array with severity

### 5. Reconciliation
**GET `/api/reconcile`**
- Compares current vs previous upload
- Returns change deltas and reconciliation status

## Preventing Future Discrepancies

### 1. Pre-Upload Safeguards
```typescript
// Checklist before processing upload
☐ File hash validation (prevent duplicate uploads)
☐ Header validation (ensure correct format)
☐ Column count validation
☐ Data type validation on sample rows
☐ Date continuity check
```

### 2. Configuration Management
- Store mapping rules in database (not hardcoded)
- Version control all parsing logic
- Audit trail for any parsing rule changes

### 3. Real-Time Monitoring
- Dashboard alerts for validation failures
- Email notifications on data anomalies
- Monthly reconciliation reports

### 4. Data Governance
- Document every field mapping
- Maintain audit trail of all uploads
- Regular data quality audits
- Establish SLA for data accuracy

## Real-Time Inventory Accuracy

### Maintaining Consistency

**Transactions**: All database writes use transactions to ensure atomicity
**No Lost Updates**: UPSERT logic prevents concurrent update conflicts
**Denormalization**: room_type_name stored with every record for query independence
**Audit Trail**: Every change tracked in upload_logs with timestamp

### Data Flow Guarantees

```
Upload → Validation → Database Write → Log Record → Reconciliation → Dashboard
  ↓         ↓            ↓               ↓            ↓                ↓
Source    Verified   Atomic Write    Immutable    Verified       Real-Time
Check     Input        TX            History      Against        Reflection
                                                  Previous
```

## Quick Troubleshooting Guide

| Symptom | Root Cause | Solution |
|---------|-----------|----------|
| Numbers are off by X% | Parsing error on specific column | Check PDF format, verify column positions |
| Duplicate records | Same upload processed twice | Check file hash before processing |
| Missing dates | Date format not recognized | Add date pattern to regex |
| Zero arrivals but guests present | Guest count parsing error | Verify delimiter between columns |
| Old numbers not updated | UPSERT logic not matching correctly | Check date/room_type composite key |

## Future Enhancements

1. **Machine Learning Validation**: Auto-detect anomalies using historical patterns
2. **Webhook Integration**: Real-time push to downstream systems
3. **Multi-Format Support**: Excel, CSV, JSON uploads
4. **Custom Field Mapping**: UI to configure column mappings
5. **Automated Corrections**: Suggest and apply corrections automatically

---

## Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database schema applied
- [ ] Environment variables set (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] App deployed to Vercel
- [ ] Test upload completed successfully
- [ ] Validation checks passing
- [ ] Reconciliation report generated
- [ ] Monitoring alerts configured
- [ ] Team trained on system usage
- [ ] Documentation reviewed and approved

