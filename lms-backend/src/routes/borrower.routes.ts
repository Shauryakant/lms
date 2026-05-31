import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/rbac.middleware";
import { businessRuleEngine } from "../middlewares/bre.middleware";
import { upload } from "../middlewares/multer.middleware";
import { applyForLoan, getMyLoans } from "../controllers/borrower.controller";

const router = Router();

// Secure all borrower routes
router.use(verifyJWT, requireRole(["Borrower"]));

router.route("/apply").post(
  upload.single("salarySlip"),
  businessRuleEngine, // Validates age, salary, PAN, employment before proceeding
  applyForLoan
);

router.route("/loans").get(getMyLoans);

export default router;
