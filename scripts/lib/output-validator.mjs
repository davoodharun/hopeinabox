import fs from 'fs';

/**
 * Validates output JavaScript file format and content
 */

/**
 * Validates JavaScript syntax of the output file
 * @param {string} filePath - Path to JavaScript file
 * @returns {Object} - { valid: boolean, errors: Array<string> }
 */
export function validateJavaScriptSyntax(filePath) {
    const errors = [];
    
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Check for required format: window.bookJsonText = "...";
        if (!content.includes('window.bookJsonText')) {
            errors.push('Missing window.bookJsonText assignment');
        }
        
        // Try to evaluate as JavaScript (basic syntax check)
        try {
            // Extract the JSON string part
            const match = content.match(/window\.bookJsonText\s*=\s*(.+);/);
            if (!match) {
                errors.push('Invalid JavaScript syntax: cannot parse window.bookJsonText assignment');
            }
        } catch (e) {
            errors.push(`JavaScript syntax error: ${e.message}`);
        }
    } catch (error) {
        errors.push(`Failed to read file: ${error.message}`);
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validates that the JSON string is valid JSON
 * @param {string} filePath - Path to JavaScript file
 * @returns {Object} - { valid: boolean, errors: Array<string>, books: Array<Object>|null }
 */
export function validateJSONString(filePath) {
    const errors = [];
    let books = null;
    
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Extract JSON string
        const match = content.match(/window\.bookJsonText\s*=\s*(.+);/);
        if (!match) {
            errors.push('Cannot extract JSON string from file');
            return { valid: false, errors, books: null };
        }
        
        // Parse the outer JSON string (double stringified)
        const jsonString = JSON.parse(match[1]);
        
        // Parse the inner JSON (actual books data)
        const booksData = JSON.parse(jsonString);
        
        if (!booksData.books || !Array.isArray(booksData.books)) {
            errors.push('JSON structure invalid: missing or invalid books array');
        } else {
            books = booksData.books;
        }
    } catch (error) {
        if (error instanceof SyntaxError) {
            errors.push(`Invalid JSON: ${error.message}`);
        } else {
            errors.push(`Failed to parse JSON: ${error.message}`);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors,
        books
    };
}

/**
 * Validates schema of all book objects
 * @param {Array<Object>} books - Array of book objects
 * @returns {Object} - { valid: boolean, errors: Array<string> }
 */
export function validateSchema(books) {
    const errors = [];
    
    if (!books || books.length === 0) {
        errors.push('No books found in output');
        return { valid: false, errors };
    }
    
    books.forEach((book, index) => {
        // Check required fields
        if (!book.Title || book.Title.trim() === '') {
            errors.push(`Book ${index + 1}: Missing Title`);
        }
        if (!book.Author || book.Author.trim() === '') {
            errors.push(`Book ${index + 1}: Missing Author`);
        }
        if (typeof book.RowNumber !== 'number' || book.RowNumber < 1) {
            errors.push(`Book ${index + 1}: Invalid RowNumber`);
        }
        
        // Check category fields are "" or "1" only
        const categoryFields = [
            'Early elementary', 'Late elementary', 'Middle school', 'Early high school', 'Late high school',
            'Yes', 'No', 'Picture book', 'Chapter book', 'Graphic novel', 'Non-fiction', 'Anthology', 'Poetry', 'Scripts & plays',
            'Lesbian', 'Gay', 'Bisexual & Pansexual', 'Trans & Nonbinary', 'Queer+',
            'Small Town, Rural & Heartland', 'Black, Caribbean, & African Diaspora', 'Asian & Asian Diaspora',
            'Latino & Hispanic', 'Native American & Indigenous', 'Diverse ensemble', 'Ability',
            'Coming out', 'Religion & Spirituality', 'Diverse family structure',
            'Relationships: Family', 'Relationships: Love', 'Relationships: Friends', 'Relationships: Community',
            'Politics, Society, & Activism', 'Classics'
        ];
        
        for (const field of categoryFields) {
            if (book.hasOwnProperty(field)) {
                const value = book[field];
                if (value !== '' && value !== '1') {
                    errors.push(`Book ${index + 1}: Category field "${field}" must be "" or "1", got: ${JSON.stringify(value)}`);
                }
            }
        }
    });
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validates property names match expected schema exactly
 * @param {Array<Object>} books - Array of book objects
 * @returns {Object} - { valid: boolean, errors: Array<string> }
 */
export function validatePropertyNames(books) {
    const errors = [];
    const expectedProperties = new Set([
        'Title', 'Author', 'RowNumber',
        'Early elementary', 'Late elementary', 'Middle school', 'Early high school', 'Late high school',
        'Yes', 'No',
        'Picture book', 'Chapter book', 'Graphic novel', 'Non-fiction', 'Anthology', 'Poetry', 'Scripts & plays',
        'Lesbian', 'Gay', 'Bisexual & Pansexual', 'Trans & Nonbinary', 'Queer+',
        'Small Town, Rural & Heartland', 'Black, Caribbean, & African Diaspora', 'Asian & Asian Diaspora',
        'Latino & Hispanic', 'Native American & Indigenous', 'Diverse ensemble', 'Ability',
        'Coming out', 'Religion & Spirituality', 'Diverse family structure',
        'Relationships: Family', 'Relationships: Love', 'Relationships: Friends', 'Relationships: Community',
        'Politics, Society, & Activism', 'Classics',
        'Synopsis', 'Synopsis link', 'Awards', 'Notes', 'Year Published'
    ]);
    
    if (!books || books.length === 0) {
        return { valid: true, errors: [] };
    }
    
    books.forEach((book, index) => {
        Object.keys(book).forEach(prop => {
            if (!expectedProperties.has(prop)) {
                errors.push(`Book ${index + 1}: Unexpected property name: "${prop}"`);
            }
        });
    });
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validates data types of book object fields
 * @param {Array<Object>} books - Array of book objects
 * @returns {Object} - { valid: boolean, errors: Array<string> }
 */
export function validateDataTypes(books) {
    const errors = [];
    
    if (!books || books.length === 0) {
        return { valid: true, errors: [] };
    }
    
    const categoryFields = [
        'Early elementary', 'Late elementary', 'Middle school', 'Early high school', 'Late high school',
        'Yes', 'No', 'Picture book', 'Chapter book', 'Graphic novel', 'Non-fiction', 'Anthology', 'Poetry', 'Scripts & plays',
        'Lesbian', 'Gay', 'Bisexual & Pansexual', 'Trans & Nonbinary', 'Queer+',
        'Small Town, Rural & Heartland', 'Black, Caribbean, & African Diaspora', 'Asian & Asian Diaspora',
        'Latino & Hispanic', 'Native American & Indigenous', 'Diverse ensemble', 'Ability',
        'Coming out', 'Religion & Spirituality', 'Diverse family structure',
        'Relationships: Family', 'Relationships: Love', 'Relationships: Friends', 'Relationships: Community',
        'Politics, Society, & Activism', 'Classics'
    ];
    
    books.forEach((book, index) => {
        // Check category fields are strings with "" or "1"
        categoryFields.forEach(field => {
            if (book.hasOwnProperty(field)) {
                if (typeof book[field] !== 'string') {
                    errors.push(`Book ${index + 1}: Category field "${field}" must be string, got ${typeof book[field]}`);
                }
            }
        });
        
        // Check text fields are strings
        const textFields = ['Title', 'Author', 'Synopsis', 'Synopsis link', 'Awards', 'Notes'];
        textFields.forEach(field => {
            if (book.hasOwnProperty(field) && typeof book[field] !== 'string') {
                errors.push(`Book ${index + 1}: Text field "${field}" must be string, got ${typeof book[field]}`);
            }
        });
        
        // Check RowNumber is number
        if (typeof book.RowNumber !== 'number') {
            errors.push(`Book ${index + 1}: RowNumber must be number, got ${typeof book.RowNumber}`);
        }
    });
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Comprehensive validation of output file
 * @param {string} filePath - Path to JavaScript file
 * @returns {Object} - { valid: boolean, errors: Array<string>, summary: Object }
 */
export function validateOutputFile(filePath) {
    const allErrors = [];
    let books = null;
    
    // Validate JavaScript syntax
    const jsValidation = validateJavaScriptSyntax(filePath);
    if (!jsValidation.valid) {
        allErrors.push(...jsValidation.errors);
    }
    
    // Validate JSON string
    const jsonValidation = validateJSONString(filePath);
    if (!jsonValidation.valid) {
        allErrors.push(...jsonValidation.errors);
    } else {
        books = jsonValidation.books;
    }
    
    // If we have books, validate schema, property names, and data types
    if (books) {
        const schemaValidation = validateSchema(books);
        if (!schemaValidation.valid) {
            allErrors.push(...schemaValidation.errors);
        }
        
        const propValidation = validatePropertyNames(books);
        if (!propValidation.valid) {
            allErrors.push(...propValidation.errors);
        }
        
        const typeValidation = validateDataTypes(books);
        if (!typeValidation.valid) {
            allErrors.push(...typeValidation.errors);
        }
    }
    
    return {
        valid: allErrors.length === 0,
        errors: allErrors,
        summary: {
            totalBooks: books ? books.length : 0,
            errorsFound: allErrors.length
        }
    };
}

