import OpenAI from 'openai'
import { PrismaClient } from '@prisma/client'
import { JWTPayload } from '../utils/jwt.utils'

const prisma = new PrismaClient()

// Initialize OpenAI client (will use OPENAI_API_KEY env variable)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key'
})

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Get AI-powered event suggestions based on user's RSVP history
 */
export async function getEventSuggestions(user: JWTPayload) {
  try {
    // Get user's RSVP history
    const userRsvps = await prisma.rsvp.findMany({
      where: { userId: user.id },
      include: {
        event: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Get all approved upcoming events
    const upcomingEvents = await prisma.event.findMany({
      where: {
        approved: true,
        date: { gte: new Date() }
      },
      include: {
        organizer: {
          select: { email: true }
        }
      },
      take: 50
    })

    // Build context for AI
    const attendedEvents = userRsvps
      .filter(r => r.status === 'GOING')
      .map(r => `- ${r.event.title} (${r.event.location}) - ${r.event.description}`)
      .join('\n')

    const availableEvents = upcomingEvents
      .map(e => `- ${e.title} at ${e.location} on ${e.date.toLocaleDateString()} - ${e.description}`)
      .join('\n')

    const prompt = `You are an event recommendation assistant. Based on the user's past event attendance, suggest which upcoming events they might be interested in.

User's Past Events (Attended):
${attendedEvents || 'No past events'}

Available Upcoming Events:
${availableEvents || 'No upcoming events'}

Please analyze the user's preferences and suggest 3-5 events they would most likely enjoy. For each suggestion, explain why based on their history. Keep it concise and friendly.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful event recommendation assistant. Be friendly and concise.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return {
      suggestions: completion.choices[0]?.message?.content || 'No suggestions available at this time.',
      eventsAnalyzed: upcomingEvents.length,
      userHistory: userRsvps.length
    }
  } catch (error: any) {
    console.error('AI suggestion error:', error.message || error)
    console.error('Error details:', {
      name: error.name,
      status: error.status,
      type: error.type,
      apiKey: process.env.OPENAI_API_KEY ? 'Set (length: ' + process.env.OPENAI_API_KEY.length + ')' : 'Not set'
    })
    // Fallback to basic suggestions if API fails
    return getFallbackSuggestions(user)
  }
}

/**
 * Fallback suggestions when AI is unavailable
 */
async function getFallbackSuggestions(user: JWTPayload) {
  const upcomingEvents = await prisma.event.findMany({
    where: {
      approved: true,
      date: { gte: new Date() }
    },
    take: 5,
    orderBy: { date: 'asc' }
  })

  const suggestions = upcomingEvents.length > 0
    ? `Here are ${upcomingEvents.length} upcoming events you might enjoy:\n\n` +
      upcomingEvents.map((e, i) => `${i + 1}. ${e.title} - ${e.location} on ${e.date.toLocaleDateString()}`).join('\n')
    : 'No upcoming events available at the moment.'

  return {
    suggestions,
    eventsAnalyzed: upcomingEvents.length,
    userHistory: 0
  }
}

/**
 * AI chat assistant for user queries
 */
export async function chatWithAssistant(user: JWTPayload, message: string, chatHistory: ChatMessage[] = []) {
  try {
    // Get user context
    const userRsvps = await prisma.rsvp.findMany({
      where: { userId: user.id },
      include: { event: true },
      take: 10
    })

    const upcomingEvents = await prisma.event.findMany({
      where: {
        approved: true,
        date: { gte: new Date() }
      },
      take: 20
    })

    const systemContext = `You are an AI assistant for an event management platform. Help users with:
- Finding events they might like
- Answering questions about events
- Helping with RSVPs
- General event-related queries

User Context:
- Email: ${user.email}
- Role: ${user.role}
- Past RSVPs: ${userRsvps.length}
- Upcoming events available: ${upcomingEvents.length}

Recent Events:
${upcomingEvents.slice(0, 10).map(e => `- ${e.title} at ${e.location} on ${e.date.toLocaleDateString()}`).join('\n')}

Be helpful, concise, and friendly. If asked about specific events, reference the available events above.`

    const messages: any[] = [
      { role: 'system', content: systemContext },
      ...chatHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.8,
      max_tokens: 300
    })

    return {
      response: completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.",
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('AI chat error:', error.message || error)
    console.error('Error details:', {
      name: error.name,
      status: error.status,
      type: error.type
    })
    
    // Provide more helpful error messages
    let errorMessage = "I'm currently unavailable. "
    
    if (error.status === 401) {
      errorMessage += "API authentication failed. Please check the API key configuration."
    } else if (error.status === 429) {
      errorMessage += "Too many requests. Please try again in a moment."
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage += "Cannot connect to AI service. Please check your internet connection."
    } else {
      errorMessage += "Please try again later or contact support for assistance."
    }
    
    return {
      response: errorMessage,
      timestamp: new Date().toISOString()
    }
  }
}
