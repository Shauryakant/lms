import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    loan: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
    utrNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
