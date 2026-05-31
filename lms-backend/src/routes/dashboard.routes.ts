import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/rbac.middleware";
import {
  getPreApplicationUsers,
  getAppliedLoans,
  updateLoanSanctionStatus,
  getSanctionedLoans,
  markLoanAsDisbursed,
  getDisbursedLoans,
  recordPayment,
} from "../controllers/dashboard.controller";

const router = Router();

// All dashboard routes require authentication
router.use(verifyJWT);

// Sales Module
router.get("/sales/leads", requireRole(["Sales"]), getPreApplicationUsers);

// Sanction Module
router.get("/sanction/loans", requireRole(["Sanction"]), getAppliedLoans);
router.patch("/sanction/loans/:loanId", requireRole(["Sanction"]), updateLoanSanctionStatus);

// Disbursement Module
router.get("/disbursement/loans", requireRole(["Disbursement"]), getSanctionedLoans);
router.patch("/disbursement/loans/:loanId", requireRole(["Disbursement"]), markLoanAsDisbursed);

// Collection Module
router.get("/collection/loans", requireRole(["Collection"]), getDisbursedLoans);
router.post("/collection/loans/:loanId/payment", requireRole(["Collection"]), recordPayment);

export default router;
