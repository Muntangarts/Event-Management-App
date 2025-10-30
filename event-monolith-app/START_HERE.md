# 🚀 START HERE - Event Management API

Welcome! This guide will get you up and running in minutes.

## 📍 You Are Here

You have a complete, production-ready Event Management API project. All files are created and ready to use.

## ⚡ 5-Minute Quick Start

### Step 1: Install Dependencies
```bash
cd event-monolith-app
npm install
```

### Step 2: Setup Environment
```bash
cp .env.example .env
```

Edit `.env` and add your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://user:password@host:5432/event_db?sslmode=require"
JWT_SECRET="your_secret_key_here"
```

### Step 3: Initialize Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

### Step 4: Start Server
```bash
npm run dev
```

### Step 5: Test It
Open in browser: `http://localhost:3000/swagger`

**Done!** Your API is running. 🎉

---

## 📚 Documentation Guide

Choose your next step:

### 🏃 I want to get started quickly
→ Read **QUICKSTART.md** (5 minutes)

### 🧪 I want to test all endpoints
→ Read **TESTING.md** (comprehensive test guide)

### 📋 I want step-by-step verification
→ Read **EXECUTION_CHECKLIST.md** (detailed checklist)

### 📖 I want complete API documentation
→ Read **README.md** (full documentation)

### 💻 I want copy-paste API examples
→ Read **INSOMNIA_EXAMPLES.md** (Insomnia/Postman examples)

### 🏗️ I want to understand the architecture
→ Read **PROJECT_SUMMARY.md** (design overview)

### 📁 I want to know all files
→ Read **FILES_MANIFEST.md** (file listing)

---

## 🎯 Common Tasks

### Test Authentication
```bash
# Signup
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "ORGANIZER"
  }'

# Save the returned token as TOKEN

# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create an Event
```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Event",
    "description": "Event description",
    "date": "2024-12-15T10:00:00Z",
    "location": "San Francisco"
  }'
```

### View API Documentation
Open: `http://localhost:3000/swagger`

### Test WebSocket
Open: `http://localhost:3000/public/index.html`

---

## 🔑 Key Features

✅ **User Authentication** - Signup, login, JWT tokens  
✅ **Role-Based Access** - ADMIN, ORGANIZER, ATTENDEE  
✅ **Event Management** - Create, update, delete, approve events  
✅ **RSVP System** - Attendees can RSVP with status tracking  
✅ **Real-time Updates** - WebSocket for live notifications  
✅ **Email Notifications** - Welcome and approval emails  
✅ **API Documentation** - Swagger/OpenAPI at `/swagger`  
✅ **Type Safety** - Full TypeScript implementation  

---

## 📊 Project Structure

```
event-monolith-app/
├── src/
│   ├── controllers/      # Business logic
│   ├── routes/          # HTTP endpoints
│   ├── middleware/      # Auth & authorization
│   ├── services/        # Email & WebSocket
│   ├── utils/           # JWT utilities
│   ├── prisma/          # Database schema
│   └── index.ts         # Main app
├── public/              # WebSocket demo
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── .env.example         # Environment template
├── render.yaml          # Deployment config
└── README.md            # Full documentation
```

---

## 🧪 Testing Workflow

### 1. Create Test Users
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

### 5. View Real-time Updates
Open: `http://localhost:3000/public/index.html`

---

## 🌐 API Endpoints

### Authentication
- `POST /signup` - Register user
- `POST /login` - Authenticate user

### Events
- `GET /events` - List approved events
- `POST /events` - Create event (ORGANIZER/ADMIN)
- `PUT /events/:id` - Update event (owner/ADMIN)
- `DELETE /events/:id` - Delete event (owner/ADMIN)
- `PUT /events/:id/approve` - Approve event (ADMIN)

### RSVP
- `POST /events/:id/rsvp` - RSVP to event
- `GET /events/:id/rsvps` - Get event RSVPs
- `GET /my-rsvps` - Get user's RSVPs

### WebSocket
- `ws://localhost:3000/ws` - Real-time updates

### Documentation
- `GET /swagger` - API documentation
- `GET /health` - Health check

---

## 🔐 Environment Variables

Create `.env` file with:

```env
# Database (Neon PostgreSQL recommended)
DATABASE_URL="postgresql://user:password@host:5432/event_db?sslmode=require"

# JWT Secret (use strong random string)
JWT_SECRET="your_super_secret_jwt_key_change_in_production"

# Email (Ethereal for testing - optional)
ETHEREAL_USER="your_ethereal_email@ethereal.email"
ETHEREAL_PASS="your_ethereal_password"

# Server
PORT=3000
NODE_ENV="development"
```

---

## 🚀 Build & Deploy

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Render
1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy!

See `render.yaml` for configuration.

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error
- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running
- Test connection: `psql "postgresql://..."`

### Prisma Migration Failed
```bash
npm run prisma:migrate
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Need Help?

1. **Quick Setup**: See QUICKSTART.md
2. **Step-by-Step**: See EXECUTION_CHECKLIST.md
3. **API Docs**: See README.md
4. **Testing**: See TESTING.md
5. **Examples**: See INSOMNIA_EXAMPLES.md
6. **Architecture**: See PROJECT_SUMMARY.md
7. **Files**: See FILES_MANIFEST.md

---

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment configured (`.env` file)
- [ ] Database initialized (`npm run prisma:migrate`)
- [ ] Server running (`npm run dev`)
- [ ] Health check passes (`http://localhost:3000/health`)
- [ ] Swagger docs accessible (`http://localhost:3000/swagger`)
- [ ] Signup works (`POST /signup`)
- [ ] Login works (`POST /login`)
- [ ] Create event works (`POST /events`)
- [ ] WebSocket connects (`ws://localhost:3000/ws`)

---

## 🎉 You're Ready!

Your Event Management API is complete and ready to use.

### Next Steps

1. **Explore the API**
   - Open Swagger: `http://localhost:3000/swagger`
   - Test endpoints with cURL or Insomnia

2. **Understand the Code**
   - Read PROJECT_SUMMARY.md for architecture
   - Review source files in `src/`

3. **Run Tests**
   - Follow TESTING.md for comprehensive tests
   - Use INSOMNIA_EXAMPLES.md for request examples

4. **Deploy**
   - Follow README.md deployment section
   - Use render.yaml for Render deployment

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **START_HERE.md** | This file - quick orientation |
| **QUICKSTART.md** | 5-minute setup guide |
| **README.md** | Complete API documentation |
| **EXECUTION_CHECKLIST.md** | Step-by-step verification |
| **TESTING.md** | Comprehensive testing guide |
| **INSOMNIA_EXAMPLES.md** | API request examples |
| **PROJECT_SUMMARY.md** | Architecture overview |
| **FILES_MANIFEST.md** | File listing |

---

## 🎯 Common Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations

# Utilities
npx prisma studio       # Open Prisma Studio (database GUI)
```

---

## 💡 Pro Tips

1. **Use Swagger** for interactive API testing
2. **Open WebSocket demo** in multiple tabs to see real-time updates
3. **Check console logs** for email preview URLs
4. **Use Insomnia/Postman** for complex testing workflows
5. **Read TESTING.md** for comprehensive test scenarios

---

## 🚀 Ready to Code!

Everything is set up and ready to go. Start with QUICKSTART.md or dive into the code!

**Happy coding!** 🎉
