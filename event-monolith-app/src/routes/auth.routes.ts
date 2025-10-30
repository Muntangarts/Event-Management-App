import { Elysia, t } from 'elysia'
import { signup, login, SignupRequest, LoginRequest } from '../controllers/auth.controller'

export function authRoutes(app: Elysia) {
  return app
    /**
     * POST /signup
     * Register a new user
     */
    .post(
      '/signup',
      async ({ body, set }) => {
        try {
          const result = await signup(body as SignupRequest)
          set.status = 201
          return result
        } catch (error: any) {
          set.status = 400
          return { error: error.message }
        }
      },
      {
        body: t.Object({
          email: t.String({ format: 'email' }),
          password: t.String({ minLength: 6 }),
          role: t.Optional(t.Enum({ ADMIN: 'ADMIN', ORGANIZER: 'ORGANIZER', ATTENDEE: 'ATTENDEE' }))
        }),
        detail: {
          tags: ['Auth'],
          summary: 'Sign up a new user',
          description: 'Create a new user account with email and password. Default role is ATTENDEE.'
        }
      }
    )

    /**
     * POST /login
     * Authenticate user and return JWT token
     */
    .post(
      '/login',
      async ({ body, set }) => {
        try {
          const result = await login(body as LoginRequest)
          set.status = 200
          return result
        } catch (error: any) {
          set.status = 401
          return { error: error.message }
        }
      },
      {
        body: t.Object({
          email: t.String({ format: 'email' }),
          password: t.String({ minLength: 6 })
        }),
        detail: {
          tags: ['Auth'],
          summary: 'Log in a user',
          description: 'Authenticate with email and password. Returns JWT token.'
        }
      }
    )
}
