# Research: CSV to Booklist Data Parser

**Feature**: CSV to Booklist Data Parser  
**Date**: 2025-01-27  
**Phase**: Phase 0 - Research

## Research Questions

### 1. CSV Parsing Library Selection

**Question**: Which CSV parsing library should be used for Node.js?

**Research Findings**:
- **csv-parse** (part of csv package): Most popular, well-maintained, handles quoted fields, newlines, and special characters. Supports streaming for large files.
- **papaparse**: Browser-focused, also works in Node.js, very fast, handles malformed CSV well.
- **Built-in Node.js**: No native CSV parser - would require manual parsing which is error-prone for quoted fields and special characters.

**Decision**: Use `csv-parse` from the `csv` package.

**Rationale**: 
- Most mature and widely-used Node.js CSV parser
- Excellent handling of edge cases (quoted fields, embedded commas, newlines)
- Supports header row detection and skipping
- Well-documented with active maintenance
- Compatible with ES modules (.mjs files)

**Alternatives Considered**:
- papaparse: Good but more browser-focused, less Node.js-specific features
- Manual parsing: Too error-prone for production use, especially with quoted fields

---

### 2. Handling Header Rows and Blank Rows

**Question**: How to robustly identify and skip header/metadata rows and blank rows in CSV files?

**Research Findings**:
- CSV files often have multiple header rows (metadata, category labels, actual headers)
- Blank rows are common in exported spreadsheets
- Detection strategies:
  1. Pattern matching: Look for rows that don't match expected data format
  2. Header detection: Identify row with column names matching expected schema
  3. Blank row detection: Check for rows with all empty or whitespace-only cells

**Decision**: Use multi-strategy approach:
1. Skip rows until finding one that matches expected header pattern (Title, Author columns)
2. Use header row to map columns to book properties
3. Skip blank rows (all cells empty or whitespace)
4. Validate each data row has Title and Author before processing

**Rationale**: 
- Handles real-world CSV variations (example.csv has 3 header rows)
- Flexible enough for different CSV structures
- Prevents processing invalid rows

**Alternatives Considered**:
- Fixed row skipping: Too brittle, breaks with different CSV structures
- Manual header specification: Less flexible, requires user input

---

### 3. JSON String Escaping for JavaScript Embedding

**Question**: How to properly escape JSON strings for embedding in JavaScript `window.bookJsonText = '...'` format?

**Research Findings**:
- Existing script (`fetch-booklist-data-secret.mjs`) uses: `JSON.stringify(JSON.stringify(jsonObj))` (double stringify)
- This creates a properly escaped JSON string that can be safely embedded in JavaScript
- Single `JSON.stringify()` would create JSON, but double stringify creates a string representation of JSON
- JavaScript will parse the outer string, then parse the inner JSON string

**Decision**: Use double `JSON.stringify()` approach matching existing pattern.

**Rationale**:
- Matches existing codebase pattern exactly
- Ensures compatibility with inflate-booklist.js expectations
- Handles all special characters (quotes, newlines, backslashes) automatically

**Alternatives Considered**:
- Manual escaping: Error-prone, could miss edge cases
- Single stringify: Would not match existing format

---

### 4. Category Field Value Normalization

**Question**: How to handle category fields that may contain values other than "1" or empty string?

**Research Findings**:
- CSV may contain: "1", "0", "yes", "no", "true", "false", empty string, or other values
- Existing booklist-data.js uses only "" or "1"
- Need normalization strategy for non-standard values

**Decision**: Normalize category fields:
- "1", "yes", "true", "Y", "y" → "1"
- Empty, "0", "no", "false", "N", "n" → ""
- Unknown values → "" (default to empty, log warning)

**Rationale**:
- Ensures output matches expected format exactly
- Handles common CSV export variations
- Safe default (empty) prevents breaking site

**Alternatives Considered**:
- Strict validation (error on non-standard values): Too strict, breaks with real-world CSV files
- Pass-through: Would break site if CSV has unexpected values

---

### 5. RowNumber Assignment

**Question**: How should RowNumber be assigned to book objects?

**Research Findings**:
- Existing booklist-data.js includes RowNumber property
- RowNumber appears to be sequential (0-based or 1-based)
- Used by inflate-booklist.js for book identification

**Decision**: Assign RowNumber starting from 1, incrementing for each valid book row processed (after skipping headers/blanks).

**Rationale**:
- Matches pattern seen in existing data (RowNumber values are sequential)
- 1-based indexing is more intuitive
- Only counts actual book entries, not header/metadata rows

**Alternatives Considered**:
- 0-based indexing: Less intuitive, but could work
- CSV row number: Would include header rows, causing confusion

---

### 6. Output File Location and Naming

**Question**: Where should the generated booklist-data.js file be written?

**Research Findings**:
- Existing booklist-data.js is in `scripts/` directory
- Tool should allow specifying output path
- Default should match existing location for convenience

**Decision**: 
- Default output: `scripts/booklist-data.js` (same directory as script)
- Allow command-line argument to specify custom output path
- Warn if overwriting existing file (safety measure)

**Rationale**:
- Matches existing file location
- Allows flexibility for testing/backup scenarios
- Safety warning prevents accidental overwrites

**Alternatives Considered**:
- Always require explicit output path: Less convenient for common use case
- Different default location: Would require manual file movement

---

## Summary

All research questions resolved. Key decisions:
1. Use `csv-parse` library for robust CSV parsing
2. Multi-strategy header/blank row detection
3. Double JSON.stringify() for JavaScript embedding
4. Normalize category values to "" or "1"
5. Sequential RowNumber starting from 1
6. Default output to scripts/booklist-data.js with override option

No blocking clarifications remain. Ready for Phase 1 design.

