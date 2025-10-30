import { PrismaClient } from '@prisma/client'
import { JWTPayload } from '../utils/jwt.utils'
import { wsService } from '../services/websocket.service'

const prisma = new PrismaClient()

export interface RsvpRequest {
  status: 'GOING' | 'MAYBE' | 'NOT_GOING'
}

/**
 * Create or update RSVP for an event
 */
export async function rsvpEvent(eventId: string, data: RsvpRequest, user: JWTPayload) {
  // Validate status
  const validStatuses = ['GOING', 'MAYBE', 'NOT_GOING']
  if (!validStatuses.includes(data.status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
  }

  // Check if event exists and is approved
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!event) {
    throw new Error('Event not found')
  }

  if (!event.approved) {
    throw new Error('Cannot RSVP to unapproved events')
  }

  // Create or update RSVP
  const rsvp = await prisma.rsvp.upsert({
    where: {
      userId_eventId: {
        userId: user.id,
        eventId: eventId
      }
    },
    create: {
      userId: user.id,
      eventId: eventId,
      status: data.status
    },
    update: {
      status: data.status
    },
    include: {
      user: {
        select: { id: true, email: true }
      },
      event: true
    }
  })

  // Determine if this is a new RSVP or update
  const isNew = rsvp.createdAt === rsvp.updatedAt

  // Broadcast via WebSocket
  if (isNew) {
    wsService.broadcastRsvpCreated(rsvp)
  } else {
    wsService.broadcastRsvpUpdated(rsvp)
  }

  return rsvp
}

/**
 * Get RSVPs for an event
 */
export async function getEventRsvps(eventId: string) {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!event) {
    throw new Error('Event not found')
  }

  const rsvps = await prisma.rsvp.findMany({
    where: { eventId },
    include: {
      user: {
        select: { id: true, email: true }
      }
    }
  })

  return rsvps
}

/**
 * Get user's RSVPs
 */
export async function getUserRsvps(user: JWTPayload) {
  const rsvps = await prisma.rsvp.findMany({
    where: { userId: user.id },
    include: {
      event: true
    }
  })

  return rsvps
}
