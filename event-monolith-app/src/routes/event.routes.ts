import { Elysia, t } from 'elysia'
import {
  getApprovedEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  CreateEventRequest,
  UpdateEventRequest
} from '../controllers/event.controller'
import { rsvpEvent, getEventRsvps, getUserRsvps, RsvpRequest } from '../controllers/rsvp.controller'
import {
  requireAuth,
  requireOrganizerOrAdmin,
  requireAdmin,
  requireRole
} from '../middleware/auth.middleware'
import { JWTPayload } from '../utils/jwt.utils'

export const eventRoutes = new Elysia()
    /**
     * GET /events
     * Get all approved events (public, but auth required per spec)
     */
    .get(
      '/events',
      async ({ set }) => {
        try {
          const events = await getApprovedEvents()
          set.status = 200
          return events
        } catch (error: any) {
          set.status = 500
          return { error: error.message }
        }
      },
      {
        beforeHandle: requireAuth,
        detail: {
          tags: ['Events'],
          summary: 'Get all approved events',
          description: 'Retrieve all approved events. Requires authentication.'
        }
      }
    )

    /**
     * POST /events
     * Create a new event (ORGANIZER only)
     */
    .post(
      '/events',
      async ({ body, set, request }) => {
        try {
          const authHeader = request.headers.get('authorization')
          const token = authHeader?.split(' ')[1]
          if (!token) {
            set.status = 401
            return { error: 'Missing token' }
          }

          // Verify token and extract user
          const { verifyToken } = await import('../utils/jwt.utils')
          const user = verifyToken(token) as JWTPayload
          if (!user) {
            set.status = 401
            return { error: 'Invalid token' }
          }

          if (user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
            set.status = 403
            return { error: 'Only ORGANIZER or ADMIN can create events' }
          }

          const result = await createEvent(body as CreateEventRequest, user)
          set.status = 201
          return result
        } catch (error: any) {
          set.status = 400
          return { error: error.message }
        }
      },
      {
        body: t.Object({
          title: t.String(),
          description: t.String(),
          date: t.String(),
          location: t.String()
        }),
        detail: {
          tags: ['Events'],
          summary: 'Create a new event',
          description: 'Create a new event. Only ORGANIZER and ADMIN roles can create events.'
        }
      }
    )

    /**
     * PUT /events/:id
     * Update an event (ORGANIZER of own event or ADMIN)
     */
    .put(
      '/events/:id',
      async ({ params, body, set, request }) => {
        try {
          const authHeader = request.headers.get('authorization')
          const token = authHeader?.split(' ')[1]
          if (!token) {
            set.status = 401
            return { error: 'Missing token' }
          }

          const { verifyToken } = await import('../utils/jwt.utils')
          const user = verifyToken(token) as JWTPayload
          if (!user) {
            set.status = 401
            return { error: 'Invalid token' }
          }

          const result = await updateEvent(params.id, body as UpdateEventRequest, user)
          set.status = 200
          return result
        } catch (error: any) {
          if (error.message.includes('Not authorized')) {
            set.status = 403
          } else if (error.message.includes('not found')) {
            set.status = 404
          } else {
            set.status = 400
          }
          return { error: error.message }
        }
      },
      {
        params: t.Object({ id: t.String() }),
        body: t.Object({
          title: t.Optional(t.String()),
          description: t.Optional(t.String()),
          date: t.Optional(t.String()),
          location: t.Optional(t.String())
        }),
        detail: {
          tags: ['Events'],
          summary: 'Update an event',
          description: 'Update event details. ORGANIZER can only update own events; ADMIN can update any.'
        }
      }
    )

    /**
     * DELETE /events/:id
     * Delete an event (ORGANIZER of own event or ADMIN)
     */
    .delete(
      '/events/:id',
      async ({ params, set, request }) => {
        try {
          const authHeader = request.headers.get('authorization')
          const token = authHeader?.split(' ')[1]
          if (!token) {
            set.status = 401
            return { error: 'Missing token' }
          }

          const { verifyToken } = await import('../utils/jwt.utils')
          const user = verifyToken(token) as JWTPayload
          if (!user) {
            set.status = 401
            return { error: 'Invalid token' }
          }

          const result = await deleteEvent(params.id, user)
          set.status = 200
          return result
        } catch (error: any) {
          if (error.message.includes('Not authorized')) {
            set.status = 403
          } else if (error.message.includes('not found')) {
            set.status = 404
          } else {
            set.status = 400
          }
          return { error: error.message }
        }
      },
      {
        params: t.Object({ id: t.String() }),
        detail: {
          tags: ['Events'],
          summary: 'Delete an event',
          description: 'Delete an event. ORGANIZER can only delete own events; ADMIN can delete any.'
        }
      }
    )

    /**
     * PUT /events/:id/approve
     * Approve an event (ADMIN only)
     */
    .put(
      '/events/:id/approve',
      async ({ params, set, request }) => {
        try {
          const authHeader = request.headers.get('authorization')
          const token = authHeader?.split(' ')[1]
          if (!token) {
            set.status = 401
            return { error: 'Missing token' }
          }

          const { verifyToken } = await import('../utils/jwt.utils')
          const user = verifyToken(token) as JWTPayload
          if (!user) {
            set.status = 401
            return { error: 'Invalid token' }
          }

          if (user.role !== 'ADMIN') {
            set.status = 403
            return { error: 'Only ADMIN can approve events' }
          }

          const result = await approveEvent(params.id)
          set.status = 200
          return result
        } catch (error: any) {
          if (error.message.includes('not found')) {
            set.status = 404
          } else {
            set.status = 400
          }
          return { error: error.message }
        }
      },
      {
        params: t.Object({ id: t.String() }),
        detail: {
          tags: ['Events'],
          summary: 'Approve an event',
          description: 'Approve an event (ADMIN only). Sends notification to organizer.'
        }
      }
    )

    /**
     * POST /events/:id/rsvp
     * RSVP to an event
     */
    .post(
      '/events/:id/rsvp',
      async ({ params, body, set, request }) => {
        try {
          const authHeader = request.headers.get('authorization')
          const token = authHeader?.split(' ')[1]
          if (!token) {
            set.status = 401
            return { error: 'Missing token' }
          }

          const { verifyToken } = await import('../utils/jwt.utils')
          const user = verifyToken(token) as JWTPayload
          if (!user) {
            set.status = 401
            return { error: 'Invalid token' }
          }

          const result = await rsvpEvent(params.id, body as RsvpRequest, user)
          set.status = 201
          return result
        } catch (error: any) {
          if (error.message.includes('not found')) {
            set.status = 404
          } else {
            set.status = 400
          }
          return { error: error.message }
        }
      },
      {
        params: t.Object({ id: t.String() }),
        body: t.Object({
          status: t.Enum({ GOING: 'GOING', MAYBE: 'MAYBE', NOT_GOING: 'NOT_GOING' })
        }),
        detail: {
          tags: ['RSVP'],
          summary: 'RSVP to an event',
          description: 'Create or update RSVP status for an event.'
        }
      }
    )

    /**
     * GET /events/:id/rsvps
     * Get RSVPs for an event
     */
    .get(
      '/events/:id/rsvps',
      async ({ params, set, request }) => {
        try {
          const authHeader = request.headers.get('authorization')
          const token = authHeader?.split(' ')[1]
          if (!token) {
            set.status = 401
            return { error: 'Missing token' }
          }

          const { verifyToken } = await import('../utils/jwt.utils')
          const user = verifyToken(token) as JWTPayload
          if (!user) {
            set.status = 401
            return { error: 'Invalid token' }
          }

          const result = await getEventRsvps(params.id)
          set.status = 200
          return result
        } catch (error: any) {
          if (error.message.includes('not found')) {
            set.status = 404
          } else {
            set.status = 400
          }
          return { error: error.message }
        }
      },
      {
        params: t.Object({ id: t.String() }),
        detail: {
          tags: ['RSVP'],
          summary: 'Get RSVPs for an event',
          description: 'Retrieve all RSVPs for a specific event.'
        }
      }
    )

    /**
     * GET /my-rsvps
     * Get user's RSVPs
     */
    .get(
      '/my-rsvps',
      async ({ set, request }) => {
        try {
          const authHeader = request.headers.get('authorization')
          const token = authHeader?.split(' ')[1]
          if (!token) {
            set.status = 401
            return { error: 'Missing token' }
          }

          const { verifyToken } = await import('../utils/jwt.utils')
          const user = verifyToken(token) as JWTPayload
          if (!user) {
            set.status = 401
            return { error: 'Invalid token' }
          }

          const result = await getUserRsvps(user)
          set.status = 200
          return result
        } catch (error: any) {
          set.status = 500
          return { error: error.message }
        }
      },
      {
        detail: {
          tags: ['RSVP'],
          summary: "Get user's RSVPs",
          description: "Retrieve all RSVPs for the authenticated user."
        }
      }
    )
