import fs from 'fs';

/**
 * Compares generated output format with existing booklist-data.js format
 */

/**
 * Compares format of two JavaScript files
 * @param {string} generatedFile - Path to newly generated file
 * @param {string} referenceFile - Path to reference file (existing booklist-data.js)
 * @returns {Object} - { match: boolean, differences: Array<string> }
 */
export function compareFormats(generatedFile, referenceFile) {
    const differences = [];
    
    try {
        const generated = fs.readFileSync(generatedFile, 'utf-8');
        const reference = fs.readFileSync(referenceFile, 'utf-8');
        
        // Check both have window.bookJsonText assignment
        const generatedHasAssignment = generated.includes('window.bookJsonText');
        const referenceHasAssignment = reference.includes('window.bookJsonText');
        
        if (generatedHasAssignment !== referenceHasAssignment) {
            differences.push('window.bookJsonText assignment presence differs');
        }
        
        // Extract JSON strings
        const generatedMatch = generated.match(/window\.bookJsonText\s*=\s*(.+);/);
        const referenceMatch = reference.match(/window\.bookJsonText\s*=\s*(.+);/);
        
        if (!generatedMatch) {
            differences.push('Generated file: Cannot extract JSON string');
        }
        if (!referenceMatch) {
            differences.push('Reference file: Cannot extract JSON string');
        }
        
        if (generatedMatch && referenceMatch) {
            try {
                // Parse both JSON strings
                const generatedJson = JSON.parse(generatedMatch[1]);
                const referenceJson = JSON.parse(referenceMatch[1]);
                
                const generatedData = JSON.parse(generatedJson);
                const referenceData = JSON.parse(referenceJson);
                
                // Compare structure
                if (generatedData.books && !referenceData.books) {
                    differences.push('Generated has books array, reference does not');
                } else if (!generatedData.books && referenceData.books) {
                    differences.push('Reference has books array, generated does not');
                } else if (generatedData.books && referenceData.books) {
                    // Compare first book structure
                    if (generatedData.books.length > 0 && referenceData.books.length > 0) {
                        const generatedKeys = Object.keys(generatedData.books[0]).sort();
                        const referenceKeys = Object.keys(referenceData.books[0]).sort();
                        
                        if (JSON.stringify(generatedKeys) !== JSON.stringify(referenceKeys)) {
                            differences.push(`Property names differ. Generated: ${generatedKeys.length} properties, Reference: ${referenceKeys.length} properties`);
                        }
                    }
                }
            } catch (e) {
                differences.push(`JSON parsing error: ${e.message}`);
            }
        }
        
    } catch (error) {
        differences.push(`File comparison error: ${error.message}`);
    }
    
    return {
        match: differences.length === 0,
        differences
    };
}

