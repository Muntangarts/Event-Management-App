# Execution Checklist

Complete step-by-step instructions to run the Event Management API locally.

## ✅ Prerequisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] PostgreSQL running (local or Neon cloud)
- [ ] Text editor or IDE (VS Code recommended)

## 🚀 Step 1: Install Dependencies

```bash
cd event-monolith-app
npm install
```

**Expected Output:**
```
added XXX packages in XXs
```

## 🔧 Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Get from Neon or local PostgreSQL
DATABASE_URL="postgresql://user:password@host:5432/event_db?sslmode=require"

# Generate a strong random string
JWT_SECRET="your_super_secret_jwt_key_change_in_production"

# Optional: Get free account at https://ethereal.email
ETHEREAL_USER="your_ethereal_email@ethereal.email"
ETHEREAL_PASS="your_ethereal_password"

PORT=3000
NODE_ENV="development"
```

## 📊 Step 3: Initialize Prisma

### 3a. Generate Prisma Client
```bash
npm run prisma:generate
```

**Expected Output:**
```
✔ Generated Prisma Client (X.X.X) to ./node_modules/@prisma/client in XXms
```

### 3b. Run Database Migrations
```bash
npm run prisma:migrate
```

**Expected Output:**
```
✔ Your database is now in sync with your schema.

✔ Generated Prisma Client (X.X.X) to ./node_modules/@prisma/client in XXms

> Prisma schema loaded from src/prisma/schema.prisma
> Datasource "db": PostgreSQL database "event_db" at "host:5432"

✔ Migration applied successfully
```

## 🎯 Step 4: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║         🎉 Event Management API Started                    ║
╠════════════════════════════════════════��═══════════════════╣
║ 🚀 Server running at: http://localhost:3000
║ 📚 Swagger docs: http://localhost:3000/swagger
║ 🔌 WebSocket: ws://localhost:3000/ws
║ 💚 Health check: http://localhost:3000/health
╚════════════════════════════════════════════════════════════╝
```

## ✨ Step 5: Verify Installation

### 5a. Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5b. View Swagger Docs
Open in browser: `http://localhost:3000/swagger`

### 5c. Test WebSocket
Open in browser: `http://localhost:3000/public/index.html`

## 🧪 Step 6: Quick API Test

### 6a. Signup
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "ORGANIZER"
  }'
```

**Expected Response (201):**
```json
{
  "id": "cuid123",
  "email": "test@example.com",
  "role": "ORGANIZER",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Save the token as `TOKEN`**

### 6b. Create Event
```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference",
    "description": "Annual tech conference",
    "date": "2024-12-15T10:00:00Z",
    "location": "San Francisco"
  }'
```

**Expected Response (201):**
```json
{
  "id": "event123",
  "title": "Tech Conference",
  "description": "Annual tech conference",
  "date": "2024-12-15T10:00:00Z",
  "location": "San Francisco",
  "approved": false,
  "organizerId": "cuid123",
  "organizer": {
    "id": "cuid123",
    "email": "test@example.com"
  }
}
```

### 6c. Get Events
```bash
curl -X GET http://localhost:3000/events \
  -H "Authorization: Bearer TOKEN"
```

**Expected Response (200):**
```json
[]
```

(Empty because event is not approved yet)

## 🏗️ Step 7: Build for Production

```bash
npm run build
```

**Expected Output:**
```
✔ Compiled successfully
```

## 🚀 Step 8: Start Production Server

```bash
npm start
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║         🎉 Event Management API Started                    ║
╠════════════════════════════════════════════════════════════╣
║ 🚀 Server running at: http://localhost:3000
...
```

## 📋 Complete Test Workflow

Follow this workflow to test all features:

### 1. Create Users
```bash
# Admin
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123","role":"ADMIN"}'

# Organizer
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"org@test.com","password":"org123","role":"ORGANIZER"}'

# Attendee
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"att@test.com","password":"att123","role":"ATTENDEE"}'
```

Save the three tokens as `ADMIN_TOKEN`, `ORG_TOKEN`, `ATT_TOKEN`.

### 2. Create Event (as Organizer)
```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer ORG_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Tech Meetup",
    "description":"Monthly tech meetup",
    "date":"2024-12-20T18:00:00Z",
    "location":"San Francisco"
  }'
```

Save the event ID as `EVENT_ID`.

### 3. Approve Event (as Admin)
```bash
curl -X PUT http://localhost:3000/events/EVENT_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 4. RSVP to Event (as Attendee)
```bash
curl -X POST http://localhost:3000/events/EVENT_ID/rsvp \
  -H "Authorization: Bearer ATT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"GOING"}'
```

### 5. Get Event RSVPs
```bash
curl -X GET http://localhost:3000/events/EVENT_ID/rsvps \
  -H "Authorization: Bearer ORG_TOKEN"
```

### 6. Get Approved Events
```bash
curl -X GET http://localhost:3000/events \
  -H "Authorization: Bearer ATT_TOKEN"
```

## 🔌 WebSocket Testing

### Using Browser
1. Open `http://localhost:3000/public/index.html`
2. Click "Connect"
3. In another terminal, create/update/delete events
4. Watch real-time updates in the browser

### Using websocat (CLI)
```bash
# Install websocat (if not installed)
# macOS: brew install websocat
# Linux: cargo install websocat
# Windows: choco install websocat

websocat ws://localhost:3000/ws
```

Then in another terminal, create events and watch messages appear.

## 📧 Email Testing

When you signup, check the console output for Ethereal preview URL:

```
✅ Welcome email sent to test@example.com
📧 Preview URL: https://ethereal.email/message/...
```

Click the URL to see the email in Ethereal.

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Error
```bash
# Check DATABASE_URL in .env
# Verify PostgreSQL is running
# Test connection:
psql "postgresql://user:password@host:5432/event_db"
```

### Prisma Migration Failed
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset --schema=src/prisma/schema.prisma

# Or manually run migrations
npm run prisma:migrate
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Compilation Error
```bash
# Clear build cache
rm -rf dist

# Rebuild
npm run build
```

## 📚 Next Steps

1. **Read Full Documentation**: See [README.md](./README.md)
2. **Detailed Testing Guide**: See [TESTING.md](./TESTING.md)
3. **Deploy to Render**: Follow deployment section in README.md
4. **Customize**: Modify controllers, routes, and services as needed

## 🎉 Success!

If you've completed all steps and tests pass, your Event Management API is ready to use!

### Key Endpoints
- **Signup**: `POST /signup`
- **Login**: `POST /login`
- **Events**: `GET/POST/PUT/DELETE /events`
- **Approve**: `PUT /events/:id/approve`
- **RSVP**: `POST /events/:id/rsvp`
- **Docs**: `GET /swagger`
- **WebSocket**: `ws://localhost:3000/ws`

### Support
- Check [TESTING.md](./TESTING.md) for detailed test cases
- Review [README.md](./README.md) for API documentation
- Check console logs for errors and email preview URLs

Happy coding! 🚀
