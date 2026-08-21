# Frontend-Backend Integration Guide

## ✅ Integration Complete!

The frontend has been successfully integrated with the backend API. Here's what was done:

## Changes Made

### 1. **API Service Layer** (`src/lib/api.ts`)

- Created centralized Axios instance with:
  - Base URL configuration from environment variables
  - JWT token interceptor (auto-adds to headers)
  - 401 error handling (auto-logout on unauthorized)
- Implemented all API methods:
  - Auth: login, register, getProfile, updateProfile
  - Challenges: create, getAll, getById, join, updateStatus
  - Dashboard: getOverview, getTodayStatus, getChallengeProgress, getChallengeLeaderboard
  - LeetCode: session management, profile, test connection

### 2. **Environment Configuration** (`.env`)

```env
VITE_API_URL=http://localhost:3000
```

### 3. **AuthContext Updated** (`src/contexts/AuthContext.tsx`)

- Replaced mock authentication with real API calls
- Stores JWT token in localStorage
- Persists user session across page refreshes
- Auto-logout on 401 errors

### 4. **Pages Updated with Real APIs**

#### Login Page (`src/pages/Login.tsx`)

- Already connected to AuthContext ✅
- Handles API errors gracefully

#### Register Page (`src/pages/Register.tsx`)

- Already connected to AuthContext ✅
- Creates user with backend API

#### Dashboard (`src/pages/Dashboard.tsx`)

- Loads real dashboard data from `/api/dashboard`
- Fetches today's status
- Displays active challenges
- Shows loading states

#### Create Challenge (`src/pages/CreateChallenge.tsx`)

- Submits challenge data to `/api/challenges`
- Maps frontend difficulty to backend difficultyFilter
- Handles validation and errors
- Added description field

#### Challenge Page (`src/pages/ChallengePage.tsx`)

- Loads challenge details from `/api/challenges/:id`
- Fetches leaderboard data
- Implements "Join Challenge" functionality
- Shows loading states

### 5. **Protected Routes** (`src/components/common/ProtectedRoute.tsx`)

- Already implemented in App.tsx ✅
- Redirects unauthenticated users to login

## Running the Application

### Start Backend:

```bash
cd backend
npm start
```

Backend runs on: `http://localhost:3000`

### Start Frontend:

```bash
cd frontend
npm install  # if you haven't already
npm run dev
```

Frontend runs on: `http://localhost:5173` (or similar Vite port)

## Testing the Integration

### 1. Register/Login Flow:

1. Go to `/register`
2. Create an account with your LeetCode username
3. You'll be auto-logged in and redirected to dashboard

### 2. Create Challenge:

1. Click "New Challenge" button
2. Fill in challenge details (name, target, difficulty, dates)
3. Submit - you'll see it in your dashboard

### 3. Join Challenge:

1. Navigate to a challenge page
2. Click "Join Challenge"
3. You'll be added to the leaderboard

### 4. Dashboard:

- View all active challenges
- See today's status
- Check penalties and stats

## API Request Examples

### Login:

```javascript
POST /api/auth/login
{
  "emailOrUsername": "Krishna",
  "password": "password123"
}
```

### Create Challenge:

```javascript
POST / api / challenges;
Authorization: Bearer <
  token >
  {
    name: "January 2026 Challenge",
    description: "Solve 1 problem daily",
    minSubmissionsPerDay: 1,
    difficultyFilter: ["Medium", "Hard"],
    uniqueProblemConstraint: true,
    penaltyAmount: 100,
    startDate: "2026-01-07T00:00:00.000Z",
    endDate: "2026-01-31T23:59:59.999Z",
  };
```

## Known Limitations / TODO

1. **Activity Heatmap** - Still using mock data (backend doesn't provide this yet)
2. **Progress Chart** - Still using mock data (needs submission history endpoint)
3. **Streak Calculation** - Not yet implemented in backend
4. **Profile Picture** - Using Dicebear avatars (no upload yet)

## Troubleshooting

### CORS Errors:

Backend already has CORS configured for `http://localhost:5173`. If using different port, update `backend/.env`:

```env
CORS_ORIGIN=http://localhost:YOUR_PORT
```

### 401 Errors:

- Check if JWT token is in localStorage (`auth_token`)
- Verify backend JWT_SECRET matches
- Token expires after 7 days

### Connection Refused:

- Ensure backend is running on port 3000
- Check `VITE_API_URL` in frontend `.env`

## Next Steps

To fully complete the integration:

1. **Add LeetCode Session Management UI**

   - Create a settings page for users to add their LeetCode session cookies
   - Use `/api/leetcode/session` endpoints

2. **Implement Real Activity Data**

   - Backend needs to track daily submissions
   - Create endpoints for submission history

3. **Add Real-time Updates**

   - Consider WebSocket for live leaderboard updates
   - Auto-refresh dashboard data

4. **Error Boundary**

   - Add React Error Boundary for better error handling

5. **Loading Skeletons**
   - Replace basic spinners with skeleton loaders

## File Structure

```
frontend/
├── src/
│   ├── lib/
│   │   └── api.ts           # ✨ NEW: Centralized API service
│   ├── contexts/
│   │   └── AuthContext.tsx  # ✅ Updated with real APIs
│   ├── pages/
│   │   ├── Login.tsx         # ✅ Connected
│   │   ├── Register.tsx      # ✅ Connected
│   │   ├── Dashboard.tsx     # ✅ Updated
│   │   ├── CreateChallenge.tsx  # ✅ Updated
│   │   └── ChallengePage.tsx    # ✅ Updated
│   └── components/
│       └── common/
│           └── ProtectedRoute.tsx  # ✨ NEW
└── .env                     # ✨ NEW: Environment config
```

## Success Checklist

- ✅ Backend APIs working (tested with Postman)
- ✅ Frontend API service created
- ✅ Authentication flow working
- ✅ Protected routes implemented
- ✅ Dashboard showing real data
- ✅ Challenge creation working
- ✅ Challenge joining working
- ✅ Error handling in place
- ✅ Loading states added
- ✅ JWT token persistence

---

**Integration Status**: ✅ **COMPLETE & READY FOR USE**

The frontend and backend are now fully connected. Users can register, login, create challenges, join challenges, and view their dashboard with real data from the backend!
