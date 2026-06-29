# Portfolio Backend API

A production-ready Express.js and MySQL backend for handling portfolio website contact form submissions.

## Features

- **Express.js API**: Lightweight, robust routing structure.
- **MySQL Integration**: Uses the `mysql2/promise` pool client for optimized performance.
- **Auto-Initialization**: Automatically checks for and creates the `contacts` table if it is missing on start.
- **Input Validation**: Server-side checks for presence and email pattern correctness.
- **Secure CORS**: Allows development origins locally and dynamically enforces Netlify whitelist configurations in production.
- **Error Handling**: Custom global JSON error handler.

---

## Folder Structure

```
backend/
├── config/
│   └── db.js               # Database pool connection & auto table creation
├── controllers/
│   └── contactController.js # Input validation & DB action delegation
├── routes/
│   └── contactRoutes.js     # API Route definitions
├── models/
│   └── contactModel.js      # SQL queries using mysql2 promise pools
├── middleware/
│   └── errorHandler.js      # Global express JSON error formatting
├── uploads/                 # Storage for files (with .gitkeep tracking)
├── .env.example             # Configuration templates
├── package.json             # Build script and dependency definitions
├── server.js                # App bootstrap/entry file
└── README.md                # Documentation (this file)
```

---

## Local Setup

### 1. Prerequisites
- **Node.js**: Version 16.x or newer.
- **MySQL Server**: Running locally or hosted.

### 2. Configure Environment Variables
Inside the `backend/` directory, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill out your configurations:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=portfolio_db
FRONTEND_URL=http://localhost:3000
```
> **Note**: Create the database in MySQL before running the project: `CREATE DATABASE portfolio_db;`. The table inside it will be generated automatically.

### 3. Install Dependencies
Run this command from inside the `backend/` directory:
```bash
npm install
```

### 4. Running the Project

- **Development Mode** (with hot-reloading via `nodemon`):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

---

## API Endpoints

### 1. Status Check
- **Endpoint**: `GET /`
- **Description**: Returns server running status and info.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Welcome to the Portfolio Website Backend API!",
    "status": "Operational",
    "timestamp": "2026-06-29T06:00:00.000Z"
  }
  ```

### 2. Submit Contact Form
- **Endpoint**: `POST /api/contact`
- **Headers**: `Content-Type: application/json`
- **Body Schema**:
  ```json
  {
    "name": "Sonam Mallick",
    "email": "sonam.mallick@example.com",
    "subject": "Inquiry about Portfolio project",
    "message": "Hi, I would love to collaborate with you on a website!"
  }
  ```
- **Successful Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Thank you! Your contact message has been sent successfully.",
    "data": {
      "id": 1,
      "name": "Sonam Mallick",
      "email": "sonam.mallick@example.com"
    }
  }
  ```
- **Validation Failure Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      "Email is required.",
      "Message is required."
    ]
  }
  ```

---

## Deployment on Render

Render makes deploying Node.js apps simple. Follow these steps:

1. **Push Code to GitHub**: Put your backend codebase in a GitHub repository.
2. **Create a Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and click **New > Web Service**.
   - Connect your GitHub repository.
3. **Configure Settings**:
   - **Name**: `portfolio-backend`
   - **Language**: `Node`
   - **Root Directory**: `backend` (Important: points to the `backend/` subfolder)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   - In Render, navigate to your web service's **Environment** tab and add the variables from `.env`:
     - `PORT`: `10000` (Render's dynamic port, or keep blank as Render sets this)
     - `NODE_ENV`: `production`
     - `DB_HOST`: *Your hosted database host address (e.g., from Aiven, Supabase, or Render MySQL)*
     - `DB_USER`: *Your database username*
     - `DB_PASSWORD`: *Your database password*
     - `DB_NAME`: *Your database name*
     - `FRONTEND_URL`: *Your Netlify frontend domain (e.g., `https://your-portfolio.netlify.app`)*
5. **Database Hosting**:
   - Render does not offer native free MySQL databases anymore. You can provision a free MySQL database on providers like **Aiven**, **PlanetScale**, or **Clever Cloud**, and paste their connection details into the environment variables on Render.
