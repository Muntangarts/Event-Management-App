# Test Frontend-Backend Integration

## Quick Test (5 minutes)

### Step 1: Install & Start Backend
```bash
cd event-monolith-app
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Wait for:
```
🚀 Server running on http://localhost:3000
📡 WebSocket available at ws://localhost:3000/ws
📚 API Documentation: http://localhost:3000/swagger
```

### Step 2: Open Frontend
Open in browser: `http://localhost:3000/frontend/index.html`

You should see the **Event Manager** login page.

### Step 3: Test Sign Up
1. Click "Create Account"
2. Enter:
   - Email: `test@example.com`
   - Password: `password123`
   - Role: Organizer
3. Click "Sign Up"
4. You should see "Account created!" message
5. You should see the Events page

### Step 4: Test Event Creation
1. Click "Create Event"
2. Fill in:
   - Title: `My First Event`
   - Description: `This is a test event`
   - Date: Pick tomorrow's date
   - Location: `Test Location`
3. Click "Create"
4. You should see "Event created" message
5. Event should appear in the list

### Step 5: Test RSVP
1. Click "RSVP Going" on the event
2. You should see "RSVP: GOING" message
3. Try "RSVP Maybe" - should update
4. Try "RSVP Not Going" - should update

### Step 6: Test Real-time Updates
1. Open frontend in **two browser tabs**
2. In Tab 1: Login as organizer
3. In Tab 2: Open same URL, login as attendee
4. In Tab 1: Create a new event
5. In Tab 2: Watch the event appear automatically (WebSocket!)
6. In Tab 2: RSVP to the event
7. In Tab 1: Watch the RSVP count update

## Detailed Test Scenarios

### Scenario 1: Authentication

**Test Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected response:
```json
{
  "id": "user-id",
  "email": "test@example.com",
  "role": "ORGANIZER",
  "token": "eyJhbGc..."
}
```

**Test Signup**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password123","role":"ATTENDEE"}'
```

### Scenario 2: Event Management

**Get Events**
```bash
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Event**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title":"Test Event",
    "description":"Test description",
    "date":"2024-12-31T18:00:00Z",
    "location":"Test Location"
  }'
```

**Update Event**
```bash
curl -X PUT http://localhost:3000/api/events/EVENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Updated Title"}'
```

**Delete Event**
```bash
curl -X DELETE http://localhost:3000/api/events/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Scenario 3: RSVP

**RSVP to Event**
```bash
curl -X POST http://localhost:3000/api/events/EVENT_ID/rsvp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status":"GOING"}'
```

**Get Event RSVPs**
```bash
curl -X GET http://localhost:3000/api/events/EVENT_ID/rsvps \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get My RSVPs**
```bash
curl -X GET http://localhost:3000/api/my-rsvps \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Scenario 4: WebSocket Real-time

**Connect to WebSocket**
```bash
# Using websocat (install: brew install websocat)
websocat ws://localhost:3000/ws

# You should see:
# {"type":"CONNECTED","message":"Connected to WebSocket"}
```

**Trigger Event Creation**
In another terminal, create an event via API. In the WebSocket terminal, you should see:
```json
{
  "type":"EVENT_CREATED",
  "payload":{...event data...},
  "timestamp":"2024-01-01T12:00:00Z"
}
```

## Browser Developer Tools Testing

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform actions in the app
4. You should see:
   - `POST /api/auth/login` - 200 OK
   - `GET /api/events` - 200 OK
   - `POST /api/events` - 201 Created
   - `POST /api/events/:id/rsvp` - 201 Created

### Check WebSocket Connection
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "WS"
4. You should see `ws://localhost:3000/ws` with status "101 Switching Protocols"
5. Click on it and go to Messages tab
6. You should see WebSocket messages like:
   ```json
   {"type":"CONNECTED","message":"Connected to WebSocket"}
   {"type":"EVENT_CREATED","payload":{...},"timestamp":"..."}
   ```

### Check LocalStorage
1. Open DevTools (F12)
2. Go to Application tab
3. Click LocalStorage > http://localhost:3000
4. You should see:
   - `token` - JWT token
   - `user` - User object (JSON)
   - `role` - User role

