import { Context } from 'elysia'
import { extractTokenFromHeader, verifyToken, JWTPayload } from '../utils/jwt.utils.js'

/**
 * Attach user to context if valid JWT is provided
 */
export async function authMiddleware(ctx: Context) {
  const authHeader = ctx.request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    ;(ctx as any).set = (ctx as any).set || {}
    ;(ctx as any).set.status = 401
    return { message: 'Missing authorization token' }
  }

  const payload = verifyToken(token)
  if (!payload) {
    ;(ctx as any).set = (ctx as any).set || {}
    ;(ctx as any).set.status = 401
    return { message: 'Invalid or expired token' }
  }

  // Attach user to context
  ;(ctx as any).user = payload
}

/**
 * Guard: Require authentication
 */
export function requireAuth(ctx: Context) {
  const authHeader = ctx.request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    ;(ctx as any).set = (ctx as any).set || {}
    ;(ctx as any).set.status = 401
    return { message: 'Missing authorization token' }
  }

  const payload = verifyToken(token)
  if (!payload) {
    ;(ctx as any).set = (ctx as any).set || {}
    ;(ctx as any).set.status = 401
    return { message: 'Invalid or expired token' }
  }

  ;(ctx as any).user = payload
}

/**
 * Guard: Require specific role(s)
 */
export function requireRole(...roles: string[]) {
  return (ctx: Context) => {
    const user = (ctx as any).user as JWTPayload | undefined

    if (!user) {
      ;(ctx as any).set = (ctx as any).set || {}
      ;(ctx as any).set.status = 401
      return { message: 'Unauthorized' }
    }

    if (!roles.includes(user.role)) {
      ;(ctx as any).set = (ctx as any).set || {}
      ;(ctx as any).set.status = 403
      return { message: `Forbidden. Required roles: ${roles.join(', ')}` }
    }
  }
}

/**
 * Guard: Require ADMIN role
 */
export function requireAdmin(ctx: Context) {
  const user = (ctx as any).user as JWTPayload | undefined

  if (!user) {
    ;(ctx as any).set = (ctx as any).set || {}
    ;(ctx as any).set.status = 401
    return { message: 'Unauthorized' }
  }

  if (user.role !== 'ADMIN') {
    ;(ctx as any).set = (ctx as any).set || {}
    ;(ctx as any).set.status = 403
    return { message: 'Forbidden. Admin role required.' }
  }
}

/**
 * Guard: Require ORGANIZER role
 */
export function requireOrganizer(ctx: Context) {
  const user = (ctx as any).user as JWTPayload | undefined

  if (!user) {
    ;(ctx as any).set = (ctx as any).set || {}
    ;(ctx as any).set.status = 401
    return { message: 'Unauthorized' }
  }

  if (user.role !== 'ORGANIZER') {
    ;(ctx as any).set = (ctx as any).set || {}
    ;(ctx as any).set.status = 403
    return { message: 'Forbidden. Organizer role required.' }
  }
}

/**
 * Guard: Require ATTENDEE role
 */
export function requireAttendee(ctx: Context) {
  const user = (ctx as any).user as JWTPayload | undefined

  if (!user) {
    ;(ctx as any).set = (ctx as any).set || {}
    ;(ctx as any).set.status = 401
    return { message: 'Unauthorized' }
  }

  if (user.role !== 'ATTENDEE') {
    ;(ctx as any).set = (ctx as any).set || {}
    ;(ctx as any).set.status = 403
    return { message: 'Forbidden. Attendee role required.' }
  }
}

/**
 * Guard: Require ORGANIZER or ADMIN role
 */
export function requireOrganizerOrAdmin(ctx: Context) {
  const user = (ctx as any).user as JWTPayload | undefined

  if (!user) {
    ;(ctx as any).set = (ctx as any).set || {}
    ;(ctx as any).set.status = 401
    return { message: 'Unauthorized' }
  }

  if (user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
    ;(ctx as any).set = (ctx as any).set || {}
    ;(ctx as any).set.status = 403
    return { message: 'Forbidden. Organizer or Admin role required.' }
  }
}
