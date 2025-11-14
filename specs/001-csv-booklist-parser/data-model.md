# Data Model: CSV to Booklist Data Parser

**Feature**: CSV to Booklist Data Parser  
**Date**: 2025-01-27  
**Phase**: Phase 1 - Design

## Entities

### CSV File

**Description**: Input file containing book data in CSV format.

**Attributes**:
- File path (string): Location of CSV file on filesystem
- Encoding (string): Character encoding (default: UTF-8)
- Structure: May contain header rows, blank rows, and data rows

**Validation Rules**:
- File must exist and be readable
- File must contain at least one data row with Title and Author
- File encoding must be detectable or UTF-8

**Relationships**:
- Contains multiple CSV rows (header/metadata rows and data rows)

---

### CSV Row

**Description**: A single row from the CSV file, which may be a header row, metadata row, blank row, or data row.

**Attributes**:
- Row index (number): Position in CSV file (0-based)
- Cells (array of strings): Column values for this row
- Row type (enum): 'header', 'metadata', 'blank', 'data'

**Validation Rules**:
- Header rows: Contain column names matching expected schema
- Blank rows: All cells are empty or whitespace-only
- Data rows: Must contain Title and Author in appropriate columns

**State Transitions**:
- Raw CSV row → Classified (header/metadata/blank/data)
- Data row → Validated → Parsed → Book object

---

### Book Object

**Description**: Represents a single book entry matching the schema expected by inflate-booklist.js.

**Attributes**:

**Required Fields**:
- `Title` (string): Book title, must not be empty
- `Author` (string): Author name(s), must not be empty
- `RowNumber` (number): Sequential identifier starting from 1

**Reading Level Fields** (empty string "" or "1"):
- `Early elementary` (string)
- `Late elementary` (string)
- `Middle school` (string)
- `Early high school` (string)
- `Late high school` (string)

**Curriculum Fields** (empty string "" or "1"):
- `Yes` (string): Book is part of curriculum
- `No` (string): Book is not part of curriculum

**Included In Fields** (empty string "" or "1"):
- `Included in...?` fields with same reading level names (Early elementary, Late elementary, Middle school, Early high school, Late high school)

**Format Fields** (empty string "" or "1"):
- `Picture book` (string)
- `Chapter book` (string)
- `Graphic novel` (string)
- `Non-fiction` (string)
- `Anthology` (string)
- `Poetry` (string)
- `Scripts & plays` (string)

**Representation Fields** (empty string "" or "1"):
- `Lesbian` (string)
- `Gay` (string)
- `Bisexual & Pansexual` (string)
- `Trans & Nonbinary` (string)
- `Queer+` (string)
- `Small Town, Rural & Heartland` (string)
- `Black, Caribbean, & African Diaspora` (string)
- `Asian & Asian Diaspora` (string)
- `Latino & Hispanic` (string)
- `Native American & Indigenous` (string)
- `Diverse ensemble` (string)
- `Ability` (string)
- `Coming out` (string)
- `Religion & Spirituality` (string)
- `Diverse family structure` (string)

**Theme Fields** (empty string "" or "1"):
- `Relationships: Family` (string)
- `Relationships: Love` (string)
- `Relationships: Friends` (string)
- `Relationships: Community` (string)
- `Politics, Society, & Activism` (string)
- `Classics` (string)

**Text Fields** (string, may be empty):
- `Synopsis` (string): Book description
- `Synopsis link` (string): URL to full synopsis
- `Awards` (string): Award information
- `Notes` (string): Additional notes
- `Year Published` (string or number): Publication year

**Validation Rules**:
- Title and Author must be non-empty strings
- All category/boolean fields must be exactly "" or "1" (never null, undefined, or other values)
- RowNumber must be a positive integer, sequential starting from 1
- Property names must match exactly (case-sensitive, including spaces and special characters)
- Year Published should be numeric or numeric string, but empty string allowed

**Relationships**:
- Belongs to Books Collection (array)
- Derived from CSV Row (one-to-one mapping)

---

### Books Collection

**Description**: Array of Book objects wrapped in a JSON structure.

**Attributes**:
- `books` (array of Book objects): All parsed book entries

**Validation Rules**:
- Must be a valid JSON array
- All Book objects must pass validation
- Array may be empty (though typically contains 100+ books)

**Relationships**:
- Contains multiple Book objects
- Serialized to JSON string for JavaScript embedding

---

### Output JavaScript File

**Description**: Generated JavaScript file containing book data in format expected by inflate-booklist.js.

**Attributes**:
- File path (string): Location where file will be written
- Content (string): JavaScript code assigning JSON string to `window.bookJsonText`
- Format: `window.bookJsonText = '{"books":[...]}';`

**Validation Rules**:
- Must be valid JavaScript syntax
- JSON string must be valid JSON
- JSON string must be properly escaped for JavaScript embedding
- File must be writable at specified path

**Relationships**:
- Contains Books Collection (serialized as JSON string)

---

## Data Flow

1. **CSV File** → Read and parse → **CSV Rows**
2. **CSV Rows** → Classify (header/metadata/blank/data) → Filter data rows
3. **Data Rows** → Map columns to properties → Validate → **Book Objects**
4. **Book Objects** → Collect → **Books Collection**
5. **Books Collection** → Serialize to JSON → Escape for JavaScript → **Output JavaScript File**

## Validation Rules Summary

### Input Validation
- CSV file exists and is readable
- CSV contains at least one valid data row
- Header row found with expected column names

### Row Validation
- Data rows must have Title and Author
- Blank rows are skipped
- Header/metadata rows are skipped

### Book Object Validation
- Required fields present and non-empty
- Category fields normalized to "" or "1"
- Property names match expected schema exactly
- RowNumber assigned sequentially

### Output Validation
- JSON string is valid JSON
- JavaScript syntax is valid
- Format matches existing booklist-data.js exactly

