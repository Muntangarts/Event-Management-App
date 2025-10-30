import { PrismaClient } from '@prisma/client'
import { JWTPayload } from '../utils/jwt.utils'
import { wsService } from '../services/websocket.service'
import { sendEventApprovalEmail } from '../services/email.service'

const prisma = new PrismaClient()

export interface CreateEventRequest {
  title: string
  description: string
  date: string
  location: string
}

export interface UpdateEventRequest {
  title?: string
  description?: string
  date?: string
  location?: string
}

/**
 * Get all approved events
 */
export async function getApprovedEvents() {
  const events = await prisma.event.findMany({
    where: { approved: true },
    include: {
      organizer: {
        select: { id: true, email: true }
      },
      rsvps: true
    },
    orderBy: { date: 'asc' }
  })

  return events
}

/**
 * Get all events (ADMIN only - includes pending events)
 */
export async function getAllEvents() {
  const events = await prisma.event.findMany({
    include: {
      organizer: {
        select: { id: true, email: true }
      },
      rsvps: true
    },
    orderBy: { date: 'asc' }
  })

  return events
}

/**
 * Create a new event (ORGANIZER only)
 */
export async function createEvent(data: CreateEventRequest, user: JWTPayload) {
  // Validate input
  if (!data.title || !data.description || !data.date || !data.location) {
    throw new Error('All fields (title, description, date, location) are required')
  }

  // Parse and validate date
  const eventDate = new Date(data.date)
  if (isNaN(eventDate.getTime())) {
    throw new Error('Invalid date format')
  }

  if (eventDate < new Date()) {
    throw new Error('Event date must be in the future')
  }

  // Create event
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      date: eventDate,
      location: data.location,
      organizerId: user.id
    },
    include: {
      organizer: {
        select: { id: true, email: true }
      }
    }
  })

  // Broadcast via WebSocket
  wsService.broadcastEventCreated(event)

  return event
}

/**
 * Update an event (ORGANIZER of own event or ADMIN)
 */
export async function updateEvent(
  eventId: string,
  data: UpdateEventRequest,
  user: JWTPayload
) {
  // Find event
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!event) {
    throw new Error('Event not found')
  }

  // Check authorization
  if (user.role !== 'ADMIN' && event.organizerId !== user.id) {
    throw new Error('Not authorized to update this event')
  }

  // Validate date if provided
  if (data.date) {
    const eventDate = new Date(data.date)
    if (isNaN(eventDate.getTime())) {
      throw new Error('Invalid date format')
    }
    if (eventDate < new Date()) {
      throw new Error('Event date must be in the future')
    }
  }

  // Update event
  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      title: data.title ?? event.title,
      description: data.description ?? event.description,
      date: data.date ? new Date(data.date) : event.date,
      location: data.location ?? event.location
    },
    include: {
      organizer: {
        select: { id: true, email: true }
      }
    }
  })

  // Broadcast via WebSocket
  wsService.broadcastEventUpdated(updated)

  return updated
}

/**
 * Delete an event (ORGANIZER of own event or ADMIN)
 */
export async function deleteEvent(eventId: string, user: JWTPayload) {
  // Find event
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!event) {
    throw new Error('Event not found')
  }

  // Check authorization
  if (user.role !== 'ADMIN' && event.organizerId !== user.id) {
    throw new Error('Not authorized to delete this event')
  }

  // Delete RSVPs first (cascade)
  await prisma.rsvp.deleteMany({
    where: { eventId }
  })

  // Delete event
  await prisma.event.delete({
    where: { id: eventId }
  })

  // Broadcast via WebSocket
  wsService.broadcastEventDeleted(eventId)

  return { success: true, id: eventId }
}

/**
 * Approve an event (ADMIN only)
 */
export async function approveEvent(eventId: string) {
  // Find event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: {
        select: { id: true, email: true }
      }
    }
  })

  if (!event) {
    throw new Error('Event not found')
  }

  if (event.approved) {
    throw new Error('Event is already approved')
  }

  // Approve event
  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { approved: true },
    include: {
      organizer: {
        select: { id: true, email: true }
      }
    }
  })

  // Send email to organizer
  if (updated.organizer?.email) {
    await sendEventApprovalEmail(updated.organizer.email, updated.title)
  }

  // Broadcast via WebSocket
  wsService.broadcastEventApproved(updated)

  return updated
}
