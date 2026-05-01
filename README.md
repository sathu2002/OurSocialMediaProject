# Intelligent User & Client Engagement Management System

A complete MERN stack application for managing clients, tasks, payments, and AI-powered insights.

## 🚀 Features

- **Role-based Authentication**: Admin, Manager, Staff, and Client roles
- **Client Management**: Full CRUD operations with package assignments
- **Task Management**: Calendar view with task assignments and status tracking
- **Feedback System**: AI-powered sentiment analysis and suggestions
- **Payment Tracking**: Invoice generation and payment status management
- **Analytics Dashboard**: Campaign performance metrics and visualizations
- **AI Insights**: Trend detection, sentiment analysis, and improvement suggestions
- **Real-time Chat**: AI assistant integrated on every page

## 🛠 Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- bcryptjs for password hashing
- Anthropic Claude AI API integration

### Frontend
- React 19 with Vite
- React Router DOM v6
- Tailwind CSS for styling
- Axios for API calls
- Recharts for data visualization
- React Icons

## 📁 Project Structure

```
project-root/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── clientController.js
│   │   ├── feedbackController.js
│   │   ├── taskController.js
│   │   ├── paymentController.js
│   │   ├── analyticsController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Feedback.js
│   │   ├── Task.js
│   │   ├── Payment.js
│   │   └── Analytics.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── aiRoutes.js
│   ├── utils/
│   │   └── aiHelper.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── StarRating.jsx
    │   │   ├── AIChatBubble.jsx
    │   │   ├── StatCard.jsx
    │   │   ├── Modal.jsx
    │   │   └── LoadingSpinner.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── LandingPage.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── ManagerDashboard.jsx
    │   │   ├── StaffDashboard.jsx
    │   │   ├── ClientDashboard.jsx
    │   │   ├── UserManagement.jsx
    │   │   ├── ClientManagement.jsx
    │   │   ├── ClientProfile.jsx
    │   │   ├── PackageManagement.jsx
    │   │   ├── TaskCalendar.jsx
    │   │   ├── TaskManagement.jsx
    │   │   ├── FeedbackForm.jsx
    │   │   ├── FeedbackHistory.jsx
    │   │   ├── PaymentDashboard.jsx
    │   │   ├── PaymentRecord.jsx
    │   │   ├── AnalyticsDashboard.jsx
    │   │   └── AIInsights.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    └── package.json
```

## 🗄️ Database Models

### User Model
- name, email, password (bcrypt hashed)
- role: Admin, Manager, Staff, Client
- isActive, createdAt

### Client Model
- userId (ref: User, optional)
- name, email, phone, company
- package: Silver, Gold, Platinum, Diamond
- registeredFrom, status, notes

### Feedback Model
- clientId (ref: Client)
- campaignName, rating (1-5), comment
- sentiment, aiSuggestion

### Task Model
- title, description
- assignedTo, assignedBy, clientId
- status: Pending, In Progress, Completed
- priority: Low, Medium, High
- dueDate, googleDriveLink

### Payment Model
- clientId, amount, currency
- package, method, status
- invoiceNumber, note, paidAt

### Analytics Model
- clientId, campaignName
- platform: Facebook, Instagram, Twitter, LinkedIn, Google, Other
- reach, impressions, engagement, clicks, conversions

## 🔐 Authentication & Authorization

- JWT tokens for authentication
- Role-based access control
- Protected routes with middleware
- Auto-logout on token expiration

## 🤖 AI Features

- **Sentiment Analysis**: Automatic feedback sentiment detection
- **Trend Detection**: Identify recurring issues from feedback
- **Role Recommendations**: AI suggests best role based on description
- **Analytics Insights**: AI analyzes performance data
- **Chat Assistant**: AI helper available on all pages

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Anthropic API Key (for AI features)

### Installation

1. Clone the repository
2. Setup Backend:
   ```bash
   cd backend
   npm install
   ```

3. Setup Frontend:
   ```bash
   cd frontend
   npm install
   ```

4. Environment Variables:
   
   **Backend (.env)**:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   PORT=5000
   ```
   
   **Frontend (.env)**:
   ```
   VITE_API_URL=http://localhost:5000
   ```

5. Start the application:
   
   **Backend**:
   ```bash
   cd backend
   node server.js
   ```
   
   **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

6. Open http://localhost:5173 in your browser

## 👥 User Roles & Permissions

### Admin
- Full access to all features
- User management (create, edit, deactivate users)
- Package management
- View all analytics and insights

### Manager
- Client management
- Task assignment and management
- Payment tracking
- View analytics and AI insights

### Staff
- View assigned tasks
- Update task status
- View task calendar

### Client
- Submit feedback
- View own analytics
- Chat with AI assistant
- Update profile information

## 📊 API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Users (Admin only)
- GET /api/users
- GET /api/users/:id
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

### Clients
- GET /api/clients
- GET /api/clients/:id
- POST /api/clients
- POST /api/clients/register (public)
- PUT /api/clients/:id
- DELETE /api/clients/:id

### Feedback
- GET /api/feedback
- GET /api/feedback/my
- POST /api/feedback
- PUT /api/feedback/:id
- DELETE /api/feedback/:id

### Tasks
- GET /api/tasks
- GET /api/tasks/my
- GET /api/tasks/calendar/:month
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

### Payments
- GET /api/payments
- GET /api/payments/stats
- GET /api/payments/client/:clientId
- POST /api/payments
- PUT /api/payments/:id
- DELETE /api/payments/:id

### Analytics
- GET /api/analytics
- GET /api/analytics/summary
- GET /api/analytics/client/:clientId
- GET /api/analytics/monthly/:month
- POST /api/analytics
- PUT /api/analytics/:id
- DELETE /api/analytics/:id

### AI Features
- POST /api/ai/chat
- POST /api/ai/sentiment
- POST /api/ai/role-recommend
- POST /api/ai/permission-explain
- POST /api/ai/trends
- POST /api/ai/suggestions
- POST /api/ai/monthly-summary
- POST /api/ai/analytics-insight

## 🎨 UI/UX Features

- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Color-coded Packages**: Silver, Gold, Platinum, Diamond
- **Interactive Charts**: Data visualization with Recharts
- **Smooth Transitions**: Hover effects and animations
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Clear error messages

## 🔧 Development

### Adding New Features
1. Create/update models in backend/models/
2. Add controllers in backend/controllers/
3. Create routes in backend/routes/
4. Mount routes in server.js
5. Create frontend components/pages
6. Add routes in App.jsx
7. Update navigation in Sidebar.jsx

### Code Style
- ES6+ JavaScript/JSX
- Async/await for API calls
- Component-based React architecture
- Tailwind CSS for styling
- Comments for complex logic

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MONGO_URI in .env
   - Ensure MongoDB is running
   - Verify network access

2. **JWT Token Issues**
   - Check JWT_SECRET is set
   - Clear browser localStorage
   - Check token expiration

3. **AI Features Not Working**
   - Verify ANTHROPIC_API_KEY
   - Check API quota limits
   - Review network connectivity

4. **CORS Errors**
   - Ensure frontend URL is in CORS whitelist
   - Check both servers are running
   - Verify API endpoint URLs

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.
#   O u r S o c i a l M e d i a P r o j e c t  
 #   O u r S o c i a l M e d i a P r o j e c t  
 