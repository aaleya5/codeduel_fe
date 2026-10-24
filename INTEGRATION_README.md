# Frontend–Backend Integration Guide

This guide documents the current React frontend and Express/Prisma backend
integration. The backend runs at `http://localhost:3000` by default; Vite
typically runs at `http://localhost:5173`.

For submission priorities, verification work, known risks, and future features,
see the [CodeDuel project roadmap](../PROJECT_ROADMAP.md).

## Run locally

1. Configure the backend `.env` with `DATABASE_URL`, `JWT_SECRET`,
   `ENCRYPTION_KEY`, and other required settings.
2. From `codeduel_be`, install dependencies, generate the Prisma client, and
   apply the schema to your local PostgreSQL database:

   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

   `npm run prisma:migrate` can be used if you are maintaining Prisma
   migrations for your environment.
3. Set `VITE_API_URL=http://localhost:3000` in the frontend `.env`.
4. From `codeduel_fe`, run:

   ```bash
   npm install
   npm run dev
   ```

The frontend Axios client sends the stored JWT as a bearer token for protected
API calls. Register or sign in before opening protected routes. Invite links
retain their destination through the login/register flow.

## Authentication and LeetCode setup

- Register with `email`, `username`, `password`, and `leetcodeUsername`, or
  sign in with `emailOrUsername` and `password`.
- The frontend stores the returned JWT and attaches it to subsequent requests.
- Set or update your LeetCode username in Settings.
- To load the private LeetCode profile/calendar, store a LeetCode session from
  Settings. The session is encrypted by the backend. Never share or commit
  LeetCode cookies, CSRF tokens, JWTs, or API secrets.
- The LeetCode profile endpoint returns calendar data for the account's active
  years. The frontend derives current and best streaks from those dated
  calendar entries.
- The Recent Submissions panel uses the connection-test endpoint to retrieve
  the latest accepted submissions. Date-specific heatmap clicks use
  `GET /api/leetcode/submissions/:username?date=YYYY-MM-DD`; LeetCode only
  exposes individual submissions for a bounded recent window, so older active
  heatmap days may not have a submission list.

## Challenge invitations and templates

- Every challenge has an invite code. Owners can copy the invite URL from the
  challenge page and share it with signed-in users.
- Opening `/invite/:inviteCode` previews challenge rules and dates.
- Joining creates a pending request. It does not add membership until the
  challenge owner approves it from the Join Requests controls.
- Owners can reject pending requests. A rejected user can submit a new request.
- The create-challenge form provides **30-day consistency** (one problem per
  day) and **two problems per day** templates. Custom challenge settings are
  still supported.

## API reference

All endpoints below are mounted under `http://localhost:3000`. Unless marked
public, they require `Authorization: Bearer <jwt_token>`. The Postman
collection is in `../codeduel_be/Postman_Collection.json`.

### Authentication

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/profile` | Authenticated |
| PUT | `/api/auth/profile` | Authenticated |

### Challenges

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/challenges` | Authenticated |
| GET | `/api/challenges` | Authenticated; optional `status`, `owned` query |
| GET | `/api/challenges/invite/:inviteCode` | Authenticated |
| POST | `/api/challenges/invite/:inviteCode/request` | Authenticated |
| GET | `/api/challenges/:id` | Authenticated |
| POST | `/api/challenges/:id/join` | Authenticated; creates a pending request |
| GET | `/api/challenges/:id/join-requests` | Challenge owner |
| PATCH | `/api/challenges/:id/join-requests/:requestId` | Challenge owner; `{ "decision": "APPROVED" \| "REJECTED" }` |
| PATCH | `/api/challenges/:id/status` | Challenge owner |
| PATCH | `/api/challenges/:id` | Challenge owner; update rules |
| DELETE | `/api/challenges/:id/members/:memberId` | Challenge owner |
| POST | `/api/challenges/:id/members/:memberId/penalty-adjustment` | Challenge owner |
| GET | `/api/challenges/:id/disputes` | Challenge owner |
| POST | `/api/challenges/:id/penalties/:penaltyId/dispute` | Authenticated member |
| POST | `/api/challenges/:id/penalties/:penaltyId/resolve` | Challenge owner |

### Dashboard and activity

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/dashboard` | Authenticated |
| GET | `/api/dashboard/today` | Authenticated |
| GET | `/api/dashboard/challenge/:challengeId` | Authenticated member |
| GET | `/api/dashboard/challenge/:challengeId/leaderboard` | Authenticated |
| GET | `/api/dashboard/challenge/:challengeId/chart` | Authenticated |
| GET | `/api/dashboard/activity-heatmap` | Authenticated |
| GET | `/api/dashboard/stats` | Authenticated |
| GET | `/api/dashboard/submission-chart` | Authenticated |
| GET | `/api/dashboard/leaderboard` | Authenticated |
| POST | `/api/dashboard/evaluate` | Authenticated challenge owner; `{ "challengeId": "...", "date": "YYYY-MM-DD" }`, date optional |

### LeetCode

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/leetcode/session` | Authenticated |
| GET | `/api/leetcode/session` | Authenticated |
| DELETE | `/api/leetcode/session` | Authenticated |
| GET | `/api/leetcode/profile/:username` | Authenticated |
| GET | `/api/leetcode/submissions/:username?date=YYYY-MM-DD` | Authenticated |
| GET | `/api/leetcode/test/:username` | Authenticated; tests connection and returns recent accepted submissions |
| GET | `/api/leetcode/problem/:titleSlug` | Authenticated |

### Notifications

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/notifications` | Authenticated; optional `unreadOnly=true` |
| GET | `/api/notifications/unread-count` | Authenticated |
| PATCH | `/api/notifications/read-all` | Authenticated |
| PATCH | `/api/notifications/:id/read` | Authenticated |

### Payments

| Method | Path | Access |
| --- | --- | --- |
| POST | `/api/payments/create-order` | Authenticated member |
| POST | `/api/payments/verify` | Authenticated member |
| GET | `/api/payments/history/:memberId` | Membership owner |
| POST | `/api/payments/manual` | Challenge owner |
| GET | `/api/payments/ledger/:memberId` | Member or challenge owner |

### Health

| Method | Path | Access |
| --- | --- | --- |
| GET | `/health` | Public |
| GET | `/` | Public API root |

## Postman workflow

1. Set `base_url` to the backend origin.
2. Register or log in. The collection scripts save the JWT to `jwt_token`.
3. Store a LeetCode session before testing profile and submission endpoints.
4. Create a challenge to populate `challenge_id`; its response also contains
   `inviteCode`, which can be used to test invite preview and requests.
5. Use a second account to submit a join request. Review and resolve it using
   the challenge owner's token.
6. Payment order creation and verification require valid Razorpay credentials
   and a real provider checkout flow. Manual payment recording is suitable for
   local API testing.

## Troubleshooting

- **401 Unauthorized:** sign in again and confirm the bearer token is current.
- **LeetCode profile unavailable:** check the configured username and stored
  session status in Settings.
- **No accepted submissions:** the endpoint returns the latest accepted
  submissions, not only submissions from yesterday; confirm the selected
  LeetCode account has accepted submissions.
- **Empty date-specific submission list:** individual submissions may be
  outside LeetCode's recent-submission window even when the heatmap shows an
  older active day.
- **CORS or connection errors:** ensure the backend is running and set
  `CORS_ORIGIN` to the actual Vite origin.
- **Schema/client mismatch:** after changing `prisma/schema.prisma`, apply the
  schema and regenerate Prisma Client before restarting the backend.
