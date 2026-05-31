import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Basic health check route
app.get("/api/v1/healthcheck", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

import authRouter from "./routes/auth.routes";
app.use("/api/v1/auth", authRouter);

import borrowerRouter from "./routes/borrower.routes";
app.use("/api/v1/borrower", borrowerRouter);

import dashboardRouter from "./routes/dashboard.routes";
app.use("/api/v1/dashboard", dashboardRouter);

export default app;
