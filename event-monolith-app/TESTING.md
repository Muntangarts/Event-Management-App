# Testing Guide - Event Management API

This guide provides step-by-step instructions for testing all API endpoints using Insomnia, Postman, or cURL.

## 📋 Prerequisites

- API running at `http://localhost:3000`
- Insomnia or Postman installed (optional, cURL examples provided)
- A text editor to store tokens

## 🔑 Setup: Create Test Users

### Step 1: Create Admin User

**POST** `http://localhost:3000/signup`

```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "id": "admin_id_123",
  "email": "admin@example.com",
  "role": "ADMIN",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Save the token as `ADMIN_TOKEN`.

### Step 2: Create Organizer User

**POST** `http://localhost:3000/signup`

```json
{
  "email": "organizer@example.com",
  "password": "organizer123",
  "role": "ORGANIZER"
}
```

Save the token as `ORGANIZER_TOKEN`.

### Step 3: Create Attendee User

**POST** `http://localhost:3000/signup`

```json
{
  "email": "attendee@example.com",
  "password": "attendee123",
  "role": "ATTENDEE"
}
```

Save the token as `ATTENDEE_TOKEN`.

---

## 🧪 Test Scenarios

### Scenario 1: Authentication

#### Test 1.1: Signup with Valid Data

**POST** `http://localhost:3000/signup`

```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "ATTENDEE"
}
```

**Expected:** 201 Created with token

#### Test 1.2: Signup with Duplicate Email

**POST** `http://localhost:3000/signup`

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Expected:** 400 Bad Request - "User with this email already exists"

#### Test 1.3: Signup with Short Password

**POST** `http://localhost:3000/signup`

```json
{
  "email": "test@example.com",
  "password": "123"
}
```

**Expected:** 400 Bad Request - "Password must be at least 6 characters"

#### Test 1.4: Login with Correct Credentials

**POST** `http://localhost:3000/login`

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Expected:** 200 OK with token

#### Test 1.5: Login with Wrong Password

**POST** `http://localhost:3000/login`

```json
{
  "email": "admin@example.com",
  "password": "wrongpassword"
}
```

**Expected:** 401 Unauthorized - "Invalid email or password"

#### Test 1.6: Login with Non-existent Email

**POST** `http://localhost:3000/login`

```json
{
  "email": "nonexistent@example.com",
  "password": "password123"
}
```

**Expected:** 401 Unauthorized - "Invalid email or password"

---

### Scenario 2: Event Management

#### Test 2.1: Get Events Without Authentication

**GET** `http://localhost:3000/events`

**Headers:** None

**Expected:** 401 Unauthorized - "Missing authorization token"

#### Test 2.2: Get Events With Valid Token

**GET** `http://localhost:3000/events`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
```

**Expected:** 200 OK with empty array (no approved events yet)

#### Test 2.3: Create Event as Organizer

**POST** `http://localhost:3000/events`

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

**Expected:** 201 Created with event object

Save the event ID as `EVENT_ID`.

#### Test 2.4: Create Event as Attendee (Should Fail)

**POST** `http://localhost:3000/events`

**Headers:**
```
Authorization: Bearer ATTENDEE_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Unauthorized Event",
  "description": "This should fail",
  "date": "2024-12-15T10:00:00Z",
  "location": "Somewhere"
}
```

**Expected:** 403 Forbidden - "Only ORGANIZER or ADMIN can create events"

#### Test 2.5: Create Event with Invalid Date

**POST** `http://localhost:3000/events`

**Headers:**
```
Authorization: Bearer ORGANIZER_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Past Event",
  "description": "Event in the past",
  "date": "2020-01-01T10:00:00Z",
  "location": "Somewhere"
}
```

**Expected:** 400 Bad Request - "Event date must be in the future"

#### Test 2.6: Update Own Event as Organizer

**PUT** `http://localhost:3000/events/EVENT_ID`

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

**Expected:** 200 OK with updated event

#### Test 2.7: Update Other's Event as Organizer (Should Fail)

First, create another event as a different organizer, then try to update it.

**PUT** `http://localhost:3000/events/OTHER_EVENT_ID`

**Headers:**
```
Authorization: Bearer ORGANIZER_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Hacked Event"
}
```

