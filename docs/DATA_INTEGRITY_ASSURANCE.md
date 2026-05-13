# Data Integrity Assurance Documentation

## Overview

This document details the mechanisms, policies, and procedures implemented to ensure that inventory numbers accurately reflect actual inventory levels and maintain consistency between the AGM checklist input and the inventory system.

## 1. ACID Principles Implementation

### Atomicity
All database operations are atomic transactions:

```sql
-- Upload example: Either ALL records insert successfully or NONE do
BEGIN TRANSACTION;

INSERT INTO housekeeping_forecasts 
  (forecast_date, room_type_name, arrivals, departures, stay_overs, ...)
VALUES
  ('2025-01-15', 'KING', 45, 12, 8, ...),
  ('2025-01-15', 'QUEEN', 38, 10, 5, ...),
  ('2025-01-15', 'SUITE', 15, 3, 2, ...);

INSERT INTO upload_logs 
  (filename, records_inserted, status)
VALUES ('hskp_report.pdf', 3, 'completed');

COMMIT;
-- If any INSERT fails, entire transaction rolls back
```

**Implementation**:
- All writes use `await supabase.from(...).insert/update/delete()`
- No partial updates; if validation fails, entire batch rejected
- Transaction isolation level: READ_COMMITTED

### Consistency
Database constraints enforce valid states:

```sql
-- UNIQUE constraint prevents duplicate (date, room_type) entries
CREATE UNIQUE INDEX idx_forecast_uniqueness 
ON housekeeping_forecasts(forecast_date, room_type_name);

-- FOREIGN KEY maintains referential integrity
ALTER TABLE housekeeping_forecasts 
ADD CONSTRAINT fk_room_type 
FOREIGN KEY (room_type_id) REFERENCES room_types(id) 
ON DELETE CASCADE;

-- CHECK constraints enforce business rules
ALTER TABLE housekeeping_forecasts 
ADD CONSTRAINT ck_no_negative_values 
CHECK (arrivals >= 0 AND departures >= 0 AND stay_overs >= 0);
```

### Isolation
Concurrent reads/writes are properly isolated:

```typescript
// Users cannot see uncommitted data from other sessions
// Each query gets a consistent snapshot at the time of request

const { data: forecasts } = await supabase
  .from('housekeeping_forecasts')
  .select('*')
  .eq('forecast_date', '2025-01-15')
  // Returns snapshot from isolation point, not affected by 
  // concurrent updates from other users
```

### Durability
All committed data is permanently stored:

```sql
-- Supabase uses PostgreSQL with WAL (Write-Ahead Logging)
-- Data is immediately written to persistent storage
-- Even if database crashes, committed transactions are recoverable
```

## 2. Data Validation Integrity

### Pre-Insert Validation

```typescript
// All data validated before database write
interface ValidationRules {
  numeric_fields: ['arrivals', 'departures', 'stay_overs', ...]
  required_fields: ['forecast_date', 'room_type_name']
  non_negative: ['arrivals', 'departures', 'stay_overs', 'guests']
  logical_rules: [
    'arriving_guests >= arrivals',
    'departing_guests >= departures',
    'stay_over_guests >= stay_overs',
  ]
}

async function validateForecastRecord(record: HousekeepingForecast) {
  const errors: string[] = []
  
  // Check required fields
  if (!record.forecast_date) errors.push('forecast_date is required')
  if (!record.room_type_name) errors.push('room_type_name is required')
  
  // Check numeric types
  for (const field of ValidationRules.numeric_fields) {
    if (typeof record[field] !== 'number') {
      errors.push(`${field} must be numeric`)
    }
  }
  
  // Check non-negative
  for (const field of ValidationRules.non_negative) {
    if (record[field] < 0) {
      errors.push(`${field} cannot be negative`)
    }
  }
  
  // Check logical relationships
  if (record.arriving_guests < record.arrivals) {
    errors.push('arriving_guests must be >= arrivals')
  }
  if (record.departing_guests < record.departures) {
    errors.push('departing_guests must be >= departures')
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join('; ')}`)
  }
}
```

### Post-Insert Verification

```sql
-- Verify inserted data integrity
SELECT 
  COUNT(*) as record_count,
  COUNT(DISTINCT forecast_date) as distinct_dates,
  COUNT(DISTINCT room_type_name) as distinct_rooms,
  MIN(arrivals) as min_arrivals,
  MAX(arrivals) as max_arrivals,
  SUM(CASE WHEN arriving_guests < arrivals THEN 1 ELSE 0 END) as logic_errors,
  SUM(CASE WHEN arrivals < 0 THEN 1 ELSE 0 END) as negative_values
