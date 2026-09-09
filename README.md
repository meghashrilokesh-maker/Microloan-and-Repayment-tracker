# Microloan and Repayment Tracker 📱💰

A societal-impact web application designed to help small street vendors and micro-entrepreneurs manage their microloans, repayments, daily sales, and business expenses digitally.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js, Express.js
- **Database**: SQLite with Prisma ORM (Zero-configuration local setup)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing

---

## 📁 Project Structure

```text
microloan-and-repayment-tracker/
├── package.json               # Root scripts to control client & server
├── .gitignore
├── README.md
│
├── server/                    # Backend API (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma      # Database models (Vendor, Loan, Repayment, Sale, Expense)
│   │   └── dev.db             # Local SQLite database
│   ├── src/
│   │   ├── config/            # Database connection (Prisma singleton)
│   │   └── server.js          # Express app entrypoint & /api/health
│   ├── .env                   # Local environment variables
│   └── package.json
│
└── client/                    # Frontend (React + Vite + Tailwind CSS)
    ├── src/
    │   ├── App.jsx            # Main app component
    │   ├── index.css          # Tailwind CSS styles
    │   └── main.jsx           # React DOM root
    ├── index.html
    ├── tailwind.config.js     # Tailwind setup
    └── package.json
```

---

## 🚀 Quick Start Guide for Team Members

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or v20+ recommended).

### 2. Start the Backend API Server
Open a terminal and run:
```bash
npm run server:dev
```
The API server will run at: **http://localhost:5000**
Health check endpoint: **http://localhost:5000/api/health**

### 3. Start the Frontend React App
Open a second terminal and run:
```bash
npm run client:dev
```
The application will open at: **http://localhost:5173**

---

## 🗄️ Inspecting the Database Visually
Prisma provides a built-in graphical database viewer. To view all tables and records in your browser:
```bash
cd server
npm run db:studio
```
This launches **Prisma Studio** at `http://localhost:5555`.
