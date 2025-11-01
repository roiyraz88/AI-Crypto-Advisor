import request from "supertest";
import { createApp } from "../app";

describe("Health Check", () => {
  const app = createApp();

  it("should return 200 and status ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("message", "Server is running");
    expect(response.body).toHaveProperty("timestamp");
  });
});

