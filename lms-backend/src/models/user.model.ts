import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin", "Sales", "Sanction", "Disbursement", "Collection", "Borrower"],
      required: true,
      default: "Borrower",
    },
    // Borrower specific fields
    pan: { type: String },
    dateOfBirth: { type: Date },
    monthlySalary: { type: Number },
    employmentMode: {
      type: String,
      enum: ["Salaried", "Self-Employed", "Unemployed"],
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
