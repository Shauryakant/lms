# Loan Management System (LMS) - Frontend

This is the frontend client for the Loan Management System, built with Next.js, React, and Tailwind CSS. It is designed with a premium, clean, and minimalist aesthetic.

## Features
- **Modern Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS.
- **Role-Based Access Control:** Highly secure client-side routing that strictly segregates Borrowers from Executives.
- **Dynamic Dashboard:** A multi-module dashboard (`Sales`, `Sanction`, `Disbursement`, `Collection`) that adapts based on the logged-in user's role.
- **Multi-Step Application Wizard:** An interactive, 3-step application form with live loan repayment calculations.

## Setup Instructions

### 1. Prerequisites
Ensure you are also running the `lms-backend` on `http://localhost:8000` simultaneously, as this frontend acts purely as a client to that REST API.

### 2. Installation
```bash
cd lms-frontend
npm install
```

### 3. Running the Application
Start the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Directory Structure
- `/src/app`: Contains the Next.js App Router pages (`/login`, `/register`, `/borrower`, `/dashboard`).
- `/src/context/AuthContext.tsx`: Manages the global user session state using React Context and `localStorage`.
- `/src/services/api.ts`: An Axios instance configured to automatically attach the authentication Bearer Token to all outgoing requests.
