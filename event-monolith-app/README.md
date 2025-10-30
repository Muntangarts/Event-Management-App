# Event Management API

A production-ready monolithic backend API for managing events with JWT authentication, WebSocket real-time updates, and email notifications.

## 🎯 Features

- **User Authentication**: JWT-based signup and login with bcrypt password hashing
- **Role-Based Access Control**: ADMIN, ORGANIZER, and ATTENDEE roles with granular permissions
- **Event Management**: Create, update, delete, and approve events
- **RSVP System**: Attendees can RSVP to events with status tracking (GOING, MAYBE, NOT_GOING)
- **Real-time Updates**: WebSocket support for live event and RSVP notifications
- **Email Notifications**: Ethereal-based mock email for welcome and approval notifications
- **API Documentation**: Swagger/OpenAPI docs at `/swagger`
- **TypeScript**: Fully typed codebase for type safety

## 🏗️ Architecture & Design Principles

This project follows **SOLID principles** and **separation of concerns**:

- **Single Responsibility**: Each controller, service, and middleware has one clear purpose
- **Open/Closed**: Routes and middleware are extensible without modifying existing code
- **Liskov Substitution**: Services implement consistent interfaces for easy testing/mocking
- **Interface Segregation**: Middleware and guards are focused and composable
- **Dependency Inversion**: Controllers depend on abstractions (Prisma client) rather than concrete implementations

**Modularity**: The codebase is organized into:
- `controllers/`: Business logic for auth, events, and RSVPs
- `routes/`: Elysia route definitions with validation
- `middleware/`: Authentication and authorization guards
- `services/`: Email and WebSocket management
- `utils/`: JWT token utilities

This structure allows easy testing, maintenance, and scaling.

## 📁 Project Structure

```
event-monolith-app/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts       # Signup, login logic
│   │   ├── event.controller.ts      # Event CRUD operations
│   │   └── rsvp.controller.ts       # RSVP management
│   ├── middleware/
│   │   └── auth.middleware.ts       # JWT verification & role guards
│   ├── routes/
│   │   ├── auth.routes.ts           # Auth endpoints
│   │   └── event.routes.ts          # Event & RSVP endpoints
│   ├── services/
│   │   ├── email.service.ts         # Ethereal email sending
│   │   └── websocket.service.ts     # WebSocket broadcasting
│   ├── utils/
│   │   └── jwt.utils.ts             # JWT token utilities
│   ├── prisma/
│   │   └── schema.prisma            # Database schema
│   └── index.ts                     # Main app entry
├── public/
│   └── index.html                   # WebSocket demo page
├── prisma/
│   └── migrations/                  # Database migrations
├── package.json
├── tsconfig.json
├── .env.example
├── render.yaml                      # Render deployment config
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon for cloud)
- Ethereal account (optional, for email testing)

### Installation

1. **Clone and install dependencies**
   ```bash
   cd event-monolith-app
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in:
   - `DATABASE_URL`: Your PostgreSQL connection string (Neon recommended)
   - `JWT_SECRET`: A strong random string for JWT signing
   - `ETHEREAL_USER` & `ETHEREAL_PASS`: Optional, for email testing (get free account at https://ethereal.email)
   - `PORT`: Server port (default: 3000)

3. **Initialize Prisma**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`
   - Swagger docs: `http://localhost:3000/swagger`
   - WebSocket: `ws://localhost:3000/ws`
   - Health check: `http://localhost:3000/health`

## 📚 API Endpoints

### Authentication

#### POST `/signup`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "ATTENDEE"
}
```

**Response (201):**
```json
{
  "id": "cuid123",
  "email": "user@example.com",
  "role": "ATTENDEE",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123",
    "role": "ORGANIZER"
  }'
