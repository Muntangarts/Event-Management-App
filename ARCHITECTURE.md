# Event Management System Architecture

## Architecture Diagram
See `finalballdrawio.png` for the complete system architecture diagram.

## System Overview

This is a full-stack event management application built with a monolithic architecture that includes:
- **Backend**: Node.js with Elysia.js framework
- **Frontend**: React with Vite
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: WebSocket support
- **AI Integration**: OpenAI-powered assistant

---

## Architecture Layers (As per Architecture Diagram)

### 1. **Frontend Layer** (React + Vite)
**Location**: `/event-frontend/`

#### Components Structure
```
src/
├── components/
│   ├── Login.jsx          → User authentication UI
│   ├── EventList.jsx      → Display and manage events
│   ├── CreateEvent.jsx    → Event creation form
│   ├── MyRsvps.jsx        → User's RSVP management
│   └── AiAssistant.jsx    → AI chat and suggestions
├── hooks/
│   └── useWebSocket.js    → WebSocket connection hook
└── App.jsx                → Main application component
```

#### Key Frontend Features
- **Authentication**: Login/Register with role-based access (ADMIN, ORGANIZER, ATTENDEE)
- **Event Management**: Create, view, update, delete events
- **RSVP System**: GOING, MAYBE, NOT_GOING status management
- **Real-time Updates**: WebSocket integration for live event updates
- **AI Assistant**: Chat interface and personalized event suggestions

---

### 2. **Backend Layer** (Elysia.js + Node.js)
**Location**: `/event-monolith-app/src/`

#### Project Structure
```
src/
├── index.ts               → Server entry point, middleware setup
├── controllers/           → Business logic
│   ├── auth.controller.ts → Authentication logic
│   ├── event.controller.ts→ Event management logic
│   └── rsvp.controller.ts → RSVP management logic
├── routes/                → API endpoints
│   ├── auth.routes.ts     → /api/auth/* routes
│   ├── event.routes.ts    → /api/events/* routes
│   └── ai.routes.ts       → /api/ai/* routes
├── services/              → External integrations
│   ├── email.service.ts   → Email notifications (Ethereal)
│   ├── websocket.service.ts→ WebSocket broadcasting
│   └── ai.service.ts      → OpenAI integration
├── middleware/            → Request interceptors
│   └── auth.middleware.ts → JWT authentication
├── utils/                 → Helper functions
│   └── jwt.utils.ts       → JWT token management
└── prisma/                → Database schema & migrations
    └── schema.prisma      → Database models
```

---

### 3. **API Endpoints** (RESTful + WebSocket)

#### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT token)

#### Event Routes (`/api/events`)
- `GET /api/events` - Get approved events (all users)
- `GET /api/events/all` - Get all events including pending (ADMIN only)
- `POST /api/events` - Create event (ORGANIZER/ADMIN only)
- `PUT /api/events/:id` - Update event (ORGANIZER of own event/ADMIN)
- `DELETE /api/events/:id` - Delete event (ORGANIZER of own event/ADMIN)
- `PUT /api/events/:id/approve` - Approve event (ADMIN only)

#### RSVP Routes (`/api/events`)
- `POST /api/events/:id/rsvp` - Create/update RSVP
- `GET /api/events/:id/rsvps` - Get event RSVPs
- `GET /api/my-rsvps` - Get user's RSVPs

#### AI Routes (`/api/ai`)
- `GET /api/ai/suggestions` - Get personalized event recommendations
- `POST /api/ai/chat` - Chat with AI assistant

#### WebSocket
- `ws://localhost:3000/ws` - Real-time event updates

---

### 4. **Database Layer** (PostgreSQL + Prisma ORM)

#### Database Models

