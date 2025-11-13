# Tasks: CSV to Booklist Data Parser

**Input**: Design documents from `/specs/001-csv-booklist-parser/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are OPTIONAL per specification - not explicitly requested, so test tasks are not included. Focus on implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create tests directory structure at repository root: tests/unit/ and tests/fixtures/
- [X] T002 Add csv dependency to scripts/package.json (csv-parse from csv package)
- [X] T003 [P] Create test fixture file tests/fixtures/sample-books.csv with minimal valid book data
- [X] T004 [P] Create test fixture file tests/fixtures/expected-output.js showing expected booklist-data.js format

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create CSV file reader module in scripts/lib/csv-reader.mjs with function to read and parse CSV files
- [X] T006 Create row classifier module in scripts/lib/row-classifier.mjs with functions to identify header/metadata/blank/data rows
- [X] T007 Create column mapper module in scripts/lib/column-mapper.mjs with function to map CSV column names to book object property names
- [X] T008 Create category normalizer module in scripts/lib/category-normalizer.mjs with function to normalize category values to "" or "1"
- [X] T009 Create book validator module in scripts/lib/book-validator.mjs with function to validate book objects against schema
- [X] T010 Create output formatter module in scripts/lib/output-formatter.mjs with function to format books collection as JavaScript file content

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Parse CSV File to Booklist Data Format (Priority: P1) 🎯 MVP

**Goal**: Convert a CSV file containing book data into the exact format required by the Squarespace site's booklist-data.js file. The tool reads a CSV file, parses each row as a book entry, transforms the data to match the expected schema, and generates a JavaScript file that assigns a JSON string to `window.bookJsonText`.

**Independent Test**: Provide a CSV file with valid book data and verify the output JavaScript file matches the expected format and contains correctly parsed book objects.

### Implementation for User Story 1

- [X] T011 [US1] Implement CSV file reading in scripts/lib/csv-reader.mjs using csv-parse library to read CSV file from filesystem
- [X] T012 [US1] Implement header row detection in scripts/lib/row-classifier.mjs to identify row containing Title and Author columns
- [X] T013 [US1] Implement blank row detection in scripts/lib/row-classifier.mjs to skip rows with all empty or whitespace-only cells
- [X] T014 [US1] Implement column-to-property mapping in scripts/lib/column-mapper.mjs to map CSV columns to book object properties matching exact names (case-sensitive, including spaces)
- [X] T015 [US1] Implement book object creation in scripts/lib/book-builder.mjs with function to create book object from CSV row data
- [X] T016 [US1] Implement RowNumber assignment in scripts/lib/book-builder.mjs to assign sequential numbers starting from 1 for each valid book
- [X] T017 [US1] Implement category field normalization in scripts/lib/category-normalizer.mjs to convert category values to "" or "1" only
- [X] T018 [US1] Implement missing field handling in scripts/lib/book-builder.mjs to set optional fields to empty string "" when missing
- [X] T019 [US1] Implement JSON serialization in scripts/lib/output-formatter.mjs using double JSON.stringify() to create properly escaped JSON string
- [X] T020 [US1] Implement JavaScript file generation in scripts/lib/output-formatter.mjs to create output in format: window.bookJsonText = '{"books":[...]}';
- [X] T021 [US1] Implement file writing in scripts/lib/file-writer.mjs with function to write JavaScript content to output file
- [X] T022 [US1] Implement main parser script scripts/parse-csv-to-booklist.mjs with CLI argument parsing and orchestration of all modules
- [X] T023 [US1] Implement basic CLI argument handling in scripts/parse-csv-to-booklist.mjs to accept input CSV file path
- [X] T024 [US1] Implement default output path logic in scripts/parse-csv-to-booklist.mjs to default to scripts/booklist-data.js

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Can parse valid CSV files and generate booklist-data.js format.

---

## Phase 4: User Story 2 - Handle CSV Data Variations (Priority: P2)

**Goal**: The parser must robustly handle variations in CSV structure including multiple header rows, inconsistent column ordering, and missing data fields without failing or producing invalid output.

**Independent Test**: Provide CSV files with various structural issues (extra headers, blank rows, missing columns) and verify the parser handles them gracefully.

### Implementation for User Story 2

- [X] T025 [US2] Enhance header detection in scripts/lib/row-classifier.mjs to skip multiple header/metadata rows until finding actual data header row
- [X] T026 [US2] Implement blank row skipping in scripts/lib/row-classifier.mjs to skip blank rows interspersed between data rows
- [X] T027 [US2] Implement required field validation in scripts/lib/book-validator.mjs to check Title and Author are present before processing row
- [X] T028 [US2] Implement invalid row handling in scripts/lib/book-builder.mjs to skip rows missing Title or Author with appropriate logging
- [X] T029 [US2] Implement duplicate column header handling in scripts/lib/column-mapper.mjs to use first occurrence when duplicate headers found
- [X] T030 [US2] Implement error handling in scripts/lib/csv-reader.mjs to handle malformed CSV files gracefully with clear error messages
- [X] T031 [US2] Implement column count validation in scripts/lib/row-classifier.mjs to handle rows with inconsistent column counts
- [X] T032 [US2] Add verbose logging option in scripts/parse-csv-to-booklist.mjs to log skipped rows and validation issues

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Parser handles CSV variations robustly.

---

## Phase 5: User Story 3 - Validate Output Format Compatibility (Priority: P3)

**Goal**: The generated JavaScript file must exactly match the format expected by inflate-booklist.js, ensuring compatibility with the existing Squarespace site infrastructure.

**Independent Test**: Compare the generated file structure against the existing booklist-data.js format and verify it can be loaded by inflate-booklist.js.

### Implementation for User Story 3

- [X] T033 [US3] Implement output format validation in scripts/lib/output-validator.mjs to verify JavaScript syntax is valid
- [X] T034 [US3] Implement JSON string validation in scripts/lib/output-validator.mjs to verify JSON string parses correctly
- [X] T035 [US3] Implement schema validation in scripts/lib/output-validator.mjs to verify all book objects match expected schema
- [X] T036 [US3] Implement property name validation in scripts/lib/output-validator.mjs to verify property names match exactly (case-sensitive, including spaces)
- [X] T037 [US3] Implement data type validation in scripts/lib/output-validator.mjs to verify category fields are "" or "1" and text fields are strings
- [X] T038 [US3] Implement --validate-only CLI option in scripts/parse-csv-to-booklist.mjs to parse and validate without generating output file
- [X] T039 [US3] Add validation summary output in scripts/parse-csv-to-booklist.mjs showing validation results and any errors found
- [X] T040 [US3] Implement format comparison utility in scripts/lib/format-comparator.mjs to compare generated output with existing booklist-data.js format

**Checkpoint**: All user stories should now be independently functional. Output format is validated for compatibility.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T041 [P] Add --help CLI option in scripts/parse-csv-to-booklist.mjs to display usage information
- [X] T042 [P] Add --verbose CLI option in scripts/parse-csv-to-booklist.mjs to enable detailed logging
- [X] T043 [P] Add --output CLI option in scripts/parse-csv-to-booklist.mjs to specify custom output file path
- [X] T044 Implement proper exit codes in scripts/parse-csv-to-booklist.mjs (0=success, 1=invalid args, 2=parse error, 3=validation error, 4=write error)
- [X] T045 Implement error message formatting in scripts/lib/error-handler.mjs to provide clear, actionable error messages
- [X] T046 Add performance logging in scripts/lib/csv-reader.mjs to track processing time for large CSV files
- [X] T047 Implement encoding detection in scripts/lib/csv-reader.mjs to handle UTF-8 and Windows-1252 encodings
- [X] T048 Add special character handling in scripts/lib/book-builder.mjs to preserve quotes, newlines, and commas in text fields
- [X] T049 Update README.md with usage instructions for the CSV parser tool
- [X] T050 Run quickstart.md validation checklist to ensure tool meets all requirements

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed sequentially in priority order (P1 → P2 → P3)
  - User Story 2 and 3 build on User Story 1 but can be tested independently
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories. This is the MVP.
- **User Story 2 (P2)**: Can start after User Story 1 - Enhances robustness but should be independently testable
- **User Story 3 (P3)**: Can start after User Story 1 - Adds validation but should be independently testable

### Within Each User Story

- Core modules before orchestration
- Data reading before processing
- Processing before output formatting
- Basic functionality before enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004)
- All Foundational tasks can run in parallel after Setup (T005-T010)
- Within User Story 1: Some modules can be developed in parallel (T015-T018, T019-T020)
- Within User Story 2: Enhancement tasks can run in parallel (T025-T027, T029-T031)
- Within User Story 3: Validation tasks can run in parallel (T033-T035, T036-T037)
- Polish phase tasks marked [P] can run in parallel (T041-T043)

---

## Parallel Example: User Story 1

```bash
# Launch foundational modules in parallel (after Setup):
Task: "Create CSV file reader module in scripts/lib/csv-reader.mjs"
Task: "Create row classifier module in scripts/lib/row-classifier.mjs"
Task: "Create column mapper module in scripts/lib/column-mapper.mjs"
Task: "Create category normalizer module in scripts/lib/category-normalizer.mjs"
Task: "Create book validator module in scripts/lib/book-validator.mjs"
Task: "Create output formatter module in scripts/lib/output-formatter.mjs"

