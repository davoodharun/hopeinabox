# Feature Specification: CSV to Booklist Data Parser

**Feature Branch**: `001-csv-booklist-parser`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "Create a parsing tool defined by @SHeetParser.md using @example.csv to create a copy of booklist-data.js"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Parse CSV File to Booklist Data Format (Priority: P1)

A developer needs to convert a CSV file containing book data into the exact format required by the Squarespace site's booklist-data.js file. The tool reads a CSV file (which may contain header rows, blank rows, and missing data), parses each row as a book entry, transforms the data to match the expected schema, and generates a JavaScript file that assigns a JSON string to `window.bookJsonText`.

**Why this priority**: This is the core functionality - without CSV parsing and format conversion, the tool cannot fulfill its purpose. This enables the entire workflow of updating book data on the site.

**Independent Test**: Can be fully tested by providing a CSV file with valid book data and verifying the output JavaScript file matches the expected format and contains correctly parsed book objects.

**Acceptance Scenarios**:

1. **Given** a CSV file with valid book data rows, **When** the parser processes the file, **Then** it generates a JavaScript file containing `window.bookJsonText` with a valid JSON string
2. **Given** a CSV file with header rows and blank rows, **When** the parser processes the file, **Then** it skips non-data rows and only processes rows containing book information
3. **Given** a CSV file with missing optional fields, **When** the parser processes the file, **Then** it generates book objects with empty strings for missing fields
4. **Given** a CSV file with category fields containing "1" or empty values, **When** the parser processes the file, **Then** it preserves these values exactly (empty string or "1") in the output

---

### User Story 2 - Handle CSV Data Variations (Priority: P2)

The parser must robustly handle variations in CSV structure including multiple header rows, inconsistent column ordering, and missing data fields without failing or producing invalid output.

**Why this priority**: Real-world CSV files often have inconsistencies. Robust error handling ensures the tool is practical for actual use cases and prevents data loss.

**Independent Test**: Can be tested independently by providing CSV files with various structural issues (extra headers, blank rows, missing columns) and verifying the parser handles them gracefully.

**Acceptance Scenarios**:

1. **Given** a CSV file with multiple header/metadata rows at the beginning, **When** the parser processes the file, **Then** it identifies and skips non-data rows before processing book entries
2. **Given** a CSV file with blank rows interspersed between data rows, **When** the parser processes the file, **Then** it skips blank rows and continues processing subsequent data rows
3. **Given** a CSV file with missing Title or Author fields, **When** the parser processes the file, **Then** it either skips the invalid row or handles it according to validation rules
4. **Given** a CSV file with duplicate column headers, **When** the parser processes the file, **Then** it handles the ambiguity appropriately (uses first occurrence or reports an error)

---

### User Story 3 - Validate Output Format Compatibility (Priority: P3)

The generated JavaScript file must exactly match the format expected by inflate-booklist.js, ensuring compatibility with the existing Squarespace site infrastructure.

**Why this priority**: Format compatibility is critical to prevent breaking the live site. This validation ensures the output can be used immediately without manual fixes.

**Independent Test**: Can be tested independently by comparing the generated file structure against the existing booklist-data.js format and verifying it can be loaded by inflate-booklist.js.

**Acceptance Scenarios**:

1. **Given** parsed book data, **When** the parser generates the output file, **Then** the file structure matches `window.bookJsonText = '{"books":[...]}'` format exactly
2. **Given** parsed book data, **When** the parser generates the output file, **Then** the JSON string contains valid JSON that can be parsed without errors
3. **Given** parsed book data, **When** the parser generates the output file, **Then** each book object includes all required properties with correct data types (strings for text fields, empty strings or "1" for categories)
4. **Given** parsed book data, **When** the parser generates the output file, **Then** property names match exactly (case-sensitive, including spaces and special characters) as expected by inflate-booklist.js

---

### Edge Cases

