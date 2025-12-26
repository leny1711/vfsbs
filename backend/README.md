# VFS Bus System - Backend

Backend API for the VFS Bus Booking System built with Node.js, Express, PostgreSQL, and Prisma.

## Prerequisites

- Node.js 18.x LTS
- npm 9.x
- PostgreSQL 15 (via Docker recommended)
- Stripe Account (for payment processing)

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js 4.18** - Web framework
- **PostgreSQL 15** - Relational database
- **Prisma ORM 5.0** - Database ORM and migrations
- **JWT** - Authentication
- **Stripe 12.0** - Payment processing
- **bcryptjs** - Password hashing

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vfsbs?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
FRONTEND_URL=http://localhost:5173
MOBILE_URL=http://localhost:19006
```

### 3. Start PostgreSQL Database

From the project root:

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432.

### 4. Generate Prisma Client and Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Seed Database (Optional)

```bash
npm run prisma:seed
```

This creates:
- Admin user: `admin@vfsbs.com` / `admin123`
- Customer user: `customer@vfsbs.com` / `customer123`
- Sample routes and schedules

### 6. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /` - API info
- `GET /health` - Health check with database status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/refresh` - Refresh JWT token (protected)

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users/bookings` - Get user's bookings (protected)

### Routes
- `GET /api/routes` - Get all active routes
- `GET /api/routes/:id` - Get single route
- `POST /api/routes` - Create route (admin only)
- `PUT /api/routes/:id` - Update route (admin only)
- `DELETE /api/routes/:id` - Delete route (admin only)

### Schedules
- `GET /api/schedules` - Get all schedules (supports filters)
- `GET /api/schedules/search` - Search schedules by origin/destination/date
- `GET /api/schedules/:id` - Get single schedule
- `POST /api/schedules` - Create schedule (admin only)
- `PUT /api/schedules/:id` - Update schedule (admin only)
- `DELETE /api/schedules/:id` - Cancel schedule (admin only)

### Bookings
- `POST /api/bookings` - Create booking (protected)
- `GET /api/bookings/:id` - Get booking details (protected)
- `PUT /api/bookings/:id/cancel` - Cancel booking (protected)
- `GET /api/bookings` - Get all bookings (admin only)

### Payments
- `POST /api/payments/create-intent` - Create Stripe PaymentIntent (protected)
- `POST /api/payments/confirm` - Confirm payment (protected)
- `GET /api/payments/:id` - Get payment details (protected)
- `POST /api/payments/webhook` - Stripe webhook handler

## Database Schema

### Models
- **User** - User accounts with authentication
- **Route** - Bus routes with origin/destination coordinates
- **Schedule** - Scheduled bus trips with seat availability
- **Booking** - User bookings with seat selection
- **Payment** - Payment records with Stripe integration

See `prisma/schema.prisma` for complete schema definition.

## Scripts

```bash
npm run dev           # Start development server with nodemon
npm start             # Start production server
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio (database GUI)
npm run prisma:seed       # Seed database with sample data
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register or login to receive a JWT token
2. Include token in Authorization header: `Authorization: Bearer <token>`
3. Token expires after 24 hours (configurable via JWT_EXPIRES_IN)
4. Use `/api/auth/refresh` to get a new token

## Stripe Integration

### Setup
1. Create a Stripe account at https://stripe.com
2. Get API keys from Stripe Dashboard
3. Add `STRIPE_SECRET_KEY` to `.env`
4. For webhooks, add `STRIPE_WEBHOOK_SECRET` to `.env`

### Payment Flow
1. User creates a booking (status: PENDING)
2. Frontend calls `/api/payments/create-intent` with bookingId
3. Backend creates Stripe PaymentIntent and returns clientSecret
4. Frontend uses Stripe SDK to collect payment
5. Frontend calls `/api/payments/confirm` after successful payment
6. Backend verifies with Stripe and updates booking status to CONFIRMED

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

All errors return JSON with `error` field:
```json
{
  "error": "Error message"
}
```

## Development

### Database Migrations

When you modify the Prisma schema:

```bash
npm run prisma:migrate
```

This creates a new migration and applies it to the database.

### View Database

Open Prisma Studio:

```bash
npm run prisma:studio
```

Access at `http://localhost:5555`

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Use production Stripe keys
4. Setup proper database (not Docker for production)
5. Configure CORS for your frontend domain
6. Setup Stripe webhooks endpoint
7. Use process manager (PM2) or container orchestration

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Role-based access control (CUSTOMER/ADMIN)
- Input validation with Joi
- Parameterized queries (Prisma prevents SQL injection)
- CORS configuration
- Environment variable protection

## License

MIT
