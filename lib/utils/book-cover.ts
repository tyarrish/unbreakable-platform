/**
 * Book cover fetching utilities using Google Books API
 */

interface GoogleBookItem {
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
      small?: string
      medium?: string
      large?: string
    }
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
  }
}

interface GoogleBooksResponse {
  items?: GoogleBookItem[]
  totalItems: number
}

interface BookMetadata {
  coverUrl?: string
  description?: string
  isbn?: string
}

/**
 * Fetch book metadata from Google Books API by ISBN
 */
export async function fetchBookByISBN(isbn: string): Promise<BookMetadata | null> {
  try {
    // Clean ISBN (remove hyphens and spaces)
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`
    )
    
    if (!response.ok) {
      console.error('Google Books API error:', response.statusText)
      return null
    }
    
    const data: GoogleBooksResponse = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return null
    }
    
    const book = data.items[0]
    const imageLinks = book.volumeInfo.imageLinks
    
    // Prefer larger images, fall back to smaller ones
    const coverUrl = 
      imageLinks?.large ||
      imageLinks?.medium ||
      imageLinks?.small ||
      imageLinks?.thumbnail?.replace('zoom=1', 'zoom=2') || // Increase thumbnail quality
      imageLinks?.thumbnail ||
      imageLinks?.smallThumbnail
    
    return {
      coverUrl,
      description: book.volumeInfo.description,
      isbn: cleanIsbn,
    }
  } catch (error) {
    console.error('Error fetching book by ISBN:', error)
    return null
  }
}

/**
 * Fetch book metadata from Google Books API by title and author
 */
export async function fetchBookByTitleAuthor(
  title: string,
  author: string
): Promise<BookMetadata | null> {
  try {
    if (!title || !author) return null
    
    // Build search query
    const query = `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`
    
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`
    )
    
    if (!response.ok) {
      console.error('Google Books API error:', response.statusText)
      return null
    }
    
    const data: GoogleBooksResponse = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return null
    }
    
    const book = data.items[0]
    const imageLinks = book.volumeInfo.imageLinks
    
    // Prefer larger images, fall back to smaller ones
    const coverUrl = 
      imageLinks?.large ||
      imageLinks?.medium ||
      imageLinks?.small ||
      imageLinks?.thumbnail?.replace('zoom=1', 'zoom=2') || // Increase thumbnail quality
      imageLinks?.thumbnail ||
      imageLinks?.smallThumbnail
    
    // Extract ISBN if available
    const isbn = book.volumeInfo.industryIdentifiers?.find(
      (id) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
    )?.identifier
    
    return {
      coverUrl,
      description: book.volumeInfo.description,
      isbn,
    }
  } catch (error) {
    console.error('Error fetching book by title/author:', error)
    return null
  }
}

/**
 * Fetch book cover - tries ISBN first, then falls back to title/author
 */
export async function fetchBookCover(
  title: string,
  author: string,
  isbn?: string
): Promise<BookMetadata | null> {
  // Try ISBN first if available (more accurate)
  if (isbn) {
    const result = await fetchBookByISBN(isbn)
    if (result && result.coverUrl) {
      return result
    }
  }
  
  // Fall back to title/author search
  return await fetchBookByTitleAuthor(title, author)
}






