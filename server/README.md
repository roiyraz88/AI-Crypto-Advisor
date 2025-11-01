# AI Crypto Advisor - Backend

Backend server for the AI Crypto Advisor application built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HTTP-Only Cookies
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Environment**: dotenv

## 📂 Project Structure

```
server/
├── src/
│   ├── config/        # Database & environment configuration
│   ├── controllers/   # Business logic controllers
│   ├── routes/        # Route definitions
│   ├── models/        # Mongoose schemas
│   ├── middleware/    # Authentication, error handling
│   ├── services/      # External API services
│   ├── utils/         # Helper functions (JWT, hashing)
│   ├── tests/         # Jest integration tests
│   ├── app.ts         # Express app configuration
│   └── index.ts       # Server entry point
├── .env.example       # Environment variables template
├── package.json
├── tsconfig.json      # TypeScript configuration
├── jest.config.ts     # Jest configuration
├── request.rest       # API request examples
└── README.md
```

## 🛠️ Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your configuration values.

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

5. **Run tests**:
   ```bash
   npm test
   npm run test:watch
   npm run test:coverage
   ```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Create new user
- `POST /auth/login` - Login, sets JWT cookie
- `POST /auth/logout` - Clear cookie

### User
- `GET /me` - Get current user info (protected)

### Onboarding
- `POST /preferences` - Save onboarding answers (protected)

### Dashboard
- `GET /dashboard` - Get personalized dashboard (protected)

### Voting
- `POST /vote` - Save thumbs up/down vote (protected)

### Health Check
- `GET /health` - Server health check

## 🔐 Authentication

The API uses JWT authentication stored in HTTP-Only cookies. Protected routes require a valid JWT token in the cookie.

## 🧪 Testing

Tests are located in `src/tests/` and use Jest + Supertest for integration testing.

## 📝 Environment Variables

See `.env.example` for required environment variables:

- `PORT` - Server port
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `CLIENT_URL` - Frontend URL for CORS
- `OPENROUTER_API_KEY` - OpenRouter API key for AI
- `CRYPTOPANIC_API_KEY` - CryptoPanic API key

## 📚 API Documentation

See `request.rest` for sample API requests that can be used with REST Client extensions.

