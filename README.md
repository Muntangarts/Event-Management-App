# 🎉 Event Management System

A full-stack event management platform with real-time updates, role-based access control, and AI-powered recommendations.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [AI Assistant](#ai-assistant)
- [Contributing](#contributing)

---

## 🌟 Overview

This is a comprehensive event management system that allows users to create, manage, and RSVP to events. The system includes admin approval workflows, real-time notifications via WebSocket, and an AI-powered assistant for personalized event recommendations.

**Key Capabilities:**
- ✅ User authentication with JWT
- ✅ Role-based access control (Admin, Organizer, Attendee)
- ✅ Event creation and management
- ✅ Admin approval workflow
- ✅ RSVP system with multiple status options
- ✅ Real-time updates via WebSocket
- ✅ AI-powered event suggestions
- ✅ Interactive AI chat assistant
- ✅ Email notifications

---

## ✨ Features

### For Attendees
- 📅 Browse approved events
- 👍 RSVP to events (Going, Maybe, Not Going)
- 📊 View personal RSVP history
- 🤖 Get AI-powered event recommendations
- 💬 Chat with AI assistant for help

### For Organizers
- ➕ Create new events
- ✏️ Edit own events
- 🗑️ Delete own events
- 📧 Receive approval notifications
- 📈 View event RSVPs

### For Admins
- ✔️ Approve/reject pending events
- 🔧 Manage all events
- 👥 Full system oversight
- 📋 View all events (approved and pending)

---

## 🏗️ Architecture

The system follows a **monolithic architecture** with clear separation of concerns:

**📖 Detailed Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md) for comprehensive system design and data flow documentation.

**🎨 Visual Diagram**: See [finalballdrawio.png](finalballdrawio.png) for the complete architecture diagram.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: CSS3 with custom design system
- **State Management**: React Hooks
- **Real-time**: WebSocket client

### Backend
- **Runtime**: Node.js
- **Framework**: Elysia.js (modern TypeScript framework)
- **Language**: TypeScript
- **API Documentation**: Swagger/OpenAPI
- **CORS**: @elysiajs/cors

### Database
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Migrations**: Prisma Migrate

### Authentication & Security
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Middleware**: Custom JWT validation

### External Services
- **AI**: OpenAI GPT-3.5-turbo
- **Email**: Nodemailer + Ethereal (testing)
- **Real-time**: WebSocket

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- OpenAI API key (for AI features)

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd Monolith-app
```

#### 2. Backend Setup
```bash
cd event-monolith-app

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your credentials:
# - DATABASE_URL
# - JWT_SECRET
# - OPENAI_API_KEY
# - ETHEREAL_USER & ETHEREAL_PASS

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

Backend will run on: **http://localhost:3000**

#### 3. Frontend Setup
```bash
cd ../event-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET="your-secret-key-here"
ETHEREAL_USER="your-ethereal-email"
ETHEREAL_PASS="your-ethereal-password"
PORT=3000
OPENAI_API_KEY="sk-your-openai-key"
```

---

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:3000/swagger
- **Health Check**: http://localhost:3000/health

### Quick API Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Register new user |
| `/api/auth/login` | POST | No | Login user |
| `/api/events` | GET | Yes | Get approved events |
| `/api/events/all` | GET | Admin | Get all events |
| `/api/events` | POST | Organizer/Admin | Create event |
| `/api/events/:id` | PUT | Owner/Admin | Update event |
| `/api/events/:id` | DELETE | Owner/Admin | Delete event |
| `/api/events/:id/approve` | PUT | Admin | Approve event |
| `/api/events/:id/rsvp` | POST | Yes | RSVP to event |
| `/api/my-rsvps` | GET | Yes | Get user RSVPs |
| `/api/ai/suggestions` | GET | Yes | Get AI suggestions |
| `/api/ai/chat` | POST | Yes | Chat with AI |

---

## 📁 Project Structure

```
Monolith-app/
├── event-monolith-app/          # Backend
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── event.controller.ts
│   │   │   └── rsvp.controller.ts
│   │   ├── routes/              # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── event.routes.ts
│   │   │   └── ai.routes.ts
│   │   ├── services/            # External services
│   │   │   ├── ai.service.ts
│   │   │   ├── email.service.ts
│   │   │   └── websocket.service.ts
│   │   ├── middleware/          # Request middleware
│   │   │   └── auth.middleware.ts
│   │   ├── utils/               # Utilities
│   │   │   └── jwt.utils.ts
│   │   ├── prisma/              # Database
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── index.ts             # Server entry point
│   ├── package.json
│   └── .env
│
├── event-frontend/              # Frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Login.jsx
│   │   │   ├── EventList.jsx
│   │   │   ├── CreateEvent.jsx
│   │   │   ├── MyRsvps.jsx
│   │   │   └── AiAssistant.jsx
│   │   ├── hooks/               # Custom hooks
│   │   │   └── useWebSocket.js
│   │   ├── App.jsx              # Main component
│   │   ├── App.css              # Styles
│   │   └── main.jsx             # Entry point
│   └── package.json
│
├── finalballdrawio.png          # Architecture diagram
├── ARCHITECTURE.md              # Detailed architecture docs
└── README.md                    # This file
```

---

## 👥 User Roles

### ADMIN
- Approve/reject events
- Manage all events (edit, delete)
- View pending and approved events
- Full system access

### ORGANIZER
- Create new events
- Edit own events
- Delete own events
- View all approved events
- RSVP to events

### ATTENDEE (Default)
- View approved events
- RSVP to events
- View own RSVPs
- Get AI recommendations

---

## 🤖 AI Assistant

The system includes an intelligent AI assistant powered by OpenAI GPT-3.5-turbo.

### Features
1. **Personalized Event Suggestions**
   - Analyzes user's RSVP history
   - Recommends events based on preferences
   - Explains recommendations

2. **Interactive Chat**
   - Answers questions about events
   - Helps navigate the platform
   - Context-aware responses

### How It Works
```
User's RSVP History → AI Analysis → Personalized Recommendations
                            ↓
                    OpenAI GPT-3.5-turbo
                            ↓
                Event Matching & Suggestions
```

### Usage
1. Click the "🤖 AI Assistant" button
2. Choose "Suggestions" tab for recommendations
3. Choose "Chat" tab to ask questions

**Example questions:**
- "What events are happening soon?"
- "Suggest events for me"
- "How do I RSVP to an event?"

---

## 🔄 Real-time Updates

The application uses WebSocket for live updates:

### Events Broadcasted
- `EVENT_CREATED` - New event added
- `EVENT_UPDATED` - Event modified  
- `EVENT_APPROVED` - Event approved
- `EVENT_DELETED` - Event removed
- `RSVP_CREATED` - New RSVP
- `RSVP_UPDATED` - RSVP status changed

All connected clients receive updates instantly without page refresh.

---

## 🔐 Security

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention (Prisma ORM)

---

## 🧪 Testing

### Backend API Testing
```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"ATTENDEE"}'
```

### Using Swagger UI
Visit http://localhost:3000/swagger to test all endpoints interactively.

---

## 📧 Email Notifications

Event approval notifications are sent via email when:
- Admin approves an event
- Organizer receives notification

**Email Provider**: Ethereal (for development/testing)

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Run migrations: `npm run prisma:migrate`

### AI Assistant Not Working
- Verify OPENAI_API_KEY is set in .env
- Check server logs for error details
- Ensure you have OpenAI API credits

---

## 📈 Future Roadmap

- [ ] Event categories and tags
- [ ] Advanced search and filtering
- [ ] Calendar view integration
- [ ] Email reminders
- [ ] Social media sharing
- [ ] Event capacity limits
- [ ] Payment integration
- [ ] Multi-language support
- [ ] Mobile app

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

For issues or questions:
1. Check the [Architecture Documentation](ARCHITECTURE.md)
2. Review the API documentation at http://localhost:3000/swagger
3. Use the AI Assistant in the application
4. Contact support

---

## 🙏 Acknowledgments

- **Elysia.js** - Modern TypeScript framework
- **Prisma** - Next-generation ORM
- **OpenAI** - AI-powered features
- **React** - UI framework
- **Vite** - Build tool

---

**Built with ❤️ Mr. Muntanga using modern web technologies**

*For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md)*  
*For visual system design, see [finalballdrawio.png](finalballdrawio.png)*
