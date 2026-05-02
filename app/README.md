# SpotOn Mobile App

React Native + Expo mobile client for the SpotOn management platform. The app connects to the existing Node.js + Express + MongoDB backend with JWT authentication and role-based access.

## Setup

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install mobile dependencies:
```bash
cd app
npm install
```

3. Configure mobile environment in `app/.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.103.203:5000/api

# Optional legacy fallback
API_URL=http://192.168.103.203:5000/api
```

Use:
- `http://10.0.2.2:5000/api` for Android emulator
- `http://localhost:5000/api` for iOS simulator
- Your computer LAN IP for a physical device

4. Start the backend:
```bash
cd backend
npm start
```

5. Start the mobile app:
```bash
cd app
npm start
```

Useful mobile commands:
```bash
npm start -- --offline
npx expo start -c
npx expo export --platform android --output-dir dist-check
```

## Login Accounts

Default seeded users from the backend:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@spoton.com` | `admin123` |
| Manager | `manager@spoton.com` | `manager123` |
| Staff | `staff@spoton.com` | `staff123` |
| Client | `client@spoton.com` | `client123` |

## Mobile Features

- Splash, login, register, logout
- JWT storage with AsyncStorage
- Protected navigation with role-based tabs
- Dashboard with summary cards
- User CRUD
- Client CRUD + package/status management
- Task CRUD + calendar view + status updates
- Feedback history with automatic sentiment handling
- Payment CRUD + payment stats
- Analytics CRUD + simple charts
- AI insights from real feedback data
- Profile/logout flow

## Role Access

| Module | Admin | Manager | Staff | Client |
|---|---|---|---|---|
| Dashboard | Yes | Yes | Yes | Yes |
| Users | Yes | Read-only list for task assignment support | No | No |
| Clients | Yes | Yes | No | Own profile only via backend |
| Packages | Yes | Yes | No | No |
| Tasks | Yes | Yes | Own tasks | No |
| Calendar | Yes | Yes | Own tasks | No |
| Feedback History | View/Delete | View | No | Own CRUD |
| Payments | Yes | Yes | No | No |
| Analytics | Yes | Yes | No | No |
| AI Insights | Yes | Yes | No | No |

## API Endpoint Table

### Authentication

| Method | Endpoint | Use |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |

### Users

| Method | Endpoint | Use |
|---|---|---|
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | User details |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Deactivate user |

### Clients

| Method | Endpoint | Use |
|---|---|---|
| GET | `/api/clients` | List clients |
| GET | `/api/clients/:id` | Client details |
| POST | `/api/clients` | Create client |
| POST | `/api/clients/register` | Public client registration |
| PUT | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Deactivate client |

### Tasks

| Method | Endpoint | Use |
|---|---|---|
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/my` | Staff task list |
| GET | `/api/tasks/calendar/:month` | Tasks by month |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Feedback

| Method | Endpoint | Use |
|---|---|---|
| GET | `/api/feedback` | Admin/Manager feedback list |
| GET | `/api/feedback/my` | Client feedback list |
| POST | `/api/feedback` | Create client feedback |
| PUT | `/api/feedback/:id` | Update client feedback |
| DELETE | `/api/feedback/:id` | Delete feedback |

### Payments

| Method | Endpoint | Use |
|---|---|---|
| GET | `/api/payments` | List payments |
| GET | `/api/payments/stats` | Payment summary |
| GET | `/api/payments/client/:clientId` | Client payments |
| POST | `/api/payments` | Create payment |
| PUT | `/api/payments/:id` | Update payment |
| DELETE | `/api/payments/:id` | Delete payment |

### Analytics

| Method | Endpoint | Use |
|---|---|---|
| GET | `/api/analytics` | List analytics records |
| GET | `/api/analytics/summary` | Totals summary |
| GET | `/api/analytics/client/:clientId` | Client analytics |
| GET | `/api/analytics/monthly/:month` | Monthly analytics |
| POST | `/api/analytics` | Create analytics record |
| PUT | `/api/analytics/:id` | Update analytics record |
| DELETE | `/api/analytics/:id` | Delete analytics record |

### AI

| Method | Endpoint | Use |
|---|---|---|
| POST | `/api/ai/chat` | Chat assistant |
| POST | `/api/ai/sentiment` | Sentiment check |
| POST | `/api/ai/analytics-insight` | Analytics insight |
| POST | `/api/ai/trends` | Trend analysis |
| POST | `/api/ai/suggestions` | Improvement suggestions |
| POST | `/api/ai/monthly-summary` | Monthly summary |

## System Architecture

The mobile app is a client-only layer on top of the existing backend:

