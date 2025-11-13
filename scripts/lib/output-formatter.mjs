/**
 * Formats books collection as JavaScript file content
 * Uses double JSON.stringify() to properly escape JSON string for JavaScript embedding
 */

/**
 * Formats a books collection into JavaScript file content
 * @param {Array<Object>} books - Array of book objects
 * @returns {string} - JavaScript file content: window.bookJsonText = '{"books":[...]}';
 */
export function formatAsJavaScript(books) {
    const booksCollection = { books };
    
    // First stringify: Convert JavaScript object to JSON string
    const jsonString = JSON.stringify(booksCollection);
    
    // Second stringify: Convert JSON string to JavaScript string literal (properly escaped)
    const escapedJsonString = JSON.stringify(jsonString);
    
    // Create the JavaScript assignment statement
    return `window.bookJsonText = ${escapedJsonString};`;
}

