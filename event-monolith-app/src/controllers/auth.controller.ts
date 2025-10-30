import { PrismaClient, Role } from '@prisma/client'
import { hash, compare } from 'bcrypt'
import { signToken, JWTPayload } from '../utils/jwt.utils'
import { sendWelcomeEmail } from '../services/email.service'

const prisma = new PrismaClient()

export interface SignupRequest {
  email: string
  password: string
  role?: Role
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  id: string
  email: string
  role: Role
  token: string
}

/**
 * Sign up a new user
 */
export async function signup(data: SignupRequest): Promise<AuthResponse> {
  // Validate input
  if (!data.email || !data.password) {
    throw new Error('Email and password are required')
  }

  if (data.password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  // Hash password
  const hashedPassword = await hash(data.password, 10)

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: data.role || Role.ATTENDEE
    }
  })

  // Send welcome email
  await sendWelcomeEmail(user.email, user.id)

  // Generate token
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  }
  const token = signToken(payload)

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    token
  }
}

/**
 * Log in a user
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  // Validate input
  if (!data.email || !data.password) {
    throw new Error('Email and password are required')
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (!user) {
    throw new Error('Invalid email or password')
  }

  // Verify password
  const passwordMatch = await compare(data.password, user.password)
  if (!passwordMatch) {
    throw new Error('Invalid email or password')
  }

  // Generate token
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  }
  const token = signToken(payload)

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    token
  }
}
