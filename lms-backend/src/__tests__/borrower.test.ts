import request from "supertest";
import app from "../app";
import { User } from "../models/user.model";
import { Loan } from "../models/loan.model";
import path from "path";
import fs from "fs";

describe("Borrower Routes", () => {
  let token: string;
  let borrowerId: string;

  beforeEach(async () => {
    // Register a borrower
    const res = await request(app).post("/api/v1/auth/register").send({
      fullName: "Test Borrower",
      email: "borrower@test.com",
      password: "password",
    });

    // Login to get token
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "borrower@test.com",
      password: "password",
    });
    token = loginRes.body.accessToken;
    borrowerId = loginRes.body.user._id;

    // Create dummy pdf for upload testing
    if (!fs.existsSync("public/uploads")) {
      fs.mkdirSync("public/uploads", { recursive: true });
    }
    fs.writeFileSync("public/uploads/dummy.pdf", "dummy content");
  });

  describe("POST /api/v1/borrower/apply", () => {
    it("should apply for a loan successfully when all BRE rules pass", async () => {
      const response = await request(app)
        .post("/api/v1/borrower/apply")
        .set("Authorization", `Bearer ${token}`)
        .field("dateOfBirth", "1990-01-01") // 30+ years old
        .field("monthlySalary", 50000)
        .field("pan", "ABCDE1234F")
        .field("employmentMode", "Salaried")
        .field("amount", 100000)
        .field("tenure", 365)
        .attach("salarySlip", "public/uploads/dummy.pdf");

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Loan application submitted successfully");
      expect(response.body.loan.status).toBe("applied");
    });

    it("should fail BRE if applicant is underage (<23)", async () => {
      const response = await request(app)
        .post("/api/v1/borrower/apply")
        .set("Authorization", `Bearer ${token}`)
        .field("dateOfBirth", "2010-01-01") // 16 years old
        .field("monthlySalary", 50000)
        .field("pan", "ABCDE1234F")
        .field("employmentMode", "Salaried")
        .field("amount", 100000)
        .field("tenure", 365)
        .attach("salarySlip", "public/uploads/dummy.pdf");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("BRE Rejected");
      expect(response.body.errors).toContain("Age must be between 23 and 50.");
    });

    it("should fail BRE if salary is below 25000", async () => {
      const response = await request(app)
        .post("/api/v1/borrower/apply")
        .set("Authorization", `Bearer ${token}`)
        .field("dateOfBirth", "1990-01-01")
        .field("monthlySalary", 20000)
        .field("pan", "ABCDE1234F")
        .field("employmentMode", "Salaried")
        .field("amount", 100000)
        .field("tenure", 365)
        .attach("salarySlip", "public/uploads/dummy.pdf");

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("Monthly salary must be at least ₹25,000.");
    });
  });
});
