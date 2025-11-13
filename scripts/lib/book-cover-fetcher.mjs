import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetches book cover images from free APIs and saves them to assets directories
 */

/**
 * Converts book title to kebab-case filename (matching inflate-booklist.js logic)
 * @param {string} title - Book title
 * @returns {string} - Kebab-case filename without extension
 */
export function titleToKebab(title) {
    let noAmpersand = title.replace('&', 'and');
    let noDiacritic = noAmpersand.normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, "");
    let noPunct = noDiacritic.replace(/[^\w\s]|_/g, "")
                             .replace(/\s+/g, " ");
    return noPunct.toLowerCase().replaceAll(' ', '-');
}

/**
 * Fetches book cover from Open Library API using title and author
 * @param {string} title - Book title
 * @param {string} author - Book author
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<string|null>} - URL to cover image or null if not found
 */
async function fetchFromOpenLibrary(title, author, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Clean author name (remove "by" prefix, illustrator info, etc.)
            let cleanAuthor = author;
            if (cleanAuthor.toLowerCase().startsWith('by ')) {
                cleanAuthor = cleanAuthor.substring(3);
            }
            // Remove illustrator info (everything after comma if it contains "illustrated")
            const commaIndex = cleanAuthor.indexOf(',');
            if (commaIndex > 0 && cleanAuthor.toLowerCase().includes('illustrated')) {
                cleanAuthor = cleanAuthor.substring(0, commaIndex);
            }
            
            // Open Library search API
            const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(cleanAuthor)}&limit=1`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            const response = await fetch(searchUrl, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                if (attempt < retries) continue;
                return null;
            }
            
            const data = await response.json();
            
            if (data.docs && data.docs.length > 0) {
                const book = data.docs[0];
                // Try ISBN first, then OCLC, then Cover ID
                if (book.isbn && book.isbn.length > 0) {
                    const isbn = book.isbn[0].replace(/[-\s]/g, ''); // Remove dashes/spaces
                    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`; // Large size
                } else if (book.oclc && book.oclc.length > 0) {
                    const oclc = book.oclc[0];
                    return `https://covers.openlibrary.org/b/oclc/${oclc}-L.jpg`;
                } else if (book.cover_i) {
                    return `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
                }
            }
            
            return null;
        } catch (error) {
            if (attempt < retries) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            if (retries === 0) { // Only log if no retries attempted
                console.error(`Error fetching from Open Library: ${error.message}`);
            }
            return null;
        }
    }
    return null;
}

/**
 * Fetches book cover from Google Books API
 * @param {string} title - Book title
 * @param {string} author - Book author
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<string|null>} - URL to cover image or null if not found
 */
async function fetchFromGoogleBooks(title, author, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Clean author name
            let cleanAuthor = author;
            if (cleanAuthor.toLowerCase().startsWith('by ')) {
                cleanAuthor = cleanAuthor.substring(3);
            }
            const commaIndex = cleanAuthor.indexOf(',');
            if (commaIndex > 0 && cleanAuthor.toLowerCase().includes('illustrated')) {
                cleanAuthor = cleanAuthor.substring(0, commaIndex);
            }
            
            const query = `${title} ${cleanAuthor}`;
            const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            const response = await fetch(searchUrl, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                if (attempt < retries) continue;
                return null;
            }
            
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const book = data.items[0];
                if (book.volumeInfo && book.volumeInfo.imageLinks) {
                    // Try to get larger image by replacing zoom parameter
                    let imageUrl = book.volumeInfo.imageLinks.thumbnail || 
                                  book.volumeInfo.imageLinks.smallThumbnail;
                    
                    if (imageUrl) {
                        // Try to get larger version by modifying zoom parameter
                        imageUrl = imageUrl.replace(/zoom=\d+/, 'zoom=0'); // zoom=0 gives larger image
                        return imageUrl;
                    }
                }
            }
            
            return null;
        } catch (error) {
            if (attempt < retries) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            if (retries === 0) { // Only log if no retries attempted
                console.error(`Error fetching from Google Books: ${error.message}`);
            }
            return null;
        }
    }
    return null;
}

/**
 * Downloads an image from URL and saves it to file
 * @param {string} imageUrl - URL to image
 * @param {string} filePath - Path where to save the image
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function downloadImage(imageUrl, filePath, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            const response = await fetch(imageUrl, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                    continue;
                }
                return false;
            }
            
            // Check if response is actually an image
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.startsWith('image/')) {
                if (attempt < retries) continue;
                return false;
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Validate it's actually an image file (check magic bytes)
            if (buffer.length < 4) {
                if (attempt < retries) continue;
                return false;
            }
            
            // Ensure directory exists
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(filePath, buffer);
            return true;
        } catch (error) {
            if (attempt < retries) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            console.error(`Error downloading image: ${error.message}`);
            return false;
        }
    }
    return false;
}

/**
 * Compresses an image using sharp
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save compressed image
 * @param {number} quality - JPEG quality (1-100, default: 85)
 * @param {number} maxWidth - Maximum width in pixels (default: 300)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function compressImage(inputPath, outputPath, quality = 85, maxWidth = 300) {
    try {
        // Ensure output directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        await sharp(inputPath)
            .resize(maxWidth, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .jpeg({ quality, mozjpeg: true })
            .toFile(outputPath);
        
        return true;
    } catch (error) {
        console.error(`Error compressing image: ${error.message}`);
        return false;
    }
}

/**
 * Fetches and saves book cover image
 * @param {Object} book - Book object with Title and Author
 * @param {string} repoRoot - Repository root directory
 * @param {boolean} verbose - Enable verbose logging
 * @returns {Promise<Object>} - { success: boolean, filename: string, source: string }
 */
export async function fetchBookCover(book, repoRoot, verbose = false) {
    const title = book.Title || '';
    const author = book.Author || '';
    
    if (!title || !author) {
        if (verbose) {
            console.log(`Skipping cover fetch for book without title or author`);
        }
        return { success: false, filename: null, source: null };
    }
    
    const filename = `${titleToKebab(title)}.jpg`;
    const compressedPath = path.join(repoRoot, 'assets', 'book-covers', filename);
    const uncompressedPath = path.join(repoRoot, 'assets', 'book-covers-uncompressed', filename);
    
    // Check if file already exists
    if (fs.existsSync(compressedPath) && fs.existsSync(uncompressedPath)) {
        if (verbose) {
            console.log(`Cover already exists: ${filename}`);
        }
        return { success: true, filename, source: 'existing' };
    }
    
    // Try Open Library first (free, no API key)
    let imageUrl = await fetchFromOpenLibrary(title, author);
    let source = 'Open Library';
    
    // Fallback to Google Books if Open Library fails
    if (!imageUrl) {
        imageUrl = await fetchFromGoogleBooks(title, author);
        source = 'Google Books';
    }
    
    if (!imageUrl) {
        if (verbose) {
            console.log(`No cover found for: ${title} by ${author}`);
        }
        return { success: false, filename, source: null };
    }
    
    // Download image
    if (verbose) {
        console.log(`Fetching cover from ${source} for: ${title}`);
    }
    
    // Save uncompressed version
    const uncompressedSuccess = await downloadImage(imageUrl, uncompressedPath);
    
    if (!uncompressedSuccess) {
        return { success: false, filename, source: null };
    }
    
    // Compress image for book-covers directory
    const compressSuccess = await compressImage(uncompressedPath, compressedPath, 85, 300);
    
    if (!compressSuccess) {
        // Fallback: copy uncompressed if compression fails
        if (verbose) {
            console.log(`  Compression failed, copying uncompressed version`);
        }
        fs.copyFileSync(uncompressedPath, compressedPath);
    } else if (verbose) {
        const originalSize = fs.statSync(uncompressedPath).size;
        const compressedSize = fs.statSync(compressedPath).size;
        const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
        console.log(`  Compressed: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${savings}% reduction)`);
    }
    
    return { success: true, filename, source };
}

/**
 * Fetches covers for all books in a books array
 * @param {Array<Object>} books - Array of book objects
 * @param {string} repoRoot - Repository root directory
 * @param {boolean} verbose - Enable verbose logging
 * @param {number} delayMs - Delay between requests to avoid rate limiting (default: 500ms)
 * @returns {Promise<Object>} - { total: number, successful: number, failed: number, skipped: number, stats: Object }
 */
export async function fetchAllBookCovers(books, repoRoot, verbose = false, delayMs = 500) {
    const results = {
        total: books.length,
        successful: 0,
        failed: 0,
        skipped: 0,
        stats: {
            openLibrary: 0,
            googleBooks: 0,
            existing: 0,
            totalSizeUncompressed: 0,
            totalSizeCompressed: 0
        }
    };
    
    const startTime = Date.now();
    
    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        const result = await fetchBookCover(book, repoRoot, verbose);
        
        if (result.success) {
            if (result.source === 'existing') {
                results.skipped++;
                results.stats.existing++;
            } else {
                results.successful++;
                if (result.source === 'Open Library') {
                    results.stats.openLibrary++;
                } else if (result.source === 'Google Books') {
                    results.stats.googleBooks++;
                }
                
                // Calculate file sizes
                const filename = result.filename;
                const uncompressedPath = path.join(repoRoot, 'assets', 'book-covers-uncompressed', filename);
                const compressedPath = path.join(repoRoot, 'assets', 'book-covers', filename);
                
                if (fs.existsSync(uncompressedPath)) {
                    results.stats.totalSizeUncompressed += fs.statSync(uncompressedPath).size;
                }
                if (fs.existsSync(compressedPath)) {
                    results.stats.totalSizeCompressed += fs.statSync(compressedPath).size;
                }
            }
        } else {
            results.failed++;
        }
        
        // Rate limiting delay (except for last item)
        if (i < books.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        // Progress update every 10 books
        if (verbose && (i + 1) % 10 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const rate = ((i + 1) / elapsed).toFixed(1);
            console.log(`Progress: ${i + 1}/${books.length} books processed (${rate} books/sec)`);
        }
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    results.stats.totalTimeSeconds = parseFloat(totalTime);
    
    return results;
}

