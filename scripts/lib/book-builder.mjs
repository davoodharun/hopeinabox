import { normalizeCategory } from './category-normalizer.mjs';
import { getPropertyName } from './column-mapper.mjs';

/**
 * Creates a book object from CSV row data
 */

/**
 * Creates a book object from a CSV row
 * @param {Array<string>} row - CSV row data
 * @param {Map<number, string>} columnMap - Column index to property name mapping
 * @param {number} rowNumber - Sequential row number (starting from 1)
 * @returns {Object} - Book object with all properties
 */
export function createBookFromRow(row, columnMap, rowNumber) {
    const book = {
        RowNumber: rowNumber  // Always calculated, never read from CSV
    };
    
    // Map all columns to book properties
    row.forEach((cell, index) => {
        const propertyName = getPropertyName(columnMap, index);
        if (!propertyName) return; // Skip unmapped columns
        
        // Skip RowNumber column from CSV - we always calculate it
        const normalizedPropertyName = propertyName.toLowerCase().trim();
        if (normalizedPropertyName === 'rownumber' || normalizedPropertyName === 'row number') {
            return; // Skip this column, use calculated RowNumber instead
        }
        
        const value = cell || ''; // Default to empty string if cell is null/undefined
        
        // Check if this is a category field (fields that should be "" or "1")
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
        
        if (categoryFields.includes(propertyName)) {
            // Normalize category fields to "" or "1"
            book[propertyName] = normalizeCategory(value);
        } else {
            // Text fields: preserve as-is, default to empty string
            book[propertyName] = value.trim();
        }
    });
    
    // Ensure required fields exist (set to empty string if missing)
    if (!book.Title) book.Title = '';
    if (!book.Author) book.Author = '';
    
    return book;
}

