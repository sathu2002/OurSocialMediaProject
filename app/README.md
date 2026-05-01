# SpotOn - Digital Marketing Management Platform

## Project Title
**SpotOn: A Comprehensive Digital Marketing Management Platform with Mobile Application**

## Problem Statement

In today's digital marketing landscape, businesses struggle with managing multiple campaigns, tracking client relationships, handling payments, and analyzing performance metrics across different platforms. Traditional marketing management systems lack integrated solutions that combine campaign management, client relationship management, payment processing, and AI-powered analytics in a unified platform.

This project addresses these challenges by developing a comprehensive digital marketing management platform with both web and mobile applications that provides:

1. **Unified Campaign Management**: Centralized platform for creating, managing, and tracking marketing campaigns across multiple channels
2. **Client Relationship Management**: Complete client lifecycle management with package subscriptions and performance tracking
3. **Automated Analytics**: AI-powered sentiment analysis, performance metrics, and actionable insights
4. **Seamless Payment Processing**: Integrated payment management with subscription packages
5. **Cross-Platform Accessibility**: Web and mobile applications for on-the-go management

## System Architecture

### Overview
The SpotOn platform follows a **Three-Tier Architecture** with **MERN Stack** backend and **React Native** mobile application:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│                 │    │                 │    │                 │
│ React Web App   │◄──►│ Node.js/Express │◄──►│ MongoDB        │
│ React Native    │    │ REST API        │    │ Collections     │
│ Mobile App      │    │ JWT Auth        │    │ Documents       │
│                 │    │ AI Integration  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Components
- **Web Application**: React.js with modern UI components
- **Mobile Application**: React Native with Expo framework
- **Responsive Design**: Mobile-first approach with web compatibility

### Backend Components
- **API Server**: Node.js with Express.js framework
- **Authentication**: JWT-based secure authentication system
- **AI Integration**: Natural Language Processing for sentiment analysis
- **Business Logic**: Comprehensive CRUD operations with validation

### Database Design
- **NoSQL Database**: MongoDB for flexible data storage
- **Document Structure**: Optimized for marketing campaign data
- **Relationships**: Embedded documents for performance optimization

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // Hashed
  role: String, // Admin, Manager, Staff, Client
  createdAt: Date,
  updatedAt: Date
}
```

### Clients Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  company: String,
  phone: String,
  package: String, // Silver, Gold, Platinum, Diamond
  packageAssignedAt: Date,
  status: String, // Active, Inactive
  userId: ObjectId, // Reference to Users
  createdAt: Date,
  updatedAt: Date
}
```

