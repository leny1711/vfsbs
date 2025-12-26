# VFS Bus System - Backend

Production-ready backend API for bus ticket booking system.

## Tech Stack

- **Node.js 18** - Runtime
- **Express 4.18** - Web framework
- **PostgreSQL 15** - Database
- **Prisma 5.0** - ORM
- **JWT** - Authentication
- **Stripe 12.0** - Payments
- **bcryptjs** - Password hashing

## Quick Start

### 1. Start PostgreSQL

From project root:

```bash
docker compose up -d
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `JWT_SECRET`: Your secret key
- `STRIPE_SECRET_KEY`: Your Stripe secret key (get from https://stripe.com)
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret

### 4. Generate Prisma Client & Migrate

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Seed Database (Optional)

```bash
npm run prisma:seed
```

Creates test accounts:
- Admin: `admin@vfsbs.com` / `admin123`
- Customer: `customer@vfsbs.com` / `customer123`

### 6. Start Server

```bash
npm run dev
```

Server runs at `http://localhost:5000`

## API Endpoints

### Public
- `GET /` - API info
- `GET /health` - Health check

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login (returns JWT)
- `GET /me` - Get current user (requires auth)
- `POST /refresh` - Refresh JWT token (requires auth)

### Users (`/api/users`)
- `GET /profile` - Get profile (auth required)
- `PUT /profile` - Update profile (auth required)
- `GET /bookings` - Get user bookings (auth required)

### Routes (`/api/routes`)
- `GET /` - List all routes
- `GET /:id` - Get route details
- `POST /` - Create route (admin only)
- `PUT /:id` - Update route (admin only)
- `DELETE /:id` - Delete route (admin only)

### Schedules (`/api/schedules`)
- `GET /` - List schedules (supports filters: routeId, date, status)
- `GET /search?origin=X&destination=Y&date=Z` - Search schedules
- `GET /:id` - Get schedule details
- `POST /` - Create schedule (admin only)
- `PUT /:id` - Update schedule (admin only)
- `DELETE /:id` - Cancel schedule (admin only)

### Bookings (`/api/bookings`)
- `POST /` - Create booking (auth required)
- `GET /:id` - Get booking details (auth required)
- `PUT /:id/cancel` - Cancel booking (auth required)
- `GET /` - List all bookings (admin only)

### Payments (`/api/payments`)
- `POST /create-intent` - Create Stripe PaymentIntent (auth required)
- `POST /confirm` - Confirm payment (auth required)
- `GET /:id` - Get payment details (auth required)
- `POST /webhook` - Stripe webhook handler

## Authentication

Include JWT token in requests:

```
Authorization: ******
```

Token expires after 24 hours. Use `/api/auth/refresh` to get new token.

## Stripe Payment Flow

1. User creates booking (status: PENDING)
2. Call `POST /api/payments/create-intent` with `bookingId`
3. Backend returns `clientSecret`
4. Frontend uses Stripe SDK to collect payment
5. Call `POST /api/payments/confirm` with `paymentId`
6. Backend verifies with Stripe and updates booking (status: CONFIRMED)

## Database Schema

- **User** - Authentication, profile
- **Route** - Bus routes with GPS coordinates
- **Schedule** - Scheduled trips with seats
- **Booking** - User bookings
- **Payment** - Payment records with Stripe

## Scripts

```bash
npm run dev              # Start dev server
npm start                # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed database
```

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `STRIPE_SECRET_KEY` - Stripe API key

Optional:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `FRONTEND_URL` - Frontend URL for CORS
- `MOBILE_URL` - Mobile app URL for CORS

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Use production Stripe keys
4. Configure production database
5. Setup Stripe webhooks
6. Use process manager (PM2) or containers

## License

MIT
