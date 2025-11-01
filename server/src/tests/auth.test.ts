import request from "supertest";
import mongoose from "mongoose";
import type { Express } from "express";
import { createApp } from "../app";
import { User } from "../models/User";

describe("Authentication", () => {
  let app: Express;

  beforeAll(async () => {
    // Connect to test database
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/test";
    await mongoose.connect(mongoURI);
    app = createApp();
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.user.email).toBe("test@example.com");
      expect(response.body.data.user.name).toBe("Test User");
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.headers["set-cookie"]?.[0]).toContain("token");
    });

    it("should return 400 for invalid email", async () => {
      const response = await request(app).post("/auth/register").send({
        email: "invalid-email",
        password: "password123",
        name: "Test User",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it("should return 400 for short password", async () => {
      const response = await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "123",
        name: "Test User",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for duplicate email", async () => {
      // Create user first
      await request(app).post("/auth/register").send({
        email: "duplicate@example.com",
        password: "password123",
        name: "First User",
      });

      // Try to register again with same email
      const response = await request(app).post("/auth/register").send({
        email: "duplicate@example.com",
        password: "password123",
        name: "Second User",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain("already exists");
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post("/auth/register").send({
        email: "login@example.com",
        password: "password123",
        name: "Login User",
      });
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("login@example.com");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should return 401 for invalid email", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 for invalid password", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /auth/logout", () => {
    it("should logout successfully", async () => {
      const response = await request(app).post("/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.headers["set-cookie"]).toBeDefined();
    });
  });
});

