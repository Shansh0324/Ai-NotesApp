# Notes App — Backend API

Production-ready RESTful Notes API built with **Node.js**, **Express**, and **MongoDB** featuring JWT authentication and user-scoped notes.

## 📁 Folder Structure

```
Backend/
├── config/
│   └── db.js              # MongoDB connection setup
├── controllers/
│   ├── authController.js   # Signup, login, getMe
│   └── noteController.js   # CRUD operations for notes
├── middleware/
│   ├── auth.js             # JWT authentication guard
│   ├── errorHandler.js     # Centralized error handler
│   └── validate.js         # Request body validation
├── models/
│   ├── Note.js             # Note schema
│   └── User.js             # User schema with bcrypt
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   └── noteRoutes.js       # Notes CRUD endpoints
├── utils/
│   ├── AppError.js         # Custom error class
│   └── asyncHandler.js     # Async error wrapper
├── .env                    # Environment variables (secret)
├── .env.example            # Env template for sharing
├── .gitignore
├── app.js                  # Express app configuration
├── package.json
├── README.md
└── server.js               # Entry point — starts server
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** v16+
- **MongoDB** (local or Atlas)

### Installation

```bash
cd Backend
npm install
```

### Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable     | Description                    | Default       |
|-------------|-------------------------------|---------------|
| `PORT`       | Server port                    | `5000`        |
| `MONGO_URI`  | MongoDB connection string      | —             |
| `JWT_SECRET` | Secret key for JWT signing     | —             |
| `JWT_EXPIRE` | Token expiry duration          | `30d`         |
| `NODE_ENV`   | Environment (development/prod) | `development` |

### Run the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Auth

| Method | Endpoint          | Description       | Auth |
|--------|------------------|--------------------|------|
| POST   | `/api/auth/signup` | Register a user   | ❌   |
| POST   | `/api/auth/login`  | Login & get token | ❌   |
| GET    | `/api/auth/me`     | Get current user  | ✅   |

### Notes (all require `Authorization: Bearer <token>`)

| Method | Endpoint           | Description       |
|--------|-------------------|--------------------|
| POST   | `/api/notes`       | Create a note      |
| GET    | `/api/notes`       | Get all user notes |
| GET    | `/api/notes/:id`   | Get single note    |
| PUT    | `/api/notes/:id`   | Update a note      |
| DELETE | `/api/notes/:id`   | Delete a note      |

## 📝 Example Requests

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com", "password": "123456"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "123456"}'
```

### Create Note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{"title": "My First Note", "content": "Hello World!"}'
```

### Get All Notes
```bash
curl http://localhost:5000/api/notes \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```
