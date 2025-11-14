# Quickstart: CSV to Booklist Data Parser

**Feature**: CSV to Booklist Data Parser  
**Date**: 2025-01-27

## Prerequisites

- Node.js installed (compatible with existing scripts directory)
- CSV file containing book data (see example.csv for format reference)
- Access to scripts directory

## Installation

1. Navigate to repository root
2. Install dependencies (if CSV parsing library not already in package.json):
   ```bash
   cd scripts
   npm install csv
   ```

## Basic Usage

### Parse CSV File

```bash
node scripts/parse-csv-to-booklist.mjs example.csv
```

This will:
- Read `example.csv` from current directory
- Parse all book entries
- Generate `scripts/booklist-data.js` with parsed data

### Specify Custom Output Path

```bash
node scripts/parse-csv-to-booklist.mjs example.csv --output scripts/booklist-data-backup.js
```

### Validate Without Generating Output

```bash
node scripts/parse-csv-to-booklist.mjs example.csv --validate-only
```

## CSV File Format

Your CSV file should:
- Have a header row with column names matching expected schema (Title, Author, etc.)
- May contain metadata/header rows at the beginning (will be auto-detected and skipped)
- May contain blank rows (will be skipped)
- Each data row represents one book

**Required Columns**:
- `Title`: Book title
- `Author`: Author name(s)

**Category Columns** (values: "1" or empty):
- Reading levels: `Early elementary`, `Late elementary`, `Middle school`, `Early high school`, `Late high school`
- Curriculum: `Yes`, `No`
- Format: `Picture book`, `Chapter book`, `Graphic novel`, `Non-fiction`, `Anthology`, `Poetry`, `Scripts & plays`
- Representation: `Lesbian`, `Gay`, `Bisexual & Pansexual`, `Trans & Nonbinary`, `Queer+`, etc.
- Themes: `Relationships: Family`, `Relationships: Love`, etc.

**Text Columns**:
- `Synopsis`: Book description
- `Synopsis link`: URL
- `Awards`: Award information
- `Notes`: Additional notes
- `Year Published`: Publication year

See `example.csv` for complete column list and format.

## Output

The tool generates `scripts/booklist-data.js` containing:
```javascript
window.bookJsonText = '{"books":[...]}';
```

This file can be:
1. Tested locally by loading `pages/browse-books.page` in a browser
2. Validated against existing `scripts/booklist-data.js` format
3. Deployed to Squarespace after validation

## Validation Checklist

Before deploying generated file:

- [ ] Generated file syntax is valid JavaScript
- [ ] JSON string parses correctly: `JSON.parse(window.bookJsonText)`
- [ ] All books have Title and Author
- [ ] Category fields are "" or "1" only
- [ ] Property names match expected schema exactly
- [ ] File loads in browser without errors
- [ ] Books display correctly on browse-books page
- [ ] Filtering and search work correctly

## Troubleshooting

**Error: "CSV file not found"**
- Check file path is correct
- Use absolute path if relative path doesn't work

**Error: "No valid data rows found"**
- Ensure CSV has Title and Author columns
- Check that header row is detected correctly
- Verify CSV has at least one data row

**Error: "Invalid category value"**
- Category fields must be "1" or empty
- Tool will normalize common values (yes/no/true/false) automatically
- Check CSV for unexpected values

**Output file doesn't match format**
- Verify using `--validate-only` first
- Check that JSON string is properly escaped
- Compare with existing `scripts/booklist-data.js`

## Next Steps

After generating booklist-data.js:
1. Test locally (load browse-books.page in browser)
2. Verify all books display correctly
3. Test filtering and search functionality
4. Deploy to Squarespace only after all checks pass

See [Development Workflow](../.specify/memory/constitution.md#development-workflow) in constitution for full process.

