/**
 * Maps CSV column names to book object property names
 * Ensures exact matching (case-sensitive, including spaces and special characters)
 */

/**
 * Maps CSV column headers to book object property names
 * @param {Array<string>} csvHeaders - Array of CSV column names
 * @returns {Map<number, string>} - Map of column index to property name
 */
export function createColumnMap(csvHeaders) {
    const columnMap = new Map();
    const seenHeaders = new Map(); // Track how many times we've seen each header
    
    csvHeaders.forEach((header, index) => {
        if (!header) return; // Skip empty headers
        
        const normalizedHeader = header.trim();
        const normalizedLower = normalizedHeader.toLowerCase();
        
        // Special handling for duplicate "Synopsis" - second occurrence should be "Synopsis link"
        if (normalizedLower === 'synopsis') {
            const count = seenHeaders.get(normalizedLower) || 0;
            if (count === 0) {
                // First "Synopsis" - map as "Synopsis"
                seenHeaders.set(normalizedLower, 1);
                columnMap.set(index, normalizedHeader);
            } else {
                // Second "Synopsis" - map as "Synopsis link"
                columnMap.set(index, 'Synopsis link');
            }
            return;
        }
        
        // Handle other duplicate headers - use first occurrence
        if (seenHeaders.has(normalizedLower)) {
            // Skip duplicate - first occurrence is already mapped
            return;
        }
        
        seenHeaders.set(normalizedLower, 1);
        
        // Map column index to exact property name (preserve case, spaces, special chars)
        columnMap.set(index, normalizedHeader);
    });
    
    return columnMap;
}

/**
 * Gets the property name for a column index
 * @param {Map<number, string>} columnMap - Column mapping
 * @param {number} columnIndex - Index of the column
 * @returns {string|undefined} - Property name or undefined if not found
 */
export function getPropertyName(columnMap, columnIndex) {
    return columnMap.get(columnIndex);
}

