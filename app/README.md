# ITP Mobile App

A React Native mobile application built with Expo that connects to the existing MERN backend API.

## Features

- **Authentication**: JWT-based login and registration with secure token storage
- **Role-Based Navigation**: Different screens based on user role (Admin, Manager, Staff, Client)
- **Dashboard**: Overview with statistics and recent tasks
- **Clients Management**: View client list with package and status information
- **Tasks**: View and filter tasks by status
- **Analytics**: View performance metrics and summaries
- **Payments**: View payment records and statistics
- **Feedback**: Submit and view feedback (Client role)
- **AI Assistant**: Chat with AI for insights and recommendations
- **Profile**: User profile and settings

## Tech Stack

- **React Native** with Expo
- **React Navigation** (Stack & Bottom Tab)
- **Axios** for API integration
- **Expo Secure Store** for JWT token storage
- **Context API** for state management

## Project Structure

```
app/
├── App.js                      # Main entry point
├── package.json                # Dependencies
├── app.json                    # Expo configuration
├── babel.config.js             # Babel configuration
├── .env.example                # Environment variables template
├── src/
│   ├── api/
│   │   └── api.js              # Axios configuration and API endpoints
│   ├── components/
│   │   ├── Button.js           # Reusable button component
│   │   ├── Input.js            # Form input component
│   │   ├── Card.js             # Card container component
│   │   ├── Loading.js          # Loading indicator
│   │   ├── ErrorMessage.js     # Error display component
│   │   ├── EmptyState.js       # Empty state display
│   │   └── index.js            # Component exports
│   ├── context/
│   │   └── AuthContext.js      # Authentication context provider
│   ├── navigation/
│   │   ├── AppNavigator.js     # Main navigator (Auth/Main switch)
│   │   ├── AuthNavigator.js    # Authentication stack
│   │   └── MainNavigator.js    # Main app tabs with role-based filtering
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js  # Login screen
│   │   │   └── RegisterScreen.js # Registration screen
│   │   └── main/
│   │       ├── HomeScreen.js       # Dashboard
│   │       ├── ClientsScreen.js    # Clients list
│   │       ├── TasksScreen.js      # Tasks list
│   │       ├── AnalyticsScreen.js  # Analytics
│   │       ├── PaymentsScreen.js   # Payments
│   │       ├── FeedbackScreen.js   # Feedback
│   │       ├── AIChatScreen.js     # AI Chat
│   │       └── ProfileScreen.js    # User profile
│   ├── styles/
│   │   └── theme.js            # Colors, typography, spacing
│   └── utils/
│       └── helpers.js          # Utility functions (optional)
└── assets/
    ├── fonts/                  # Custom fonts
    └── images/                 # App images
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

## Setup Instructions

### 1. Install Dependencies

```bash
cd app
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the API URL:

```bash
cp .env.example .env
```

Edit `.env` file with your backend API URL:

```env
# For iOS Simulator:
API_URL=http://localhost:5000/api

# For Android Emulator:
# API_URL=http://10.0.2.2:5000/api

# For physical device (use your computer's IP):
# API_URL=http://192.168.1.100:5000/api
```

### 3. Update Backend CORS (if needed)

Make sure your backend allows requests from the mobile app. In `backend/server.js`, update the CORS configuration:

```javascript
// Allow requests from mobile app
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:8081'],
  credentials: true 
}));
```

### 4. Start the Backend Server

Make sure your backend is running on the configured port (default: 5000):

```bash
cd backend
npm start
```

### 5. Start the Mobile App

```bash
cd app
npm start
```

This will start the Expo development server and display a QR code.

### 6. Run on Device/Simulator

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app

## Backend API Integration

The mobile app connects to the following backend API endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Clients
- `GET /api/clients` - Get all clients (Admin/Manager)
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create client (Admin/Manager)
- `POST /api/clients/register` - Public client registration
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client (Admin)

### Tasks
- `GET /api/tasks` - Get all tasks (Admin/Manager)
- `GET /api/tasks/my` - Get my tasks (Staff)
- `GET /api/tasks/calendar/:month` - Get tasks by month
- `POST /api/tasks` - Create task (Admin/Manager)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Admin/Manager)

### Feedback
- `GET /api/feedback` - Get all feedback (Admin/Manager)
- `GET /api/feedback/my` - Get my feedback (Client)
- `POST /api/feedback` - Create feedback (Client)
- `PUT /api/feedback/:id` - Update feedback (Client)
- `DELETE /api/feedback/:id` - Delete feedback

### Payments
- `GET /api/payments` - Get all payments (Admin/Manager)
- `GET /api/payments/stats` - Get payment statistics
- `GET /api/payments/client/:clientId` - Get client payments
- `POST /api/payments` - Create payment (Admin/Manager)
- `PUT /api/payments/:id` - Update payment (Admin/Manager)
- `DELETE /api/payments/:id` - Delete payment (Admin)

### Analytics
- `GET /api/analytics` - Get all analytics (Admin/Manager)
- `GET /api/analytics/summary` - Get analytics summary
- `GET /api/analytics/client/:clientId` - Get client analytics
- `GET /api/analytics/monthly/:month` - Get monthly analytics

### AI
- `POST /api/ai/chat` - AI chat
- `POST /api/ai/sentiment` - Sentiment analysis
- `POST /api/ai/analytics-insight` - Analytics insights
- `POST /api/ai/role-recommend` - Role recommendations (Admin)
- `POST /api/ai/permission-explain` - Permission explanations (Admin)
- `POST /api/ai/trends` - Trends analysis (Admin/Manager)
- `POST /api/ai/suggestions` - Suggestions (Admin/Manager)
- `POST /api/ai/monthly-summary` - Monthly summary (Admin/Manager)

## Role-Based Access

### Admin
- Full access to all features
- Can manage users, clients, tasks, payments, analytics
- Access to AI assistant

### Manager
- Manage clients, tasks, payments
- View analytics
- Access to AI assistant

### Staff
- View assigned tasks
- Update task status
- View personal dashboard

### Client
- Submit feedback
- View personal tasks
- View personal dashboard

## Customization

### Colors
Update `src/styles/theme.js` to change the color scheme:
- Primary: Blue (#1e40af)
- Navy Dark: (#0f172a)
- Accent: (#2563eb)

### API URL
Update the `API_URL` in `src/api/api.js` or use environment variables.

## Troubleshooting

### Connection Issues
- Ensure backend server is running
- Check that the IP address in `.env` matches your computer's IP
- Verify CORS settings in backend

### Authentication Issues
- Check that JWT_SECRET is properly set in backend `.env`
- Clear app storage and restart
- Verify token is being stored correctly in SecureStore

### Expo Issues
- Clear Expo cache: `expo r -c`
- Update Expo CLI: `npm install -g expo-cli`
- Check Node.js version compatibility

## Build for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

Or use EAS Build:
```bash
eas build --platform ios
eas build --platform android
```

## License

This project is part of the ITP system.
