# Number Mapping Troubleshooting & Correction Procedures

## Executive Summary

This document provides step-by-step procedures to identify, diagnose, and correct number mapping errors in the AGM checklist inventory system. It emphasizes verifying the source of each number and ensuring data integrity throughout the upload and reconciliation process.

## Part 1: Identifying the Problem

### Step 1.1: Recognize Symptoms

Use this checklist to identify if a number mapping error exists:

- [ ] A specific number doesn't match the source PDF
- [ ] Totals don't add up (e.g., arrivals ≠ sum of guests)
- [ ] Historical data shows a sudden unexplained jump
- [ ] Two uploads of the same file produce different results
- [ ] Dashboard shows numbers that don't appear in the report
- [ ] Same date has conflicting entries

### Step 1.2: Enable Debug Logging

```typescript
// In app/page.tsx or components, add:
console.log("[v0] Number Mapping Debug:", {
  timestamp: new Date().toISOString(),
  forecast_date: record.forecast_date,
  room_type: record.room_type_name,
  parsed_value: parsedValue,
  database_value: storedValue,
  difference: parsedValue - storedValue,
})
```

### Step 1.3: Locate the Error

Use the decision tree:

```
Does the problem exist in the PDF?
├─ YES → Error is in parsing (Go to 2.1)
└─ NO → Error is in upload process
   └─ Compare upload date/time
      ├─ Did it change between uploads? (Go to 2.2)
      └─ Same upload? (Go to 2.3)
```

## Part 2: Root Cause Analysis

### 2.1: PDF Parsing Errors

**Diagnosis**: The number in the database differs from what's in the PDF

**Common Causes**:
1. **Whitespace Corruption** - Extra spaces between columns
2. **Character Recognition** - OCR errors (8 read as B, 5 as S)
3. **Decimal Point Issues** - 1.5 read as 15
4. **Locale Formatting** - 1,234 (US) vs 1.234 (EU)

**Verification Procedure**:

```bash
# Step 1: Export the problematic record
curl -X GET 'http://localhost:3000/api/forecasts?startDate=2025-01-15&endDate=2025-01-15' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Step 2: Cross-reference with PDF
# Open the uploaded PDF and find the matching date/room type
# Manually verify: Does the number in the database match the PDF?
```

**SQL Query to Verify Source**:
```sql
-- Find where a number came from
SELECT 
  hf.id,
  hf.forecast_date,
  hf.room_type_name,
  hf.arrivals,
  hf.arriving_guests,
  ul.filename,
  ul.upload_date,
  ul.raw_data->>'header' as parsed_header,
  ul.raw_data->CONCAT(hf.forecast_date, '_', hf.room_type_name) as parsed_row
FROM housekeeping_forecasts hf
JOIN upload_logs ul ON hf.upload_id = ul.id
WHERE hf.forecast_date = '2025-01-15'
  AND hf.room_type_name = 'KING'
ORDER BY ul.upload_date DESC
LIMIT 1;
```

**Correction Procedure**:

If the parsed value is wrong but the PDF is correct:

```typescript
// Step 1: Identify the problematic field
const problematicField = 'arrivals'  // Example
const correctValue = 45  // From PDF

// Step 2: Run correction via API
const response = await fetch('/api/forecasts/correct', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    forecast_date: '2025-01-15',
    room_type_name: 'KING',
    field: problematicField,
    corrected_value: correctValue,
    reason: 'OCR error: "5" was read as "S"',
    source_evidence: 'PDF page 1, row 3'
  })
})
```

### 2.2: Duplicate Upload Handling

**Diagnosis**: Same file uploaded twice, causing data to be processed twice

**Prevention**:
```typescript
// Implement file hash checking
import crypto from 'crypto'

function getFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

// Before processing:
const fileHash = getFileHash(fileData)
const existing = await supabase
  .from('upload_logs')
  .select('id')
  .eq('file_hash', fileHash)

if (existing.data.length > 0) {
  throw new Error('This file was already uploaded on ' + existing.data[0].upload_date)
}
```

**Detection Query**:
```sql
-- Find duplicate uploads
SELECT 
  filename,
  COUNT(*) as upload_count,
  MAX(upload_date) as last_upload,
  MIN(upload_date) as first_upload,
  DATEDIFF(day, MIN(upload_date), MAX(upload_date)) as days_apart
FROM upload_logs
GROUP BY filename
HAVING COUNT(*) > 1
ORDER BY upload_count DESC;
```

**Correction for Duplicates**:

