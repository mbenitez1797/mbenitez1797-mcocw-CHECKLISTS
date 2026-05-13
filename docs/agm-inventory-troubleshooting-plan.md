# AGM Checklist Inventory Number Mapping: Troubleshooting & Correction Plan

## Executive Summary

This document provides a comprehensive troubleshooting and correction plan to address number mapping accuracy issues between the AGM (Annual General Meeting) checklist upload process and the inventory management system. The goal is to ensure data integrity, accurate real-time inventory reflection, and prevent future discrepancies.

---

## Table of Contents

1. [Problem Identification](#1-problem-identification)
2. [Root Cause Analysis Framework](#2-root-cause-analysis-framework)
3. [Number Source Verification Protocol](#3-number-source-verification-protocol)
4. [Correction Implementation Steps](#4-correction-implementation-steps)
5. [Data Parsing & Mapping Modifications](#5-data-parsing--mapping-modifications)
6. [Validation & Testing Procedures](#6-validation--testing-procedures)
7. [Monitoring & Prevention Strategy](#7-monitoring--prevention-strategy)
8. [Data Integrity Assurance](#8-data-integrity-assurance)

---

## 1. Problem Identification

### 1.1 Common Number Mapping Issues

| Issue Type | Description | Impact Level |
|------------|-------------|--------------|
| **Field Misalignment** | Source columns mapped to incorrect destination fields | Critical |
| **Data Type Mismatch** | Numeric values parsed as strings or vice versa | High |
| **Decimal Precision Loss** | Rounding errors during conversion | Medium |
| **Unit Conversion Errors** | Quantities not converted between units properly | Critical |
| **Duplicate Key Conflicts** | Same inventory item mapped multiple times | High |
| **Null/Empty Value Handling** | Missing values not handled consistently | Medium |
| **Index Offset Errors** | Off-by-one errors in array/column indexing | Critical |
| **Date-to-Number Parsing** | Dates incorrectly interpreted as serial numbers | High |

### 1.2 Symptoms Checklist

- [ ] Inventory counts don't match physical counts after upload
- [ ] Specific items consistently show incorrect quantities
- [ ] Numbers appear shifted by one row/column
- [ ] Decimal values truncated or rounded unexpectedly
- [ ] Negative numbers appearing where only positive expected
- [ ] Scientific notation appearing in integer fields
- [ ] Zero values overwriting existing inventory data
- [ ] Duplicate entries created for single items

---

## 2. Root Cause Analysis Framework

### 2.1 Diagnostic Decision Tree

```
START: Number Mapping Issue Detected
│
├─► Is the issue consistent across all uploads?
│   ├─ YES → Systematic mapping configuration error
│   │        └─► Check: mapping_config.json, field definitions
│   │
│   └─ NO → Data-specific or conditional logic issue
│           └─► Check: specific file formats, edge cases
│
├─► Does the issue affect specific columns only?
│   ├─ YES → Column-level mapping misconfiguration
│   │        └─► Verify: column index, header matching logic
│   │
│   └─ NO → Global parsing or transformation issue
│           └─► Check: data type coercion, number formatting
│
├─► Are the numbers off by a predictable amount?
│   ├─ YES → Unit conversion or multiplier error
│   │        └─► Review: unit mappings, conversion factors
│   │
│   └─ NO → Data corruption or parsing failure
│           └─► Inspect: raw file encoding, special characters
│
└─► END: Root cause identified → Proceed to Section 4
```

### 2.2 Root Cause Categories

#### Category A: Configuration Errors
```typescript
// Example: Incorrect field mapping configuration
interface MappingConfig {
  sourceField: string;      // Field name in AGM checklist
  targetField: string;      // Field name in inventory system
  dataType: 'number' | 'integer' | 'decimal' | 'string';
  transformations?: TransformRule[];
}

// PROBLEM: Source and target fields swapped
const INCORRECT_MAPPING = {
  sourceField: 'inventory_count',    // Actually contains SKU
  targetField: 'sku',                // Should receive count
};

// CORRECT: Properly aligned fields
const CORRECT_MAPPING = {
  sourceField: 'quantity_on_hand',
  targetField: 'inventory_count',
  dataType: 'integer',
};
```

#### Category B: Parsing Logic Errors
```typescript
// PROBLEM: Incorrect number parsing
const parseQuantity = (value: string): number => {
  // Bug: Doesn't handle comma separators
  return parseInt(value); // "1,234" → 1 (incorrect)
};

// CORRECT: Proper number parsing
const parseQuantityCorrect = (value: string): number => {
  const cleaned = value.replace(/,/g, '').trim();
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    throw new NumberParsingError(`Invalid quantity: ${value}`);
  }
  
  return Math.round(parsed); // For integer quantities
};
```

#### Category C: Data Source Issues
```typescript
// Common AGM checklist data quality issues
const DATA_SOURCE_ISSUES = {
  encodingProblems: 'Non-UTF8 characters corrupting numbers',
  excelFormatting: 'Hidden formatting affecting raw values',
  formulaErrors: 'Cells containing formulas instead of values',
  mergedCells: 'Merged cells causing row/column misalignment',
  hiddenRows: 'Hidden rows/columns shifting indices',
};
```

### 2.3 Investigation Checklist

- [ ] **Step 1:** Export raw AGM checklist data without processing
- [ ] **Step 2:** Compare exported values to original source document
- [ ] **Step 3:** Trace number through each transformation step
- [ ] **Step 4:** Log intermediate values at each processing stage
- [ ] **Step 5:** Compare final inventory values to expected values
- [ ] **Step 6:** Document any discrepancies with specific examples

---

## 3. Number Source Verification Protocol

### 3.1 Source Tracing Methodology

```typescript
interface NumberTraceRecord {
  timestamp: Date;
  stage: 'source' | 'extraction' | 'transformation' | 'validation' | 'destination';
  fieldName: string;
  originalValue: unknown;
  processedValue: number | null;
  transformationsApplied: string[];
  validationStatus: 'passed' | 'failed' | 'warning';
  errorDetails?: string;
}

// Implement comprehensive number tracing
class NumberSourceTracer {
  private traces: Map<string, NumberTraceRecord[]> = new Map();
  
  traceNumber(
    itemId: string,
    stage: NumberTraceRecord['stage'],
    fieldName: string,
    originalValue: unknown,
    processedValue: number | null,
    transformations: string[] = []
  ): void {
    const record: NumberTraceRecord = {
      timestamp: new Date(),
      stage,
      fieldName,
      originalValue,
      processedValue,
      transformationsApplied: transformations,
      validationStatus: this.validate(originalValue, processedValue),
    };
    
    const existing = this.traces.get(itemId) || [];
    existing.push(record);
    this.traces.set(itemId, existing);
  }
  
  generateAuditReport(itemId: string): NumberAuditReport {
    const records = this.traces.get(itemId) || [];
    return {
      itemId,
      traceCount: records.length,
      stages: records,
      hasDiscrepancies: records.some(r => r.validationStatus === 'failed'),
      recommendations: this.analyzeDiscrepancies(records),
    };
  }
}
```

### 3.2 Source Verification Checklist

#### For Each Number Field:

| Step | Action | Verification Method |
|------|--------|---------------------|
| 1 | Identify source cell/field | Document exact location (Row X, Column Y) |
| 2 | Extract raw value | Log before any processing |
| 3 | Verify data type | Check `typeof` and format |
| 4 | Compare to manual entry | Side-by-side comparison |
| 5 | Track transformations | Log each modification |
| 6 | Validate final value | Compare to expected result |

### 3.3 Verification Queries

```sql
-- Query to identify number mapping discrepancies
SELECT 
    agm.item_id,
    agm.source_quantity AS agm_value,
    inv.current_quantity AS inventory_value,
    ABS(agm.source_quantity - inv.current_quantity) AS discrepancy,
    CASE 
        WHEN agm.source_quantity = inv.current_quantity THEN 'MATCH'
        WHEN agm.source_quantity IS NULL THEN 'MISSING_SOURCE'
        WHEN inv.current_quantity IS NULL THEN 'MISSING_INVENTORY'
        ELSE 'MISMATCH'
    END AS status,
    agm.upload_timestamp,
    agm.source_file_name
FROM agm_checklist_uploads agm
LEFT JOIN inventory_items inv ON agm.item_id = inv.item_id
WHERE agm.upload_date = CURRENT_DATE
    AND (agm.source_quantity != inv.current_quantity 
         OR agm.source_quantity IS NULL 
         OR inv.current_quantity IS NULL)
ORDER BY discrepancy DESC;

-- Identify patterns in discrepancies
SELECT 
    source_field_name,
    COUNT(*) AS occurrence_count,
    AVG(ABS(source_value - mapped_value)) AS avg_discrepancy,
    MIN(source_value) AS min_source,
    MAX(source_value) AS max_source,
    STRING_AGG(DISTINCT error_type, ', ') AS error_types
FROM mapping_audit_log
WHERE mapping_status = 'DISCREPANCY'
GROUP BY source_field_name
ORDER BY occurrence_count DESC;
```

---

## 4. Correction Implementation Steps

### 4.1 Immediate Remediation Workflow

```
Phase 1: Assessment (Day 1)
├─► Freeze affected uploads (prevent further data corruption)
├─► Generate discrepancy report using verification queries
├─► Categorize issues by root cause type
└─► Prioritize based on impact severity

Phase 2: Data Recovery (Days 2-3)
├─► Export backup of current inventory state
├─► Identify correct source values from AGM checklists
├─► Create correction delta dataset
└─► Review corrections with stakeholders

Phase 3: Correction Application (Day 4)
├─► Apply corrections in staging environment
├─► Validate corrected values match source
├─► Generate before/after comparison report
└─► Deploy corrections to production (with rollback plan)

Phase 4: Verification (Day 5)
├─► Run full reconciliation between AGM and inventory
├─► Confirm zero discrepancy count
├─► Document lessons learned
└─► Update monitoring alerts
```

### 4.2 Correction Script Template

```typescript
import { db } from '@/lib/database';

interface CorrectionRecord {
  itemId: string;
  fieldName: string;
  incorrectValue: number;
  correctValue: number;
  correctionReason: string;
  sourceReference: string;
}

async function applyInventoryCorrections(
  corrections: CorrectionRecord[],
  options: { dryRun?: boolean; batchSize?: number } = {}
): Promise<CorrectionResult> {
  const { dryRun = true, batchSize = 100 } = options;
  
  const results: CorrectionResult = {
    attempted: corrections.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };
  
  // Create audit log entry
  const auditLogId = await db.correctionAuditLog.create({
    data: {
      initiatedAt: new Date(),
      correctionCount: corrections.length,
      isDryRun: dryRun,
      status: 'IN_PROGRESS',
    },
  });
  
  // Process in batches
  for (let i = 0; i < corrections.length; i += batchSize) {
    const batch = corrections.slice(i, i + batchSize);
    
    await db.$transaction(async (tx) => {
      for (const correction of batch) {
        try {
          // Verify current value matches expected incorrect value
          const currentItem = await tx.inventoryItem.findUnique({
            where: { id: correction.itemId },
            select: { [correction.fieldName]: true },
          });
          
          const currentValue = currentItem?.[correction.fieldName];
          
          if (currentValue !== correction.incorrectValue) {
            results.skipped++;
            results.errors.push({
              itemId: correction.itemId,
              error: `Value mismatch: expected ${correction.incorrectValue}, found ${currentValue}`,
            });
            continue;
          }
          
          if (!dryRun) {
            // Apply correction
            await tx.inventoryItem.update({
              where: { id: correction.itemId },
              data: { [correction.fieldName]: correction.correctValue },
            });
            
            // Log individual correction
            await tx.correctionDetail.create({
              data: {
                auditLogId,
                itemId: correction.itemId,
                fieldName: correction.fieldName,
                previousValue: correction.incorrectValue,
                newValue: correction.correctValue,
                reason: correction.correctionReason,
                sourceReference: correction.sourceReference,
              },
            });
          }
          
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            itemId: correction.itemId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    });
  }
  
  // Update audit log
  await db.correctionAuditLog.update({
    where: { id: auditLogId },
    data: {
      completedAt: new Date(),
      status: results.failed > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED',
      successCount: results.successful,
      failCount: results.failed,
      skipCount: results.skipped,
    },
  });
  
  return results;
}
```

### 4.3 Rollback Procedure

```typescript
async function rollbackCorrections(auditLogId: string): Promise<void> {
  const corrections = await db.correctionDetail.findMany({
    where: { auditLogId },
  });
  
  await db.$transaction(async (tx) => {
    for (const correction of corrections) {
      await tx.inventoryItem.update({
        where: { id: correction.itemId },
        data: { [correction.fieldName]: correction.previousValue },
      });
    }
    
    await tx.correctionAuditLog.update({
      where: { id: auditLogId },
      data: {
        status: 'ROLLED_BACK',
        rolledBackAt: new Date(),
      },
    });
  });
}
```

---

## 5. Data Parsing & Mapping Modifications

### 5.1 Enhanced Parsing Configuration

```typescript
// /lib/agm-parser/config.ts

export interface FieldMappingConfig {
  sourceField: string;
  targetField: string;
  dataType: 'integer' | 'decimal' | 'currency' | 'percentage' | 'string';
  required: boolean;
  defaultValue?: number;
  validationRules: ValidationRule[];
  transformations: TransformationRule[];
}

export interface ValidationRule {
  type: 'range' | 'regex' | 'custom';
  params: Record<string, unknown>;
  errorMessage: string;
  severity: 'error' | 'warning';
}

export interface TransformationRule {
  type: 'multiply' | 'divide' | 'round' | 'floor' | 'ceil' | 'custom';
  params: Record<string, unknown>;
  order: number;
}

// Example: Complete mapping configuration
export const INVENTORY_MAPPING_CONFIG: FieldMappingConfig[] = [
  {
    sourceField: 'Quantity On Hand',
    targetField: 'currentQuantity',
    dataType: 'integer',
    required: true,
    defaultValue: 0,
    validationRules: [
      {
        type: 'range',
        params: { min: 0, max: 1000000 },
        errorMessage: 'Quantity must be between 0 and 1,000,000',
        severity: 'error',
      },
    ],
    transformations: [
      { type: 'round', params: { decimals: 0 }, order: 1 },
    ],
  },
  {
    sourceField: 'Unit Price',
    targetField: 'unitPrice',
    dataType: 'currency',
    required: true,
    validationRules: [
      {
        type: 'range',
        params: { min: 0.01, max: 999999.99 },
        errorMessage: 'Price must be between $0.01 and $999,999.99',
        severity: 'error',
      },
    ],
    transformations: [
      { type: 'round', params: { decimals: 2 }, order: 1 },
    ],
  },
  {
    sourceField: 'Reorder Point',
    targetField: 'reorderThreshold',
    dataType: 'integer',
    required: false,
    defaultValue: 10,
    validationRules: [
      {
        type: 'range',
        params: { min: 0, max: 10000 },
        errorMessage: 'Reorder point must be between 0 and 10,000',
        severity: 'warning',
      },
    ],
    transformations: [],
  },
];
```

### 5.2 Robust Number Parser

```typescript
// /lib/agm-parser/number-parser.ts

export class NumberParser {
  private locale: string;
  
  constructor(locale: string = 'en-US') {
    this.locale = locale;
  }
  
  /**
   * Parse a value to a number with comprehensive error handling
   */
  parse(
    value: unknown,
    config: FieldMappingConfig
  ): ParseResult {
    const result: ParseResult = {
      success: false,
      value: null,
      originalValue: value,
      warnings: [],
      errors: [],
    };
    
    // Handle null/undefined
    if (value === null || value === undefined || value === '') {
      if (config.required) {
        result.errors.push(`Required field "${config.sourceField}" is empty`);
        return result;
      }
      result.value = config.defaultValue ?? null;
      result.success = true;
      return result;
    }
    
    // Convert to string for processing
    let stringValue = String(value).trim();
    
    // Handle special Excel values
    if (this.isExcelError(stringValue)) {
      result.errors.push(`Excel error value detected: ${stringValue}`);
      return result;
    }
    
    // Remove currency symbols and formatting
    stringValue = this.cleanNumericString(stringValue, config.dataType);
    
    // Parse based on data type
    let numericValue: number;
    
    switch (config.dataType) {
      case 'integer':
        numericValue = this.parseInteger(stringValue);
        break;
      case 'decimal':
      case 'currency':
        numericValue = this.parseDecimal(stringValue);
        break;
      case 'percentage':
        numericValue = this.parsePercentage(stringValue);
        break;
      default:
        numericValue = parseFloat(stringValue);
    }
    
    // Check for NaN
    if (isNaN(numericValue)) {
      result.errors.push(
        `Cannot parse "${value}" as ${config.dataType} for field "${config.sourceField}"`
      );
      return result;
    }
    
    // Apply transformations
    numericValue = this.applyTransformations(numericValue, config.transformations);
    
    // Run validations
    const validationResult = this.runValidations(numericValue, config);
    result.warnings.push(...validationResult.warnings);
    result.errors.push(...validationResult.errors);
    
    if (validationResult.errors.length > 0) {
      return result;
    }
    
    result.value = numericValue;
    result.success = true;
    return result;
  }
  
  private cleanNumericString(value: string, dataType: string): string {
    let cleaned = value;
    
    // Remove currency symbols
    cleaned = cleaned.replace(/[$€£¥₹]/g, '');
    
    // Remove percentage sign
    if (dataType !== 'percentage') {
      cleaned = cleaned.replace(/%/g, '');
    }
    
    // Handle different thousand separators based on locale
    if (this.locale === 'en-US') {
      // US format: 1,234.56
      cleaned = cleaned.replace(/,/g, '');
    } else if (this.locale === 'de-DE' || this.locale === 'es-ES') {
      // European format: 1.234,56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
    
    // Remove spaces (thousand separators in some locales)
    cleaned = cleaned.replace(/\s/g, '');
    
    // Handle parentheses for negative numbers
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
      cleaned = '-' + cleaned.slice(1, -1);
    }
    
    return cleaned;
  }
  
  private parseInteger(value: string): number {
    const parsed = parseFloat(value);
    // Check if value was actually an integer
    if (!Number.isInteger(parsed) && !isNaN(parsed)) {
      console.warn(`Value ${value} truncated to integer: ${Math.round(parsed)}`);
    }
    return Math.round(parsed);
  }
  
  private parseDecimal(value: string): number {
    return parseFloat(value);
  }
  
  private parsePercentage(value: string): number {
    let cleaned = value.replace(/%/g, '');
    const parsed = parseFloat(cleaned);
    // If value > 1, assume it's already a percentage (e.g., 50 means 50%)
    // If value <= 1, assume it's a decimal (e.g., 0.5 means 50%)
    return parsed > 1 ? parsed / 100 : parsed;
  }
  
  private isExcelError(value: string): boolean {
    const excelErrors = ['#N/A', '#VALUE!', '#REF!', '#DIV/0!', '#NUM!', '#NAME?', '#NULL!'];
    return excelErrors.includes(value.toUpperCase());
  }
  
  private applyTransformations(
    value: number,
    transformations: TransformationRule[]
  ): number {
    const sorted = [...transformations].sort((a, b) => a.order - b.order);
    
    return sorted.reduce((current, transform) => {
      switch (transform.type) {
        case 'multiply':
          return current * (transform.params.factor as number);
        case 'divide':
          return current / (transform.params.factor as number);
        case 'round':
          const decimals = transform.params.decimals as number;
          return Math.round(current * 10 ** decimals) / 10 ** decimals;
        case 'floor':
          return Math.floor(current);
        case 'ceil':
          return Math.ceil(current);
        default:
          return current;
      }
    }, value);
  }
  
  private runValidations(
    value: number,
    config: FieldMappingConfig
  ): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    for (const rule of config.validationRules) {
      let isValid = true;
      
      switch (rule.type) {
        case 'range':
          const { min, max } = rule.params as { min: number; max: number };
          isValid = value >= min && value <= max;
          break;
        case 'regex':
          const pattern = new RegExp(rule.params.pattern as string);
          isValid = pattern.test(String(value));
          break;
      }
      
      if (!isValid) {
        if (rule.severity === 'error') {
          errors.push(rule.errorMessage);
        } else {
          warnings.push(rule.errorMessage);
        }
      }
    }
    
    return { warnings, errors };
  }
}

interface ParseResult {
  success: boolean;
  value: number | null;
  originalValue: unknown;
  warnings: string[];
  errors: string[];
}
```

### 5.3 Column Mapping Auto-Detection

```typescript
// /lib/agm-parser/column-detector.ts

interface ColumnMatch {
  sourceIndex: number;
  sourceHeader: string;
  targetField: string;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'position' | 'none';
}

export class ColumnDetector {
  private headerAliases: Map<string, string[]> = new Map([
    ['currentQuantity', ['quantity', 'qty', 'quantity on hand', 'qoh', 'stock', 'count', 'units']],
    ['itemCode', ['sku', 'item code', 'item #', 'item number', 'product code', 'part number']],
    ['unitPrice', ['price', 'unit price', 'cost', 'unit cost', 'rate']],
    ['description', ['description', 'desc', 'item description', 'name', 'product name']],
    ['reorderThreshold', ['reorder point', 'reorder level', 'min stock', 'minimum']],
  ]);
  
  detectColumns(
    headers: string[],
    expectedFields: string[]
  ): ColumnMatch[] {
    const matches: ColumnMatch[] = [];
    
    for (const field of expectedFields) {
      const aliases = this.headerAliases.get(field) || [field];
      let bestMatch: ColumnMatch = {
        sourceIndex: -1,
        sourceHeader: '',
        targetField: field,
        confidence: 0,
        matchType: 'none',
      };
      
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i].toLowerCase().trim();
        
        // Check exact match
        if (aliases.some(alias => alias.toLowerCase() === header)) {
          bestMatch = {
            sourceIndex: i,
            sourceHeader: headers[i],
            targetField: field,
            confidence: 1.0,
            matchType: 'exact',
          };
          break;
        }
        
        // Check fuzzy match
        for (const alias of aliases) {
          const similarity = this.calculateSimilarity(header, alias.toLowerCase());
          if (similarity > bestMatch.confidence && similarity > 0.7) {
            bestMatch = {
              sourceIndex: i,
              sourceHeader: headers[i],
              targetField: field,
              confidence: similarity,
              matchType: 'fuzzy',
            };
          }
        }
      }
      
      matches.push(bestMatch);
    }
    
    // Validate for conflicts (same source mapped to multiple targets)
    this.validateMatches(matches);
    
    return matches;
  }
  
  private calculateSimilarity(str1: string, str2: string): number {
    // Levenshtein distance-based similarity
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    const distance = this.levenshteinDistance(str1, str2);
    return (maxLen - distance) / maxLen;
  }
  
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + 1
          );
        }
      }
    }
    
    return dp[m][n];
  }
  
  private validateMatches(matches: ColumnMatch[]): void {
    const usedIndices = new Map<number, string>();
    
    for (const match of matches) {
      if (match.sourceIndex >= 0) {
        const existing = usedIndices.get(match.sourceIndex);
        if (existing) {
          console.warn(
            `Column ${match.sourceIndex} (${match.sourceHeader}) mapped to multiple fields: ` +
            `${existing} and ${match.targetField}`
          );
          // Keep the higher confidence match
          const existingMatch = matches.find(m => m.targetField === existing);
          if (existingMatch && match.confidence > existingMatch.confidence) {
            existingMatch.sourceIndex = -1;
            existingMatch.confidence = 0;
            existingMatch.matchType = 'none';
          } else {
            match.sourceIndex = -1;
            match.confidence = 0;
            match.matchType = 'none';
          }
        } else {
          usedIndices.set(match.sourceIndex, match.targetField);
        }
      }
    }
  }
}
```

---

## 6. Validation & Testing Procedures

### 6.1 Automated Test Suite

```typescript
// /lib/agm-parser/__tests__/number-mapping.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { NumberParser } from '../number-parser';
import { processAGMUpload } from '../processor';
import { INVENTORY_MAPPING_CONFIG } from '../config';

describe('Number Mapping Accuracy', () => {
  let parser: NumberParser;
  
  beforeEach(() => {
    parser = new NumberParser('en-US');
  });
  
  describe('Number Parsing', () => {
    it('should parse plain integers correctly', () => {
      const config = INVENTORY_MAPPING_CONFIG.find(c => c.dataType === 'integer')!;
      
      const testCases = [
        { input: '100', expected: 100 },
        { input: '0', expected: 0 },
        { input: '999999', expected: 999999 },
        { input: '-50', expected: -50 },
      ];
      
      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input, config);
        expect(result.success).toBe(true);
        expect(result.value).toBe(expected);
      });
    });
    
    it('should handle formatted numbers correctly', () => {
      const config = INVENTORY_MAPPING_CONFIG.find(c => c.dataType === 'integer')!;
      
      const testCases = [
        { input: '1,234', expected: 1234 },
        { input: '1,234,567', expected: 1234567 },
        { input: '  500  ', expected: 500 },
      ];
      
      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input, config);
        expect(result.success).toBe(true);
        expect(result.value).toBe(expected);
      });
    });
    
    it('should parse currency values correctly', () => {
      const config = INVENTORY_MAPPING_CONFIG.find(c => c.dataType === 'currency')!;
      
      const testCases = [
        { input: '$19.99', expected: 19.99 },
        { input: '€1,234.56', expected: 1234.56 },
        { input: '100.00', expected: 100.00 },
        { input: '$1,000,000.00', expected: 1000000.00 },
      ];
      
      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input, config);
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(expected, 2);
      });
    });
    
    it('should handle Excel error values', () => {
      const config = INVENTORY_MAPPING_CONFIG[0];
      
      const errorValues = ['#N/A', '#VALUE!', '#REF!', '#DIV/0!'];
      
      errorValues.forEach(errorValue => {
        const result = parser.parse(errorValue, config);
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
    
    it('should apply default values for empty required fields', () => {
      const config = { ...INVENTORY_MAPPING_CONFIG[0], required: false, defaultValue: 0 };
      
      const emptyValues = ['', null, undefined];
      
      emptyValues.forEach(emptyValue => {
        const result = parser.parse(emptyValue, config);
        expect(result.success).toBe(true);
        expect(result.value).toBe(0);
      });
    });
  });
  
  describe('End-to-End Upload Processing', () => {
    it('should correctly map all fields from sample AGM data', async () => {
      const sampleData = [
        {
          'Item Code': 'SKU-001',
          'Description': 'Widget A',
          'Quantity On Hand': '1,234',
          'Unit Price': '$19.99',
          'Reorder Point': '50',
        },
        {
          'Item Code': 'SKU-002',
          'Description': 'Widget B',
          'Quantity On Hand': '567',
          'Unit Price': '$29.99',
          'Reorder Point': '25',
        },
      ];
      
      const result = await processAGMUpload(sampleData);
      
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual(expect.objectContaining({
        itemCode: 'SKU-001',
        currentQuantity: 1234,
        unitPrice: 19.99,
        reorderThreshold: 50,
      }));
    });
    
    it('should detect and report column mapping issues', async () => {
      const misalignedData = [
        {
          'SKU Number': 'SKU-001', // Different header than expected
          'Qty': '100',            // Different header than expected
        },
      ];
      
      const result = await processAGMUpload(misalignedData, { strictMapping: false });
      
      expect(result.warnings).toContain(
        expect.stringMatching(/fuzzy match|column mapping/i)
      );
    });
  });
  
  describe('Regression Tests', () => {
    // Add specific regression tests for previously identified bugs
    
    it('REGRESSION: should not shift values by one column', async () => {
      // This test catches the bug where quantity was mapped to price column
      const data = [
        { 'A': 'SKU-001', 'B': '100', 'C': '25.00' },
      ];
      
      const result = await processAGMUpload(data, {
        columnMapping: {
          'A': 'itemCode',
          'B': 'currentQuantity',
          'C': 'unitPrice',
        },
      });
      
      expect(result.items[0].currentQuantity).toBe(100);
      expect(result.items[0].unitPrice).toBe(25.00);
    });
    
    it('REGRESSION: should preserve decimal precision for prices', async () => {
      const data = [{ 'Price': '19.9999999' }];
      
      const result = await processAGMUpload(data);
      
      // Should round to 2 decimal places
      expect(result.items[0].unitPrice).toBe(20.00);
    });
  });
});
```

### 6.2 Reconciliation Report Generator

```typescript
// /lib/agm-parser/reconciliation.ts

interface ReconciliationReport {
  generatedAt: Date;
  summary: {
    totalItems: number;
    matchedItems: number;
    mismatchedItems: number;
    missingInAGM: number;
    missingInInventory: number;
    matchRate: number;
  };
  discrepancies: DiscrepancyRecord[];
  recommendations: string[];
}

interface DiscrepancyRecord {
  itemId: string;
  field: string;
  agmValue: number | null;
  inventoryValue: number | null;
  difference: number;
  percentageDifference: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export async function generateReconciliationReport(
  agmUploadId: string
): Promise<ReconciliationReport> {
  // Fetch AGM upload data
  const agmData = await db.agmUpload.findUnique({
    where: { id: agmUploadId },
    include: { items: true },
  });
  
  // Fetch current inventory data
  const inventoryData = await db.inventoryItem.findMany({
    where: {
      itemCode: { in: agmData.items.map(i => i.itemCode) },
    },
  });
  
  const inventoryMap = new Map(inventoryData.map(i => [i.itemCode, i]));
  const agmMap = new Map(agmData.items.map(i => [i.itemCode, i]));
  
  const discrepancies: DiscrepancyRecord[] = [];
  let matchedCount = 0;
  
  // Compare each AGM item against inventory
  for (const agmItem of agmData.items) {
    const invItem = inventoryMap.get(agmItem.itemCode);
    
    if (!invItem) {
      discrepancies.push({
        itemId: agmItem.itemCode,
        field: 'existence',
        agmValue: null,
        inventoryValue: null,
        difference: 0,
        percentageDifference: 0,
        severity: 'high',
      });
      continue;
    }
    
    // Compare numeric fields
    const fieldsToCompare = ['currentQuantity', 'unitPrice', 'reorderThreshold'];
    let hasDiscrepancy = false;
    
    for (const field of fieldsToCompare) {
      const agmValue = agmItem[field] as number;
      const invValue = invItem[field] as number;
      
      if (agmValue !== invValue) {
        hasDiscrepancy = true;
        const diff = Math.abs(agmValue - invValue);
        const percentDiff = invValue !== 0 ? (diff / invValue) * 100 : 100;
        
        discrepancies.push({
          itemId: agmItem.itemCode,
          field,
          agmValue,
          inventoryValue: invValue,
          difference: diff,
          percentageDifference: percentDiff,
          severity: determineSeverity(field, percentDiff),
        });
      }
    }
    
    if (!hasDiscrepancy) {
      matchedCount++;
    }
  }
  
  // Check for items in inventory but not in AGM
  for (const invItem of inventoryData) {
    if (!agmMap.has(invItem.itemCode)) {
      discrepancies.push({
        itemId: invItem.itemCode,
        field: 'existence',
        agmValue: null,
        inventoryValue: null,
        difference: 0,
        percentageDifference: 0,
        severity: 'medium',
      });
    }
  }
  
  const totalItems = new Set([...agmMap.keys(), ...inventoryMap.keys()]).size;
  
  return {
    generatedAt: new Date(),
    summary: {
      totalItems,
      matchedItems: matchedCount,
      mismatchedItems: discrepancies.filter(d => d.field !== 'existence').length,
      missingInAGM: discrepancies.filter(d => d.field === 'existence' && d.inventoryValue !== null).length,
      missingInInventory: discrepancies.filter(d => d.field === 'existence' && d.agmValue !== null).length,
      matchRate: (matchedCount / totalItems) * 100,
    },
    discrepancies,
    recommendations: generateRecommendations(discrepancies),
  };
}

function determineSeverity(field: string, percentDiff: number): DiscrepancyRecord['severity'] {
  if (field === 'currentQuantity') {
    if (percentDiff > 50) return 'critical';
    if (percentDiff > 25) return 'high';
    if (percentDiff > 10) return 'medium';
    return 'low';
  }
  
  if (field === 'unitPrice') {
    if (percentDiff > 20) return 'critical';
    if (percentDiff > 10) return 'high';
    if (percentDiff > 5) return 'medium';
    return 'low';
  }
  
  return percentDiff > 25 ? 'medium' : 'low';
}

function generateRecommendations(discrepancies: DiscrepancyRecord[]): string[] {
  const recommendations: string[] = [];
  
  const criticalCount = discrepancies.filter(d => d.severity === 'critical').length;
  const highCount = discrepancies.filter(d => d.severity === 'high').length;
  
  if (criticalCount > 0) {
    recommendations.push(
      `URGENT: ${criticalCount} critical discrepancies require immediate investigation`
    );
  }
  
  if (highCount > 10) {
    recommendations.push(
      'Consider reviewing the column mapping configuration - high number of discrepancies suggests systematic issue'
    );
  }
  
  const quantityDiscrepancies = discrepancies.filter(d => d.field === 'currentQuantity');
  if (quantityDiscrepancies.length > 0) {
    const avgDiff = quantityDiscrepancies.reduce((sum, d) => sum + d.difference, 0) / quantityDiscrepancies.length;
    if (Math.abs(avgDiff - Math.round(avgDiff)) < 0.01) {
      recommendations.push(
        `Average quantity discrepancy is approximately ${Math.round(avgDiff)} - possible unit conversion issue`
      );
    }
  }
  
  return recommendations;
}
```

### 6.3 Validation Checklist

#### Pre-Upload Validation
- [ ] Source file format verified (Excel, CSV, etc.)
- [ ] Required columns present and correctly named
- [ ] Data types match expected formats
- [ ] No Excel formula errors in data cells
- [ ] Character encoding is UTF-8
- [ ] No hidden rows/columns affecting data

#### During-Upload Validation
- [ ] Column mapping correctly detected
- [ ] All required fields populated
- [ ] Numeric values within valid ranges
- [ ] No duplicate item codes
- [ ] Transformation rules applied correctly
- [ ] Warnings logged for edge cases

#### Post-Upload Validation
- [ ] Reconciliation report generated
- [ ] Match rate meets threshold (>99%)
- [ ] No critical discrepancies
- [ ] Sample verification completed
- [ ] Audit log entry created

---

## 7. Monitoring & Prevention Strategy

### 7.1 Real-Time Monitoring Dashboard

```typescript
// /components/inventory/monitoring-dashboard.tsx

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface MappingMetrics {
  totalUploads24h: number;
  successRate: number;
  avgProcessingTime: number;
  discrepancyCount: number;
  criticalAlerts: number;
  pendingReview: number;
}

export function MappingMonitoringDashboard() {
  const [metrics, setMetrics] = useState<MappingMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await fetch('/api/inventory/mapping-metrics');
      const data = await response.json();
      setMetrics(data.metrics);
      setAlerts(data.alerts);
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  if (!metrics) return <div>Loading...</div>;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mapping Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</span>
              <Badge variant={metrics.successRate > 99 ? 'default' : 'destructive'}>
                {metrics.successRate > 99 ? 'Healthy' : 'Needs Attention'}
              </Badge>
            </div>
            <Progress value={metrics.successRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Discrepancies (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{metrics.discrepancyCount}</span>
              {metrics.discrepancyCount === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.pendingReview} pending review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{metrics.criticalAlerts}</span>
              {metrics.criticalAlerts > 0 && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Active Alerts</h3>
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.title}</strong>: {alert.message}
                <span className="text-xs text-muted-foreground ml-2">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 7.2 Automated Alert Configuration

```typescript
// /lib/alerts/mapping-alerts.ts

interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: MappingMetrics, recentUploads: UploadRecord[]) => boolean;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  cooldownMinutes: number;
}

export const MAPPING_ALERT_RULES: AlertRule[] = [
  {
    id: 'success-rate-drop',
    name: 'Mapping Success Rate Below Threshold',
    condition: (metrics) => metrics.successRate < 99,
    severity: 'warning',
    message: 'Mapping success rate has dropped below 99%',
    cooldownMinutes: 30,
  },
  {
    id: 'success-rate-critical',
    name: 'Mapping Success Rate Critical',
    condition: (metrics) => metrics.successRate < 95,
    severity: 'critical',
    message: 'CRITICAL: Mapping success rate below 95% - immediate investigation required',
    cooldownMinutes: 5,
  },
  {
    id: 'discrepancy-spike',
    name: 'Discrepancy Count Spike',
    condition: (metrics, recentUploads) => {
      const hourlyAvg = recentUploads
        .filter(u => u.timestamp > Date.now() - 3600000)
        .reduce((sum, u) => sum + u.discrepancyCount, 0) / Math.max(recentUploads.length, 1);
      return hourlyAvg > 10;
    },
    severity: 'warning',
    message: 'Unusual spike in discrepancies detected in the last hour',
    cooldownMinutes: 60,
  },
  {
    id: 'same-error-repeated',
    name: 'Repeated Error Pattern',
    condition: (metrics, recentUploads) => {
      const errors = recentUploads.flatMap(u => u.errors);
      const errorCounts = new Map<string, number>();
      errors.forEach(e => errorCounts.set(e.code, (errorCounts.get(e.code) || 0) + 1));
      return Array.from(errorCounts.values()).some(count => count > 5);
    },
    severity: 'warning',
    message: 'Same error occurring repeatedly - possible systematic issue',
    cooldownMinutes: 30,
  },
  {
    id: 'quantity-shift-detected',
    name: 'Systematic Quantity Shift',
    condition: (metrics, recentUploads) => {
      const quantityDiffs = recentUploads
        .flatMap(u => u.discrepancies)
        .filter(d => d.field === 'currentQuantity')
        .map(d => d.difference);
      
      if (quantityDiffs.length < 5) return false;
      
      // Check if most differences are similar (suggesting column shift)
      const avgDiff = quantityDiffs.reduce((a, b) => a + b, 0) / quantityDiffs.length;
      const consistentDiffs = quantityDiffs.filter(d => Math.abs(d - avgDiff) < 1);
      return consistentDiffs.length > quantityDiffs.length * 0.8;
    },
    severity: 'critical',
    message: 'Systematic quantity shift detected - likely column mapping error',
    cooldownMinutes: 5,
  },
];
```

### 7.3 Prevention Measures

```typescript
// /lib/agm-parser/safeguards.ts

/**
 * Pre-upload safeguards to prevent common mapping errors
 */
export const UPLOAD_SAFEGUARDS = {
  /**
   * Require explicit column mapping confirmation for new file formats
   */
  requireMappingConfirmation: true,
  
  /**
   * Maximum allowed discrepancy percentage before blocking upload
   */
  maxDiscrepancyThreshold: 5,
  
  /**
   * Require sample validation before full upload
   */
  requireSampleValidation: true,
  sampleSize: 10,
  
  /**
   * Block uploads with detected Excel errors
   */
  blockExcelErrors: true,
  
  /**
   * Require dual approval for large uploads
   */
  dualApprovalThreshold: 1000, // items
  
  /**
   * Automatic backup before overwriting inventory data
   */
  autoBackup: true,
  backupRetentionDays: 30,
};

/**
 * Validation gates that must pass before upload proceeds
 */
export async function runPreUploadValidation(
  data: unknown[],
  config: UploadConfig
): Promise<ValidationGateResult> {
  const gates: ValidationGate[] = [
    {
      name: 'Column Mapping Verification',
      check: async () => {
        const detector = new ColumnDetector();
        const matches = detector.detectColumns(
          Object.keys(data[0] || {}),
          config.requiredFields
        );
        
        const lowConfidence = matches.filter(m => m.confidence < 0.9);
        if (lowConfidence.length > 0) {
          return {
            passed: false,
            message: `Low confidence mapping for: ${lowConfidence.map(m => m.targetField).join(', ')}`,
            requiresConfirmation: true,
          };
        }
        return { passed: true };
      },
    },
    {
      name: 'Sample Data Validation',
      check: async () => {
        const sample = data.slice(0, UPLOAD_SAFEGUARDS.sampleSize);
        const parser = new NumberParser();
        const errors: string[] = [];
        
        for (const row of sample) {
          for (const fieldConfig of config.fieldMappings) {
            const result = parser.parse(row[fieldConfig.sourceField], fieldConfig);
            if (!result.success) {
              errors.push(...result.errors);
            }
          }
        }
        
        return {
          passed: errors.length === 0,
          message: errors.length > 0 ? `Sample validation errors: ${errors.slice(0, 3).join('; ')}` : undefined,
        };
      },
    },
    {
      name: 'Duplicate Detection',
      check: async () => {
        const keys = data.map(row => row[config.primaryKeyField]);
        const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
        
        return {
          passed: duplicates.length === 0,
          message: duplicates.length > 0 ? `Duplicate keys found: ${[...new Set(duplicates)].slice(0, 5).join(', ')}` : undefined,
        };
      },
    },
    {
      name: 'Data Completeness',
      check: async () => {
        const requiredFields = config.fieldMappings.filter(f => f.required).map(f => f.sourceField);
        const incompleteRows = data.filter(row => 
          requiredFields.some(field => !row[field] || row[field] === '')
        );
        
        const completenessRate = ((data.length - incompleteRows.length) / data.length) * 100;
        
        return {
          passed: completenessRate >= 95,
          message: completenessRate < 95 ? `Data completeness is ${completenessRate.toFixed(1)}% - below 95% threshold` : undefined,
        };
      },
    },
  ];
  
  const results: GateResult[] = [];
  
  for (const gate of gates) {
    const result = await gate.check();
    results.push({ name: gate.name, ...result });
    
    if (!result.passed && !result.requiresConfirmation) {
      break; // Stop on hard failure
    }
  }
  
  return {
    allPassed: results.every(r => r.passed),
    requiresConfirmation: results.some(r => r.requiresConfirmation),
    gates: results,
  };
}
```

---

## 8. Data Integrity Assurance

### 8.1 Data Integrity Principles

| Principle | Implementation |
|-----------|----------------|
| **Atomicity** | All-or-nothing uploads - partial failures roll back entirely |
| **Consistency** | Validation gates ensure data meets schema requirements |
| **Isolation** | Concurrent uploads processed independently with locking |
| **Durability** | Committed changes persisted with automatic backup |
| **Auditability** | Complete trace of all data modifications |

### 8.2 Integrity Verification Queries

```sql
-- Daily integrity check: AGM uploads vs inventory
WITH upload_summary AS (
    SELECT 
        DATE(upload_timestamp) AS upload_date,
        COUNT(DISTINCT upload_id) AS upload_count,
        SUM(item_count) AS total_items,
        SUM(discrepancy_count) AS total_discrepancies
    FROM agm_upload_log
    WHERE upload_timestamp >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY DATE(upload_timestamp)
),
inventory_changes AS (
    SELECT 
        DATE(modified_at) AS change_date,
        COUNT(*) AS change_count,
        SUM(CASE WHEN change_source = 'AGM_UPLOAD' THEN 1 ELSE 0 END) AS agm_changes
    FROM inventory_audit_log
    WHERE modified_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY DATE(modified_at)
)
SELECT 
    COALESCE(u.upload_date, i.change_date) AS date,
    u.upload_count,
    u.total_items AS uploaded_items,
    i.agm_changes AS inventory_changes,
    u.total_discrepancies AS discrepancies,
    CASE 
        WHEN u.total_items = i.agm_changes THEN 'SYNCED'
        ELSE 'MISMATCH'
    END AS sync_status
FROM upload_summary u
FULL OUTER JOIN inventory_changes i ON u.upload_date = i.change_date
ORDER BY date DESC;

-- Identify orphaned records
SELECT 'AGM without Inventory' AS issue_type, COUNT(*) AS count
FROM agm_checklist_items agm
LEFT JOIN inventory_items inv ON agm.item_code = inv.item_code
WHERE inv.item_code IS NULL
UNION ALL
SELECT 'Inventory without AGM' AS issue_type, COUNT(*) AS count  
FROM inventory_items inv
LEFT JOIN agm_checklist_items agm ON inv.item_code = agm.item_code
WHERE agm.item_code IS NULL
    AND inv.last_verified_date < CURRENT_DATE - INTERVAL '30 days';
```

### 8.3 Real-Time Sync Verification

```typescript
// /lib/inventory/sync-verifier.ts

export class SyncVerifier {
  private readonly toleranceThreshold = 0.001; // 0.1% tolerance for float comparison
  
  async verifyRealTimeSync(uploadId: string): Promise<SyncVerificationResult> {
    const uploadRecord = await db.agmUpload.findUnique({
      where: { id: uploadId },
      include: { items: true },
    });
    
    if (!uploadRecord) {
      throw new Error(`Upload ${uploadId} not found`);
    }
    
    const verificationResults: ItemVerification[] = [];
    
    for (const agmItem of uploadRecord.items) {
      // Fetch current inventory state
      const inventoryItem = await db.inventoryItem.findUnique({
        where: { itemCode: agmItem.itemCode },
      });
      
      const verification: ItemVerification = {
        itemCode: agmItem.itemCode,
        fields: [],
        isSynced: true,
      };
      
      // Verify each mapped field
      const fieldsToVerify: Array<keyof typeof agmItem> = [
        'currentQuantity',
        'unitPrice',
        'reorderThreshold',
      ];
      
      for (const field of fieldsToVerify) {
        const agmValue = agmItem[field] as number;
        const invValue = inventoryItem?.[field] as number;
        
        const isMatched = this.compareValues(agmValue, invValue);
        
        verification.fields.push({
          fieldName: field,
          agmValue,
          inventoryValue: invValue,
          isMatched,
        });
        
        if (!isMatched) {
          verification.isSynced = false;
        }
      }
      
      verificationResults.push(verification);
    }
    
    const syncedCount = verificationResults.filter(v => v.isSynced).length;
    
    return {
      uploadId,
      totalItems: verificationResults.length,
      syncedItems: syncedCount,
      unsyncedItems: verificationResults.length - syncedCount,
      syncRate: (syncedCount / verificationResults.length) * 100,
      verificationTimestamp: new Date(),
      details: verificationResults.filter(v => !v.isSynced),
      status: syncedCount === verificationResults.length ? 'FULLY_SYNCED' : 'PARTIAL_SYNC',
    };
  }
  
  private compareValues(value1: number | null, value2: number | null): boolean {
    if (value1 === null && value2 === null) return true;
    if (value1 === null || value2 === null) return false;
    
    // Use tolerance for floating point comparison
    const diff = Math.abs(value1 - value2);
    const maxValue = Math.max(Math.abs(value1), Math.abs(value2), 1);
    
    return diff / maxValue <= this.toleranceThreshold;
  }
}
```

### 8.4 Integrity Maintenance Schedule

| Task | Frequency | Description |
|------|-----------|-------------|
| Full Reconciliation | Daily | Compare all AGM data against inventory |
| Orphan Detection | Weekly | Find records without matching pairs |
| Audit Log Review | Weekly | Review all mapping warnings/errors |
| Backup Verification | Weekly | Confirm backups are restorable |
| Schema Drift Check | Monthly | Verify mapping config matches current schemas |
| Performance Audit | Monthly | Review processing times and bottlenecks |
| Security Review | Quarterly | Audit access controls and data handling |

---

## Appendix A: Quick Reference

### Common Issues & Solutions

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| All quantities off by 1 | Off-by-one index error | Fix array indexing in column mapping |
| Prices showing as quantities | Column mapping swapped | Reconfigure field mappings |
| Scientific notation in IDs | Number parsing of string field | Change data type to string |
| Negative where positive expected | Sign handling in parser | Add absolute value transformation |
| Decimals truncated | Integer parsing applied | Change data type to decimal |
| Empty values causing errors | Missing null handling | Add default value configuration |

### Emergency Contacts

| Role | Responsibility |
|------|----------------|
| Data Integrity Lead | Final approval for corrections |
| System Administrator | Database access and backups |
| AGM Process Owner | Source data verification |
| IT Support | Technical troubleshooting |

---

## Appendix B: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-13 | v0 | Initial document creation |

---

*This document should be reviewed and updated whenever significant changes are made to the AGM checklist format, inventory system schema, or mapping configuration.*
