import fs from 'fs';

/**
 * Writes JavaScript content to an output file
 */

/**
 * Writes JavaScript content to a file
 * @param {string} filePath - Path where file should be written
 * @param {string} content - JavaScript file content
 * @throws {Error} - If file write fails
 */
export function writeJavaScriptFile(filePath, content) {
    try {
        fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error) {
        throw new Error(`Failed to write output file: ${error.message}`);
    }
}