**User Model**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(ATTENDEE)
  events    Event[]
  rsvps     Rsvp[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Event Model**
```prisma
model Event {
  id          String   @id @default(cuid())
  title       String
  description String
  date        DateTime
  location    String
  approved    Boolean  @default(false)
  organizer   User?    @relation(fields: [organizerId], references: [id])
  organizerId String?
  rsvps       Rsvp[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**RSVP Model**
```prisma
model Rsvp {
  id        String   @id @default(cuid())
  status    String   // GOING, MAYBE, NOT_GOING
  userId    String
  eventId   String
  user      User     @relation(fields: [userId], references: [id])
  event     Event    @relation(fields: [eventId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, eventId])
}
```

---

### 5. **Authentication & Authorization Flow**

#### JWT Authentication
1. User registers/logs in → Server generates JWT token
2. Client stores token in localStorage
3. Client includes token in Authorization header: `Bearer <token>`
4. Middleware validates token on protected routes
5. User data extracted from token for authorization

#### Role-Based Access Control (RBAC)
- **ADMIN**: Full access (approve events, manage all events)
- **ORGANIZER**: Create events, manage own events
- **ATTENDEE**: View events, RSVP to events

---

### 6. **Real-time Communication (WebSocket)**

#### WebSocket Service (`websocket.service.ts`)
Broadcasts real-time updates for:
- `EVENT_CREATED` - New event added
- `EVENT_UPDATED` - Event modified
- `EVENT_APPROVED` - Event approved by admin
- `EVENT_DELETED` - Event removed
- `RSVP_CREATED` - New RSVP
- `RSVP_UPDATED` - RSVP status changed

#### Frontend Integration
```javascript
useWebSocket('ws://localhost:3000/ws', (data) => {
  if (data.type === 'EVENT_CREATED') {
    // Update events list
  }
  // Handle other event types...
})
```

---

### 7. **AI Integration (OpenAI)**

#### AI Service Features
1. **Event Suggestions** (`getEventSuggestions`)
   - Analyzes user's RSVP history
   - Compares with available upcoming events
   - Uses GPT-3.5-turbo to generate personalized recommendations

2. **Chat Assistant** (`chatWithAssistant`)
   - Context-aware responses
   - Knows user role, history, and available events
   - Helps with platform navigation and queries

#### Configuration
- Requires `OPENAI_API_KEY` in `.env`
- Fallback to basic suggestions if API unavailable
- Model: `gpt-3.5-turbo`

---

### 8. **Email Notifications**

#### Email Service (`email.service.ts`)
- **Provider**: Ethereal Email (for testing)
- **Use Case**: Event approval notifications
- **Flow**: Admin approves event → Email sent to organizer

---

## Data Flow Examples

### Example 1: Creating an Event
```
1. ORGANIZER clicks "Create Event" in frontend
2. Frontend sends POST /api/events with event data + JWT token
3. Middleware validates JWT and checks role
4. Controller creates event in database (approved: false)
5. WebSocket broadcasts EVENT_CREATED
6. Frontend receives WebSocket update and displays new event
```

### Example 2: Admin Approving Event
```
1. ADMIN sees pending event in EventList
2. ADMIN clicks "Approve Event" button
3. Frontend sends PUT /api/events/:id/approve + JWT token
4. Middleware validates ADMIN role
5. Controller updates event.approved = true
6. Email sent to organizer
7. WebSocket broadcasts EVENT_APPROVED
8. Frontend updates event status to "Approved"
```

### Example 3: AI Suggestions
```
1. User clicks "AI Assistant" → "Suggestions" tab
2. Frontend sends GET /api/ai/suggestions + JWT token
3. Backend fetches user's RSVP history from database
4. Backend fetches upcoming approved events
5. AI Service calls OpenAI API with context
6. GPT-3.5 analyzes patterns and suggests events
7. Response returned to frontend and displayed
```

---

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, CSS3 |
| **Backend** | Node.js, Elysia.js, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Authentication** | JWT, bcrypt |
| **Real-time** | WebSocket |
| **AI** | OpenAI GPT-3.5-turbo |
| **Email** | Nodemailer + Ethereal |
| **API Docs** | Swagger/OpenAPI |

---

## Environment Configuration

### Backend (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
ETHEREAL_USER="..."
ETHEREAL_PASS="..."
PORT=3000
OPENAI_API_KEY="sk-..."
```

### Frontend
- Development server: `http://localhost:5173` (Vite)
- API base URL: `http://localhost:3000/api`
- WebSocket URL: `ws://localhost:3000/ws`

---

## Running the Application

### Backend
```bash
cd event-monolith-app
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend
```bash
cd event-frontend
npm install
npm run dev
```

### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/swagger
- WebSocket: ws://localhost:3000/ws

---

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Signed with secret key
3. **CORS**: Configured for cross-origin requests
4. **Role-Based Access**: Middleware enforcement
5. **Input Validation**: Elysia schema validation
6. **SQL Injection Prevention**: Prisma parameterized queries

---

## Future Enhancements (Based on Architecture)

- [ ] Event categories and tags
- [ ] Advanced search and filtering
- [ ] Calendar view integration
- [ ] Email reminders for upcoming events
- [ ] Social sharing features
- [ ] Event capacity management
- [ ] Payment integration for paid events
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

*This architecture document maps directly to the system diagram in `finalballdrawio.png`*
