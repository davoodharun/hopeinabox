/**
 * Normalizes category field values to "" or "1" only
 * Handles common CSV export variations (yes/no/true/false/0/1/Y/N)
 */

/**
 * Normalizes a category value to "" or "1"
 * @param {string|number|undefined|null} value - Raw category value from CSV
 * @returns {string} - Normalized value: "" or "1"
 */
export function normalizeCategory(value) {
    // Handle null/undefined
    if (value === null || value === undefined) {
        return '';
    }
    
    // Convert to string and trim
    const strValue = String(value).trim();
    
    // Empty string
    if (strValue === '') {
        return '';
    }
    
    // Values that mean "true" or "yes"
    const truthyValues = ['1', 'yes', 'true', 'y', 'on'];
    if (truthyValues.includes(strValue.toLowerCase())) {
        return '1';
    }
    
    // Values that mean "false" or "no"
    const falsyValues = ['0', 'no', 'false', 'n', 'off', ''];
    if (falsyValues.includes(strValue.toLowerCase())) {
        return '';
    }
    
    // Unknown values default to empty (safe default)
    // Could log a warning in verbose mode
    return '';
}

