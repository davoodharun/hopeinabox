# Output Format Contract

**Feature**: CSV to Booklist Data Parser  
**Date**: 2025-01-27  
**Type**: File Format Specification

## JavaScript File Format

The generated `booklist-data.js` file MUST follow this exact format:

```javascript
window.bookJsonText = '{"books":[...]}';
```

Where:
- `window.bookJsonText` is assigned a JSON string
- The JSON string contains a valid JSON object with a `books` array
- The JSON string is properly escaped for JavaScript embedding (double stringified)

## JSON Structure

```json
{
  "books": [
    {
      "Title": "Book Title",
      "Author": "Author Name",
      "RowNumber": 1,
      "Early elementary": "",
      "Late elementary": "1",
      ...
    },
    ...
  ]
}
```

## Escaping Rules

The JSON string MUST be double-stringified:
1. First stringify: Convert JavaScript object to JSON string
2. Second stringify: Convert JSON string to JavaScript string literal

This ensures:
- Quotes are escaped: `"` becomes `\"`
- Newlines are escaped: `\n` becomes `\\n`
- Backslashes are escaped: `\` becomes `\\`
- String can be safely embedded in JavaScript code

## Example Output

```javascript
window.bookJsonText = "{\"books\":[{\"Title\":\"A Family Is a Family Is a Family\",\"Author\":\"by Sara O'Leary, illustrated by Qin Leng\",\"RowNumber\":1,\"Early elementary\":\"1\",\"Late elementary\":\"\",...}]}";
```

## Validation

The output file MUST:
1. Be valid JavaScript syntax
2. Contain valid JSON when parsed from the string
3. Match the Book Object Schema (see `book-schema.json`)
4. Have property names exactly matching expected names (case-sensitive, including spaces)
5. Have category fields as "" or "1" only
6. Be loadable by `inflate-booklist.js` without modification

## Compatibility

This format MUST match the existing `scripts/booklist-data.js` format exactly to ensure compatibility with:
- `scripts/inflate-booklist.js` - expects `window.bookJsonText`
- `pages/browse-books.page` - loads booklist-data.js script

