import mongoose, { Schema } from "mongoose";

const loanSchema = new Schema(
  {
    borrower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 50000, max: 500000 },
    tenure: { type: Number, required: true, min: 30, max: 365 }, // in days
    interestRate: { type: Number, default: 12 }, // 12% p.a.
    status: {
      type: String,
      enum: ["pending", "applied", "sanctioned", "disbursed", "closed"],
      default: "pending",
    },
    salarySlipUrl: { type: String }, // path to the uploaded file
    rejectionReason: { type: String },
    // Derived/Math fields
    simpleInterest: { type: Number },
    totalRepayment: { type: Number },
    amountPaid: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Calculate interest before saving if amount or tenure changes
loanSchema.pre("save", async function () {
  if (this.isModified("amount") || this.isModified("tenure") || this.isModified("interestRate")) {
    const p = this.amount as number;
    const r = this.interestRate as number;
    const t = this.tenure as number;
    this.simpleInterest = (p * r * t) / (365 * 100);
    this.totalRepayment = p + this.simpleInterest;
  }
});

export const Loan = mongoose.model("Loan", loanSchema);
