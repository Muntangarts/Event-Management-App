# Insomnia/Postman Request Examples

Copy-paste ready examples for testing all API endpoints.

## 📌 Base URL

```
http://localhost:3000
```

## 🔐 Authentication Endpoints

### POST /signup - Create Admin User

**Method:** POST  
**URL:** `http://localhost:3000/signup`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "role": "ADMIN"
}
```

**Expected Status:** 201 Created

**Response:**
```json
{
  "id": "clx1234567890abcdef",
  "email": "admin@example.com",
  "role": "ADMIN",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /signup - Create Organizer User

**Method:** POST  
**URL:** `http://localhost:3000/signup`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "organizer@example.com",
  "password": "organizer123",
  "role": "ORGANIZER"
}
```

**Expected Status:** 201 Created

---

### POST /signup - Create Attendee User

**Method:** POST  
**URL:** `http://localhost:3000/signup`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "attendee@example.com",
  "password": "attendee123",
  "role": "ATTENDEE"
}
```

**Expected Status:** 201 Created

---

### POST /login - Authenticate User

**Method:** POST  
**URL:** `http://localhost:3000/login`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Expected Status:** 200 OK

**Response:**
```json
{
  "id": "clx1234567890abcdef",
  "email": "admin@example.com",
  "role": "ADMIN",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📅 Event Endpoints

### GET /events - List Approved Events

**Method:** GET  
**URL:** `http://localhost:3000/events`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected Status:** 200 OK

**Response:**
```json
[
  {
    "id": "clx9876543210fedcba",
    "title": "Tech Conference 2024",
    "description": "Annual technology conference",
    "date": "2024-12-15T10:00:00.000Z",
    "location": "San Francisco Convention Center",
    "approved": true,
    "organizerId": "clx1234567890abcdef",
    "organizer": {
      "id": "clx1234567890abcdef",
      "email": "organizer@example.com"
    },
    "rsvps": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### POST /events - Create Event (Organizer)

**Method:** POST  
**URL:** `http://localhost:3000/events`  
**Headers:**
```
Authorization: Bearer ORGANIZER_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference with keynotes and workshops",
  "date": "2024-12-15T10:00:00Z",
  "location": "San Francisco Convention Center"
}
```

**Expected Status:** 201 Created

**Response:**
```json
{
  "id": "clx9876543210fedcba",
  "title": "Tech Conference 2024",
  "description": "Annual technology conference with keynotes and workshops",
  "date": "2024-12-15T10:00:00.000Z",
  "location": "San Francisco Convention Center",
  "approved": false,
  "organizerId": "clx1234567890abcdef",
  "organizer": {
    "id": "clx1234567890abcdef",
    "email": "organizer@example.com"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### PUT /events/:id - Update Event

**Method:** PUT  
**URL:** `http://localhost:3000/events/clx9876543210fedcba`  
**Headers:**
```
Authorization: Bearer ORGANIZER_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Tech Conference 2024 - Updated",
  "location": "New York Convention Center"
}
```

**Expected Status:** 200 OK

**Response:**
```json
{
  "id": "clx9876543210fedcba",
  "title": "Tech Conference 2024 - Updated",
  "description": "Annual technology conference with keynotes and workshops",
  "date": "2024-12-15T10:00:00.000Z",
  "location": "New York Convention Center",
  "approved": false,
  "organizerId": "clx1234567890abcdef",
  "organizer": {
    "id": "clx1234567890abcdef",
    "email": "organizer@example.com"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

---

### DELETE /events/:id - Delete Event

**Method:** DELETE  
**URL:** `http://localhost:3000/events/clx9876543210fedcba`  
**Headers:**
```
Authorization: Bearer ORGANIZER_TOKEN
```

**Expected Status:** 200 OK

**Response:**
```json
{
  "success": true,
  "id": "clx9876543210fedcba"
}
```

---

### PUT /events/:id/approve - Approve Event (Admin)

