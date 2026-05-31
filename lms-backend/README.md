# Loan Management System (LMS) - Backend

This is the backend service for the Loan Management System. Built with Node.js, Express, TypeScript, and MongoDB.

## Features
- **Role-Based Access Control (RBAC):** Strict modular access for Admin, Sales, Sanction, Disbursement, Collection, and Borrower.
- **Business Rule Engine (BRE):** Server-side validation for age, salary, PAN, and employment status.
- **File Uploads:** Secure salary slip uploads (PDF/JPG/PNG, max 5MB).
- **Loan Math:** Automated simple interest calculation.
- **Auto-Closing Loans:** Loans automatically transition to "closed" when outstanding balance reaches zero.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI.

### 2. Installation
```bash
cd lms-backend
npm install
```

### 3. Environment Variables
Rename the example environment file and update it with your own credentials (such as your MongoDB URI and JWT secrets).
```bash
cp .env.example .env
```

### 4. Database Seeding
To easily evaluate the assignment, a seed script is provided that generates a test account for every role (with a default password of `password123`).
```bash
npx ts-node src/seed.ts
```

### 5. Running the Application
Start the development server with hot-reloading:
```bash
npm run dev
```
The server will start on `http://localhost:8000` (or the port defined in your `.env`).

## Architecture & Data Flow
- **Authentication:** `POST /api/v1/auth/register` & `POST /api/v1/auth/login`. Returns JWT tokens and sets HTTP-only cookies.
- **Borrower Portal:** `POST /api/v1/borrower/apply` applies for a loan, processes BRE rules, uploads the salary slip, and performs loan math.
- **Dashboard Modules:** 
  - `GET /api/v1/dashboard/sales/leads`
  - `PATCH /api/v1/dashboard/sanction/loans/:loanId`
  - `PATCH /api/v1/dashboard/disbursement/loans/:loanId`
  - `POST /api/v1/dashboard/collection/loans/:loanId/payment`
