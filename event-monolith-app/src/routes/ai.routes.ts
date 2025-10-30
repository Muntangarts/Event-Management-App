import { Elysia, t } from 'elysia'
import { getEventSuggestions, chatWithAssistant } from '../services/ai.service.js'
import { JWTPayload } from '../utils/jwt.utils.js'

export const aiRoutes = new Elysia({ prefix: '/api/ai' })

  .get(
    '/suggestions',
    async ({ set, request }) => {
      try {
        const authHeader = request.headers.get('authorization')
        const token = authHeader?.split(' ')[1]
        if (!token) {
          set.status = 401
          return { error: 'Missing token' }
        }

        const { verifyToken } = await import('../utils/jwt.utils.js')
        const user = verifyToken(token) as JWTPayload
        if (!user) {
          set.status = 401
          return { error: 'Invalid token' }
        }

        const suggestions = await getEventSuggestions(user)
        set.status = 200
        return suggestions
      } catch (error: any) {
        set.status = 500
        return { error: error.message }
      }
    },
    {
      detail: {
        tags: ['AI'],
        summary: 'Get AI event suggestions',
        description: 'Get personalized event recommendations based on user RSVP history'
      }
    }
  )

  /**
   * POST /ai/chat
   * Chat with AI assistant
   */
  .post(
    '/chat',
    async ({ body, set, request }) => {
      try {
        const authHeader = request.headers.get('authorization')
        const token = authHeader?.split(' ')[1]
        if (!token) {
          set.status = 401
          return { error: 'Missing token' }
        }

        const { verifyToken } = await import('../utils/jwt.utils.js')
        const user = verifyToken(token) as JWTPayload
        if (!user) {
          set.status = 401
          return { error: 'Invalid token' }
        }

        const { message, chatHistory } = body as any
        if (!message) {
          set.status = 400
          return { error: 'Message is required' }
        }

        const response = await chatWithAssistant(user, message, chatHistory)
        set.status = 200
        return response
      } catch (error: any) {
        set.status = 500
        return { error: error.message }
      }
    },
    {
      body: t.Object({
        message: t.String(),
        chatHistory: t.Optional(t.Array(t.Object({
          role: t.String(),
          content: t.String()
        })))
      }),
      detail: {
        tags: ['AI'],
        summary: 'Chat with AI assistant',
        description: 'Get help and answers from the AI assistant about events and platform features'
      }
    }
  )
