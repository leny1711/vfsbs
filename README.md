# VFS Bus System

Complete monorepo bus ticket booking system with backend API and frontend web application.

## Project Structure

```
vfsbs/
├── backend/          # Node.js/Express backend
├── frontend/         # React web application
└── docker-compose.yml # PostgreSQL database
```

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set JWT_SECRET and Stripe keys
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Backend runs at `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env and set Google Maps and Stripe keys
# Edit index.html and set Google Maps API key
npm run dev
```

Frontend runs at `http://localhost:3000`

## Tech Stack

### Backend
- Node.js 18 + Express 4.18
- PostgreSQL 15 + Prisma ORM
- JWT Authentication
- Stripe Payment Integration
- RESTful API

### Frontend
- React 18 + Vite
- React Router 6
- Stripe React SDK
- Google Maps JavaScript API
- Axios for API calls

## Features

- ✅ User authentication (login/register)
- ✅ Role-based access control (Customer/Admin)
- ✅ Bus route management with GPS coordinates
- ✅ Schedule search and filtering
- ✅ Multi-seat booking system
- ✅ Stripe payment integration
- ✅ Google Maps visualization
- ✅ Booking management and cancellation
- ✅ User profile management
- ✅ Admin dashboard for routes and schedules

## Test Accounts

- **Admin**: admin@vfsbs.com / admin123
- **Customer**: customer@vfsbs.com / customer123

## Documentation

- [Backend README](./backend/README.md) - Backend API documentation
- [Frontend README](./frontend/README.md) - Frontend documentation

## API Keys Required

1. **Stripe** (https://stripe.com)
   - Secret Key (backend)
   - Publishable Key (frontend)

2. **Google Maps** (https://console.cloud.google.com)
   - Enable "Maps JavaScript API"
   - API Key (frontend)

## Development

Backend and frontend run independently:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- Database: PostgreSQL on port 5432

## Production Deployment

### Backend
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Use production Stripe keys
- Deploy to Node.js hosting (Heroku, AWS, etc.)

### Frontend
- Run `npm run build`
- Deploy `dist/` folder to static hosting (Vercel, Netlify, etc.)
- Set production environment variables

## License

MIT