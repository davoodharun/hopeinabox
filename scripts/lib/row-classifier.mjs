/**
 * Classifies CSV rows as header, metadata, blank, or data rows
 */

/**
 * Checks if a row is blank (all cells are empty or whitespace-only)
 * @param {Array<string>} row - Array of cell values
 * @returns {boolean} - True if row is blank
 */
export function isBlankRow(row) {
    if (!row || row.length === 0) return true;
    return row.every(cell => !cell || cell.trim() === '');
}

/**
 * Checks if a row is a header row (contains Title and Author columns)
 * @param {Array<string>} row - Array of cell values
 * @returns {boolean} - True if row appears to be a header row
 */
export function isHeaderRow(row) {
    if (!row || row.length < 2) return false;
    const rowLower = row.map(cell => (cell || '').toLowerCase().trim());
    return rowLower.includes('title') && rowLower.includes('author');
}

/**
 * Checks if a row is a metadata row (contains non-data information)
 * @param {Array<string>} row - Array of cell values
 * @param {number} rowIndex - Index of the row in the CSV
 * @returns {boolean} - True if row appears to be metadata
 */
export function isMetadataRow(row, rowIndex) {
    // Metadata rows are typically:
    // - First few rows that aren't headers
    // - Contain mostly empty cells or summary data
    if (rowIndex < 3 && !isHeaderRow(row) && !isBlankRow(row)) {
        // Check if row has very few non-empty cells (likely metadata)
        const nonEmptyCells = row.filter(cell => cell && cell.trim() !== '').length;
        return nonEmptyCells < 3;
    }
    return false;
}

/**
 * Classifies a row type
 * @param {Array<string>} row - Array of cell values
 * @param {number} rowIndex - Index of the row in the CSV
 * @returns {string} - 'header', 'metadata', 'blank', or 'data'
 */
export function classifyRow(row, rowIndex) {
    if (isBlankRow(row)) return 'blank';
    if (isHeaderRow(row)) return 'header';
    if (isMetadataRow(row, rowIndex)) return 'metadata';
    return 'data';
}

/**
 * Checks if a row has inconsistent column count compared to header
 * @param {Array<string>} row - Array of cell values
 * @param {number} expectedColumnCount - Expected number of columns from header
 * @returns {boolean} - True if column count differs significantly
 */
export function hasInconsistentColumnCount(row, expectedColumnCount) {
    // Allow some flexibility (within 20% difference)
    const difference = Math.abs(row.length - expectedColumnCount);
    return difference > expectedColumnCount * 0.2;
}

