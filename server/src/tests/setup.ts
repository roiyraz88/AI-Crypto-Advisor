/**
 * Jest test setup file
 * Runs before all tests
 */

// Setup test environment variables
process.env.NODE_ENV = "test";
process.env.PORT = "5001";
process.env.MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "test-refresh-secret";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
process.env.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "test-key";
process.env.CRYPTOPANIC_API_KEY =
  process.env.CRYPTOPANIC_API_KEY || "test-key";