FROM housekeeping_forecasts
WHERE upload_id = 'specific_upload_id'
HAVING SUM(CASE WHEN arriving_guests < arrivals THEN 1 ELSE 0 END) > 0
  OR SUM(CASE WHEN arrivals < 0 THEN 1 ELSE 0 END) > 0
-- If this query returns any results, integrity is compromised
```

## 3. Reconciliation Mechanisms

### Automatic Daily Reconciliation

```typescript
// Runs every 24 hours (scheduled job)
export async function runDailyReconciliation() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  const { data: currentUpload } = await supabase
    .from('upload_logs')
    .select('*')
    .eq(
      'upload_date', 
      yesterday.toISOString().split('T')[0]
    )
    .order('upload_date', { ascending: false })
    .limit(1)
  
  const { data: previousUpload } = await supabase
    .from('upload_logs')
    .select('*')
    .eq(
      'upload_date', 
      new Date(yesterday.getTime() - 24*60*60*1000).toISOString().split('T')[0]
    )
    .order('upload_date', { ascending: false })
    .limit(1)
  
  if (!currentUpload || !previousUpload) return
  
  // Compare and generate report
  const reconciliation = await compareUploads(currentUpload.id, previousUpload.id)
  
  // Alert if discrepancies found
  if (reconciliation.discrepancies.length > 0) {
    await alertOps('Reconciliation discrepancies detected', reconciliation)
  }
}
```

### Manual Reconciliation Query

```sql
-- Compare two uploads side-by-side
SELECT 
  COALESCE(curr.forecast_date, prev.forecast_date) as forecast_date,
  COALESCE(curr.room_type_name, prev.room_type_name) as room_type,
  
  COALESCE(prev.arrivals, 0) as prev_arrivals,
  COALESCE(curr.arrivals, 0) as curr_arrivals,
  COALESCE(curr.arrivals, 0) - COALESCE(prev.arrivals, 0) as arrivals_delta,
  
  COALESCE(prev.departures, 0) as prev_departures,
  COALESCE(curr.departures, 0) as curr_departures,
  COALESCE(curr.departures, 0) - COALESCE(prev.departures, 0) as departures_delta,
  
  COALESCE(prev.stay_overs, 0) as prev_stay_overs,
  COALESCE(curr.stay_overs, 0) as curr_stay_overs,
  COALESCE(curr.stay_overs, 0) - COALESCE(prev.stay_overs, 0) as stay_overs_delta,
  
  CASE 
    WHEN COALESCE(prev.arrivals, 0) = COALESCE(curr.arrivals, 0) 
      AND COALESCE(prev.departures, 0) = COALESCE(curr.departures, 0)
      AND COALESCE(prev.stay_overs, 0) = COALESCE(curr.stay_overs, 0)
    THEN 'MATCH'
    ELSE 'CHANGE'
  END as reconciliation_status
  
FROM housekeeping_forecasts curr
FULL OUTER JOIN housekeeping_forecasts prev
  ON prev.forecast_date = curr.forecast_date
  AND prev.room_type_name = curr.room_type_name
  AND prev.upload_id = 'previous_upload_uuid'

WHERE curr.upload_id = 'current_upload_uuid'
  OR prev.upload_id = 'previous_upload_uuid'

ORDER BY reconciliation_status DESC, forecast_date;
```

## 4. Real-Time Consistency Checks

### Trigger-Based Validation

```sql
-- Automatic validation on every INSERT/UPDATE
CREATE OR REPLACE FUNCTION validate_forecast_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Check 1: No negative values
  IF NEW.arrivals < 0 OR NEW.departures < 0 OR NEW.stay_overs < 0 THEN
    RAISE EXCEPTION 'Negative values not allowed';
  END IF;
  
  -- Check 2: Guest counts >= room counts
  IF NEW.arriving_guests < NEW.arrivals THEN
    RAISE EXCEPTION 'arriving_guests (%) must be >= arrivals (%)', 
      NEW.arriving_guests, NEW.arrivals;
  END IF;
  
  IF NEW.departing_guests < NEW.departures THEN
    RAISE EXCEPTION 'departing_guests (%) must be >= departures (%)',
      NEW.departing_guests, NEW.departures;
  END IF;
  
  IF NEW.stay_over_guests < NEW.stay_overs THEN
    RAISE EXCEPTION 'stay_over_guests (%) must be >= stay_overs (%)',
      NEW.stay_over_guests, NEW.stay_overs;
  END IF;
  
  -- Check 3: No zero without reason
  IF NEW.arrivals = 0 AND NEW.arriving_guests > 0 THEN
    RAISE EXCEPTION 'arrivals cannot be 0 when arriving_guests > 0';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_forecast
