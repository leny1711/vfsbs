# ServiceHub - Human Service Marketplace

A modern platform that connects people who need help with nearby human service providers. Think Uber, but for human services.

## Project Concept

ServiceHub is a service marketplace (not a transport/bus application) that enables:

- **Clients**: Request services from nearby providers
- **Providers**: Offer their services to people in their area
- **Emergency Mode**: One-click access to immediate help from the closest available provider

## Project Structure

```
vfsbs/
├── backend/          # Node.js/Express backend API
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

## Core Features

### Frontend Web Application
- ✅ Authentication (login/register)
- ✅ Home page: "Find help near me" with Google Maps
- ✅ Nearby service providers visualization
- ✅ Service provider cards (type, distance, availability)
- ✅ **Emergency Button** 🚨 - One-click immediate help
- ✅ Provider booking with flexible duration
- ✅ Stripe payment integration
- ✅ User dashboard for managing bookings
- ✅ Profile management

### Emergency Mode
- Large, visible emergency button on home page
- Instantly requests closest available provider
- No manual selection needed
- Clear UI feedback (searching → provider found)
- Visually distinct from normal booking

### Design
- Modern, friendly, and professional UI
- Rounded corners throughout
- Soft shadows for depth
- Clean spacing and layout
- Smooth hover/transition effects
- Warm color palette (Yellow/Amber primary)
- Mobile-first responsive design
- Startup/SaaS aesthetic

## Test Accounts

- **Admin**: admin@vfsbs.com / admin123
- **Client**: customer@vfsbs.com / customer123

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

## Technical Notes

- Frontend uses existing backend API endpoints
- Backend schema maintained for compatibility
- Service providers mapped from existing schedule/route data
- No backend modifications required
- Payment flow integrated with Stripe
- Google Maps for location visualization

## License

MIT
