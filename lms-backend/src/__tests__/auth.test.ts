import request from "supertest";
import app from "../app";
import { User } from "../models/user.model";

describe("Auth Routes", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should register a new borrower successfully", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        fullName: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.user.role).toBe("Borrower");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should fail if required fields are missing", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        email: "test2@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("All fields are required");
    });

    it("should fail if email is already in use", async () => {
      await User.create({
        fullName: "Existing",
        email: "existing@example.com",
        password: "hashedpassword",
        role: "Borrower",
      });

      const response = await request(app).post("/api/v1/auth/register").send({
        fullName: "New User",
        email: "existing@example.com",
        password: "password123",
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("User with this email already exists");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      // Create user using the API to ensure password hashing works properly
      await request(app).post("/api/v1/auth/register").send({
        fullName: "Login User",
        email: "login@example.com",
        password: "password123",
      });
    });

    it("should login successfully with correct credentials", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User logged in successfully");
      expect(response.body).toHaveProperty("accessToken");
    });

    it("should fail with invalid password", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid user credentials");
    });

    it("should fail with unregistered email", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "notfound@example.com",
        password: "password123",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User does not exist");
    });
  });
});