BEFORE INSERT OR UPDATE ON housekeeping_forecasts
FOR EACH ROW
EXECUTE FUNCTION validate_forecast_data();
```

### Application-Level Verification

```typescript
// Double-check after database write
async function verifyDataIntegrity(uploadId: string) {
  // Fetch what was just inserted
  const { data: inserted } = await supabase
    .from('housekeeping_forecasts')
    .select('*')
    .eq('upload_id', uploadId)
  
  // Verify each record
  for (const record of inserted) {
    const errors: string[] = []
    
    // Check 1: Values match upload log
    const uploadLog = await supabase
      .from('upload_logs')
      .select('raw_data')
      .eq('id', uploadId)
      .single()
    
    const key = `${record.forecast_date}_${record.room_type_name}`
    const original = uploadLog.data.raw_data[key]
    
    if (original.arrivals !== record.arrivals) {
      errors.push(`Arrivals mismatch: ${original.arrivals} -> ${record.arrivals}`)
    }
    
    // Check 2: Logical consistency
    if (record.arriving_guests < record.arrivals) {
      errors.push('Guest count < room count for arrivals')
    }
    
    // Check 3: No negative values
    if (record.arrivals < 0 || record.departures < 0) {
      errors.push('Negative values detected')
    }
    
    if (errors.length > 0) {
      console.error(`[v0] Data integrity error for ${key}:`, errors)
      // Alert operations team
      await notifyOps('DATA INTEGRITY ERROR', {
        uploadId,
        recordId: record.id,
        errors
      })
    }
  }
}
```

## 5. Audit Trail & Change Tracking

### Complete Audit Log

```sql
-- Every change is tracked
CREATE TABLE data_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(10) CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  
  -- Before/after values
  old_values JSONB,
  new_values JSONB,
  
  -- Who made the change
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Why
  change_reason TEXT,
  
  -- Verification
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT
);

