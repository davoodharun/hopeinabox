#!/usr/bin/env node

import { readCSVFile } from './lib/csv-reader.mjs';
import { classifyRow, isBlankRow, isHeaderRow, isMetadataRow, hasInconsistentColumnCount } from './lib/row-classifier.mjs';
import { createColumnMap } from './lib/column-mapper.mjs';
import { createBookFromRow } from './lib/book-builder.mjs';
import { validateBook, hasRequiredFields } from './lib/book-validator.mjs';
import { formatAsJavaScript } from './lib/output-formatter.mjs';
import { writeJavaScriptFile } from './lib/file-writer.mjs';
import { validateOutputFile } from './lib/output-validator.mjs';
import { compareFormats } from './lib/format-comparator.mjs';
import { formatError, getExitCode } from './lib/error-handler.mjs';
import { fetchAllBookCovers } from './lib/book-cover-fetcher.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main CSV to Booklist Data Parser
 * Converts CSV files to booklist-data.js format for Squarespace site
 */

// CLI argument parsing
const args = process.argv.slice(2);
let inputFile = null;
let outputFile = 'scripts/booklist-data-test.js';
let verbose = false;
let validateOnly = false;
let fetchCovers = false;

// Parse arguments
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
        console.log(`
Usage: node scripts/parse-csv-to-booklist.mjs [options] <input-csv-file>

Arguments:
  <input-csv-file>          Path to CSV file containing book data (required)

Options:
  --output, -o <path>       Output file path (default: scripts/booklist-data.js)
  --help, -h                Display this help message
  --verbose, -v             Enable verbose logging
  --validate-only           Parse and validate CSV without generating output file
  --fetch-covers, --covers  Fetch book cover images from free APIs after parsing

Examples:
  node scripts/parse-csv-to-booklist.mjs example.csv
  node scripts/parse-csv-to-booklist.mjs example.csv --output scripts/booklist-data-new.js
  node scripts/parse-csv-to-booklist.mjs example.csv --validate-only
  node scripts/parse-csv-to-booklist.mjs example.csv --verbose
`);
        process.exit(0);
    } else if (arg === '--verbose' || arg === '-v') {
        verbose = true;
    } else if (arg === '--validate-only') {
        validateOnly = true;
    } else if (arg === '--fetch-covers' || arg === '--covers') {
        fetchCovers = true;
    } else if (arg === '--output' || arg === '-o') {
        if (i + 1 < args.length) {
            outputFile = args[++i];
        } else {
            console.error('Error: --output requires a file path');
            process.exit(1);
        }
    } else if (!arg.startsWith('-')) {
        inputFile = arg;
    }
}

// Validate input file
if (!inputFile) {
    console.error('Error: Input CSV file is required');
    console.error('Usage: node scripts/parse-csv-to-booklist.mjs [options] <input-csv-file>');
    console.error('Use --help for more information');
    process.exit(1);
}

if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
}