```

#### POST `/login`
Authenticate and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "id": "cuid123",
  "email": "user@example.com",
  "role": "ATTENDEE",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

### Events

All event endpoints require `Authorization: Bearer <token>` header.

#### GET `/events`
Get all approved events.

**Response (200):**
```json
[
  {
    "id": "event123",
    "title": "Tech Conference 2024",
    "description": "Annual tech conference",
    "date": "2024-12-15T10:00:00Z",
    "location": "San Francisco",
    "approved": true,
    "organizerId": "user123",
    "organizer": {
      "id": "user123",
      "email": "organizer@example.com"
    },
    "rsvps": []
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST `/events`
Create a new event (ORGANIZER or ADMIN only).

**Request:**
```json
{
  "title": "Tech Conference 2024",
  "description": "Annual tech conference",
  "date": "2024-12-15T10:00:00Z",
  "location": "San Francisco"
}
```

**Response (201):**
```json
{
  "id": "event123",
  "title": "Tech Conference 2024",
  "description": "Annual tech conference",
  "date": "2024-12-15T10:00:00Z",
  "location": "San Francisco",
  "approved": false,
  "organizerId": "user123",
  "organizer": {
    "id": "user123",
    "email": "organizer@example.com"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference 2024",
    "description": "Annual tech conference",
    "date": "2024-12-15T10:00:00Z",
    "location": "San Francisco"
  }'
```

#### PUT `/events/:id`
Update an event (ORGANIZER of own event or ADMIN).

**Request:**
```json
{
  "title": "Tech Conference 2024 - Updated",
  "location": "New York"
}
```

**Response (200):**
```json
{
  "id": "event123",
  "title": "Tech Conference 2024 - Updated",
  "location": "New York",
  ...
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/events/event123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference 2024 - Updated"
  }'
```

#### DELETE `/events/:id`
Delete an event (ORGANIZER of own event or ADMIN).

**Response (200):**
```json
{
  "success": true,
  "id": "event123"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/events/event123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### PUT `/events/:id/approve`
Approve an event (ADMIN only).

**Response (200):**
```json
{
  "id": "event123",
  "approved": true,
  ...
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/events/event123/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### RSVP

#### POST `/events/:id/rsvp`
RSVP to an event.

**Request:**
```json
{
  "status": "GOING"
}
```

**Response (201):**
```json
{
  "id": "rsvp123",
  "status": "GOING",
  "userId": "user123",
  "eventId": "event123",
  "user": {
    "id": "user123",
    "email": "attendee@example.com"
  },
  "event": { ... }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/events/event123/rsvp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "GOING"
  }'
```

#### GET `/events/:id/rsvps`
Get all RSVPs for an event.

**Response (200):**
```json
[
  {
    "id": "rsvp123",
    "status": "GOING",
    "userId": "user123",
    "eventId": "event123",
    "user": {
      "id": "user123",
      "email": "attendee@example.com"
    }
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/events/event123/rsvps \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### GET `/my-rsvps`
Get user's RSVPs.

**Response (200):**
```json
[
  {
    "id": "rsvp123",
    "status": "GOING",
    "userId": "user123",
    "eventId": "event123",
    "event": { ... }
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/my-rsvps \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔌 WebSocket Real-time Updates

Connect to `ws://localhost:3000/ws` to receive real-time event updates.

### Message Types

```typescript
// Event created
{
  "type": "EVENT_CREATED",
  "payload": { event object },
  "timestamp": "2024-01-15T10:30:00Z"
}

// Event updated
{
  "type": "EVENT_UPDATED",
  "payload": { event object },
  "timestamp": "2024-01-15T10:30:00Z"
}

// Event deleted
{
  "type": "EVENT_DELETED",
  "payload": { "id": "event123" },
  "timestamp": "2024-01-15T10:30:00Z"
}

// Event approved
{
  "type": "EVENT_APPROVED",
  "payload": { event object },
  "timestamp": "2024-01-15T10:30:00Z"
}

// RSVP created
{
  "type": "RSVP_CREATED",
  "payload": { rsvp object },
  "timestamp": "2024-01-15T10:30:00Z"
}

// RSVP updated
{
  "type": "RSVP_UPDATED",
  "payload": { rsvp object },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### WebSocket Testing

**Using JavaScript:**
```javascript
const ws = new WebSocket('ws://localhost:3000/ws')

ws.onopen = () => {
  console.log('Connected')
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Received:', data)
}

ws.onerror = (error) => {
  console.error('Error:', error)
}
```

**Using websocat (CLI):**
```bash
websocat ws://localhost:3000/ws
```

**Using Insomnia:**
1. Create a new WebSocket request
2. URL: `ws://localhost:3000/ws`
3. Connect and observe messages

## 🧪 Testing Checklist

### 1. Authentication Flow
- [ ] POST `/signup` with valid email and password → 201 with token
- [ ] POST `/signup` with existing email → 400 error
- [ ] POST `/login` with correct credentials → 200 with token
- [ ] POST `/login` with wrong password → 401 error
- [ ] GET `/events` without token → 401 error

### 2. Event Management (ORGANIZER)
- [ ] POST `/events` as ORGANIZER → 201 event created
- [ ] POST `/events` as ATTENDEE → 403 forbidden
- [ ] PUT `/events/:id` own event → 200 updated
- [ ] PUT `/events/:id` other's event → 403 forbidden
- [ ] DELETE `/events/:id` own event → 200 deleted

### 3. Event Approval (ADMIN)
- [ ] PUT `/events/:id/approve` as ADMIN → 200 approved
- [ ] PUT `/events/:id/approve` as ORGANIZER → 403 forbidden
- [ ] GET `/events` shows only approved events

### 4. RSVP System
- [ ] POST `/events/:id/rsvp` with GOING → 201 RSVP created
- [ ] POST `/events/:id/rsvp` update status → 200 updated
- [ ] GET `/events/:id/rsvps` → 200 list of RSVPs
- [ ] GET `/my-rsvps` → 200 user's RSVPs

### 5. WebSocket Real-time
- [ ] Connect to `/ws` → receive CONNECTED message
- [ ] Create event → all clients receive EVENT_CREATED
- [ ] Update event → all clients receive EVENT_UPDATED
- [ ] Delete event → all clients receive EVENT_DELETED
- [ ] Approve event → all clients receive EVENT_APPROVED
- [ ] RSVP to event → all clients receive RSVP_CREATED

### 6. Email Notifications
- [ ] Signup → welcome email sent (check Ethereal preview URL in console)
- [ ] Event approved → organizer receives approval email

## 🛠️ Development

### Build
```bash
npm run build
```

### Start Production
```bash
npm start
```

### Prisma Commands
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npx prisma studio --schema=src/prisma/schema.prisma
```

## 🌐 Deployment to Render

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Render service**
   - Go to https://render.com
   - Connect GitHub repository
   - Create new Web Service
   - Use `render.yaml` for configuration

3. **Set environment variables in Render dashboard**
   - `DATABASE_URL`: Your Neon PostgreSQL URL
   - `JWT_SECRET`: Strong random string
   - `ETHEREAL_USER`: Your Ethereal email
   - `ETHEREAL_PASS`: Your Ethereal password

4. **Deploy**
   - Render will automatically build and deploy on push to main

## 📝 Environment Variables

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# JWT Secret (use strong random string)
JWT_SECRET="your_super_secret_jwt_key_change_in_production"

# Email (Ethereal for testing)
ETHEREAL_USER="your_ethereal_email@ethereal.email"
ETHEREAL_PASS="your_ethereal_password"

# Server
PORT=3000
```

## 🔐 Security Notes

- Always use strong `JWT_SECRET` in production
- Use HTTPS in production
- Validate all user inputs
- Use environment variables for sensitive data
- Implement rate limiting for production
- Use CORS middleware if needed
- Regularly update dependencies

## 📦 Dependencies

- **elysia**: Modern TypeScript web framework
- **@prisma/client**: Database ORM
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing
- **nodemailer**: Email sending
- **@elysiajs/swagger**: API documentation

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.

## 📞 Support

For issues or questions, please open an issue on GitHub.
