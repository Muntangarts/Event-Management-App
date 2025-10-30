# Quick Start Guide

Get the Event Management API running in 5 minutes.

## 🚀 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` and add your database URL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/event_db?sslmode=require"
JWT_SECRET="your_secret_key_here"
ETHEREAL_USER="your_ethereal_email@ethereal.email"
ETHEREAL_PASS="your_ethereal_password"
PORT=3000
```

### 3. Initialize Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

The API is now running at `http://localhost:3000`

---

## 📚 API Documentation

- **Swagger Docs**: http://localhost:3000/swagger
- **Health Check**: http://localhost:3000/health
- **WebSocket**: ws://localhost:3000/ws

---

## 🧪 Quick Test

### 1. Signup
```bash
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "ORGANIZER"
  }'
```

Save the returned `token`.

### 2. Create Event
```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Event",
    "description": "Event description",
    "date": "2024-12-15T10:00:00Z",
    "location": "San Francisco"
  }'
```

### 3. Get Events
```bash
curl -X GET http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔌 WebSocket Demo

Open `http://localhost:3000/public/index.html` in your browser to see real-time updates.

---

## 📖 Full Documentation

See [README.md](./README.md) for complete API documentation and [TESTING.md](./TESTING.md) for detailed testing guide.

---

## 🆘 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run `npm run prisma:migrate` to create tables

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process: `lsof -ti:3000 | xargs kill -9`

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

## 🌐 Deploy to Render

1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy!

See [README.md](./README.md) for detailed deployment instructions.
