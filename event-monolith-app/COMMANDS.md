# 🔧 Complete Command Reference

All commands needed to run the Event Management API.

## 📍 Prerequisites

- Node.js 18+ installed
- npm installed
- PostgreSQL running (or Neon account)

## 🚀 Setup Commands

### 1. Navigate to Project
```bash
cd event-monolith-app
```

### 2. Install Dependencies
```bash
npm install
```

**Expected Output:**
```
added XXX packages in XXs
```

### 3. Setup Environment
```bash
cp .env.example .env
```

Then edit `.env` with your database URL:
```bash
# On Windows (Notepad)
notepad .env

# On macOS (VS Code)
code .env

# On Linux (nano) 
nano .env
```

### 4. Generate Prisma Client
```bash
npm run prisma:generate
```

**Expected Output:**
```
✔ Generated Prisma Client (X.X.X) to ./node_modules/@prisma/client in XXms
```

### 5. Run Database Migrations
```bash
npm run prisma:migrate
```

**Expected Output:**
```
✔ Your database is now in sync with your schema.
```

---

## 🎯 Development Commands

### Start Development Server (with hot reload)
```bash
npm run dev
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║         🎉 Event Management API Started                    ║
╠════════════════════════════════════════════════════════════╣
║ 🚀 Server running at: http://localhost:3000
║ 📚 Swagger docs: http://localhost:3000/swagger
║ 🔌 WebSocket: ws://localhost:3000/ws
║ 💚 Health check: http://localhost:3000/health
╚════════════════════════════════════════════════════════════╝
```

### Build for Production
```bash
npm run build
```

**Expected Output:**
```
✔ Compiled successfully
```

### Start Production Server
```bash
npm start
```

---

## 🧪 Testing Commands

### Health Check
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

### Signup (Create Admin)
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

### Signup (Create Organizer)
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@example.com",
    "password": "organizer123",
    "role": "ORGANIZER"
  }'
```

### Signup (Create Attendee)
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "attendee@example.com",
    "password": "attendee123",
    "role": "ATTENDEE"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Create Event (save TOKEN from login response)
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

### Get Events
```bash
curl -X GET http://localhost:3000/events \
  -H "Authorization: Bearer TOKEN"
```

### Approve Event (save EVENT_ID from create response)
```bash
curl -X PUT http://localhost:3000/events/EVENT_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### RSVP to Event
```bash
curl -X POST http://localhost:3000/events/EVENT_ID/rsvp \
  -H "Authorization: Bearer ATTENDEE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "GOING"}'
```

### Get Event RSVPs
```bash
curl -X GET http://localhost:3000/events/EVENT_ID/rsvps \
  -H "Authorization: Bearer ORGANIZER_TOKEN"
```

### Get User's RSVPs
```bash
curl -X GET http://localhost:3000/my-rsvps \
  -H "Authorization: Bearer ATTENDEE_TOKEN"
```

---

## 📊 Prisma Commands

### Generate Prisma Client
```bash
npm run prisma:generate
```

### Run Migrations
```bash
npm run prisma:migrate
```

### Open Prisma Studio (Database GUI)
```bash
npx prisma studio --schema=src/prisma/schema.prisma
```

### Reset Database (WARNING: Deletes all data)
```bash
npx prisma migrate reset --schema=src/prisma/schema.prisma
```

### View Database Schema
```bash
npx prisma db pull --schema=src/prisma/schema.prisma
```

---

## 🌐 Browser Commands

### Open Swagger Documentation
```bash
# macOS
open http://localhost:3000/swagger

# Windows
start http://localhost:3000/swagger

# Linux
xdg-open http://localhost:3000/swagger
```

### Open WebSocket Demo
```bash
# macOS
open http://localhost:3000/public/index.html

# Windows
start http://localhost:3000/public/index.html

# Linux
xdg-open http://localhost:3000/public/index.html
```

### Open Health Check
```bash
# macOS
open http://localhost:3000/health

# Windows
start http://localhost:3000/health

# Linux
xdg-open http://localhost:3000/health
```

