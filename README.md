# CoreFlow

A full-stack authentication starter built with a Vite + React frontend and an Express + MongoDB backend.

## Overview

CoreFlow provides user registration, email verification, login with JWT-based access and refresh tokens, password reset (OTP), and basic user management. The project separates client and server into two folders for easy development.

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS, Redux
- Backend: Node.js, Express, MongoDB (Mongoose)
- Auth: JSON Web Tokens (JWT)
- Email: Nodemailer (Gmail)
- File uploads / media: Cloudinary

## Features

- Email verification during registration
- Login with access and refresh tokens
- Forgot password via OTP
- Session tracking
- Cloudinary integration for media

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or Atlas)

## Environment Variables

Create a `.env` file in the `server/` folder with the following variables:

- `MONGO_URI` — MongoDB connection URI (without the database name). Example: `mongodb+srv://user:pass@cluster0.mongodb.net`
- `SECRET_KEY` — JWT secret for access tokens and registration verification
- `REFRESH_TOKEN_SECRET` — JWT secret for refresh tokens
- `ACCESS_TOKEN_EXPIRES_IN` — e.g. `15m` or `1h`
- `REFRESH_TOKEN_EXPIRES_IN` — e.g. `30d`
- `USER_MAIL` — Gmail address used to send verification/OTP emails
- `USER_PASS` — App password for the Gmail account
- `CLIENT_URL` — Frontend URL (defaults to `http://localhost:5173`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials
- `PORT` — (optional) server port, defaults to `3000`

## Installation

Install dependencies for both client and server:

```bash
# from project root
cd server
npm install

cd ../client
npm install
```

## Running Locally

Start the backend (development):

```bash
cd server
# uses nodemon if you have it installed locally or globally
npm run dev
```

Start the frontend (development):

```bash
cd client
npm run dev
```

The client is configured to allow requests from `http://localhost:5173`. The server exposes API routes under `/api/v1/` (for example `/api/v1/auth`).

## Useful Scripts

- Server (in `server/package.json`):
  - `npm run dev` — start server with nodemon
  - `npm start` — start server with node
- Client (in `client/package.json`):
  - `npm run dev` — start Vite dev server
  - `npm run build` — build for production
  - `npm run preview` — locally preview production build
  - `npm run lint` — run ESLint

## API Endpoints (selected)

- `POST /api/v1/auth/register` — register a user (sends verification email)
- `GET  /api/v1/auth/verify` — verify registration token (token passed as Bearer header)
- `POST /api/v1/auth/login` — login and receive tokens
- `POST /api/v1/auth/forgot-password` — request OTP
- `POST /api/v1/auth/verify-otp/:email` — verify OTP
- `POST /api/v1/auth/change-password/:email` — change password
- `GET /api/v1/user/...` — user-related routes

(See `server/routes/` for full route definitions.)

## Project Structure

- `client/` — React + Vite frontend
  - `src/` — React source code
- `server/` — Express backend
  - `controllers/` — route handlers
  - `models/` — Mongoose models
  - `routes/` — API routes
  - `utils/` — helpers (email, cloudinary)
  - `config/database/` — DB connection

## Deployment Notes

- Ensure environment variables are set in the hosting platform (e.g., Vercel for the client, Heroku/Render/DigitalOcean for the server).
- Configure CORS and `CLIENT_URL` for production domain(s).
- Use secure storage for secrets (do not commit `.env` to version control).

## Author

Abhishek

---

If you'd like, I can also:
- Add a `.env.example` file in `server/` with placeholders
- Add setup scripts or GitHub Actions for deployment