// Main processing function
async function main() {
    try {
        if (verbose) {
            console.log(`Reading CSV file: ${inputFile}`);
        }
        
        // Read CSV file
        const rows = await readCSVFile(inputFile);
        
        if (verbose) {
            console.log(`Read ${rows.length} rows from CSV file`);
        }
        
        // Find header row and create column map
        // Skip multiple header/metadata rows until finding actual data header row
        let headerRowIndex = -1;
        let columnMap = null;
        
        for (let i = 0; i < rows.length; i++) {
            const rowType = classifyRow(rows[i], i);
            if (rowType === 'header') {
                headerRowIndex = i;
                columnMap = createColumnMap(rows[i]);
                if (verbose) {
                    console.log(`Found header row at index ${i}`);
                    console.log(`Mapped ${columnMap.size} columns`);
                }
                break;
            } else if (rowType === 'metadata' && verbose) {
                console.log(`Skipping metadata row at index ${i}`);
            }
        }
        
        if (!columnMap) {
            throw new Error('Could not find header row with Title and Author columns');
        }
        
        // Process data rows
        const books = [];
        let rowNumber = 1;
        let skippedRows = 0;
        
        for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            
            // Skip blank rows
            if (isBlankRow(row)) {
                if (verbose) {
                    console.log(`Skipping blank row at index ${i}`);
                }
                skippedRows++;
                continue;
            }
            
            // Check column count consistency (warn but don't fail)
            if (hasInconsistentColumnCount(row, columnMap.size) && verbose) {
                console.log(`Warning: Row ${i + 1} has ${row.length} columns, expected ${columnMap.size}`);
            }
            
            // Check if row has required fields
            if (!hasRequiredFields(row, columnMap)) {
                if (verbose) {
                    console.log(`Skipping row ${i + 1}: missing Title or Author`);
                }
                skippedRows++;
                continue;
            }
            
            // Create book object
            const book = createBookFromRow(row, columnMap, rowNumber);
            
            // Validate book
            const validation = validateBook(book);
            if (!validation.valid) {
                if (verbose) {
                    console.log(`Skipping row ${i + 1}: validation errors:`, validation.errors.join(', '));
                }
                skippedRows++;
                continue;
            }
            
            books.push(book);
            rowNumber++;
        }
        
        if (books.length === 0) {
            throw new Error('No valid book entries found in CSV file');
        }
        
        if (verbose) {
            console.log(`Processed ${books.length} books, skipped ${skippedRows} rows`);
        }
        
        // Validate only mode
        if (validateOnly) {
            console.log(`Validation complete: ${books.length} valid books found`);
            
            // Perform comprehensive validation
            if (verbose) {
                console.log('\nPerforming output format validation...');
            }
            
            // Format as JavaScript temporarily to validate
            const jsContent = formatAsJavaScript(books);
            const tempFile = outputFile + '.tmp';
            writeJavaScriptFile(tempFile, jsContent);
            
            try {
                const validation = validateOutputFile(tempFile);
                if (validation.valid) {
                    console.log(`✓ Output format validation passed`);
                    console.log(`  - ${validation.summary.totalBooks} books validated`);
                } else {
                    console.error(`✗ Output format validation failed:`);
                    validation.errors.forEach(err => console.error(`  - ${err}`));
                    fs.unlinkSync(tempFile);
                    process.exit(3);
                }
                
                // Compare with existing booklist-data.js if it exists
                const referenceFile = 'scripts/booklist-data.js';
                if (fs.existsSync(referenceFile)) {
                    const comparison = compareFormats(tempFile, referenceFile);
                    if (comparison.match) {
                        console.log(`✓ Format matches existing booklist-data.js`);
                    } else {
                        console.log(`⚠ Format differences detected:`);
                        comparison.differences.forEach(diff => console.log(`  - ${diff}`));
                    }
                }
                
                fs.unlinkSync(tempFile);
            } catch (error) {
                if (fs.existsSync(tempFile)) {
                    fs.unlinkSync(tempFile);
                }
                throw error;
            }
            
            process.exit(0);
        }
        
        // Format as JavaScript
        const jsContent = formatAsJavaScript(books);
        
        // Write output file
        writeJavaScriptFile(outputFile, jsContent);
        
        // Validate output file
        if (verbose) {
            console.log('\nValidating output file...');
            const validation = validateOutputFile(outputFile);
            if (validation.valid) {
                console.log(`✓ Output file validation passed`);
            } else {
                console.error(`✗ Output file validation failed:`);
                validation.errors.forEach(err => console.error(`  - ${err}`));
            }
        }
        
        console.log(`Successfully parsed ${books.length} books and wrote to ${outputFile}`);
        
        // Fetch book covers if requested
        if (fetchCovers) {
            console.log('\nFetching book cover images...');
            const repoRoot = path.resolve(__dirname, '..');
            const coverResults = await fetchAllBookCovers(books, repoRoot, verbose, 500);
            
            console.log('\nCover fetch results:');
            console.log(`  Total books: ${coverResults.total}`);
            console.log(`  Successfully fetched: ${coverResults.successful}`);
            console.log(`  Already existed: ${coverResults.skipped}`);
            console.log(`  Failed/not found: ${coverResults.failed}`);
            
            if (coverResults.successful > 0) {
                console.log(`\nSource breakdown:`);
                console.log(`  Open Library: ${coverResults.stats.openLibrary}`);
                console.log(`  Google Books: ${coverResults.stats.googleBooks}`);
                
                const uncompressedMB = (coverResults.stats.totalSizeUncompressed / (1024 * 1024)).toFixed(2);
                const compressedMB = (coverResults.stats.totalSizeCompressed / (1024 * 1024)).toFixed(2);
                const savings = coverResults.stats.totalSizeUncompressed > 0 
                    ? ((1 - coverResults.stats.totalSizeCompressed / coverResults.stats.totalSizeUncompressed) * 100).toFixed(1)
                    : 0;
                
                console.log(`\nFile sizes:`);
                console.log(`  Uncompressed: ${uncompressedMB} MB`);
                console.log(`  Compressed: ${compressedMB} MB (${savings}% reduction)`);
                console.log(`  Time: ${coverResults.stats.totalTimeSeconds}s`);
            }
        }
        
        process.exit(0);
        
    } catch (error) {
        const errorMessage = formatError(error, 'Error');
        console.error(errorMessage);
        if (verbose) {
            console.error('\nStack trace:');
            console.error(error.stack);
        }
        
        const exitCode = getExitCode(error);
        process.exit(exitCode);
    }
}

// Run main function
main();

