# Tecspacs Backend API

A comprehensive backend API for the Tecspacs snippet/package manager platform, featuring Auth0 authentication, MongoDB database, and Google Gemini AI integration.

## 🚀 Features

### Authentication & Security
- **Auth0 JWT Authentication** - Secure user authentication with JWT tokens
- **Protected Routes** - Middleware for securing sensitive endpoints
- **User Management** - Complete user profile management system

### Database & Models
- **MongoDB with Mongoose** - Robust database with proper schemas
- **User Model** - Complete user profiles with Auth0 integration
- **Tec Model** - Technical snippets with rich metadata
- **Pac Model** - Code packages with dependencies and files

### AI Integration
- **Google Gemini AI** - AI-powered code analysis and improvement
- **Code Summarization** - Automatic code snippet summaries
- **Code Improvement** - AI suggestions for code optimization

### API Endpoints
- **RESTful Design** - Clean, consistent API structure
- **CRUD Operations** - Full Create, Read, Update, Delete functionality
- **Pagination & Filtering** - Efficient data retrieval
- **Error Handling** - Comprehensive error responses

## 📁 Project Structure

```
backend/
├── controllers/          # Business logic handlers
│   ├── tecController.js  # Tec (snippet) operations
│   ├── pacController.js  # Pac (package) operations
│   └── userController.js # User management
├── middleware/           # Express middleware
│   ├── auth.js          # Auth0 JWT verification
│   └── errorHandler.js  # Error handling middleware
├── models/              # MongoDB schemas
│   ├── Tec.js          # Tec model
│   ├── Pac.js          # Pac model
│   └── User.js         # User model
├── routes/              # API route definitions
│   ├── tecs.js         # Tec endpoints
│   ├── pacs.js         # Pac endpoints
│   └── users.js        # User endpoints
├── utils/               # Utility functions
│   ├── objectIdValidation.js
│   └── errorHandler.js
├── index.js            # Main server file
├── package.json        # Dependencies
└── env.example         # Environment variables template
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `env.example` to `.env` and configure:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/tecspacs

# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier

# Google Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### User Management
- `GET /api/users/me` - Get current user profile (Protected)
- `POST /api/users/profile` - Create user profile (Protected)

### Tecs (Snippets)
- `GET /api/tecs` - Get all tecs (Public)
- `POST /api/tecs` - Create new tec (Protected)
- `GET /api/tecs/:id` - Get tec by ID (Public)
- `DELETE /api/tecs/:id` - Delete tec (Protected)
- `POST /api/tecs/:id/summarize` - AI summarize tec (Protected)
- `POST /api/tecs/:id/improve` - AI improve tec (Protected)

### Pacs (Packages)
- `GET /api/pacs` - Get all pacs (Public)
- `POST /api/pacs` - Create new pac (Protected)
- `GET /api/pacs/:id` - Get pac by ID (Public)
- `DELETE /api/pacs/:id` - Delete pac (Protected)
- `POST /api/pacs/:id/summarize` - AI summarize pac (Protected)

## 🔐 Authentication

All protected endpoints require a valid Auth0 JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🤖 AI Features

### Code Summarization
Automatically generates concise summaries of code snippets and packages using Google Gemini AI.

### Code Improvement
Provides AI-powered suggestions for code optimization, including:
- Performance improvements
- Best practices
- Security considerations
- Code readability
- Modern alternatives

## 🧪 Testing

The API includes comprehensive error handling and validation:
- ObjectId validation for MongoDB queries
- Proper HTTP status codes
- Detailed error messages
- Input validation

## 🔧 Development

### Key Technologies
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Auth0** - Authentication service
- **Google Gemini AI** - AI integration
- **CORS** - Cross-origin resource sharing

### Code Quality
- Modular architecture
- Separation of concerns
- Comprehensive error handling
- Input validation
- Proper HTTP status codes

## 📝 Notes

- All timestamps are automatically managed by Mongoose
- User profiles are auto-created on first authentication
- AI features require a valid Gemini API key
- Protected routes require valid Auth0 JWT tokens
- Database connection is required for all operations

## 🚀 Deployment

The backend is production-ready with:
- Environment-based configuration
- Proper error handling
- Security middleware
- CORS support
- Health check endpoints 