1. `React Native + Expo` handles UI, navigation, and device runtime.
2. `Axios` in `src/api/` sends requests to the hosted backend URL from `.env`.
3. `AsyncStorage` stores the JWT token and user session.
4. `AuthContext` restores the session and gates protected routes.
5. Backend validates JWT, applies role permissions, and reads/writes MongoDB.

Main app structure:

```text
app/
  App.js
  src/
    api/
    components/
    context/
    navigation/
    screens/
      auth/
      main/
    styles/
    utils/
```

## Database Schema Summary

### Users
- `name`
- `email`
- `password`
- `role`: `Admin | Manager | Staff | Client`
- `isActive`

### Clients
- `userId`
- `name`
- `email`
- `phone`
- `company`
- `package`: `Silver | Gold | Platinum | Diamond`
- `status`: `active | inactive`
- `packageAssignedAt`

### Tasks
- `title`
- `description`
- `assignedTo`
- `assignedBy`
- `clientId`
- `status`: `Pending | In Progress | Completed`
- `priority`: `Low | Medium | High`
- `dueDate`
- `calendarMonth`

### Feedback
- `clientId`
- `campaignName`
- `rating`
- `comment`
- `sentiment`: `positive | neutral | negative`
- `aiSuggestion`

### Payments
- `clientId`
- `amount`
- `currency`
- `package`
- `method`: `Cash | Bank Transfer | Cheque | Online`
- `status`: `Paid | Pending | Overdue`
- `invoiceNumber`
- `note`
- `paidAt`

### Analytics
- `clientId`
- `campaignName`
- `platform`
- `reach`
- `impressions`
- `engagement`
- `clicks`
- `conversions`
- `reportMonth`

## 6-Member Responsibility Breakdown

1. Backend/API owner
Builds Express routes, controllers, auth middleware, and MongoDB integration.

2. Mobile UI owner
Builds shared components, theme system, spacing, cards, and responsive screens.

3. Auth/navigation owner
Maintains splash flow, login/register/logout, token persistence, and protected routes.

4. CRUD/features owner
Implements users, clients, tasks, payments, feedback, analytics, and package flows.

5. AI/insights owner
Maintains sentiment utilities, AI insight screens, summaries, and feedback analysis UX.

6. QA/documentation owner
Runs verification, maintains README, test checklist, and release notes.

## Testing Checklist

### Authentication
- [ ] Splash screen appears
- [ ] Login works for all four seeded roles
- [ ] Logout clears AsyncStorage
- [ ] Protected tabs change by role

### Users
- [ ] List users loads
- [ ] Search works
- [ ] Create user works
- [ ] Edit user works
- [ ] Delete/deactivate user works

### Clients
- [ ] List/search/filter works
- [ ] Create client works
- [ ] Edit client works
- [ ] Delete/deactivate client works
- [ ] Package/status display is correct

### Tasks
- [ ] List/search/filter works
- [ ] Create task works
- [ ] Edit task works
- [ ] Delete task works
- [ ] Staff can update own task status
- [ ] Calendar shows tasks by date

### Feedback
- [ ] Client can add feedback
- [ ] Client can edit feedback within backend rules
- [ ] Delete feedback works for allowed roles
- [ ] Sentiment filtering works
- [ ] AI sentiment is saved by backend

### Payments
- [ ] Payment list loads
- [ ] Payment stats load
- [ ] Create payment works
- [ ] Update payment works
- [ ] Delete payment works
- [ ] Search/filter works

### Analytics
- [ ] Analytics list loads
- [ ] Create record works
- [ ] Edit record works
- [ ] Delete record works
- [ ] Charts render

### General
- [ ] No red screen on login or dashboard
- [ ] Mobile tabs render cleanly
- [ ] Empty states show when data is missing
- [ ] Errors show clear messages
- [ ] Pull-to-refresh works

## File Upload Support

The current backend does not expose a multipart upload endpoint, so file upload is not connected in the mobile app.

## How To Test Each Module

1. Start the backend with `npm start` in `backend/`.
2. Start Expo with `npm start` in `app/`.
3. Login as `Admin` and verify users, clients, packages, tasks, payments, analytics, and AI insights.
4. Login as `Manager` and verify client/task/payment/analytics access without admin-only create-user access.
5. Login as `Staff` and verify only assigned tasks and calendar entries appear.
6. Login as `Client` and verify feedback CRUD and personal dashboard data.
7. Pull to refresh on every tab.
8. Try invalid forms to confirm validation messages.
9. Delete one record in each admin module and confirm list refresh.
10. Re-login after logout to confirm token persistence and cleanup.