# Launch book building components in parallel:
Task: "Implement book object creation in scripts/lib/book-builder.mjs"
Task: "Implement category field normalization in scripts/lib/category-normalizer.mjs"
Task: "Implement missing field handling in scripts/lib/book-builder.mjs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently with example.csv
5. Verify output matches existing booklist-data.js format
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Validate output format (MVP!)
3. Add User Story 2 → Test independently → Validate robust CSV handling
4. Add User Story 3 → Test independently → Validate format compatibility
5. Each story adds value without breaking previous stories

### Single Developer Strategy

Since this is a single command-line tool:

1. Complete Setup + Foundational sequentially
2. Implement User Story 1 completely (MVP)
3. Test User Story 1 with example.csv
4. Implement User Story 2 enhancements
5. Test User Story 2 with various CSV edge cases
6. Implement User Story 3 validation
7. Test User Story 3 format compatibility
8. Polish and finalize

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are relative to repository root
- Follow existing code style from scripts/fetch-booklist-data-secret.mjs
- Ensure output format matches existing booklist-data.js exactly to prevent site breakage

---

## Task Summary

**Total Tasks**: 50

**By Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (User Story 1 - P1): 14 tasks
- Phase 4 (User Story 2 - P2): 8 tasks
- Phase 5 (User Story 3 - P3): 8 tasks
- Phase 6 (Polish): 10 tasks

**By User Story**:
- User Story 1 (P1): 14 tasks
- User Story 2 (P2): 8 tasks
- User Story 3 (P3): 8 tasks

**Parallel Opportunities**: 
- Setup: 2 tasks can run in parallel
- Foundational: All 6 tasks can run in parallel after Setup
- User Story 1: Multiple modules can be developed in parallel
- User Story 2: Enhancement tasks can run in parallel
- User Story 3: Validation tasks can run in parallel
- Polish: 3 CLI option tasks can run in parallel

**Independent Test Criteria**:
- **User Story 1**: Provide CSV file with valid book data → verify output JavaScript file matches expected format
- **User Story 2**: Provide CSV files with structural issues → verify parser handles them gracefully
- **User Story 3**: Generate output file → verify format matches existing booklist-data.js and can be loaded by inflate-booklist.js

**Suggested MVP Scope**: User Story 1 only (Phases 1-3). This delivers core functionality: parse CSV and generate booklist-data.js format.

