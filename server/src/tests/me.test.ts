import request from "supertest";
import mongoose from "mongoose";
import type { Express } from "express";
import { createApp } from "../app";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";

describe("GET /me", () => {
  let app: Express;

  beforeAll(async () => {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/test";
    await mongoose.connect(mongoURI);
    app = createApp();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("should return user info with valid token", async () => {
    // Create a test user
    const user = new User({
      email: "me@example.com",
      password: "hashedpassword",
      name: "Me User",
    });
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    // Make request with token
    const response = await request(app)
      .get("/me")
      .set("Cookie", `token=${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toHaveProperty("id");
    expect(response.body.data.user.email).toBe("me@example.com");
    expect(response.body.data.user.name).toBe("Me User");
  });

  it("should return 401 without token", async () => {
    const response = await request(app).get("/me");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBe("Authentication required");
  });

  it("should return 401 with invalid token", async () => {
    const response = await request(app)
      .get("/me")
      .set("Cookie", "token=invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
