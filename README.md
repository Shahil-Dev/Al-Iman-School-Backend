# 🏫 Al-Iman School Management ERP System — Backend API

An enterprise-grade, highly scalable, and secure RESTful API built for managing comprehensive school operations, academic administrative workflows, user authentication, and role-based access controls.

---

## 🚀 Tech Stack & Core Technologies

- **Runtime Environment:** [Node.js](https://nodejs.org/) (v20+)
- **Framework:** [Express.js](https://expressjs.com/) (v5.x)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (v7.x / TS 5.7+)
- **Database ORM:** [Prisma ORM](https://www.prisma.io/) (v5.22.0)
- **Database Provider:** [PostgreSQL](https://www.postgresql.org/) (Hosted on Neon DB)
- **Authentication & Security:** JSON Web Tokens (JWT), Bcrypt password hashing, CORS, Cookie Parser
- **Validation Engine:** [Zod](https://zod.dev/) (v4.x)
- **Mailing System:** Nodemailer (SMTP Integration)
- **Development Tooling:** TSX (TypeScript Execute), ESLint, Prettier, Apollo Gears CLI
- **Deployment & Cloud:** [Vercel](https://vercel.com/) (Serverless Architecture)

---

## ✨ Key Features & Architecture Highlights

1. **Role-Based Access Control (RBAC):**
   - Fine-grained permission system supporting dynamic roles (Super Admin, Admin, Teacher, Student, Parent, Staff).

2. **Data Validation & Error Handling:**
   - Centralized Global Error Handler catching Zod validation errors, Prisma database constraints (e.g., `P2002` duplicate entry handling), and runtime exceptions.

3. **Prisma & Database Optimization:**
   - Schema modularization and relational integrity using PostgreSQL via Prisma.
   - Built-in `binaryTargets` configuration for seamless cross-platform Vercel serverless execution.

4. **Modular Architecture:**
   - Clean Code Structure separating concerns into **Routes**, **Controllers**, **Services**, **Middlewares**, and **Interfaces**.

5. **Serverless Deployment Ready:**
   - Configured specifically for Vercel Serverless Functions with optimized build scripts (`postinstall: prisma generate`).

---

## 📁 Project Structure

```text
.
├── prisma/
│   ├── schema.prisma       # Prisma DB Schema & Engine Configuration
│   └── seed.ts             # Initial Database Seeding Script
├── src/
│   ├── app.ts              # Express App setup, Middlewares & Health check
│   ├── server.ts           # Server Listener & Process Crash Handlers
│   ├── middlewares/        # Global Error Handler, Not Found, Auth Guard
│   ├── modules/            # Feature-based Business Logic Modules
│   │   ├── Auth/           # Authentication Routes, Controllers, Services
│   │   └── ...             # Academic, User, Examination & Financial Modules
│   └── routes/             # Central API Router Configuration
├── vercel.json             # Vercel Serverless Route & Build Configuration
├── tsconfig.json           # Node16 TypeScript Compiler Configuration
├── package.json            # Scripts and Dependencies
└── .env                    # Environment Variables Configuration
