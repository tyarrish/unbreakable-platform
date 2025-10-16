import { NextRequest, NextResponse } from 'next/server'
import { getAnthropicClient, DEFAULT_MODEL } from '@/lib/ai/client'

/**
 * AI endpoint: Enrich book details for the leadership cohort
 * Generates description focused on leadership relevance and finds metadata
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, author } = body

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      )
    }

    const anthropic = getAnthropicClient()

    // Generate cohort-relevant description with AI
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1000,
      system: `You are helping curate books for Building the Unbreakable, a Stoic-influenced leadership development program.

Your job:
- Generate a 2-3 paragraph description of the book
- Focus on WHY this book matters for leadership development
- Explain how it connects to Stoic principles and practical leadership
- Make it compelling but grounded (not marketing fluff)
- Use direct, accessible language

Do NOT:
- Just summarize the plot
- Use corporate jargon
- Be overly academic
- Include purchase links or availability info`,
      messages: [
        {
          role: 'user',
          content: `Generate a leadership-focused description for this book:

Title: ${title}
Author: ${author}

Focus on why this book is valuable for leaders in a Stoic-influenced development program. 2-3 paragraphs.`,
        },
      ],
    })

    const description = message.content[0].type === 'text' ? message.content[0].text : ''

    // Generate potential links (basic format)
    const amazonSearchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(
      `${title} ${author}`
    )}`
    const goodreadsSearchUrl = `https://www.goodreads.com/search?q=${encodeURIComponent(
      `${title} ${author}`
    )}`

    // Try to extract ISBN from Google Books API
    let isbn = ''
    let amazonLink = amazonSearchUrl
    let goodreadsLink = goodreadsSearchUrl

    try {
      const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        `intitle:${title}+inauthor:${author}`
      )}&maxResults=1`

      const googleResponse = await fetch(googleBooksUrl)
      const googleData = await googleResponse.json()

      if (googleData.items && googleData.items.length > 0) {
        const book = googleData.items[0].volumeInfo
        
        // Get ISBN
        if (book.industryIdentifiers) {
          const isbn13 = book.industryIdentifiers.find(
            (id: any) => id.type === 'ISBN_13'
          )
          const isbn10 = book.industryIdentifiers.find(
            (id: any) => id.type === 'ISBN_10'
          )
          isbn = isbn13?.identifier || isbn10?.identifier || ''
        }

        // Try to construct better Amazon link with ISBN
        if (isbn) {
          amazonLink = `https://www.amazon.com/dp/${isbn}`
        }
      }
    } catch (error) {
      console.error('Error fetching book metadata:', error)
      // Fall back to search URLs
    }

    return NextResponse.json({
      success: true,
      data: {
        description,
        isbn,
        amazon_link: amazonLink,
        goodreads_link: goodreadsLink,
      },
    })
  } catch (error: any) {
    console.error('Error enriching book:', error)
    return NextResponse.json(
      {
        error: 'Failed to enrich book details',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