---

## 🔌 WebSocket Commands

### Using websocat (CLI)
```bash
# Install websocat first
# macOS: brew install websocat
# Linux: cargo install websocat
# Windows: choco install websocat

# Connect to WebSocket
websocat ws://localhost:3000/ws
```

### Using Node.js
```bash
node -e "
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', e.data);
"
```

---

## 🚀 Deployment Commands

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Render
```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Connect to Render (via web interface)
# 3. Set environment variables
# 4. Deploy!
```

---

## 🧹 Cleanup Commands

### Remove node_modules
```bash
rm -rf node_modules
```

### Remove build output
```bash
rm -rf dist
```

### Remove Prisma cache
```bash
rm -rf .prisma
```

### Clean reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🐛 Troubleshooting Commands

### Check if port 3000 is in use
```bash
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

### Kill process on port 3000
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
taskkill /PID <PID> /F
```

### Test database connection
```bash
# Replace with your DATABASE_URL
psql "postgresql://user:password@host:5432/event_db"
```

### Check Node version
```bash
node --version
```

### Check npm version
```bash
npm --version
```

### Clear npm cache
```bash
npm cache clean --force
```

---

## 📋 Complete Setup Workflow

```bash
# 1. Navigate to project
cd event-monolith-app

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your database URL

# 4. Initialize database
npm run prisma:generate
npm run prisma:migrate

# 5. Start development server
npm run dev

# 6. In another terminal, test the API
curl http://localhost:3000/health

# 7. Open in browser
# - Swagger: http://localhost:3000/swagger
# - WebSocket Demo: http://localhost:3000/public/index.html
```

---

## 🎯 Quick Test Workflow

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Run tests
# Signup
TOKEN=$(curl -s -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"ORGANIZER"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Create event
EVENT_ID=$(curl -s -X POST http://localhost:3000/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","date":"2024-12-15T10:00:00Z","location":"SF"}' \
  | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# Get events
curl -X GET http://localhost:3000/events \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Documentation Commands

### View README
```bash
# macOS
open README.md

# Windows
start README.md

# Linux
cat README.md
```

### View Quick Start
```bash
# macOS
open QUICKSTART.md

# Windows
start QUICKSTART.md

# Linux
cat QUICKSTART.md
```

---

## 🔑 Environment Setup

### Create .env file
```bash
cp .env.example .env
```

### Edit .env (choose one)
```bash
# VS Code
code .env

# Nano
nano .env

# Vim
vim .env

# Notepad (Windows)
notepad .env
```

### Verify .env
```bash
cat .env
```

---

## ✅ Verification Checklist

```bash
# 1. Check Node version
node --version  # Should be 18+

# 2. Check npm version
npm --version

# 3. Check dependencies installed
npm list elysia prisma

# 4. Check .env file exists
ls -la .env

# 5. Check database connection
psql $DATABASE_URL -c "SELECT 1"

# 6. Check Prisma client generated
ls -la node_modules/@prisma/client

# 7. Start server
npm run dev

# 8. Health check
curl http://localhost:3000/health
```

---

## 🎉 Success!

If all commands execute successfully, your Event Management API is ready to use!

**Next Steps:**
1. Read START_HERE.md
2. Follow QUICKSTART.md
3. Test endpoints with INSOMNIA_EXAMPLES.md
4. Deploy to Render

---

## 📞 Command Help

### Get help for npm scripts
```bash
npm run
```

### Get help for Prisma
```bash
npx prisma --help
```

### Get help for Elysia
```bash
npm info elysia
```

---

## 💾 Backup Commands

### Backup database
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore database
```bash
psql $DATABASE_URL < backup.sql
```

### Export Prisma schema
```bash
npx prisma db pull --schema=src/prisma/schema.prisma
```

---

## 🚀 Ready to Go!

All commands are ready to use. Start with:

```bash
cd event-monolith-app
npm install
npm run dev
```

Then open: `http://localhost:3000/swagger`

**Happy coding!** 🎉