```sql
-- Identify which upload is the "correct" one
-- Typically the first one is authoritative
DELETE FROM upload_logs 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM upload_logs 
  GROUP BY filename
)
AND filename = 'hskp_monthly_jan2025.pdf';

-- Reset the records to their pre-duplicate state
UPDATE housekeeping_forecasts
SET upload_id = (
  SELECT MIN(id) FROM upload_logs 
  WHERE filename = 'hskp_monthly_jan2025.pdf'
)
WHERE upload_id IN (
  SELECT id FROM upload_logs 
  WHERE filename = 'hskp_monthly_jan2025.pdf'
);
```

### 2.3: Column Misalignment

**Diagnosis**: Numbers are shifted - e.g., arrivals value appears in departures column

**Identification**:
1. Compare column headers in PDF with expected format
2. Check for extra/missing columns
3. Verify column order matches parsing logic

**Verification Query**:
```sql
-- Check for logical inconsistencies suggesting column shift
SELECT 
  hf.forecast_date,
  hf.room_type_name,
  hf.arrivals,
  hf.arriving_guests,
  hf.departures,
  hf.departing_guests,
  CASE 
    WHEN hf.arriving_guests > hf.arrivals * 10 THEN 'SUSPICIOUS'
    WHEN hf.departing_guests > hf.departures * 10 THEN 'SUSPICIOUS'
    ELSE 'OK'
  END as data_quality
FROM housekeeping_forecasts hf
WHERE hf.forecast_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND CURDATE()
ORDER BY data_quality DESC;
```

**Correction Procedure**:

```typescript
// Step 1: Create a mapping correction
const columnMapping = {
  original: ['DATE', 'ROOM', 'ARR', 'ARR_GUESTS', 'DEP', 'DEP_GUESTS', ...],
  corrected: ['DATE', 'ROOM', 'ARR_GUESTS', 'ARR', 'DEP_GUESTS', 'DEP', ...]
  // Note the swap of positions 2-3 and 4-5
}

// Step 2: Re-parse with corrected mapping
const correctedData = reparsePDFWithMapping(pdfBuffer, columnMapping)

// Step 3: Update database with corrected values
for (const record of correctedData) {
  await supabase
    .from('housekeeping_forecasts')
    .update({
      arrivals: record.arrivals,
      arriving_guests: record.arriving_guests,
      departures: record.departures,
      departing_guests: record.departing_guests,
    })
    .eq('forecast_date', record.forecast_date)
    .eq('room_type_name', record.room_type_name)
}
```

### 2.4: Numeric Type Errors

**Diagnosis**: Numbers with unexpected characters (1,234 instead of 1234, or $45 instead of 45)

**Detection**:
```sql
-- Find records that might have parsing issues
SELECT 
  hf.id,
  hf.forecast_date,
  hf.room_type_name,
  ul.raw_data->CONCAT(hf.forecast_date, '_', hf.room_type_name) as original_text,
  hf.arrivals as parsed_arrivals
FROM housekeeping_forecasts hf
JOIN upload_logs ul ON hf.upload_id = ul.id
WHERE hf.arrivals > 10000  -- Likely parsed "1,000" as "1000"
  OR hf.arrivals < 0       -- Likely parsed negative symbol
LIMIT 20;
```

**Correction Logic** (in lib/pdf-parser.ts):

```typescript
function sanitizeNumber(rawValue: string): number {
  // Remove currency symbols
  let cleaned = rawValue.replace(/[$€¥£]/g, '')
  
  // Remove percentage signs
  cleaned = cleaned.replace(/%/g, '')
  
  // Handle thousands separators
  // If value has both . and , determine which is decimal
  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastCommaIdx = cleaned.lastIndexOf(',')
    const lastDotIdx = cleaned.lastIndexOf('.')
    
    if (lastDotIdx > lastCommaIdx) {
      // 1,234.56 format
      cleaned = cleaned.replace(/,/g, '')
    } else {
      // 1.234,56 format
      cleaned = cleaned.replace(/\./g, '').replace(/,/, '.')
    }
  } else if (cleaned.includes(',')) {
    // Determine if comma is thousands or decimal
    const parts = cleaned.split(',')
    if (parts[1].length === 2) {
      // 1,234.56 with just commas (decimal implied)
      cleaned = cleaned.replace(/,(?=\d{2}$)/, '.')  // Last comma is decimal
      cleaned = cleaned.replace(/,/g, '')
    } else {
      // Just thousands separator
      cleaned = cleaned.replace(/,/g, '')
    }
  }
  
  // Convert to integer
  const num = parseInt(cleaned, 10)
  
  if (isNaN(num)) {
    throw new Error(`Cannot parse number: ${rawValue} -> ${cleaned}`)
  }
  
  return num
}
```

