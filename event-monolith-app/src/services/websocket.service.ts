export interface WSMessage {
  type: 'EVENT_CREATED' | 'EVENT_UPDATED' | 'EVENT_DELETED' | 'EVENT_APPROVED' | 'RSVP_CREATED' | 'RSVP_UPDATED'
  payload: Record<string, any>
  timestamp: string
}

class WebSocketService {
  private clients: Set<any> = new Set()


  addClient(ws: any): void {
    this.clients.add(ws)
    console.log(`📡 WebSocket client connected. Total clients: ${this.clients.size}`)
  }

  
  removeClient(ws: any): void {
    this.clients.delete(ws)
    console.log(`📡 WebSocket client disconnected. Total clients: ${this.clients.size}`)
  }

  
  broadcast(message: WSMessage): void {
    const payload = JSON.stringify(message)
    this.clients.forEach((client) => {
      try {
        client.send(payload)
      } catch (error) {
        console.error('Failed to send WebSocket message:', error)
        this.removeClient(client)
      }
    })
  }

  /**
   * Broadcast event creation
   */
  broadcastEventCreated(event: any): void {
    this.broadcast({
      type: 'EVENT_CREATED',
      payload: event,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Broadcast event update
   */
  broadcastEventUpdated(event: any): void {
    this.broadcast({
      type: 'EVENT_UPDATED',
      payload: event,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Broadcast event deletion
   */
  broadcastEventDeleted(eventId: string): void {
    this.broadcast({
      type: 'EVENT_DELETED',
      payload: { id: eventId },
      timestamp: new Date().toISOString()
    })
  }

  
  broadcastEventApproved(event: any): void {
    this.broadcast({
      type: 'EVENT_APPROVED',
      payload: event,
      timestamp: new Date().toISOString()
    })
  }

  
  broadcastRsvpCreated(rsvp: any): void {
    this.broadcast({
      type: 'RSVP_CREATED',
      payload: rsvp,
      timestamp: new Date().toISOString()
    })
  }

  
  broadcastRsvpUpdated(rsvp: any): void {
    this.broadcast({
      type: 'RSVP_UPDATED',
      payload: rsvp,
      timestamp: new Date().toISOString()
    })
  }

 
  getClientCount(): number {
    return this.clients.size
  }
}

export const wsService = new WebSocketService()
