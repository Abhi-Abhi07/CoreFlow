# CoreFlow

CoreFlow is a full-stack process scheduling simulation and diagnostics platform built with React, Vite, Express, and MongoDB. It combines a scheduler visualization engine with secure user authentication, email workflows, and cloud-based media handling.

---

## Overview

CoreFlow enables developers and students to model process workloads, visualize scheduler execution, and analyze operating system metrics in a single application. The project separates frontend and backend responsibilities into `client/` and `server/` for clear organization and easy deployment.

---

## Key Features

- Interactive process scheduler visualization
- Deterministic scheduler engines in `client/src/utils/schedulers/`
- JWT authentication with access and refresh tokens
- Email verification and OTP password recovery
- Cloudinary-based media upload support
- Real-time metrics for turnaround and waiting time

---

## Algorithmic Simulation Matrix

The scheduler implementation evaluates process lifecycle metrics precisely and reports two core operating system measurements:

- **Turnaround Time (`T_tat`)**: `T_tat = T_completion - T_arrival`
- **Waiting Time (`T_waiting`)**: `T_waiting = T_tat - T_burst`

| Strategy | Preemption | Primary Metric | Complexity | Typical Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **FCFS** | Non-Preemptive | Arrival order | O(1) | Batch workloads |
| **RR** | Preemptive | Time quantum slices | O(1) | Time-sharing systems |
| **SJF** | Non-Preemptive | Shortest burst time | O(log n) | Long-term batch optimization |
| **SRTF** | Preemptive | Shortest remaining time | O(log n) | Preemptive short-job tracking |
| **Priority Scheduling** | Non-Preemptive | Explicit priority | O(log n) | Critical signal handling |
| **Preemptive Priority** | Preemptive | Dynamic high-priority interruption | O(log n) | Real-time interrupt handling |
| **MLQ** | Mixed | Multi-queue partitioning | O(n) | Foreground/background separation |
| **MLFQ** | Preemptive | Feedback-driven queue adjustment | O(n) | Adaptive general-purpose systems |

> **MLFQ note:** CoreFlow tracks 10ms execution slices per queue level. Jobs that exceed their slice limits are downgraded through a 3-level hierarchy, while idle lower-priority jobs are promoted to reduce starvation.

---

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS, Redux
- Backend: Node.js, Express, MongoDB (Mongoose)
- Authentication: JSON Web Tokens (JWT)
- Email: Nodemailer (Gmail)
- Media upload: Multer and Cloudinary

---

## Prerequisites

- Node.js v18 or later
- npm or yarn
- MongoDB instance (local or Atlas)

---

## Environment Variables

Create a `.env` file in the `server/` folder with:

- `MONGO_URI` — MongoDB connection URI, e.g. `mongodb+srv://user:pass@cluster0.mongodb.net`
- `SECRET_KEY` — JWT secret for access tokens and verification
- `REFRESH_TOKEN_SECRET` — JWT secret for refresh tokens
- `ACCESS_TOKEN_EXPIRES_IN` — e.g. `15m` or `1h`
- `REFRESH_TOKEN_EXPIRES_IN` — e.g. `30d`
- `USER_MAIL` — Gmail address for verification and OTP emails
- `USER_PASS` — App password for the Gmail account
- `CLIENT_URL` — Frontend origin (default: `http://localhost:5173`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials
- `PORT` — Optional server port (default: `3000`)

---

## Installation

Install dependencies for both the server and client:

```bash
cd server
npm install

cd ../client
npm install
```

---

## Running Locally

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

The frontend is configured for `http://localhost:5173`, and the backend serves API routes under `/api/v1/`.

---

## Useful Scripts

- Server:
  - `npm run dev` — start backend with nodemon
  - `npm start` — start backend with node
- Client:
  - `npm run dev` — start Vite development server
  - `npm run build` — build production assets
  - `npm run preview` — preview production build
  - `npm run lint` — run ESLint

---

## API Endpoints

- `POST /api/v1/auth/register` — register user and send verification email
- `GET /api/v1/auth/verify` — verify registration token
- `POST /api/v1/auth/login` — login and receive tokens
- `POST /api/v1/auth/forgot-password` — request OTP
- `POST /api/v1/auth/verify-otp/:email` — verify OTP
- `POST /api/v1/auth/change-password/:email` — change password
- `GET /api/v1/user/...` — user-related routes

See `server/routes/` for the full route list.

---

## Project Structure

- `client/` — React + Vite frontend
  - `src/` — frontend source files
- `server/` — Express backend
  - `controllers/` — route handlers
  - `models/` — Mongoose schemas
  - `routes/` — API endpoints
  - `utils/` — utility helpers
  - `config/database/` — database connection

---

## Deployment Notes

- Set environment variables in production
- Configure CORS and `CLIENT_URL` for the production domain
- Keep secrets secure and avoid committing `.env`

---

## Author

Abhishek

---