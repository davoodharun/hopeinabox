/**
 * Provides clear, actionable error messages for common errors
 */

/**
 * Formats error message with context and suggestions
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred (e.g., "CSV parsing", "File writing")
 * @returns {string} - Formatted error message
 */
export function formatError(error, context = '') {
    const prefix = context ? `${context}: ` : '';
    
    // Handle specific error types
    if (error.code === 'ENOENT') {
        return `${prefix}File not found. Please check the file path and ensure the file exists.`;
    }
    
    if (error.code === 'EACCES') {
        return `${prefix}Permission denied. Please check file permissions.`;
    }
    
    if (error.message.includes('CSV file not found')) {
        return `${prefix}CSV file not found. Please provide a valid path to your CSV file.`;
    }
    
    if (error.message.includes('header row')) {
        return `${prefix}Could not find header row with Title and Author columns. Please ensure your CSV file has a header row.`;
    }
    
    if (error.message.includes('No valid book entries')) {
        return `${prefix}No valid book entries found. Please ensure your CSV file contains at least one row with Title and Author fields.`;
    }
    
    if (error.message.includes('Malformed CSV')) {
        return `${prefix}CSV file appears to be malformed. Please check the file format and ensure it's valid CSV.`;
    }
    
    if (error.message.includes('Failed to write')) {
        return `${prefix}Failed to write output file. Please check write permissions and disk space.`;
    }
    
    // Generic error message
    return `${prefix}${error.message}`;
}

/**
 * Gets exit code for error type
 * @param {Error} error - Error object
 * @returns {number} - Exit code (1-4)
 */
export function getExitCode(error) {
    if (error.message.includes('not found') || error.message.includes('Invalid arguments')) {
        return 1;
    } else if (error.message.includes('Failed to read CSV') || error.message.includes('malformed')) {
        return 2;
    } else if (error.message.includes('validation') || error.message.includes('required')) {
        return 3;
    } else if (error.message.includes('Failed to write')) {
        return 4;
    }
    return 1; // Default
}

