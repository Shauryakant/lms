import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { User } from "../models/user.model";
import { Loan } from "../models/loan.model";

export const applyForLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;
    const { dateOfBirth, monthlySalary, pan, employmentMode, amount, tenure } = req.body;
    
    // We expect req.file to have the uploaded salary slip from Multer
    if (!req.file) {
      res.status(400).json({ message: "Salary slip upload is required" });
      return;
    }

    // 1. Update Borrower Profile Details
    await User.findByIdAndUpdate(userId, {
      dateOfBirth,
      monthlySalary,
      pan,
      employmentMode,
    });

    // 2. Create Loan Application
    const newLoan = await Loan.create({
      borrower: userId,
      amount,
      tenure,
      status: "applied", // Transitions directly to applied so Sanction can see it
      salarySlipUrl: `/uploads/${req.file.filename}`
    });

    res.status(201).json({ message: "Loan application submitted successfully", loan: newLoan });
  } catch (error) {
    res.status(500).json({ message: "Error in loan application", error });
  }
};

export const getMyLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await Loan.find({ borrower: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ message: "Error fetching loans", error });
  }
};
