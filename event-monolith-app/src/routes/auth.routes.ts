import { Elysia, t } from 'elysia'
import { signup, login, SignupRequest, LoginRequest } from '../controllers/auth.controller.js'

export const authRoutes = new Elysia({ prefix: '/api' })
   
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
          email: t.String(),
          password: t.String({ minLength: 6 }),
          role: t.Optional(t.Union([
            t.Literal('ADMIN'),
            t.Literal('ORGANIZER'),
            t.Literal('ATTENDEE')
          ]))
        }),
        detail: {
          tags: ['Auth'],
          summary: 'Sign up a new user',
          description: 'Create a new user account with email and password. Default role is ATTENDEE.'
        }
      }
    )

   
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
          email: t.String(),
          password: t.String({ minLength: 6 })
        }),
        detail: {
          tags: ['Auth'],
          summary: 'Log in a user',
          description: 'Authenticate with email and password. Returns JWT token.'
        }
      }
    )
