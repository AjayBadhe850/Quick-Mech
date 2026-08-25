# Quick-Mech – Vehicle Service Platform

**Quick-Mech** is a modern, full-stack vehicle assistance platform that connects users in need of emergency roadside help, maintenance, and vehicle repair services with certified mechanics near their location in real-time.

---

## 🌟 Overview

Whether you are stranded on the highway with a flat tire or scheduling an engine tune-up in town, Quick-Mech bridges the gap between vehicle owners and repair specialists with geolocation discovery, distance estimation, cryptographic OTP authentication, transparent service listings, and booking management.

---

## 🚀 Features

- **Email OTP Authentication**: Single-use, cryptographically secure 6-digit OTP delivery via [Resend](https://resend.com), with 5-minute TTL, attempt throttling, and JWT session issuing.
- **Location-Based Discovery**: Live user coordinates fetching via browser Geolocation API with reverse geocoding via OpenStreetMap Nominatim.
- **Nearby Mechanics Engine**: Calculates real-time distance using the Haversine formula and driving duration routes via OSRM.
- **Mechanic Profiles & Services**: Comprehensive workshop details, certified badges, promotional offers, operating hours, ratings, customer reviews, and photo galleries.
- **Service Booking & UPI Payments**: End-to-end booking flow with interactive dynamic UPI QR codes and instant status tracking.
- **Referral Program**: Unique referral codes for users to earn rewards and track referral milestones.
- **Comprehensive Admin Control Panel**: Dedicated management dashboard to manage workshops, upload shop photos, configure platform promotions, and inspect active bookings.

---

## 🏗️ Architecture

```text
                    USER
                      │
                      ▼
             Netlify Frontend
            React 18 + Vite (SPA)
                      │
                   HTTPS REST
                      │
                      ▼
              Railway Backend
            Node.js + Express.js
         (Helmet, Rate Limit, Zod)
                      │
                 Prisma ORM
                      │
                      ▼
             Railway PostgreSQL

External Services:
    ├─ Resend          ──> Transactional OTP Emails
    ├─ Geolocation/OSRM──> Driving distance & duration
    └─ OpenStreetMap   ──> Reverse geocoding
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Routing**: React Router DOM (v6)
- **Styling**: Vanilla CSS3 (Custom responsive layouts, CSS Grid, Flexbox, glassmorphism, animations)
- **API Client**: Centralized fetch wrapper (`frontend/src/services/api.js`) with JWT interceptors

### Backend
- **Runtime**: Node.js (>= 18)
- **Framework**: Express.js
- **Validation**: Zod
- **Authentication**: JWT (JSON Web Tokens) + SHA-256 OTP hashing
- **Email Delivery**: Resend SDK
- **Security**: Helmet, CORS, Express-Rate-Limit

### Database & ORM
- **Database**: PostgreSQL (Railway)
- **ORM**: Prisma ORM with relational schema and automated migrations

---

## 📁 Project Structure

```text
Quick-Mech/
├── frontend/
│   ├── public/
│   │   └── _redirects              # Netlify SPA redirect rules
│   ├── src/
│   │   ├── data/
│   │   │   └── mechanicsData.js    # Local fallback mechanic data
│   │   ├── pages/                  # Preserved UI page components & styles
│   │   │   ├── Admin.jsx & Admin.css
│   │   │   ├── Booking.jsx & Booking.css
│   │   │   ├── Dashboard.jsx & Dashboard.css
│   │   │   ├── Login.jsx & Login.css
│   │   │   ├── MechanicDetails.jsx & MechanicDetails.css
│   │   │   ├── OTPVerification.jsx & OTPVerification.css
│   │   │   ├── PaymentHistory.jsx & PaymentHistory.css
│   │   │   ├── RatingsReviews.jsx & RatingsReviews.css
│   │   │   ├── Referral.jsx & Referral.css
│   │   │   └── UploadPics.jsx & UploadPics.css
│   │   ├── services/
│   │   │   └── api.js              # Centralized API service layer
│   │   ├── App.jsx & App.css
│   │   ├── main.jsx & index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Prisma schema for PostgreSQL
│   │   └── seed.js                 # Seed initial mechanics & services
│   ├── src/
│   │   ├── config/                 # Env validation and Prisma client
│   │   ├── controllers/            # Request handlers
│   │   ├── middleware/             # Auth, validation, rate limiting, error handler
│   │   ├── routes/                 # Express REST routes
│   │   ├── services/               # Core business logic
│   │   ├── utils/                  # Haversine distance, response formatting
│   │   ├── validators/             # Zod input validation schemas
│   │   ├── app.js                  # Express app configuration
│   │   └── server.js               # HTTP server entrypoint
│   ├── package.json
│   └── .env.example
│
├── .github/workflows/              # GitHub Actions CI build check
├── netlify.toml                    # Netlify deployment configuration
├── package.json                    # Root workspace runner scripts
├── .gitignore
└── README.md
```

---

## 💻 Local Development

### 1. Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database (local or cloud instance like Railway / Supabase / Neon)

### 2. Clone and Install

```bash
git clone https://github.com/AjayBadhe850/Quick-Mech.git
cd Quick-Mech

# Install backend and frontend dependencies
npm run install:all
```

### 3. Configure Environment Variables

**Backend (`backend/.env`):**
```bash
cp backend/.env.example backend/.env
```
Fill in your database URL and Resend API key.

**Frontend (`frontend/.env`):**
```bash
cp frontend/.env.example frontend/.env
```
Default `VITE_API_URL=http://localhost:5000` is ready for local development.

### 4. Database Setup & Seeding

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database (or run migrations)
cd backend && npx prisma db push

# Seed initial mechanics, services, and sample data
npm run prisma:seed
```

### 5. Run the Application

```bash
# Run both Backend (port 5000) and Frontend (port 5173) concurrently:
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔐 Environment Variables

### Backend (`backend/.env.example`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | API server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://USER:PASS@HOST:PORT/DB` |
| `JWT_SECRET` | Secret key for signing session tokens | `<secure_random_string_32_chars>` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `RESEND_API_KEY` | Resend API Key for sending OTPs | `re_xxxxxxxxxxxxxxxxx` |
| `RESEND_FROM_EMAIL` | Sender address configured in Resend | `QuickMech <onboarding@resend.dev>` |
| `FRONTEND_URL` | Allowed CORS origins (comma-separated) | `http://localhost:5173,https://your-app.netlify.app` |

### Frontend (`frontend/.env.example`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Public base URL of the Backend API | `http://localhost:5000` (Local) / `https://your-backend.railway.app` (Prod) |

---

## 🗄️ Database Setup (Prisma Models)

- **`User`**: Account identity, role (`USER`, `ADMIN`, `MECHANIC`), wallet balance, and referral tracking.
- **`OtpVerification`**: Stores hashed OTPs, expiration timestamps, attempt counters, and single-use status.
- **`Mechanic`**: Workshop details, coordinates (`lat`, `lng`), categories, ratings, contact info, and gallery images.
- **`Service`**: Repair packages linked to specific mechanics with pricing and duration.
- **`Vehicle`**: User-registered vehicles (Car, Bike, etc.).
- **`Booking`**: Service reservations connecting User, Mechanic, Service, Date/Time, and Status (`PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
- **`Review`**: Star ratings and feedback text linked to mechanics and users.
- **`Payment`**: Transaction logs for UPI and service payments.

---

## 🔑 Authentication Flow

```text
1. User enters Name & Email / Mobile on Login screen.
2. Frontend calls POST /api/auth/send-otp.
3. Backend generates cryptographically secure 6-digit random code.
4. Backend hashes OTP (HMAC-SHA256) and stores hash in DB with 5-min TTL.
5. Backend sends transactional email with OTP via Resend.
6. User enters 6 digits on the flip card.
7. Backend verifies hash, checks expiration and max attempts (<= 5).
8. On success, OTP is marked consumed, User is upserted, and JWT token is issued.
9. Frontend stores JWT token and attaches 'Authorization: Bearer <token>' on API requests.
```

---

## 📡 API Overview

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health & database connectivity check | Public |
| `POST` | `/api/auth/send-otp` | Request 6-digit OTP code | Rate Limited |
| `POST` | `/api/auth/verify-otp` | Verify OTP and receive JWT | Public |
| `POST` | `/api/auth/resend-otp` | Resend OTP code | Rate Limited |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Required |
| `GET` | `/api/mechanics` | List all mechanics (with filter params) | Public |
| `GET` | `/api/mechanics/nearby` | Find mechanics near lat/lng coordinates | Public |
| `GET` | `/api/mechanics/:id` | Get mechanic profile, services, and reviews | Public |
| `POST` | `/api/mechanics/:id/images` | Upload shop pictures to gallery | Admin |
| `POST` | `/api/bookings` | Create a new service booking | Optional |
| `GET` | `/api/bookings` | Retrieve user bookings | Optional |
| `POST` | `/api/payments` | Record completed payment | Optional |
| `GET` | `/api/payments/:mobileNumber` | Retrieve payment history | Optional |
| `GET` | `/api/reviews` | Retrieve mechanic reviews | Public |
| `POST` | `/api/reviews` | Submit a customer review | Optional |

---

## 🚀 Netlify Deployment (Frontend)

1. Connect your GitHub repository on [Netlify](https://app.netlify.com).
2. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist` (or `frontend/dist`)
3. Set Environment Variable in Netlify Dashboard:
   - `VITE_API_URL` = `https://your-backend-service.up.railway.app`
4. The included `netlify.toml` and `_redirects` file will automatically handle Single Page App routing so page refreshes never return 404.

---

## 🚂 Railway Deployment (Backend + Database)

1. Create a project in [Railway](https://railway.app).
2. Add a **PostgreSQL** database service from Railway's template library.
3. Add a new service from your GitHub repo and select the `backend` directory (Root Directory: `/backend`).
4. In the Railway Service settings, add the following Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` *(reference Railway Postgres service)*
   - `JWT_SECRET` = `<generate-secure-jwt-secret>`
   - `RESEND_API_KEY` = `re_xxxxxxxx`
   - `RESEND_FROM_EMAIL` = `QuickMech <onboarding@resend.dev>` *(or your verified domain)*
   - `FRONTEND_URL` = `https://your-app.netlify.app`
5. Set the Start Command in Railway:
   ```bash
   npx prisma generate && npx prisma db push && npm start
   ```

---

## 🛡️ Security Notes

- **Zero Hardcoded Secrets**: All keys, credentials, and URLs are strictly accessed via environment variables.
- **Hashed OTPs**: Plain-text OTPs are never persisted in the database.
- **Anti-Brute Force**: Express rate limiters protect OTP generation and verification attempts.
- **CORS Protection**: CORS headers strictly allow requests only from verified frontend origins in production.
- **HTTP Security Headers**: Powered by `helmet` to protect against clickjacking, MIME-sniffing, and XSS.
- **Centralized Error Redaction**: Stack traces and database internals are sanitized from production client responses.

---

## 🔮 Future Improvements

- PostGIS integration for sub-millisecond spatial geospatial queries at scale.
- Real-time GPS location tracking of on-the-way mechanics via WebSockets.
- Integrated automated SMS gateway (Twilio / AWS SNS) alongside email delivery.
- Push notifications for booking confirmations and technician arrival.
