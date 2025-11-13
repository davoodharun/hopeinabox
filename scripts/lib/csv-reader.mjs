import { parse } from 'csv-parse/sync';
import fs from 'fs';

/**
 * Reads and parses a CSV file from the filesystem
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array<Array<string>>>} - Array of rows, each row is an array of cell values
 */
export async function readCSVFile(filePath) {
    const startTime = Date.now();
    try {
        // Try UTF-8 first, fall back to Windows-1252 if needed
        let fileContent;
        try {
            fileContent = fs.readFileSync(filePath, 'utf-8');
        } catch (encodingError) {
            // Try Windows-1252 encoding
            fileContent = fs.readFileSync(filePath, 'latin1');
        }
        
        const records = parse(fileContent, {
            skip_empty_lines: false, // We'll handle blank rows ourselves
            relax_column_count: true, // Allow inconsistent column counts
            bom: true, // Handle BOM if present
        });
        
        const processingTime = Date.now() - startTime;
        if (processingTime > 1000) {
            // Log performance for large files (could be enhanced with verbose flag)
            console.log(`CSV parsing took ${processingTime}ms`);
        }
        
        return records;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`CSV file not found: ${filePath}`);
        } else if (error.message.includes('Invalid')) {
            throw new Error(`Malformed CSV file: ${error.message}`);
        } else {
            throw new Error(`Failed to read CSV file: ${error.message}`);
        }
    }
}

