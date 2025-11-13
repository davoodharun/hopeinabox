# CLI Interface Contract

**Feature**: CSV to Booklist Data Parser  
**Date**: 2025-01-27  
**Type**: Command-Line Interface Specification

## Command Syntax

```bash
node scripts/parse-csv-to-booklist.mjs [options] <input-csv-file>
```

## Arguments

- `<input-csv-file>` (required): Path to CSV file containing book data

## Options

- `--output, -o <path>`: Output file path (default: `scripts/booklist-data.js`)
- `--help, -h`: Display help message
- `--verbose, -v`: Enable verbose logging
- `--validate-only`: Parse and validate CSV without generating output file

## Exit Codes

- `0`: Success - CSV parsed and output file generated
- `1`: Error - Invalid arguments or file not found
- `2`: Error - CSV parsing failed (malformed file)
- `3`: Error - Validation failed (missing required fields, invalid data)
- `4`: Error - Output file write failed

## Output

**Success**: 
- Writes JavaScript file to specified output path
- Prints summary: "Successfully parsed N books and wrote to <output-path>"

**Error**:
- Prints error message to stderr
- Exits with appropriate exit code

## Examples

```bash
# Basic usage with default output
node scripts/parse-csv-to-booklist.mjs example.csv

# Specify custom output path
node scripts/parse-csv-to-booklist.mjs example.csv --output scripts/booklist-data-new.js

# Validate without generating output
node scripts/parse-csv-to-booklist.mjs example.csv --validate-only

# Verbose mode
node scripts/parse-csv-to-booklist.mjs example.csv --verbose
```

## Input File Requirements

- File must exist and be readable
- File must be valid CSV format
- File must contain at least one data row with Title and Author columns
- File encoding: UTF-8 (default) or auto-detect

## Output File Format

- JavaScript file containing: `window.bookJsonText = '{"books":[...]}';`
- JSON string is properly escaped for JavaScript embedding
- File is overwritten if it exists (with warning in verbose mode)

