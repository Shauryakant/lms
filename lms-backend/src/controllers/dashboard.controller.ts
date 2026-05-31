import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { User } from "../models/user.model";
import { Loan } from "../models/loan.model";
import { Payment } from "../models/payment.model";

// --- SALES MODULE ---
export const getPreApplicationUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Users with role Borrower who don't have a Loan application
    const borrowers = await User.find({ role: "Borrower" });
    const appliedBorrowerIds = await Loan.distinct("borrower");
    
    const preApplicationUsers = borrowers.filter(
      (b) => !appliedBorrowerIds.map(String).includes(String(b._id))
    );

    res.status(200).json({ leads: preApplicationUsers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales leads", error });
  }
};

// --- SANCTION MODULE ---
export const getAppliedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: "applied" }).populate("borrower", "-password");
    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ message: "Error fetching applied loans", error });
  }
};

export const updateLoanSanctionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["sanctioned", "rejected"].includes(status)) {
      res.status(400).json({ message: "Status must be 'sanctioned' or 'rejected'" });
      return;
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }

    loan.status = status === "rejected" ? "closed" : status;
    if (status === "rejected") {
      loan.rejectionReason = rejectionReason || "Rejected by Sanction Officer";
    }

    await loan.save();
    res.status(200).json({ message: `Loan ${status}`, loan });
  } catch (error) {
    res.status(500).json({ message: "Error updating sanction status", error });
  }
};

// --- DISBURSEMENT MODULE ---
export const getSanctionedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: "sanctioned" }).populate("borrower", "-password");
    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ message: "Error fetching sanctioned loans", error });
  }
};

export const markLoanAsDisbursed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const loan = await Loan.findByIdAndUpdate(loanId, { status: "disbursed" }, { new: true });
    
    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }

    res.status(200).json({ message: "Loan disbursed successfully", loan });
  } catch (error) {
    res.status(500).json({ message: "Error disbursing loan", error });
  }
};

// --- COLLECTION MODULE ---
export const getDisbursedLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ status: "disbursed" }).populate("borrower", "-password");
    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ message: "Error fetching disbursed loans", error });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { utrNumber, amount, paymentDate } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan || loan.status !== "disbursed") {
      res.status(400).json({ message: "Valid disbursed loan not found" });
      return;
    }

    // Check UTR uniqueness
    const existingPayment = await Payment.findOne({ utrNumber });
    if (existingPayment) {
      res.status(400).json({ message: "Duplicate UTR Number" });
      return;
    }

    // Calculate outstanding
    const outstandingBalance = (loan.totalRepayment || 0) - (loan.amountPaid || 0);
    if (amount > outstandingBalance) {
      res.status(400).json({ message: `Payment amount exceeds outstanding balance of ${outstandingBalance}` });
      return;
    }

    // Record payment
    const payment = await Payment.create({
      loan: loan._id,
      utrNumber,
      amount,
      paymentDate: paymentDate || new Date()
    });

    // Update loan
    loan.amountPaid = (loan.amountPaid || 0) + amount;
    
    // Auto-close if fully paid
    if (loan.amountPaid >= (loan.totalRepayment || 0)) {
      loan.status = "closed";
    }

    await loan.save();

    res.status(201).json({ message: "Payment recorded successfully", payment, loan });
  } catch (error) {
    res.status(500).json({ message: "Error recording payment", error });
  }
};
