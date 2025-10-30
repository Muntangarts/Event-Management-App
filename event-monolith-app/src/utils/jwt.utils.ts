import jwt from 'jsonwebtoken'

export interface JWTPayload {
  id: string
  email: string
  role: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_me'

/**
 * Sign a JWT token with user payload
 */
export function signToken(payload: JWTPayload, expiresIn: string = '24h'): string {
  // jsonwebtoken typings are strict about overloads; cast to `any` to satisfy
  // the compiler while preserving runtime behavior.
  return jwt.sign(payload as any, JWT_SECRET as any, { expiresIn } as any)
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1]
}