**Method:** PUT  
**URL:** `http://localhost:3000/events/clx9876543210fedcba/approve`  
**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
```

**Expected Status:** 200 OK

**Response:**
```json
{
  "id": "clx9876543210fedcba",
  "title": "Tech Conference 2024",
  "description": "Annual technology conference with keynotes and workshops",
  "date": "2024-12-15T10:00:00.000Z",
  "location": "San Francisco Convention Center",
  "approved": true,
  "organizerId": "clx1234567890abcdef",
  "organizer": {
    "id": "clx1234567890abcdef",
    "email": "organizer@example.com"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:40:00.000Z"
}
```

---

## 📝 RSVP Endpoints

### POST /events/:id/rsvp - RSVP to Event

**Method:** POST  
**URL:** `http://localhost:3000/events/clx9876543210fedcba/rsvp`  
**Headers:**
```
Authorization: Bearer ATTENDEE_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "status": "GOING"
}
```

**Expected Status:** 201 Created

**Response:**
```json
{
  "id": "clx5555555555555555",
  "status": "GOING",
  "userId": "clx3333333333333333",
  "eventId": "clx9876543210fedcba",
  "user": {
    "id": "clx3333333333333333",
    "email": "attendee@example.com"
  },
  "event": {
    "id": "clx9876543210fedcba",
    "title": "Tech Conference 2024",
    "description": "Annual technology conference with keynotes and workshops",
    "date": "2024-12-15T10:00:00.000Z",
    "location": "San Francisco Convention Center",
    "approved": true,
    "organizerId": "clx1234567890abcdef",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:40:00.000Z"
  },
  "createdAt": "2024-01-15T10:45:00.000Z",
  "updatedAt": "2024-01-15T10:45:00.000Z"
}
```

---

### POST /events/:id/rsvp - Update RSVP Status

**Method:** POST  
**URL:** `http://localhost:3000/events/clx9876543210fedcba/rsvp`  
**Headers:**
```
Authorization: Bearer ATTENDEE_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "status": "MAYBE"
}
```

**Expected Status:** 200 OK

**Response:**
```json
{
  "id": "clx5555555555555555",
  "status": "MAYBE",
  "userId": "clx3333333333333333",
  "eventId": "clx9876543210fedcba",
  "user": {
    "id": "clx3333333333333333",
    "email": "attendee@example.com"
  },
  "event": { ... },
  "createdAt": "2024-01-15T10:45:00.000Z",
  "updatedAt": "2024-01-15T10:50:00.000Z"
}
```

---

### GET /events/:id/rsvps - Get Event RSVPs

**Method:** GET  
**URL:** `http://localhost:3000/events/clx9876543210fedcba/rsvps`  
**Headers:**
```
Authorization: Bearer ORGANIZER_TOKEN
```

**Expected Status:** 200 OK

**Response:**
```json
[
  {
    "id": "clx5555555555555555",
    "status": "GOING",
    "userId": "clx3333333333333333",
    "eventId": "clx9876543210fedcba",
    "user": {
      "id": "clx3333333333333333",
      "email": "attendee@example.com"
    },
    "createdAt": "2024-01-15T10:45:00.000Z",
    "updatedAt": "2024-01-15T10:45:00.000Z"
  }
]
```

---

### GET /my-rsvps - Get User's RSVPs

**Method:** GET  
**URL:** `http://localhost:3000/my-rsvps`  
**Headers:**
```
Authorization: Bearer ATTENDEE_TOKEN
```

**Expected Status:** 200 OK

**Response:**
```json
[
  {
    "id": "clx5555555555555555",
    "status": "GOING",
    "userId": "clx3333333333333333",
    "eventId": "clx9876543210fedcba",
    "event": {
      "id": "clx9876543210fedcba",
      "title": "Tech Conference 2024",
      "description": "Annual technology conference with keynotes and workshops",
      "date": "2024-12-15T10:00:00.000Z",
      "location": "San Francisco Convention Center",
      "approved": true,
      "organizerId": "clx1234567890abcdef",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:40:00.000Z"
    },
    "createdAt": "2024-01-15T10:45:00.000Z",
    "updatedAt": "2024-01-15T10:45:00.000Z"
  }
]
```

---

## 🔌 WebSocket Examples

### Connect to WebSocket

**URL:** `ws://localhost:3000/ws`

**JavaScript:**
```javascript
const ws = new WebSocket('ws://localhost:3000/ws')

ws.onopen = () => {
  console.log('Connected to WebSocket')
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('Received:', data)
}

ws.onerror = (error) => {
  console.error('WebSocket error:', error)
}

ws.onclose = () => {
  console.log('Disconnected from WebSocket')
}
```

---

### WebSocket Message: EVENT_CREATED

```json
{
  "type": "EVENT_CREATED",
  "payload": {
    "id": "clx9876543210fedcba",
    "title": "Tech Conference 2024",
    "description": "Annual technology conference with keynotes and workshops",
    "date": "2024-12-15T10:00:00.000Z",
    "location": "San Francisco Convention Center",
    "approved": false,
    "organizerId": "clx1234567890abcdef",
    "organizer": {
      "id": "clx1234567890abcdef",
      "email": "organizer@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### WebSocket Message: EVENT_APPROVED

```json
{
  "type": "EVENT_APPROVED",
  "payload": {
    "id": "clx9876543210fedcba",
    "title": "Tech Conference 2024",
    "description": "Annual technology conference with keynotes and workshops",
    "date": "2024-12-15T10:00:00.000Z",
    "location": "San Francisco Convention Center",
    "approved": true,
    "organizerId": "clx1234567890abcdef",
    "organizer": {
      "id": "clx1234567890abcdef",
      "email": "organizer@example.com"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:40:00.000Z"
  },
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

---

### WebSocket Message: RSVP_CREATED

```json
{
  "type": "RSVP_CREATED",
  "payload": {
    "id": "clx5555555555555555",
    "status": "GOING",
    "userId": "clx3333333333333333",
    "eventId": "clx9876543210fedcba",
    "user": {
      "id": "clx3333333333333333",
      "email": "attendee@example.com"
    },
    "event": {
      "id": "clx9876543210fedcba",
      "title": "Tech Conference 2024",
      "description": "Annual technology conference with keynotes and workshops",
      "date": "2024-12-15T10:00:00.000Z",
      "location": "San Francisco Convention Center",
      "approved": true,
      "organizerId": "clx1234567890abcdef",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:40:00.000Z"
    },
    "createdAt": "2024-01-15T10:45:00.000Z",
    "updatedAt": "2024-01-15T10:45:00.000Z"
  },
  "timestamp": "2024-01-15T10:45:00.000Z"
}
```

---

### WebSocket Message: EVENT_DELETED

```json
{
  "type": "EVENT_DELETED",
  "payload": {
    "id": "clx9876543210fedcba"
  },
  "timestamp": "2024-01-15T10:50:00.000Z"
}
```

---

## 🚨 Error Response Examples

### 401 Unauthorized - Missing Token

**Response:**
```json
{
  "error": "Missing authorization token"
}
```

---

### 401 Unauthorized - Invalid Token

**Response:**
```json
{
  "error": "Invalid or expired token"
}
```

---

### 403 Forbidden - Insufficient Permissions

**Response:**
```json
{
  "error": "Only ORGANIZER or ADMIN can create events"
}
```

---

### 404 Not Found - Event Not Found

**Response:**
```json
{
  "error": "Event not found"
}
```

---

### 400 Bad Request - Invalid Input

**Response:**
```json
{
  "error": "Event date must be in the future"
}
```

---

## 📥 Importing into Insomnia

1. Create a new Request Collection
2. Add requests with the examples above
3. Use environment variables for tokens:
   - `{{ admin_token }}`
   - `{{ organizer_token }}`
   - `{{ attendee_token }}`
   - `{{ event_id }}`

---

## 📥 Importing into Postman

1. Create a new Collection
2. Add requests with the examples above
3. Use Postman variables:
   - `{{admin_token}}`
   - `{{organizer_token}}`
   - `{{attendee_token}}`
   - `{{event_id}}`
4. Use Pre-request Scripts to extract tokens from responses

---

## 💡 Tips

- Always save tokens from signup/login responses
- Use environment variables to avoid repetitive copying
- Test error cases (wrong role, missing fields, etc.)
- Monitor WebSocket messages while making API calls
- Check console logs for email preview URLs