## Part 3: Verification Procedures

### 3.1: End-to-End Verification

**Verify that every number is correct:**

```sql
-- Comprehensive data quality report
SELECT 
  hf.forecast_date,
  hf.room_type_name,
  hf.arrivals,
  hf.arriving_guests,
  hf.departures,
  hf.departing_guests,
  hf.stay_overs,
  hf.stay_over_guests,
  CASE 
    -- Check: arriving_guests should be >= arrivals
    WHEN hf.arriving_guests < hf.arrivals THEN 'ERROR: guests < rooms'
    -- Check: departing_guests should be >= departures
    WHEN hf.departing_guests < hf.departures THEN 'ERROR: guests < rooms'
    -- Check: stay_over_guests should be >= stay_overs
    WHEN hf.stay_over_guests < hf.stay_overs THEN 'ERROR: guests < rooms'
    -- Check: no negative values
    WHEN hf.arrivals < 0 OR hf.departures < 0 OR hf.stay_overs < 0 THEN 'ERROR: negative value'
    ELSE 'OK'
  END as validation_status,
  CONCAT(hf.arrivals, '/', hf.arriving_guests) as arrivals_ratio,
  CONCAT(hf.departures, '/', hf.departing_guests) as departures_ratio
FROM housekeeping_forecasts hf
ORDER BY validation_status DESC, hf.forecast_date DESC;
```

### 3.2: Audit Trail Verification

**Trace a specific number back to its source:**

```typescript
// Verify a specific number's entire history
async function verifyNumberOrigin(
  forecastDate: string,
  roomType: string,
  field: string
) {
  // Get all versions of this record
  const { data: history } = await supabase
    .from('housekeeping_forecasts')
    .select('*, upload_logs(*)')
    .eq('forecast_date', forecastDate)
    .eq('room_type_name', roomType)
    .order('created_at', { ascending: true })
  
  console.log(`History of ${field} for ${roomType} on ${forecastDate}:`)
  
  for (const record of history) {
    console.log(
      `Upload ${record.upload_logs.filename}: ` +
      `${field} = ${record[field]} ` +
      `(uploaded ${record.created_at})`
    )
  }
}
```

### 3.3: Pre-Upload Validation Checklist

Before accepting any upload, verify:

```typescript
async function preUploadValidation(buffer: Buffer): Promise<ValidationResult> {
  const checks = {
    isReadable: false,
    hasRecognizableDate: false,
    hasExpectedColumns: false,
    allFieldsParseable: false,
    noNegativeValues: false,
    dataConsistent: false,
  }
  
  try {
    // Check 1: Is file readable?
    const text = await extractTextFromPDF(buffer)
    checks.isReadable = text.length > 0
    
    // Check 2: Does it have recognizable dates?
    const dates = text.match(/\d{1,2}\/\d{1,2}\/\d{4}/g) || []
    checks.hasRecognizableDate = dates.length > 0
    
    // Check 3: Does it have expected columns?
    const hasExpectedColumns = [
      'ARRIVALS',
      'DEPARTURES',
      'STAY OVERS'
    ].every(col => text.includes(col))
    checks.hasExpectedColumns = hasExpectedColumns
    
    // Check 4: Can all fields be parsed as numbers?
    const parsed = parseReport(text)
    checks.allFieldsParseable = parsed.every(row =>
      typeof row.arrivals === 'number' &&
      typeof row.departures === 'number' &&
      typeof row.stay_overs === 'number'
    )
    
    // Check 5: No negative values?
    checks.noNegativeValues = parsed.every(row =>
      row.arrivals >= 0 &&
      row.departures >= 0 &&
      row.stay_overs >= 0
    )
    
    // Check 6: Data is logically consistent?
    checks.dataConsistent = parsed.every(row =>
      row.arriving_guests >= row.arrivals &&
      row.departing_guests >= row.departures
    )
    
    return {
      isValid: Object.values(checks).every(v => v === true),
      checks
    }
  } catch (error) {
    console.error('[v0] Pre-upload validation error:', error)
    return { isValid: false, checks, error: error.message }
  }
}
```

## Part 4: Correction Implementation

### 4.1: Manual Correction via API

