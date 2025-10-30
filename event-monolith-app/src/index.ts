import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import { authRoutes } from './routes/auth.routes.js'
import { eventRoutes } from './routes/event.routes.js'
import { aiRoutes } from './routes/ai.routes.js'
import { wsService } from './services/websocket.service.js'

dotenv.config()
const PORT = parseInt(process.env.PORT || '3000', 10)

const app = new Elysia()
  .use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'Event Management API',
        version: '1.0.0',
        description: 'Event management system with authentication, RSVP, and real-time updates'
      },
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Events', description: 'Event management endpoints' },
        { name: 'RSVP', description: 'RSVP management endpoints' }
      ]
    }
  }))
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))

// WebSocket support
app.ws('/ws', {
  open(ws) {
    wsService.addClient(ws)
    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to WebSocket' }))
  },
  close(ws) {
    wsService.removeClient(ws)
  },
  message(ws, message) {
    console.log('WebSocket message received:', message)
  }
})

// Register routes
app.use(authRoutes)
app.use(eventRoutes)
app.use(aiRoutes)

// Export for serverless environments
export default app.fetch

// Start server if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const handler = async (req: any, res: any) => {
    try {
      // Construct proper Request object from Node.js IncomingMessage
      const url = `http://${req.headers.host}${req.url}`
      
      // Read request body
      const chunks: Buffer[] = []
      for await (const chunk of req) {
        chunks.push(chunk)
      }
      const body = chunks.length > 0 ? Buffer.concat(chunks) : null
      
      // Create Request object
      const request = new Request(url, {
        method: req.method,
        headers: req.headers,
        body: body && req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined
      })
      
      const response = await app.fetch(request)
      
      // Set headers
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()))
      
      // Handle response body
      if (response.body) {
        const reader = response.body.getReader()
        const responseChunks: Uint8Array[] = []
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          responseChunks.push(value)
        }
        
        const responseBody = Buffer.concat(responseChunks)
        res.end(responseBody)
      } else {
        res.end()
      }
    } catch (error) {
      console.error('Request error:', error)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Internal server error' }))
    }
  }
  
  const server = createServer(handler)

  // Handle WebSocket upgrades
  server.on('upgrade', (req: any, socket: any, head: any) => {
    if (req.url === '/ws') {
      // @ts-ignore - Elysia internal WebSocket handling
      app._ws?.upgrade(req, socket, head, (ws: any) => {
        // WebSocket upgrade handled by Elysia
      })
    } else {
      socket.destroy()
    }
  })

  server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`)
    console.log(`📡 WebSocket available at ws://localhost:${PORT}/ws`)
    console.log(`📚 API Documentation: http://localhost:${PORT}/swagger\n`)
  })
}