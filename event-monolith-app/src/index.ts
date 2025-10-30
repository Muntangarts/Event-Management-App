import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import NodeHandler from '@elysiajs/node'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { authRoutes } from './routes/auth.routes'
import { eventRoutes } from './routes/event.routes'
import { wsService } from './services/websocket.service'

dotenv.config()
const PORT = parseInt(process.env.PORT || '3000', 10)

// Force Node adapter
process.env.ELYSIA_ADAPTER = 'node'

const app = new Elysia()
  .use(swagger({ /* ... */ }))
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))

// WebSocket (will work with Node adapter)
app.ws('/ws', {
  open(ws) {
    wsService.addClient(ws)
    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected' }))
  },
  close(ws) {
    wsService.removeClient(ws)
  },
  message(ws, message) {
    console.log('WebSocket message:', message)
  }
})

app.use(authRoutes)
app.use(eventRoutes)

// Export for serverless
export default app.fetch

// Local Node server with WebSocket upgrade
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const handler = (req: any, res: any) => {
    app.fetch(req).then((response: any) => {
      res.writeHead(response.status, response.headers)
      res.end(response.body)
    })
  }
  const server = require('http').createServer(handler)

  server.on('upgrade', (req: any, socket: any, head: any) => {
    if (req.url === '/ws') {
      // @ts-ignore
      app._ws?.upgrade(req, socket, head, (ws: any) => {
        // Let Elysia handle the upgrade
      })
    }
  })

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`WebSocket: ws://localhost:${PORT}/ws`)
  })
}