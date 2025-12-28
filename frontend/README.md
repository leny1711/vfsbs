# ServiceHub - Human Service Marketplace

Modern React web application for connecting people who need help with nearby service providers. An Uber-like platform for human services.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Stripe** - Payment processing
- **Google Maps JavaScript API** - Provider location visualization
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

### Core Features
- **Home Page** - "Find help near me" with Google Maps showing nearby providers
- **Emergency Button** 🚨 - One-click booking of nearest available provider
- **Provider Search** - Browse and filter service providers by location and type
- **Service Booking** - Book providers with flexible duration and Stripe payment
- **Real-time Availability** - See which providers are available now

### Public Access
- **Browse Providers** - View available service providers on map
- **Emergency Mode** - Quick access to immediate help
- **Login/Register** - User authentication

### Authenticated Clients
- **Book Services** - Select provider and service duration with Stripe payment
- **My Bookings** - View and manage service bookings
- **Profile** - Update profile information
- **Cancel Bookings** - Cancel confirmed bookings

### Admin Users
- **Manage Providers** - Create, edit, and manage service providers
- **Manage Services** - Handle service availability and scheduling

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── EmergencyButton.jsx   # Emergency mode button
│   │   │   ├── ProviderCard.jsx      # Provider display card
│   │   │   ├── Button.jsx            # Reusable button
│   │   │   ├── Card.jsx              # Card component
│   │   │   ├── Input.jsx             # Form input
│   │   │   ├── Select.jsx            # Select dropdown
│   │   │   ├── Alert.jsx             # Alert messages
│   │   │   └── Loading.jsx           # Loading spinner
│   │   ├── Navbar.jsx                # Navigation bar
│   │   └── PrivateRoute.jsx          # Route protection
│   ├── contexts/
│   │   └── AuthContext.jsx           # Authentication context
│   ├── pages/
│   │   ├── Home.jsx                  # Home with map & emergency button
│   │   ├── Login.jsx                 # Login page
│   │   ├── Register.jsx              # Registration page
│   │   ├── Search.jsx                # Provider search & filtering
│   │   ├── Booking.jsx               # Service booking with Stripe
│   │   ├── MyBookings.jsx            # User service bookings
│   │   ├── Profile.jsx               # User profile
│   │   └── admin/
│   │       ├── AdminRoutes.jsx       # Provider management
│   │       └── AdminSchedules.jsx    # Service management
│   ├── services/
│   │   └── api.js                    # API service layer
│   ├── App.jsx                       # Main app with routing
│   ├── main.jsx                      # Entry point
│   └── index.css                     # Global styles
├── index.html                        # HTML template
├── vite.config.js                    # Vite configuration
├── package.json                      # Dependencies
├── .env.example                      # Environment template
└── .gitignore                        # Git ignore rules
```

## Design System

### Color Palette
- **Primary**: Yellow/Amber (#f59e0b)
- **Secondary**: White, Light Gray
- **Text**: Soft Black (#171717)
- **Emergency**: Red (#ef4444)
- **Success**: Green (#10b981)

### Design Features
- ✅ Rounded corners everywhere
- ✅ Soft shadows for depth
- ✅ Clean spacing and layout
- ✅ Smooth hover/transition effects
- ✅ Mobile-first responsive design
- ✅ Modern startup/SaaS aesthetic

## Emergency Mode

The emergency feature is the core of the platform:

1. **Large visible button** on home page
2. **One-click action** - no manual provider selection
3. **Automatic matching** - finds closest available provider
4. **Visual feedback** - Shows searching/found states
5. **Priority routing** - Quick navigation to booking
6. **Clear indication** - Emergency bookings marked in UI

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
- `GET /api/schedules` - Get service providers (mapped from schedules)
- `GET /api/schedules/search` - Search providers
- `POST /api/bookings` - Create service booking
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment

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
1. User selects provider and service duration
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
- **Provider locations** on interactive map
- **User location** marker
- **Distance calculation** to providers
- **Auto-fit bounds** to show all providers
- **Real-time updates** when providers change

## User Roles

### Client (CUSTOMER)
- Search and book service providers
- View bookings
- Cancel bookings
- Update profile
- Emergency booking access

### Admin (ADMIN)
- All client features
- Manage service providers
- Manage service availability
- View all bookings

## Test Accounts

From backend seed data:
- **Admin**: admin@vfsbs.com / admin123
- **Client**: customer@vfsbs.com / customer123

## Development

### Available Scripts

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Code Style
- React functional components with hooks
- Reusable UI component library
- Responsive design with CSS Grid/Flexbox
- Error handling on all API calls
- Mobile-first approach

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
- Backend compatibility maintained (uses existing schedule/route endpoints)

## License

MIT