### Check Console
1. Open DevTools (F12)
2. Go to Console tab
3. You should see:
   - `WS connected` - When WebSocket connects
   - `WS closed` - When WebSocket disconnects
   - No errors (red messages)

## Role-Based Access Testing

### Test Organizer Permissions
1. Sign up as Organizer
2. You should see "Create Event" form
3. You should see Edit/Delete buttons on your events
4. You should NOT see Edit/Delete on other's events

### Test Attendee Permissions
1. Sign up as Attendee
2. You should NOT see "Create Event" form
3. You should NOT see Edit/Delete buttons
4. You should see RSVP buttons

### Test Admin Permissions
1. Manually set role to ADMIN in database
2. You should see "Create Event" form
3. You should see Edit/Delete on ALL events
4. You should see Approve button

## Error Handling Testing

### Test Invalid Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"wrong"}'
```

Expected: 401 Unauthorized with error message

### Test Missing Token
```bash
curl -X GET http://localhost:3000/api/events
```

Expected: 401 Unauthorized

### Test Invalid Token
```bash
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer invalid-token"
```

Expected: 401 Unauthorized

### Test Unauthorized Action
```bash
# As Attendee, try to create event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ATTENDEE_TOKEN" \
  -d '{"title":"Test","description":"Test","date":"2024-12-31T18:00:00Z","location":"Test"}'
```

Expected: 403 Forbidden

## Performance Testing

### Measure API Response Time
```bash
time curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: < 100ms

### Measure WebSocket Latency
1. Open DevTools Network tab
2. Filter by WS
3. Click on WebSocket connection
4. Go to Messages tab
5. Note timestamps of messages
6. Latency should be < 50ms

### Load Test (Optional)
```bash
# Using Apache Bench (ab)
ab -n 100 -c 10 http://localhost:3000/health
```

Expected: All requests succeed

## Cleanup

### Reset Database
```bash
rm event-monolith-app/prisma/dev.db
npm run prisma:migrate
```

### Clear Browser Storage
1. Open DevTools (F12)
2. Go to Application tab
3. Click LocalStorage
4. Right-click and "Clear All"

## Success Indicators

✅ All of the following should be true:

- [ ] Frontend loads without errors
- [ ] Can sign up and login
- [ ] Can create events (as Organizer)
- [ ] Can view events (as Attendee)
- [ ] Can RSVP to events
- [ ] Can edit own events
- [ ] Can delete own events
- [ ] Real-time updates work (WebSocket)
- [ ] Role-based access works
- [ ] Error messages display correctly
- [ ] Token persists on refresh
- [ ] Logout clears storage
- [ ] No console errors
- [ ] Network requests are successful

## Troubleshooting

### "Cannot GET /frontend/index.html"
- Backend not running
- Check: `npm run dev` is running
- Try: `http://localhost:3000/health`

### "Login failed: Invalid email or password"
- User doesn't exist
- Wrong password
- Try signing up first

### "RSVP failed: Cannot RSVP to unapproved events"
- Event is not approved
- Use Swagger UI to approve: `PUT /api/events/{id}/approve`

### WebSocket not connecting
- Backend not running
- Check browser console for errors
- Try refreshing page
- Check Network tab for WS connection

### CORS errors
- Backend CORS not enabled
- Check: `@elysiajs/cors` is installed
- Check: CORS middleware is in `src/index.ts`

### Database errors
- Database not initialized
- Run: `npm run prisma:migrate`
- Or delete and recreate: `rm prisma/dev.db && npm run prisma:migrate`

## Next Steps

After successful testing:

1. **Deploy to Render**
   - Follow FRONTEND_INTEGRATION.md

2. **Add More Features**
   - Event search
   - User profiles
   - Event categories
   - Email notifications

3. **Improve Security**
   - Use httpOnly cookies
   - Add rate limiting
   - Add request validation

4. **Enhance UX**
   - Add loading spinners
   - Add form validation
   - Add dark mode
   - Improve mobile design

---

**Test Status**: Ready to test
**Expected Duration**: 5-10 minutes
**Success Rate**: Should be 100% if all steps followed
