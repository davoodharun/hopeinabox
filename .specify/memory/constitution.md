<!--
Sync Impact Report:
Version: 0.1.0 → 1.0.0 (Initial creation)
Modified principles: N/A (new constitution)
Added sections: Core Principles, Site Stability Requirements, Data Format Requirements, Development Workflow
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section exists
  ✅ spec-template.md - No changes needed
  ✅ tasks-template.md - No changes needed
Follow-up TODOs: None
-->

# Hope in a Box Constitution

## Core Principles

### I. Site Stability First (NON-NEGOTIABLE)

The Squarespace site MUST remain functional at all times. Any changes that could affect the live site MUST be validated before deployment. The existing booklist-data.js format and inflate-booklist.js script are critical dependencies that MUST be preserved. Changes to data format or script behavior require thorough testing against the existing browse-books.page implementation.

**Rationale**: This is an inherited production site serving Hope in a Box's mission. Breaking the site would disrupt access to the curated book list for teachers and students.

### II. Data Format Compatibility

All generated booklist-data.js files MUST match the exact format expected by inflate-booklist.js:
- File MUST assign a JSON string to `window.bookJsonText`
- JSON structure MUST be `{"books": [array of book objects]}`
- Each book object MUST include all properties expected by the existing code (Title, Author, reading levels, categories, etc.)
- Property names MUST match exactly (case-sensitive, including spaces and special characters)
- Empty values MUST be represented as empty strings `""`, not `null` or `undefined`

**Rationale**: The inflate-booklist.js script expects a specific format. Deviations will cause runtime errors and break the site.

### III. CSV Parsing Validation

CSV parsing tools MUST validate output against the existing booklist-data.js schema before generating new files. Validation MUST check:
- Required fields are present (Title, Author minimum)
- Field names match expected column headers
- Data types match expectations (e.g., Year Published is numeric)
- Boolean/category fields are properly formatted (empty string or "1")
- RowNumber is assigned correctly for each book

**Rationale**: CSV files may contain header rows, blank rows, or missing data. Robust parsing prevents malformed data from breaking the site.

### IV. Testing Before Deployment

All changes MUST be tested locally before pushing to Squarespace:
- Generated booklist-data.js MUST be validated for syntax correctness
- Page MUST be tested in a browser to verify books display correctly
- Filtering and search functionality MUST be verified
- Book count and display logic MUST be validated

**Rationale**: Squarespace deployment affects the live site immediately. Local testing prevents breaking production.

### V. Understanding Before Modification

Before modifying any existing code, developers MUST:
- Read and understand the existing implementation
- Trace data flow from CSV → JSON → page rendering
- Identify all dependencies and side effects
- Document the expected behavior before changing it

**Rationale**: This is inherited code with limited documentation. Understanding prevents accidental breakage.

## Site Stability Requirements

### Critical Files

The following files are critical to site functionality and MUST be handled with extreme care:
- `scripts/booklist-data.js`: Data source for the book list
- `scripts/inflate-booklist.js`: Script that renders books on the page
- `pages/browse-books.page`: HTML template and page structure
- `assets/book-covers/`: Book cover images referenced by the site

### Breaking Change Definition

A breaking change is any modification that:
- Alters the format of booklist-data.js in a way that breaks JSON parsing
- Changes property names or structure expected by inflate-booklist.js
- Modifies the HTML structure or CSS classes used by inflate-booklist.js
- Removes or renames files referenced by the page

Breaking changes MUST be documented with migration plans before implementation.

## Data Format Requirements

### Book Object Schema

Each book object in the books array MUST include:
- `Title` (string): Book title
- `Author` (string): Author name(s)
- Reading level fields: `Early elementary`, `Late elementary`, `Middle school`, `Early high school`, `Late high school` (empty string or "1")
- `Yes` / `No` (empty string or "1"): Curriculum flag
- `Included in...?` fields: Same reading level names (empty string or "1")
- Format fields: `Picture book`, `Chapter book`, `Graphic novel`, `Non-fiction`, `Anthology`, `Poetry`, `Scripts & plays` (empty string or "1")
- Representation fields: All representation categories (empty string or "1")
- `Synopsis` (string): Book description
- `Synopsis link` (string): URL to full synopsis
- `Awards` (string): Award information
- `Notes` (string): Additional notes
- `Year Published` (string or number): Publication year
- `RowNumber` (number): Sequential row identifier

### File Format Specification

The booklist-data.js file MUST be structured as:
```javascript
window.bookJsonText = '{"books":[...]}';
```

Where the JSON string contains valid JSON matching the schema above.

## Development Workflow

### CSV to JSON Conversion Process

1. **Parse CSV**: Read CSV file, handle header rows and blank rows
2. **Validate Data**: Check required fields, data types, format compliance
3. **Transform**: Convert CSV rows to book objects matching schema
4. **Generate**: Create booklist-data.js file with correct format
5. **Validate Output**: Syntax check, schema validation, format verification
6. **Test Locally**: Load page in browser, verify functionality
7. **Deploy**: Push to Squarespace only after all checks pass

### Change Approval Process

- Minor changes (CSV parsing improvements): Local testing required
- Format changes: Requires review of inflate-booklist.js compatibility
- Script modifications: Requires full regression testing of page functionality

## Governance

This constitution supersedes all other development practices. All code changes MUST comply with these principles. Amendments require:
- Documentation of the change rationale
- Impact analysis on site stability
- Updated testing procedures if needed
- Version bump in this document

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
