# Implementation Plan: CSV to Booklist Data Parser

**Branch**: `001-csv-booklist-parser` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-csv-booklist-parser/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a command-line tool that parses CSV files containing book data and generates a JavaScript file (`booklist-data.js`) in the exact format required by the Squarespace site's `inflate-booklist.js` script. The tool must handle CSV files with header rows, blank rows, and missing data while ensuring 100% format compatibility with the existing booklist-data.js structure to prevent breaking the live site.

## Technical Context

**Language/Version**: Node.js (ES modules - .mjs files, compatible with existing scripts directory)  
**Primary Dependencies**: CSV parsing library (e.g., csv-parse, papaparse, or built-in Node.js), fs (Node.js built-in)  
**Storage**: Local filesystem (CSV input file, JavaScript output file)  
**Testing**: Node.js test framework (e.g., Node.js built-in test runner, Jest, or Mocha)  
**Target Platform**: Node.js runtime (cross-platform: Windows, macOS, Linux)  
**Project Type**: Single command-line tool/script  
**Performance Goals**: Process 200-book CSV file in under 5 seconds (per SC-006)  
**Constraints**: 
- Output format MUST exactly match existing booklist-data.js structure
- Must handle CSV files with multiple header rows and blank rows
- Must preserve exact property names (case-sensitive, including spaces)
- Category fields must be "" or "1" only (never null/undefined)
- JSON string must be properly escaped for JavaScript embedding  
**Scale/Scope**: 
- Input: CSV files with 100-200+ book entries
- Output: Single JavaScript file (~100KB-500KB depending on book count)
- Single developer tool (not a web service or API)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gates

✅ **I. Site Stability First**: Tool generates output files only - does not modify existing site files. Output must be validated before deployment.

✅ **II. Data Format Compatibility**: Tool's primary purpose is to generate booklist-data.js in exact format. This is the core requirement.

✅ **III. CSV Parsing Validation**: Tool must validate output against schema before generating files. This is a core functional requirement.

✅ **IV. Testing Before Deployment**: Tool is a development utility - all testing happens locally before any deployment.

✅ **V. Understanding Before Modification**: Tool reads existing booklist-data.js format and example.csv to understand structure. No modification of existing code required.

**Status**: All gates pass. Tool aligns with constitution principles.

### Post-Design Re-check

✅ **I. Site Stability First**: Tool generates output files only - does not modify existing site files. Output validation ensures compatibility before deployment.

✅ **II. Data Format Compatibility**: Design ensures exact format matching through double JSON.stringify() and schema validation. All property names preserved exactly.

✅ **III. CSV Parsing Validation**: Data model includes comprehensive validation rules. Output format contract ensures schema compliance.

✅ **IV. Testing Before Deployment**: Quickstart includes validation checklist. Tool supports --validate-only mode for testing.

✅ **V. Understanding Before Modification**: Research phase analyzed existing booklist-data.js format. Design matches existing patterns exactly.

**Status**: All gates pass post-design. Implementation ready to proceed.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
scripts/
├── parse-csv-to-booklist.mjs    # Main parser script
├── package.json                  # Existing (add CSV parsing dependency)
└── [existing scripts remain unchanged]

tests/
├── unit/
│   ├── test-csv-parser.mjs      # Unit tests for CSV parsing
│   └── test-output-format.mjs   # Tests for output format validation
└── fixtures/
    ├── sample-books.csv          # Test CSV file
    └── expected-output.js        # Expected booklist-data.js format
```

**Structure Decision**: Single command-line script in existing `scripts/` directory to maintain consistency with `fetch-booklist-data-secret.mjs`. Tests in new `tests/` directory at repository root. No changes to existing site files.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *No violations* | *N/A* | *All constitution principles satisfied* |
