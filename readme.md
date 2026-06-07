# DevPulse API

A secure and modular issue tracking backend API built with Node.js, Express.js, TypeScript, and PostgreSQL.

This project allows contributors and maintainers to manage software issues and feature requests with JWT-based authentication and role-based authorization.

---

# 🚀 Live Links

## Backend Live URL

```txt
https://bug-reporting-system-nine.vercel.app/
```

## GitHub Repository

```txt
https://github.com/meiad-khan/bug-reporting-system
```

---

# ✨ Features

* User Registration & Login
* JWT Authentication & Authorization
* Role-based Access Control
* Create, Update, Delete Issues
* Public Issue Retrieval
* Filtering & Sorting Issues
* Password Hashing with bcrypt
* PostgreSQL Database Integration
* Modular Architecture
* Protected Routes
* TypeScript Strict Typing

---

# 🛠️ Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* pg
* bcrypt
* jsonwebtoken
* dotenv
* cors
* vercel

---

# 📁 Project Structure

```txt
src/
│
├── app/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   └── issues/
│   ├── utils/
│   ├── db/
│   └── types/
│
├── app.ts
└── server.ts
```

---

# ⚙️ Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/meiad-khan/bug-reporting-system
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Create `.env` File

```env
PORT=3000

DATABASE_URL=your_postgresql_database_url

JWT_SECRET=your_secret_key
```

---

## 4. Run Development Server

```bash
npm run dev
```

---

# 🗄️ Database Schema Summary

## Users Table

| Field      | Type               |
| ---------- | ------------------ |
| id         | SERIAL PRIMARY KEY |
| name       | VARCHAR            |
| email      | VARCHAR UNIQUE     |
| password   | TEXT               |
| role       | VARCHAR            |
| created_at | TIMESTAMP          |
| updated_at | TIMESTAMP          |

---

## Issues Table

| Field       | Type               |
| ----------- | ------------------ |
| id          | SERIAL PRIMARY KEY |
| title       | VARCHAR(150)       |
| description | TEXT               |
| type        | VARCHAR            |
| status      | VARCHAR            |
| reporter_id | INTEGER            |
| created_at  | TIMESTAMP          |
| updated_at  | TIMESTAMP          |

---

# 🔐 Authentication

JWT-based authentication is used.

Protected routes require:

```txt
Authorization: <JWT_TOKEN>
```

---

# 🌐 API Endpoints

# Authentication

## Register User

```http
POST /api/auth/signup
```

---

## Login User

```http
POST /api/auth/login
```

---

# Issues

## Create Issue

```http
POST /api/issues
```

Access:

* contributor
* maintainer

---

## Get All Issues

```http
GET /api/issues
```

### Query Parameters

| Param  | Values                      |
| ------ | --------------------------- |
| sort   | newest, oldest              |
| type   | bug, feature_request        |
| status | open, in_progress, resolved |

Example:

```txt
/api/issues?sort=newest&type=bug
```

---

## Get Single Issue

```http
GET /api/issues/:id
```

---

## Update Issue

```http
PATCH /api/issues/:id
```

Access:

* maintainer → any issue
* contributor → own issue if status is open

---

## Delete Issue

```http
DELETE /api/issues/:id
```

Access:

* maintainer only

---

# 📌 Response Format

## Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": "Error details"
}
```

---

# 🔒 Security Features

* Password hashing using bcrypt
* JWT verification middleware
* Role-based route protection
* Authorization checks for issue ownership
* Protected private routes

---

# 🚀 Deployment

Backend deployed on:

* Vercel

Database hosted on:

* Neon PostgreSQL

---

# 👨‍💻 Author

Md Meiad Khan

---

# 📜 License

This project is developed for educational purposes as part of an assignment submission.