**Expected:** 403 Forbidden - "Not authorized to update this event"

#### Test 2.8: Update Event as Admin (Should Succeed)

**PUT** `http://localhost:3000/events/EVENT_ID`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Tech Conference 2024 - Admin Updated"
}
```

**Expected:** 200 OK with updated event

#### Test 2.9: Delete Own Event as Organizer

**DELETE** `http://localhost:3000/events/EVENT_ID`

**Headers:**
```
Authorization: Bearer ORGANIZER_TOKEN
```

**Expected:** 200 OK - `{ "success": true, "id": "EVENT_ID" }`

#### Test 2.10: Delete Non-existent Event

**DELETE** `http://localhost:3000/events/nonexistent_id`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
```

**Expected:** 404 Not Found - "Event not found"

---

### Scenario 3: Event Approval

#### Test 3.1: Approve Event as Admin

First, create a new event as organizer.

**PUT** `http://localhost:3000/events/EVENT_ID/approve`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
```

**Expected:** 200 OK with event object where `approved: true`

#### Test 3.2: Approve Event as Organizer (Should Fail)

**PUT** `http://localhost:3000/events/EVENT_ID/approve`

**Headers:**
```
Authorization: Bearer ORGANIZER_TOKEN
```

**Expected:** 403 Forbidden - "Only ADMIN can approve events"

#### Test 3.3: Approve Already Approved Event

**PUT** `http://localhost:3000/events/EVENT_ID/approve`

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN
```

**Expected:** 400 Bad Request - "Event is already approved"

#### Test 3.4: Get Events Shows Only Approved

**GET** `http://localhost:3000/events`

**Headers:**
```
Authorization: Bearer ATTENDEE_TOKEN
```

**Expected:** 200 OK with only approved events in array

---

### Scenario 4: RSVP Management

#### Test 4.1: RSVP to Approved Event

First, ensure an event is approved.

**POST** `http://localhost:3000/events/EVENT_ID/rsvp`

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

**Expected:** 201 Created with RSVP object

Save the RSVP ID as `RSVP_ID`.

#### Test 4.2: RSVP to Unapproved Event (Should Fail)

Create an unapproved event first.

**POST** `http://localhost:3000/events/UNAPPROVED_EVENT_ID/rsvp`

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

**Expected:** 400 Bad Request - "Cannot RSVP to unapproved events"

#### Test 4.3: Update RSVP Status

**POST** `http://localhost:3000/events/EVENT_ID/rsvp`

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

**Expected:** 200 OK with updated RSVP

#### Test 4.4: RSVP with Invalid Status

**POST** `http://localhost:3000/events/EVENT_ID/rsvp`

**Headers:**
```
Authorization: Bearer ATTENDEE_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "status": "INVALID_STATUS"
}
```

**Expected:** 400 Bad Request - "Invalid status. Must be one of: GOING, MAYBE, NOT_GOING"

#### Test 4.5: Get Event RSVPs

**GET** `http://localhost:3000/events/EVENT_ID/rsvps`

**Headers:**
```
Authorization: Bearer ORGANIZER_TOKEN
```

**Expected:** 200 OK with array of RSVPs

#### Test 4.6: Get User's RSVPs

**GET** `http://localhost:3000/my-rsvps`

**Headers:**
```
Authorization: Bearer ATTENDEE_TOKEN
```

**Expected:** 200 OK with array of user's RSVPs

---

### Scenario 5: WebSocket Real-time Updates

#### Test 5.1: Connect to WebSocket

Using JavaScript:
```javascript
const ws = new WebSocket('ws://localhost:3000/ws')

ws.onopen = () => {
  console.log('Connected')
}

ws.onmessage = (event) => {
  console.log('Message:', JSON.parse(event.data))
}
```

**Expected:** Receive `{ type: 'CONNECTED', message: 'Connected to WebSocket' }`

#### Test 5.2: Receive EVENT_CREATED

1. Connect WebSocket client
2. Create event as organizer (POST `/events`)
3. Check WebSocket client receives:

