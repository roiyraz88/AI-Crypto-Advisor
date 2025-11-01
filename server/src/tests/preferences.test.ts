import request from "supertest";
import mongoose from "mongoose";
import type { Express } from "express";
import { createApp } from "../app";
import { User } from "../models/User";
import { Preferences } from "../models/Preferences";
import { generateToken } from "../utils/jwt";

describe("Preferences", () => {
  let app: Express;
  let testUser: InstanceType<typeof User>;
  let authToken: string;

  beforeAll(async () => {
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/test";
    await mongoose.connect(mongoURI);
    app = createApp();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Preferences.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Preferences.deleteMany({});

    // Create test user
    testUser = new User({
      email: "prefs@example.com",
      password: "hashedpassword",
      name: "Prefs User",
    });
    await testUser.save();

    authToken = generateToken(testUser._id.toString());
  });

  describe("POST /preferences", () => {
    it("should save preferences successfully", async () => {
      const response = await request(app)
        .post("/preferences")
        .set("Cookie", `token=${authToken}`)
        .send({
          experienceLevel: "intermediate",
          riskTolerance: "moderate",
          investmentGoals: ["long-term", "trading"],
          favoriteCryptos: ["bitcoin", "ethereum"],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.preferences.experienceLevel).toBe("intermediate");
      expect(response.body.data.preferences.riskTolerance).toBe("moderate");
      expect(response.body.data.preferences.investmentGoals).toHaveLength(2);
      expect(response.body.data.preferences.favoriteCryptos).toHaveLength(2);
    });

    it("should return 400 for invalid experience level", async () => {
      const response = await request(app)
        .post("/preferences")
        .set("Cookie", `token=${authToken}`)
        .send({
          experienceLevel: "expert",
          riskTolerance: "moderate",
          investmentGoals: ["long-term"],
          favoriteCryptos: ["bitcoin"],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).post("/preferences").send({
        experienceLevel: "beginner",
        riskTolerance: "low",
        investmentGoals: ["long-term"],
        favoriteCryptos: ["bitcoin"],
      });

      expect(response.status).toBe(401);
    });

    it("should update existing preferences", async () => {
      // Save preferences first
      await request(app)
        .post("/preferences")
        .set("Cookie", `token=${authToken}`)
        .send({
          experienceLevel: "beginner",
          riskTolerance: "low",
          investmentGoals: ["long-term"],
          favoriteCryptos: ["bitcoin"],
        });

      // Update preferences
      const response = await request(app)
        .post("/preferences")
        .set("Cookie", `token=${authToken}`)
        .send({
          experienceLevel: "advanced",
          riskTolerance: "high",
          investmentGoals: ["trading"],
          favoriteCryptos: ["ethereum", "solana"],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.preferences.experienceLevel).toBe("advanced");
      expect(response.body.data.preferences.riskTolerance).toBe("high");
    });
  });
});

