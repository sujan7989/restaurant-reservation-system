# Restaurant Reservation Management System

A full-stack web application for managing restaurant table reservations with role-based access control for customers and administrators.

## Technology Stack

- **Frontend**: React 18 with Vite, Framer Motion, Lucide React
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Features

### Customer Functionality
- User registration and login with modern UI
- Create table reservations with date, time slot, and guest count
- View personal reservation history
- Cancel own reservations with confirmation dialogs
- Real-time availability checking
- Toast notifications for user feedback
- Loading skeletons and empty states

### Administrator Functionality
- View all reservations across the system
- Filter reservations by date
- Create, edit, and cancel any reservation
- Manage restaurant tables (add, edit, delete)
- View table configurations and capacities
- Modern card-based table management
- Tab-based navigation between reservations and tables
- Confirmation dialogs for destructive actions

### UI/UX Features
- Modern, premium SaaS-inspired design
- Responsive layout (mobile, tablet, desktop)
- Smooth animations with Framer Motion
- Toast notifications for user feedback
- Confirmation dialogs for critical actions
- Loading skeletons for better perceived performance
- Empty states for better UX
- Beautiful cards with subtle shadows
- Premium color palette (slate, indigo accents)
- Consistent typography and spacing
- Accessible components

### System Features
- Role-based access control (Customer vs Admin)
- Conflict prevention (no double bookings)
- Capacity validation (table must accommodate guest count)
- Time slot management (5 predefined slots)
- Soft delete for reservations (status-based cancellation)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant-reservation
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

4. Seed the database with initial data:
```bash
npm run seed
```

This will create:
- Admin user: `admin@restaurant.com` / `admin123`
- Test customer: `customer@test.com` / `customer123`
- 8 sample tables with varying capacities

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Reservations
- `GET /api/reservations` - Get reservations (filtered by user role)
- `GET /api/reservations/available` - Get available tables for booking
- `POST /api/reservations` - Create a new reservation
- `GET /api/reservations/:id` - Get single reservation
- `PUT /api/reservations/:id` - Update reservation (admin only)
- `DELETE /api/reservations/:id` - Cancel reservation

### Tables
- `GET /api/tables` - Get all tables
- `GET /api/tables/:id` - Get single table
- `POST /api/tables` - Create table (admin only)
- `PUT /api/tables/:id` - Update table (admin only)
- `DELETE /api/tables/:id` - Delete table (admin only)

## Assumptions Made

1. **Single Restaurant**: The system is designed for a single restaurant location.
2. **Fixed Time Slots**: Reservations are limited to 5 predefined 2-hour time slots:
   - 11:00-13:00 (Lunch)
   - 13:00-15:00 (Late Lunch)
   - 17:00-19:00 (Early Dinner)
   - 19:00-21:00 (Dinner)
   - 21:00-23:00 (Late Dinner)
3. **Table Configuration**: Tables are pre-configured with fixed seating capacities.
4. **Date Handling**: All dates are stored and handled in UTC timezone.
5. **User Roles**: Only two roles are supported - customer and admin.
6. **Reservation Status**: Reservations use soft delete via status field (confirmed/cancelled).

## Reservation and Availability Logic

### Conflict Prevention
The system prevents double bookings through the following logic:

1. **Availability Check**: When creating a reservation, the system queries for existing confirmed reservations with the same:
   - Table ID
   - Date
   - Time slot

2. **Capacity Validation**: The system ensures that the selected table's capacity is sufficient for the requested number of guests.

3. **Atomic Operations**: Reservation creation and updates check for conflicts before committing changes.

### Availability Query Flow
1. Customer selects date, time slot, and number of guests
2. System queries tables with capacity >= requested guests
3. System filters out tables with existing confirmed reservations for the selected date/time
4. Customer selects from available tables
5. Reservation is created with conflict check as final validation

### Update Conflict Handling
When an admin updates a reservation:
- The system checks for conflicts excluding the current reservation being updated
- This allows moving reservations between tables/time slots without self-conflict errors

## Role-Based Access Control

### Customer Role
- Can only view their own reservations
- Can create new reservations
- Can cancel only their own reservations
- Cannot access admin dashboard or table management
- Cannot modify other users' reservations

### Admin Role
- Can view all reservations in the system
- Can filter reservations by date
- Can create, edit, and cancel any reservation
- Can manage all tables (CRUD operations)
- Has dedicated admin dashboard with extended functionality
- Can assign tables to any user's reservation

### Implementation
- **Backend**: JWT tokens contain user ID; middleware verifies role before allowing access to protected routes
- **Frontend**: AuthContext manages user state; ProtectedRoute component redirects based on role
- **API Security**: All protected routes require valid JWT token in Authorization header

## Known Limitations

1. **No Real-time Updates**: The system does not use WebSockets or real-time notifications
2. **No Payment Integration**: Reservations do not require payment or deposit
3. **No Email Notifications**: Users do not receive confirmation or reminder emails
4. **No Waitlist**: If no tables are available, customers cannot join a waitlist
5. **Single Restaurant**: Cannot handle multiple restaurant locations
6. **Time Slot Rigidity**: Cannot accommodate custom time durations or overlapping slots
7. **No Recurring Reservations**: Cannot set up recurring weekly/monthly reservations
8. **Modern UI**: The interface has a modern, premium SaaS-inspired design with smooth animations
9. **No Analytics**: No reporting or analytics features for administrators
10. **No User Profile Management**: Users cannot update their profile information after registration

## Areas for Improvement with Additional Time

1. **Real-time Features**: Add WebSocket support for live availability updates
2. **Email Notifications**: Implement email service for booking confirmations and reminders
3. **Payment Integration**: Add payment processing for reservation deposits
4. **Advanced Scheduling**: Support custom time slots and flexible durations
5. **Multi-restaurant Support**: Extend to handle multiple restaurant locations
6. **Waitlist System**: Implement waitlist functionality when no tables are available
7. **User Profiles**: Allow users to update their information and preferences
8. **Analytics Dashboard**: Add charts and metrics for restaurant performance
9. **Mobile App**: Develop a mobile application using React Native
10. **Review System**: Allow customers to leave reviews after dining
11. **Table Visualization**: Add visual table layout for better table selection
12. **Calendar View**: Implement calendar-based reservation viewing
13. **Export Features**: Allow admins to export reservations to CSV/PDF
14. **Rate Limiting**: Add API rate limiting to prevent abuse

## Database Schema

### User Collection
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['customer', 'admin'], default: 'customer'),
  createdAt: Date,
  updatedAt: Date
}
```

### Table Collection
```javascript
{
  tableNumber: Number (required, unique),
  capacity: Number (required, min: 1),
  location: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Reservation Collection
```javascript
{
  user: ObjectId (ref: User, required),
  table: ObjectId (ref: Table, required),
  date: Date (required),
  timeSlot: String (enum: predefined slots, required),
  numberOfGuests: Number (required, min: 1),
  status: String (enum: ['confirmed', 'cancelled'], default: 'confirmed'),
  createdAt: Date,
  updatedAt: Date
}
```

## Deployment

The application is designed to be deployed on platforms like:
- **Backend**: Render, Railway, Heroku
- **Frontend**: Vercel, Netlify, or served from the same backend

For production deployment:
1. Set environment variables for MongoDB URI, JWT secret, and FRONTEND_URL (your Vercel domain, e.g. `https://your-app.vercel.app`)
2. Build the frontend: `npm run build`
3. Configure CORS via the `FRONTEND_URL` environment variable on Render
4. Use a production MongoDB instance (MongoDB Atlas recommended)

## License

This project is created for educational purposes.