-- Trigger to populate audit log
CREATE OR REPLACE FUNCTION audit_record_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO data_change_log 
    (table_name, record_id, operation, old_values, new_values, changed_by)
  VALUES (
    TG_TABLE_NAME,
    NEW.id,
    TG_OP,
    TO_JSONB(OLD),
    TO_JSONB(NEW),
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_housekeeping_changes
AFTER INSERT OR UPDATE OR DELETE ON housekeeping_forecasts
FOR EACH ROW
EXECUTE FUNCTION audit_record_change();
```

### Query the Audit Trail

```sql
-- See complete history of a specific record
SELECT 
  dcl.changed_at,
  dcl.operation,
  dcl.old_values->'arrivals' as old_arrivals,
  dcl.new_values->'arrivals' as new_arrivals,
  auth.users.email as changed_by
FROM data_change_log dcl
JOIN auth.users ON dcl.changed_by = auth.users.id
WHERE dcl.record_id = 'specific_forecast_id'
ORDER BY dcl.changed_at DESC;
```

## 6. Real-Time Sync Verification

### Detect Out-of-Sync Conditions

```typescript
// Check if database and application view are consistent
export async function verifySyncIntegrity() {
  const metrics = {
    database_record_count: 0,
    api_viewable_count: 0,
    cache_age_seconds: 0,
    last_sync_time: null,
    is_in_sync: false,
  }
  
  // Count from database
  const { count: dbCount } = await supabase
    .from('housekeeping_forecasts')
    .select('*', { count: 'exact', head: true })
  
  // Count from API
  const apiResponse = await fetch('/api/forecasts')
  const apiData = await apiResponse.json()
  
  metrics.database_record_count = dbCount
  metrics.api_viewable_count = apiData.data.length
  metrics.is_in_sync = dbCount === apiData.data.length
  
  // Check cache age
  const cacheHeader = apiResponse.headers.get('cache-control')
  metrics.cache_age_seconds = parseCacheAge(cacheHeader)
  
  if (!metrics.is_in_sync) {
    console.error('[v0] SYNC ERROR: Database and API out of sync!', metrics)
    
    // Trigger reconciliation
    await runFullReconciliation()
  }
  
  return metrics
}
```

## 7. Backup & Recovery Procedures

### Automated Backups

```typescript
// Daily backup to external storage
export async function createDailyBackup() {
  const now = new Date()
  const backupId = `backup_${now.toISOString().split('T')[0]}`
  
  // Export all data
  const { data: forecasts } = await supabase
    .from('housekeeping_forecasts')
    .select('*')
  
  const { data: uploads } = await supabase
    .from('upload_logs')
    .select('*')
  
  const backup = {
    timestamp: now.toISOString(),
    forecasts,
    uploads,
    checksums: {
      forecasts_count: forecasts.length,
      uploads_count: uploads.length,
      data_hash: hashData(forecasts + uploads)
    }
  }
  
  // Store backup
  await saveBackupToStorage(backupId, JSON.stringify(backup))
}
```

### Recovery from Backup

```sql
-- If data corruption detected, restore from known good state
-- 1. Identify last known good backup
SELECT MAX(backup_date) as latest_good_backup
FROM backup_logs
WHERE status = 'verified' AND corruption_detected = false;

-- 2. Restore data
TRUNCATE TABLE housekeeping_forecasts CASCADE;
INSERT INTO housekeeping_forecasts
SELECT * FROM backup_2025_01_14.housekeeping_forecasts;

-- 3. Verify integrity
SELECT COUNT(*) as restored_records,
       COUNT(DISTINCT forecast_date) as distinct_dates
FROM housekeeping_forecasts;

-- 4. Log recovery event
INSERT INTO system_events (event_type, description, severity)
VALUES ('DATA_RECOVERY', 'Restored from backup 2025-01-14', 'HIGH');
```

## 8. Integrity Monitoring Dashboard Metrics

### Key Metrics to Track

```typescript
interface DataIntegrityMetrics {
  // Validation metrics
  total_records: number
  records_passing_validation: number
  records_with_warnings: number
  records_with_errors: number
  validation_pass_rate: number  // % passing all checks
  
  // Reconciliation metrics
  current_vs_previous_match_rate: number
  average_change_magnitude: number
  unexpected_changes_detected: number
  
  // Sync metrics
  database_sync_status: 'OK' | 'WARNING' | 'ERROR'
  cache_freshness_seconds: number
  
  // Audit metrics
  total_audit_entries: number
  unverified_changes: number
  
  // Backup metrics
  days_since_last_backup: number
  backup_verification_status: 'OK' | 'WARNING' | 'ERROR'
}

async function generateIntegrityReport(): Promise<DataIntegrityMetrics> {
  return {
    total_records: await countTotalRecords(),
    records_passing_validation: await countValidRecords(),
    records_with_warnings: await countWarningRecords(),
    records_with_errors: await countErrorRecords(),
    validation_pass_rate: await calculatePassRate(),
    current_vs_previous_match_rate: await calculateMatchRate(),
    average_change_magnitude: await calculateAverageDelta(),
    unexpected_changes_detected: await detectAnomalies(),
    database_sync_status: await checkSyncStatus(),
    cache_freshness_seconds: getCacheFreshness(),
    total_audit_entries: await countAuditEntries(),
    unverified_changes: await countUnverifiedChanges(),
    days_since_last_backup: await daysSinceLastBackup(),
    backup_verification_status: await verifyBackupStatus(),
  }
}
```

## 9. Incident Response Procedures

### When Data Integrity Issues Are Detected

```
1. IMMEDIATE RESPONSE (0-5 minutes)
   ☐ Stop all uploads (set maintenance mode)
   ☐ Alert ops team
   ☐ Take database snapshot

2. INVESTIGATION (5-30 minutes)
   ☐ Identify affected records
   ☐ Determine root cause (parsing error, duplicate, bad upload, etc.)
   ☐ Calculate scope of impact

3. REMEDIATION (30-120 minutes)
   ☐ Choose correction strategy (delete, rollback, fix)
   ☐ Implement correction
   ☐ Verify integrity post-correction
   ☐ Update upload_logs with incident details

4. COMMUNICATION (ongoing)
   ☐ Notify stakeholders
   ☐ Provide ETA for resolution
   ☐ Send final status update

5. POST-INCIDENT (24 hours)
   ☐ Root cause analysis
   ☐ Implement preventive measures
   ☐ Update procedures
   ☐ Team debrief
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-15  
**Next Review**: 2025-04-15
