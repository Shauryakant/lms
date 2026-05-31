import request from "supertest";
import app from "../app";
import { User } from "../models/user.model";
import { Loan } from "../models/loan.model";
import { Payment } from "../models/payment.model";

describe("Dashboard Routes", () => {
  let adminToken: string;
  let salesToken: string;
  let sanctionToken: string;
  let disbursementToken: string;
  let collectionToken: string;
  let borrowerToken: string;
  let borrowerId: string;
  let testLoanId: string;

  beforeEach(async () => {
    // We will just register them all via the API to keep it simple
    const roles = ["Admin", "Sales", "Sanction", "Disbursement", "Collection", "Borrower"];
    const tokens: Record<string, string> = {};

    for (const role of roles) {
      const email = `${role.toLowerCase()}@test.com`;
      await request(app).post("/api/v1/auth/register").send({
        fullName: `${role} User`,
        email,
        password: "password123",
      });

      // Update role manually since register defaults to Borrower
      await User.findOneAndUpdate({ email }, { role });

      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email,
        password: "password123",
      });
      tokens[role] = loginRes.body.accessToken;
      
      if (role === "Borrower") {
        borrowerId = loginRes.body.user._id;
      }
    }

    adminToken = tokens["Admin"];
    salesToken = tokens["Sales"];
    sanctionToken = tokens["Sanction"];
    disbursementToken = tokens["Disbursement"];
    collectionToken = tokens["Collection"];
    borrowerToken = tokens["Borrower"];

    // Create a mock loan directly in DB
    const loan = await Loan.create({
      borrower: borrowerId,
      amount: 100000,
      tenure: 365,
      status: "applied",
      salarySlipUrl: "/uploads/dummy.pdf"
    });
    testLoanId = loan._id.toString();
  });

  describe("RBAC Enforcement", () => {
    it("should allow Sales to access sales route", async () => {
      const res = await request(app).get("/api/v1/dashboard/sales/leads").set("Authorization", `Bearer ${salesToken}`);
      expect(res.status).toBe(200);
    });

    it("should block Sales from accessing sanction route", async () => {
      const res = await request(app).get("/api/v1/dashboard/sanction/loans").set("Authorization", `Bearer ${salesToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Forbidden");
    });

    it("should allow Admin to access any route", async () => {
      const res1 = await request(app).get("/api/v1/dashboard/sales/leads").set("Authorization", `Bearer ${adminToken}`);
      expect(res1.status).toBe(200);
      
      const res2 = await request(app).get("/api/v1/dashboard/sanction/loans").set("Authorization", `Bearer ${adminToken}`);
      expect(res2.status).toBe(200);
    });

    it("should block Borrower from accessing any dashboard route", async () => {
      const res = await request(app).get("/api/v1/dashboard/sales/leads").set("Authorization", `Bearer ${borrowerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe("Sanction Module", () => {
    it("should update loan status to sanctioned", async () => {
      const res = await request(app)
        .patch(`/api/v1/dashboard/sanction/loans/${testLoanId}`)
        .set("Authorization", `Bearer ${sanctionToken}`)
        .send({ status: "sanctioned" });

      expect(res.status).toBe(200);
      expect(res.body.loan.status).toBe("sanctioned");
    });
  });

  describe("Disbursement Module", () => {
    it("should mark loan as disbursed", async () => {
      const res = await request(app)
        .patch(`/api/v1/dashboard/disbursement/loans/${testLoanId}`)
        .set("Authorization", `Bearer ${disbursementToken}`);

      expect(res.status).toBe(200);
      expect(res.body.loan.status).toBe("disbursed");
    });
  });

  describe("Collection Module", () => {
    beforeEach(async () => {
      await Loan.findByIdAndUpdate(testLoanId, { status: "disbursed" });
    });

    it("should record payment and reduce balance", async () => {
      // Get loan to know amount
      const loan = await Loan.findById(testLoanId);
      
      const res = await request(app)
        .post(`/api/v1/dashboard/collection/loans/${testLoanId}/payment`)
        .set("Authorization", `Bearer ${collectionToken}`)
        .send({
          utrNumber: "UTR12345",
          amount: 50000,
        });

      expect(res.status).toBe(201);
      expect(res.body.loan.amountPaid).toBe(50000);
      expect(res.body.loan.status).toBe("disbursed"); // Not closed yet
    });

    it("should auto-close loan when fully paid", async () => {
      const loan = await Loan.findById(testLoanId);

      const res = await request(app)
        .post(`/api/v1/dashboard/collection/loans/${testLoanId}/payment`)
        .set("Authorization", `Bearer ${collectionToken}`)
        .send({
          utrNumber: "UTR67890",
          amount: loan!.totalRepayment!,
        });

      expect(res.status).toBe(201);
      expect(res.body.loan.status).toBe("closed");
    });
  });
});