- What happens when the CSV file is empty or contains no data rows?
- How does the parser handle CSV files with inconsistent column counts across rows?
- What happens when category fields contain values other than "1" or empty (e.g., "0", "yes", "true")?
- How does the parser handle special characters in text fields (quotes, newlines, commas)?
- What happens when Year Published contains non-numeric values or is missing?
- How does the parser handle CSV files with different encodings (UTF-8, Windows-1252)?
- What happens when Synopsis or other text fields contain very long content?
- How does the parser handle duplicate book titles or authors?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The parser MUST read CSV files from the local filesystem
- **FR-002**: The parser MUST identify and skip header/metadata rows that do not contain book data
- **FR-003**: The parser MUST identify and skip blank rows in the CSV file
- **FR-004**: The parser MUST parse each data row as a book entry with the following required fields: Title, Author
- **FR-005**: The parser MUST map CSV columns to book object properties matching the exact names expected by inflate-booklist.js (case-sensitive, including spaces)
- **FR-006**: The parser MUST handle reading level fields: Early elementary, Late elementary, Middle school, Early high school, Late high school
- **FR-007**: The parser MUST handle Curriculum fields: Yes, No
- **FR-008**: The parser MUST handle "Included in...?" fields with the same reading level values
- **FR-009**: The parser MUST handle Format fields: Picture book, Chapter book, Graphic novel, Non-fiction, Anthology, Poetry, Scripts & plays
- **FR-010**: The parser MUST handle all Representation fields: Lesbian, Gay, Bisexual & Pansexual, Trans & Nonbinary, Queer+, Small Town, Rural & Heartland, Black Caribbean & African Diaspora, Asian & Asian Diaspora, Latino & Hispanic, Native American & Indigenous, Diverse ensemble, Ability, Coming out, Religion & Spirituality, Diverse family structure
- **FR-011**: The parser MUST handle Theme fields: Relationships: Family, Relationships: Love, Relationships: Friends, Relationships: Community, Politics Society & Activism, Classics
- **FR-012**: The parser MUST handle text fields: Synopsis, Synopsis link, Awards, Notes
- **FR-013**: The parser MUST handle Year Published as a numeric or string field
- **FR-014**: The parser MUST assign a RowNumber to each book object (sequential, starting from 1)
- **FR-015**: The parser MUST represent category/boolean fields as empty string "" or "1" (never null, undefined, or other values)
- **FR-016**: The parser MUST represent missing optional fields as empty strings ""
- **FR-017**: The parser MUST generate output in the format: `window.bookJsonText = '{"books":[...]}';` where the content is a valid JSON string
- **FR-018**: The parser MUST ensure the JSON string is properly escaped for JavaScript (quotes, newlines, special characters)
- **FR-019**: The parser MUST write the output to a JavaScript file (default: booklist-data.js or as specified)
- **FR-020**: The parser MUST validate that required fields (Title, Author) are present before processing a row
- **FR-021**: The parser MUST handle CSV files with quoted fields containing commas or newlines
- **FR-022**: The parser MUST preserve the exact text content of fields including special characters and formatting

### Key Entities *(include if feature involves data)*

- **CSV File**: Input file containing book data with potential header rows, blank rows, and variable data quality
- **Book Object**: Represents a single book entry with properties matching the schema expected by inflate-booklist.js, including Title, Author, reading levels, categories, format, representation, themes, synopsis, awards, notes, year published, and row number
- **Output JavaScript File**: File containing `window.bookJsonText` assignment with a JSON string containing the books array

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The parser successfully processes CSV files containing 100+ book entries without errors
- **SC-002**: The generated JavaScript file can be loaded by inflate-booklist.js without modification
- **SC-003**: 100% of valid book rows in the CSV are successfully converted to book objects in the output
- **SC-004**: The parser handles CSV files with up to 3 header/metadata rows and multiple blank rows without failing
- **SC-005**: Generated output files match the exact format of existing booklist-data.js files (structure, property names, data types)
- **SC-006**: The parser completes processing of a 200-book CSV file in under 5 seconds
- **SC-007**: All category fields are correctly represented as empty strings or "1" with 100% accuracy
- **SC-008**: Property names in generated book objects match expected names exactly (case-sensitive, including spaces) with 100% accuracy