```json
{
  "type": "EVENT_CREATED",
  "payload": { event object },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Test 5.3: Receive EVENT_UPDATED

1. Connect WebSocket client
2. Update event (PUT `/events/:id`)
3. Check WebSocket client receives:

```json
{
  "type": "EVENT_UPDATED",
  "payload": { event object },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Test 5.4: Receive EVENT_APPROVED

1. Connect WebSocket client
2. Approve event (PUT `/events/:id/approve`)
3. Check WebSocket client receives:

```json
{
  "type": "EVENT_APPROVED",
  "payload": { event object },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Test 5.5: Receive EVENT_DELETED

1. Connect WebSocket client
2. Delete event (DELETE `/events/:id`)
3. Check WebSocket client receives:

```json
{
  "type": "EVENT_DELETED",
  "payload": { "id": "event_id" },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Test 5.6: Receive RSVP_CREATED

1. Connect WebSocket client
2. RSVP to event (POST `/events/:id/rsvp`)
3. Check WebSocket client receives:

```json
{
  "type": "RSVP_CREATED",
  "payload": { rsvp object },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Test 5.7: Receive RSVP_UPDATED

1. Connect WebSocket client
2. Update RSVP (POST `/events/:id/rsvp` with different status)
3. Check WebSocket client receives:

```json
{
  "type": "RSVP_UPDATED",
  "payload": { rsvp object },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Test 5.8: Multiple Clients Receive Updates

1. Open WebSocket demo at `http://localhost:3000/public/index.html` in multiple browser tabs
2. Create/update/delete events or RSVPs
3. Verify all tabs receive the same messages in real-time

---

## 📊 cURL Command Reference

### Authentication

```bash
# Signup
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "role": "ORGANIZER"
  }'

# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Events

```bash
# Get events
curl -X GET http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create event
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Event Title",
    "description": "Event description",
    "date": "2024-12-15T10:00:00Z",
    "location": "Location"
  }'

# Update event
curl -X PUT http://localhost:3000/events/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title"
  }'

# Delete event
curl -X DELETE http://localhost:3000/events/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Approve event
curl -X PUT http://localhost:3000/events/EVENT_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### RSVP

```bash
# RSVP to event
curl -X POST http://localhost:3000/events/EVENT_ID/rsvp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "GOING"
  }'

# Get event RSVPs
curl -X GET http://localhost:3000/events/EVENT_ID/rsvps \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get user's RSVPs
curl -X GET http://localhost:3000/my-rsvps \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Test Checklist

- [ ] All signup scenarios pass
- [ ] All login scenarios pass
- [ ] Event creation works for ORGANIZER/ADMIN
- [ ] Event creation fails for ATTENDEE
- [ ] Event update works for owner/ADMIN
- [ ] Event deletion works for owner/ADMIN
- [ ] Event approval works for ADMIN only
- [ ] RSVP creation works for approved events
- [ ] RSVP fails for unapproved events
- [ ] WebSocket connects successfully
- [ ] WebSocket receives EVENT_CREATED
- [ ] WebSocket receives EVENT_UPDATED
- [ ] WebSocket receives EVENT_DELETED
- [ ] WebSocket receives EVENT_APPROVED
- [ ] WebSocket receives RSVP_CREATED
- [ ] WebSocket receives RSVP_UPDATED
- [ ] Multiple WebSocket clients receive updates
- [ ] Email sent on signup (check console)
- [ ] Email sent on event approval (check console)

---

## 🐛 Troubleshooting

### "Missing authorization token"
- Ensure you're including the `Authorization: Bearer TOKEN` header
- Check that the token is valid and not expired

### "Invalid or expired token"
- Token may have expired (24 hours)
- Try logging in again to get a new token

### "Event date must be in the future"
- Ensure the date is in ISO 8601 format and in the future
- Example: `2024-12-15T10:00:00Z`

### WebSocket not receiving messages
- Ensure WebSocket is connected (check browser console)
- Verify the server is running
- Check that you're using `ws://` not `http://`

### Email not sending
- Ethereal credentials may be incorrect
- Check console for preview URL
- Ethereal is for testing only; use real SMTP in production

---

## 📚 Additional Resources

- [Elysia.js Documentation](https://elysiajs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT.io](https://jwt.io)
- [Ethereal Email](https://ethereal.email)
