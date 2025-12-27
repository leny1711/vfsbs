# VFS Bus System - Frontend

Production-ready React web application for bus ticket booking system.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Stripe** - Payment processing
- **Google Maps JavaScript API** - Map visualization
- **Axios** - HTTP client
- **date-fns** - Date formatting

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000)
- `VITE_GOOGLE_MAPS_API_KEY` - Your Google Maps API key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

### 3. Update Google Maps API Key

Edit `index.html` and replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key.

### 4. Start Development Server

Make sure the backend is running at http://localhost:5000, then:

```bash
npm run dev
```

Application runs at `http://localhost:3000`

## Features

### Public Access
- **Home Page** - Welcome page with quick navigation
- **Search Schedules** - Search bus schedules by origin, destination, and date
- **Login/Register** - User authentication

### Authenticated Users
- **Book Tickets** - Select seats and book tickets with Stripe payment
- **My Bookings** - View and manage bookings
- **Profile** - Update profile information
- **Cancel Bookings** - Cancel confirmed bookings

### Admin Users
- **Manage Routes** - Create, edit, delete bus routes with map visualization
- **Manage Schedules** - Create, edit, cancel schedules

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Navigation bar
│   │   └── PrivateRoute.jsx     # Route protection
│   ├── contexts/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── pages/
│   │   ├── Home.jsx             # Home page
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration page
│   │   ├── Search.jsx           # Schedule search
│   │   ├── Booking.jsx          # Booking with Stripe
│   │   ├── MyBookings.jsx       # User bookings
│   │   ├── Profile.jsx          # User profile
│   │   └── admin/
│   │       ├── AdminRoutes.jsx  # Route management
│   │       └── AdminSchedules.jsx # Schedule management
│   ├── services/
│   │   └── api.js               # API service layer
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies
├── .env.example                # Environment template
└── .gitignore                  # Git ignore rules
```

## API Integration

The frontend communicates with the backend API at `http://localhost:5000` (configurable via `VITE_API_URL`).

### Authentication
- JWT tokens stored in localStorage
- Auto-refresh on API errors
- Protected routes require authentication

### API Endpoints Used
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/schedules/search` - Search schedules
- `POST /api/bookings` - Create booking
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- And more...

## Stripe Payment Integration

### Setup
1. Get your Stripe publishable key from https://stripe.com
2. Set `VITE_STRIPE_PUBLISHABLE_KEY` in `.env`
3. The backend handles the secret key

### Testing
Use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Use any future expiry date and any CVC

### Payment Flow
1. User selects schedule and seats
2. Frontend creates booking (status: PENDING)
3. Backend creates Stripe PaymentIntent
4. User enters card details
5. Stripe confirms payment
6. Backend updates booking (status: CONFIRMED)

## Google Maps Integration

### Setup
1. Get API key from Google Cloud Console
2. Enable "Maps JavaScript API"
3. Update key in `index.html` and `.env`

### Features
- Route visualization on admin route management
- Origin and destination markers
- Auto-fit bounds to show full route

## User Roles

### Customer (CUSTOMER)
- Search and book tickets
- View bookings
- Cancel bookings
- Update profile

### Admin (ADMIN)
- All customer features
- Manage routes
- Manage schedules
- View all bookings

## Test Accounts

From backend seed data:
- **Admin**: admin@vfsbs.com / admin123
- **Customer**: customer@vfsbs.com / customer123

## Development

### Available Scripts

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Code Style
- React functional components with hooks
- Inline styles for simplicity
- Responsive design with CSS Grid
- Error handling on all API calls

## Production Deployment

### Build

```bash
npm run build
```

Generates optimized files in `dist/` directory.

### Environment Variables

Set production values:
- `VITE_API_URL` - Production backend URL
- `VITE_GOOGLE_MAPS_API_KEY` - Production Google Maps key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Production Stripe key

### Hosting

Can be hosted on:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- Make sure backend is running before starting frontend
- Google Maps requires valid API key to display maps
- Stripe requires valid keys for payment processing
- All API calls include JWT token when authenticated
- Responsive design works on mobile and desktop

## License

MIT