### Campaigns Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  client: ObjectId, // Reference to Clients
  platform: String, // Social Media, Email, Website, Mobile App
  status: String, // Active, Paused, Completed, Cancelled
  budget: Number,
  targetAudience: String,
  reach: Number,
  engagement: Number,
  clicks: Number,
  conversions: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  assignedTo: ObjectId, // Reference to Users
  clientId: ObjectId, // Reference to Clients
  status: String, // Pending, In Progress, Completed
  priority: String, // Low, Medium, High, Urgent
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Payments Collection
```javascript
{
  _id: ObjectId,
  clientId: ObjectId, // Reference to Clients
  amount: Number,
  currency: String,
  status: String, // Pending, Completed, Failed
  paymentMethod: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Feedback Collection
```javascript
{
  _id: ObjectId,
  clientId: ObjectId, // Reference to Clients
  campaignName: String,
  rating: Number, // 1-5 stars
  comment: String,
  sentiment: String, // Positive, Neutral, Negative (AI-generated)
  createdAt: Date,
  updatedAt: Date
}
```

### Analytics Collection
```javascript
{
  _id: ObjectId,
  clientId: ObjectId, // Reference to Clients
  metric: String,
  value: Number,
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoint Table

### Authentication Endpoints
| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |

### User Management Endpoints
| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Client Management Endpoints
| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/api/clients` | Get all clients | Admin, Manager |
| GET | `/api/clients/:id` | Get client by ID | Admin, Manager, Client |
| POST | `/api/clients` | Create client | Admin, Manager |
| POST | `/api/clients/register` | Public client registration | Public |
| PUT | `/api/clients/:id` | Update client | Admin, Manager, Client |
| DELETE | `/api/clients/:id` | Delete client | Admin |

### Campaign Management Endpoints
| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/api/campaigns` | Get all campaigns | Admin, Manager |
| GET | `/api/campaigns/:id` | Get campaign by ID | Admin, Manager |
| POST | `/api/campaigns` | Create campaign | Admin, Manager |
| PUT | `/api/campaigns/:id` | Update campaign | Admin, Manager |
| DELETE | `/api/campaigns/:id` | Delete campaign | Admin, Manager |

### Task Management Endpoints
| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/api/tasks` | Get all tasks | Admin, Manager |
| GET | `/api/tasks/my` | Get my tasks | Staff |
| GET | `/api/tasks/calendar/:month` | Get tasks by month | All Roles |
| POST | `/api/tasks` | Create task | Admin, Manager |
| PUT | `/api/tasks/:id` | Update task | Admin, Manager, Staff |
| DELETE | `/api/tasks/:id` | Delete task | Admin, Manager |

### Payment Management Endpoints
| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/api/payments` | Get all payments | Admin, Manager |
| GET | `/api/payments/stats` | Get payment statistics | Admin, Manager |
| GET | `/api/payments/client/:clientId` | Get client payments | Admin, Manager, Client |
| POST | `/api/payments` | Create payment | Admin, Manager |
| PUT | `/api/payments/:id` | Update payment | Admin, Manager |
| DELETE | `/api/payments/:id` | Delete payment | Admin |

### Feedback Management Endpoints
| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/api/feedback` | Get all feedback | Admin, Manager |
| GET | `/api/feedback/my` | Get my feedback | Client |
| POST | `/api/feedback` | Create feedback | Client |
| PUT | `/api/feedback/:id` | Update feedback | Client |
| DELETE | `/api/feedback/:id` | Delete feedback | Admin, Manager |

### Analytics Endpoints
| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| GET | `/api/analytics` | Get all analytics | Admin, Manager |
| GET | `/api/analytics/summary` | Get analytics summary | Admin, Manager |
| GET | `/api/analytics/client/:clientId` | Get client analytics | Admin, Manager, Client |
| GET | `/api/analytics/monthly/:month` | Get monthly analytics | Admin, Manager |

### AI Integration Endpoints
| Method | Endpoint | Description | Access |
|---------|----------|-------------|--------|
| POST | `/api/ai/chat` | AI chat assistant | All Roles |
| POST | `/api/ai/sentiment` | Sentiment analysis | All Roles |
| POST | `/api/ai/analytics-insight` | Analytics insights | Admin, Manager |
| POST | `/api/ai/trends` | Trends analysis | Admin, Manager |

## Setup Steps

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Git for version control

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ITP_Project_01
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Database Setup
```bash
# Start MongoDB service
# For local MongoDB:
mongod

# For MongoDB Atlas (cloud):
# Update connection string in backend/.env
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

### 5. Mobile App Setup
```bash
cd app
npm install
```

## Environment Configuration

### Backend Environment Variables (.env)
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/spoton_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# AI Configuration (if using external AI service)
AI_API_KEY=your_ai_api_key_here
AI_BASE_URL=https://api.openai.com/v1
```

### Mobile App Environment Variables (.env)
```env
# API Configuration
API_URL=http://localhost:5000/api

# For Android Emulator:
# API_URL=http://10.0.2.2:5000/api

# For iOS Simulator:
# API_URL=http://localhost:5000/api

# For Physical Device:
# API_URL=http://YOUR_COMPUTER_IP:5000/api
```

### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Backend Hosted API URL Instructions

### Local Development
1. **Start Backend Server**:
   ```bash
   cd backend
   npm start
   ```
   Server will run on `http://localhost:5000`

2. **Find Your Computer's IP** (for physical device testing):
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
   - Example: `192.168.1.100`

3. **Update Mobile App .env**:
   ```env
   API_URL=http://192.168.1.100:5000/api
   ```

### Production Deployment
1. **Backend Hosting Options**:
   - **Heroku**: Easy deployment with free tier
   - **DigitalOcean**: Reliable cloud hosting
   - **AWS EC2**: Scalable cloud solution
   - **Vercel**: Serverless deployment

2. **Update API URLs**:
   ```env
   # Production
   API_URL=https://your-backend-domain.com/api
   ```

## Mobile App Run Commands

### Development
```bash
cd app

# Start Expo Development Server
npx expo start

# Start with Clear Cache
npx expo start --clear

# Start for Specific Platform
npx expo start --ios     # iOS Simulator
npx expo start --android  # Android Emulator
npx expo start --web      # Web Browser
```

### Build Commands
```bash
# Build for Production
npx expo build:ios
npx expo build:android

# EAS Build (Recommended)
eas build --platform ios
eas build --platform android
eas build --platform all
```

### Testing Commands
```bash
# Run Tests
npx jest

# Run Tests with Coverage
npx jest --coverage

# Run Linting
npx eslint src/
```

## Default Login Accounts

### Admin Account
- **Email**: `admin@spoton.com`
- **Password**: `admin123`
- **Role**: Administrator
- **Access**: Full system access

### Manager Account
- **Email**: `manager@spoton.com`
- **Password**: `manager123`
- **Role**: Manager
- **Access**: Client management, analytics, payments

### Staff Account
- **Email**: `staff@spoton.com`
- **Password**: `staff123`
- **Role**: Staff
- **Access**: Task management, dashboard

### Client Account
- **Email**: `client@spoton.com`
- **Password**: `client123`
- **Role**: Client
- **Access**: Feedback, personal dashboard

## 6-Member Responsibility Breakdown

### Team Member 1: Project Lead & Backend Architecture
**Responsibilities**:
- Overall project coordination and timeline management
- Backend API design and implementation
- Database schema design and optimization
- Authentication and authorization systems
- Code review and quality assurance

**Key Deliverables**:
- Complete backend API with all endpoints
- Database models and relationships
- Authentication middleware
- API documentation

### Team Member 2: Frontend Web Development
**Responsibilities**:
- React.js web application development
- UI/UX implementation and responsive design
- State management with Redux/Context API
- Component library development
- Web application testing

**Key Deliverables**:
- Complete web application
- Reusable component library
- Responsive design implementation
- Web application testing suite

### Team Member 3: Mobile Application Development
**Responsibilities**:
- React Native mobile app development
- Mobile UI/UX design and implementation
- Navigation and routing setup
- Mobile-specific features implementation
- Mobile app testing and optimization

**Key Deliverables**:
- Complete mobile application
- Mobile-optimized UI components
- Navigation system
- Mobile testing suite

### Team Member 4: AI Integration & Analytics
**Responsibilities**:
- AI service integration and implementation
- Sentiment analysis algorithms
- Analytics dashboard development
- Data visualization components
- Performance metrics calculation

**Key Deliverables**:
- AI integration services
- Sentiment analysis system
- Analytics dashboards (web & mobile)
- Data visualization components

### Team Member 5: Database Management & Testing
**Responsibilities**:
- Database setup and configuration
- Data migration and seeding
- API testing and validation
- Performance testing and optimization
- Bug tracking and resolution

**Key Deliverables**:
- Database setup scripts
- Test data seeding
- Comprehensive test suite
- Performance optimization reports

### Team Member 6: DevOps & Deployment
**Responsibilities**:
- CI/CD pipeline setup
- Deployment configuration
- Environment management
- Security implementation
- Documentation and user guides

**Key Deliverables**:
- Deployment pipelines
- Environment configurations
- Security implementations
- Complete documentation

## Testing Checklist

### Backend Testing
- [ ] **Unit Tests**: All API endpoints tested
- [ ] **Integration Tests**: Database operations tested
- [ ] **Authentication Tests**: JWT token validation
- [ ] **Authorization Tests**: Role-based access control
- [ ] **Error Handling Tests**: Proper error responses
- [ ] **Performance Tests**: API response times
- [ ] **Security Tests**: Input validation and sanitization

### Frontend Testing
- [ ] **Component Tests**: All React components tested
- [ ] **Integration Tests**: Component interactions
- [ ] **Navigation Tests**: Routing and navigation
- [ ] **Form Tests**: Form validation and submission
- [ ] **API Integration Tests**: Backend connectivity
- [ ] **Responsive Tests**: Mobile and desktop layouts
- [ ] **Cross-browser Tests**: Browser compatibility

### Mobile Testing
- [ ] **Unit Tests**: Mobile components tested
- [ ] **Integration Tests**: Mobile API integration
- [ ] **Navigation Tests**: Mobile navigation flow
- [ ] **Authentication Tests**: Mobile login/logout
- [ ] **Device Tests**: iOS and Android compatibility
- [ ] **Performance Tests**: Mobile app performance
- [ ] **Usability Tests**: Mobile user experience

### End-to-End Testing
- [ ] **User Journey Tests**: Complete user workflows
- [ ] **Cross-Platform Tests**: Web and mobile integration
- [ ] **Data Consistency Tests**: Data synchronization
- [ ] **Performance Tests**: Overall system performance
- [ ] **Security Tests**: End-to-end security validation
- [ ] **Load Tests**: System behavior under load

### Manual Testing Checklist
- [ ] **Registration Flow**: New user registration
- [ ] **Login Flow**: User authentication
- [ ] **Dashboard Loading**: Data display and statistics
- [ ] **CRUD Operations**: Create, read, update, delete for all entities
- [ ] **Role-Based Access**: Proper role restrictions
- [ ] **Mobile Responsiveness**: Mobile layout and functionality
- [ ] **Error Handling**: Proper error messages and recovery
- [ ] **Payment Processing**: Payment creation and status updates
- [ ] **Feedback System**: Feedback submission and display
- [ ] **Analytics Display**: Charts and metrics visualization
- [ ] **AI Integration**: Sentiment analysis and insights

## Deployment Explanation

### Development Environment
1. **Local Development**:
   - Backend: `npm start` on port 5000
   - Frontend: `npm run dev` on port 5173
   - Mobile: `npx expo start` on port 8081
   - Database: Local MongoDB instance

2. **Environment Variables**:
   - Separate configurations for development, staging, and production
   - Secure storage of sensitive information
   - Environment-specific API endpoints

### Production Deployment Strategy

#### Backend Deployment
1. **Cloud Hosting**: Deploy to Heroku, DigitalOcean, or AWS
2. **Database**: Use MongoDB Atlas for production database
3. **Environment Variables**: Configure production environment
4. **Security**: Implement HTTPS, CORS, and security headers
5. **Monitoring**: Add logging and monitoring services

#### Frontend Deployment
1. **Static Hosting**: Deploy to Vercel, Netlify, or AWS S3
2. **Build Optimization**: Minimize and optimize production build
3. **CDN Integration**: Use CDN for faster content delivery
4. **Environment Configuration**: Production API endpoints
5. **Performance**: Implement caching strategies

#### Mobile App Deployment
1. **App Store**: Submit to Apple App Store and Google Play Store
2. **Build Configuration**: Production builds with proper signing
3. **Version Management**: Semantic versioning and release management
4. **Analytics**: Implement crash reporting and usage analytics
5. **Updates**: Over-the-air updates for React Native

### CI/CD Pipeline
1. **Version Control**: Git-based version control with branching
2. **Automated Testing**: Run test suite on every commit
3. **Automated Builds**: Build and test on merge to main branch
4. **Automated Deployment**: Deploy to staging on successful tests
5. **Production Deployment**: Manual approval for production deployment

### Monitoring and Maintenance
1. **Performance Monitoring**: Track application performance
2. **Error Tracking**: Monitor and alert on errors
3. **User Analytics**: Track user behavior and usage
4. **Security Monitoring**: Monitor for security threats
5. **Backup Strategy**: Regular database backups and recovery plans

## Tech Stack Summary

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

### Frontend Web
- **React.js**: JavaScript library for UI
- **React Router**: Client-side routing
- **Axios**: HTTP client library
- **Tailwind CSS**: Utility-first CSS framework
- **Chart.js**: Data visualization library

### Mobile App
- **React Native**: Mobile app framework
- **Expo**: Development platform for React Native
- **React Navigation**: Navigation library
- **AsyncStorage**: Local storage
- **Expo Secure Store**: Secure storage

### Development Tools
- **Git**: Version control system
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Expo CLI**: Development tools

---

## License

This project is developed as part of the ITP (Information Technology Project) course. All rights reserved to the development team.

## Contact

For any questions or support, please contact the development team through the course instructor or project coordinator.

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
