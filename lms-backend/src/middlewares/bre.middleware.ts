import { Request, Response, NextFunction } from "express";

export const businessRuleEngine = (req: Request, res: Response, next: NextFunction): void => {
  const { dateOfBirth, monthlySalary, pan, employmentMode } = req.body;

  const errors: string[] = [];

  // Age rule: between 23 and 50
  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 23 || age > 50) {
      errors.push("Age must be between 23 and 50.");
    }
  } else {
    errors.push("Date of birth is required.");
  }

  // Salary rule: >= 25000
  if (!monthlySalary || monthlySalary < 25000) {
    errors.push("Monthly salary must be at least ₹25,000.");
  }

  // PAN rule: valid format (e.g. ABCDE1234F)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!pan || !panRegex.test(pan)) {
    errors.push("Invalid PAN format.");
  }

  // Employment rule: Cannot be Unemployed
  if (employmentMode === "Unemployed") {
    errors.push("Applicant cannot be unemployed.");
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "BRE Rejected", errors });
    return;
  }

  next();
};
