/**
 * Validates book objects against the expected schema
 */

/**
 * Validates that a book object has required fields
 * @param {Object} book - Book object to validate
 * @returns {Object} - { valid: boolean, errors: Array<string> }
 */
export function validateBook(book) {
    const errors = [];
    
    // Check required fields
    if (!book.Title || book.Title.trim() === '') {
        errors.push('Title is required and cannot be empty');
    }
    
    if (!book.Author || book.Author.trim() === '') {
        errors.push('Author is required and cannot be empty');
    }
    
    if (typeof book.RowNumber !== 'number' || book.RowNumber < 1) {
        errors.push('RowNumber must be a positive integer');
    }
    
    // Check category fields are "" or "1" only
    const categoryFields = [
        'Early elementary', 'Late elementary', 'Middle school', 'Early high school', 'Late high school',
        'Yes', 'No',
        'Picture book', 'Chapter book', 'Graphic novel', 'Non-fiction', 'Anthology', 'Poetry', 'Scripts & plays',
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
                errors.push(`Category field "${field}" must be "" or "1", got: ${JSON.stringify(value)}`);
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validates that required fields (Title, Author) are present in a CSV row
 * @param {Array<string>} row - CSV row data
 * @param {Map<number, string>} columnMap - Column mapping
 * @returns {boolean} - True if row has required fields
 */
export function hasRequiredFields(row, columnMap) {
    let hasTitle = false;
    let hasAuthor = false;
    
    row.forEach((cell, index) => {
        const propertyName = columnMap.get(index);
        if (propertyName === 'Title' && cell && cell.trim() !== '') {
            hasTitle = true;
        }
        if (propertyName === 'Author' && cell && cell.trim() !== '') {
            hasAuthor = true;
        }
    });
    
    return hasTitle && hasAuthor;
}

