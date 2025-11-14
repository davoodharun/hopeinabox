# Books Page for Hope in a Box

This is a custom Squarespace infrastructure for [Hope in a Box's website](https://hopeinabox.org/).

## About

Hope in a Box is a non-profit dedicated to helping teachers at rural and/or low-income schools include LGBTQ+ books in their classroom.
This infrastructure helps teachers browse Hope in a Box's curated list of 100 inclusive books with an [interactive page for searching and filtering books](https://hopeinabox.org/books)).
We do this by generating a static HTML page using pre-scraped data, without the use of any database or backend.

## Repository Structure

The structure of this repository adheres to Squarespace's template format, [which is specified here](https://developers.squarespace.com/template-overview).
The important files are:

- `pages/browse-books.page`: the HTML and CSS for the book list page.
- `scripts/booklist-data.js`: a pre-generated JSON file masquerading as a JS file that contains data for all books.
- `scripts/inflate-booklist.js`: a script that ingests data from `booklist.js` and inflates the page.

The book list page's search functionality uses [fuzzyset](https://github.com/Glench/fuzzyset.js) by Glen Chiacchieri.

## Instructions for Pushing to Squarespace

1. Clone this repository to a local machine.
2. Push this repository to the remote address as specfied by your own Squarespace site.

## Updating the Book List Data

There are two ways to update the book list data:

### Option 1: CSV Parser (Recommended)

1. Prepare your CSV file with book data (see `example.csv` for format reference)
2. Run `node scripts/parse-csv-to-booklist.mjs <your-csv-file.csv>` to generate `scripts/booklist-data.js`
3. Use `--validate-only` to validate without generating output: `node scripts/parse-csv-to-booklist.mjs <csv-file> --validate-only`
4. Use `--verbose` for detailed logging: `node scripts/parse-csv-to-booklist.mjs <csv-file> --verbose`
5. Use `--output` to specify custom output path: `node scripts/parse-csv-to-booklist.mjs <csv-file> --output scripts/booklist-data-new.js`
6. Use `--fetch-covers` to automatically download book cover images: `node scripts/parse-csv-to-booklist.mjs <csv-file> --fetch-covers`

The CSV parser handles:
- Multiple header/metadata rows
- Blank rows
- Missing optional fields
- Category field normalization
- Exact format matching with existing booklist-data.js
- Optional book cover image fetching from free APIs (Open Library, Google Books)

**Book Cover Fetching:**
- Uses free APIs (Open Library, Google Books) - no API keys required
- Automatically converts book titles to kebab-case filenames matching existing convention
- Saves images to both `assets/book-covers/` (compressed) and `assets/book-covers-uncompressed/`
- Skips books that already have cover images
- Includes rate limiting to avoid API throttling

### Option 2: Google Sheets API (Legacy)

1. Run `node scripts/fetch-booklist-data-secret.mjs` to scrape book data from a database or a spreadsheet into the format as specified in `scripts/booklist-data.js`. This script uses private keys that are not included in the repository. If you would like to use the fetching script with your own spreadsheet, you'll need to create a developer key for the Google Sheets API and [follow the endpoint here](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get). If you would like to use our data, please get in touch.

### After Updating Data

1. Ensure that `assets/book-covers/` contains the covers of every book, formatted in kebab case.
2. Test locally by loading `pages/browse-books.page` in a browser to verify books display correctly.
3. Push the repository to the Squarespace remote.
