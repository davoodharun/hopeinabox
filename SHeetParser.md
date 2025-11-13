- Script should parse csv file and create a data.js file in the same format as booklist-data.js
- `scripts/booklist-data.js`: a JSON file masquerading as a JS file that contains data for all books.
- `pages/browse-books.page`: the HTML template and CSS for the book list page that ingests booklist-data.js. 
- `scripts/inflate-booklist.js` is the script that inflates the data
- example csv can be found at example.csv; THere may be title rows or blank rows/missing data. Essentially, each row should be a book with the following properties:

Title (text)
Author (text)

---- 0 or 1 values with Categories----
Reading level
    Early elementary
    Late elementary
    Middle school
    Early high school
    Late high school	
Curriculum?
    Yes	
    No
Included in...?
    Early elementary
    Late elementary
    Middle school
    Early high school	
    Late high school
Format
    Picture book	
    Chapter book
    Graphic novel	
    Non-fiction
    Anthology
    Poetry
    Scripts & plays	
Representation
    Lesbian
    Gay
    Bisexual & Pansexual
    Trans & Nonbinary
    Queer+	
    Small Town
    Rural & Heartland
    Black, Caribbean, & African Diaspora
    Asian & Asian Diaspora	
    Latino & Hispanic	
    Native American & Indigenous
    Diverse ensemble	
    Ability
    Coming out
    Religion & Spirituality
    Diverse family structure
    Relationships: Family	
    Relationships: Love	
    Relationships: Friends	
    Relationships: Community	
    Politics, Society, & Activism
    Classics
------    

Synopsis(long text)
Synopsis Link
Awards	(text)
Notes	(text)
Year Published (int / year)