```typescript
// POST /api/forecasts/correct
// Manually correct a specific field

export async function POST(request: Request) {
  const body = await request.json()
  
  const {
    forecast_date,
    room_type_name,
    field,
    corrected_value,
    reason,
    approved_by
  } = body
  
  // Validate correction
  if (!['arrivals', 'departures', 'stay_overs', ...].includes(field)) {
    return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
  }
  
  if (corrected_value < 0) {
    return NextResponse.json({ error: 'Values cannot be negative' }, { status: 400 })
  }
  
  // Update record
  const { error } = await supabase
    .from('housekeeping_forecasts')
    .update({
      [field]: corrected_value,
      updated_at: new Date().toISOString()
    })
    .eq('forecast_date', forecast_date)
    .eq('room_type_name', room_type_name)
  
  // Log the correction
  await supabase
    .from('data_corrections_log')
    .insert({
      forecast_date,
      room_type_name,
      field,
      original_value: existingRecord[field],
      corrected_value,
      reason,
      approved_by,
      correction_date: new Date().toISOString()
    })
  
  return NextResponse.json({ success: true })
}
```

### 4.2: Bulk Re-Processing

If multiple records need correction:

```typescript
async function reprocessUpload(uploadId: string) {
  // Get original upload metadata
  const upload = await supabase
    .from('upload_logs')
    .select('*')
    .eq('id', uploadId)
    .single()
  
  // Get raw data from upload
  const rawData = upload.raw_data
  
  // Re-parse with current (fixed) logic
  const correctedData = reparse(rawData)
  
  // Replace all records from this upload
  await supabase
    .from('housekeeping_forecasts')
    .delete()
    .eq('upload_id', uploadId)
  
  // Insert corrected records
  for (const record of correctedData) {
    await supabase
      .from('housekeeping_forecasts')
      .insert(record)
  }
  
  // Mark upload as reprocessed
  await supabase
    .from('upload_logs')
    .update({ status: 'reprocessed', updated_at: new Date() })
    .eq('id', uploadId)
}
```

## Part 5: Preventing Future Discrepancies

### 5.1: Configuration Best Practices

```yaml
# config/data-mapping.yaml
# Store all mapping rules in version-controlled configuration

column_mapping:
  date: "DATE"
  room_type: "ROOM TYPE"
  arrivals: "ARRIVALS"
  arriving_guests: "ARRIVING GUESTS"
  departures: "DEPARTURES"
  departing_guests: "DEPARTING GUESTS"
  stay_overs: "STAY OVERS"
  stay_over_guests: "STAY OVER GUESTS"

validation_rules:
  allow_negative_values: false
  guests_must_exceed_rooms: true
  null_handling: "convert_to_zero"
  decimal_handling: "round_to_integer"

parsing_tolerances:
  date_format_variants:
    - "MM/DD/YYYY"
    - "M/D/YYYY"
    - "DD/MM/YYYY"
  
  number_delimiters:
    - thousands: ","
      decimal: "."
    - thousands: "."
      decimal: ","

error_handling:
  on_parse_failure: "log_and_skip"
  on_validation_failure: "log_and_flag_for_review"
  on_duplicate_upload: "reject"
```

### 5.2: Continuous Monitoring

```typescript
// Add this to your monitoring dashboard
export async function generateDataQualityMetrics() {
  const metrics = {
    total_records: await countRecords(),
    validation_pass_rate: await calculatePassRate(),
    recent_corrections: await getRecentCorrections(),
    anomaly_score: await calculateAnomalyScore(),
    last_validation: await getLastValidationDate(),
    alerts: await getActiveAlerts(),
  }
  
  return metrics
}

// Set up alerts
const ALERTS = {
  VALIDATION_PASS_RATE_BELOW_95: {
    threshold: 0.95,
    action: 'email_to_ops@company.com'
  },
  LARGE_VALUE_CHANGE: {
    threshold: (oldVal, newVal) => Math.abs(newVal - oldVal) > oldVal * 0.5,
    action: 'slack_notification'
  },
  DUPLICATE_UPLOAD_DETECTED: {
    action: 'reject_and_notify'
  }
}
```

### 5.3: Training & Documentation

- [ ] Team trained on common error types
- [ ] Standard operating procedure documented
- [ ] Weekly data quality reviews scheduled
- [ ] Monthly reconciliation reports generated
- [ ] Quarterly audits of parsing logic

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-15  
**Owner**: Inventory Management Team  
**Review Cycle**: Quarterly
