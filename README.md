# Trippio Server

Express + MongoDB (Mongoose) backend for the Trippio trip-planning app.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Example `.env` (copy from `.env.example`):

```
PORT=4000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/
CLIENT_ORIGIN=http://localhost:5173
APP_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=<random-secret-at-least-32-chars>
ACCESS_TOKEN_TTL_MINUTES=15
REFRESH_TOKEN_TTL_DAYS=30
NODE_ENV=development
```

| Variable                     | Required           | Default                 | Description                           |
| ---------------------------- | ------------------ | ----------------------- | ------------------------------------- |
| `PORT`                       | No                 | `4000`                  | Server listen port                    |
| `MONGO_URI` (or `MONGO_URL`) | **Yes**            | —                       | MongoDB connection string             |
| `CLIENT_ORIGIN`              | No                 | `http://localhost:5173` | Allowed CORS origin (for credentials) |
| `APP_ORIGIN`                 | No                 | `http://localhost:5173` | Base URL for magic links              |
| `ACCESS_TOKEN_SECRET`        | **Yes** (for auth) | —                       | Secret for signing JWTs               |
| `ACCESS_TOKEN_TTL_MINUTES`   | No                 | `15`                    | Access token lifetime                 |
| `REFRESH_TOKEN_TTL_DAYS`     | No                 | `30`                    | Refresh session lifetime              |
| `NODE_ENV`                   | No                 | `development`           | `production` enables secure cookies   |

### 3. Seed the database

Inserts a 12-day Japan trip with days, places, events, bookings, and suggestions. The script is idempotent — it removes the previous seed trip before re-inserting.

```bash
npm run seed
```

### 4. Start the dev server

```bash
npm run dev
```

The API is now available at `http://localhost:4000`.

## API Endpoints

All endpoints are prefixed with `/api` and return a standard envelope:

```json
{ "data": <payload>, "error": null }       // success
{ "data": null, "error": { "message": "..." } }  // failure
```

### Health

```
GET /health → { ok: true }
```

### Trips

```
GET    /api/trips
POST   /api/trips
GET    /api/trips/:tripId
DELETE /api/trips/:tripId   (owner only; cascades to days, events, places, bookings, suggestions, proposals, share links)
POST   /api/trips/:tripId/share-links
```

**Delete trip:** `DELETE /api/trips/:tripId` requires owner auth. It permanently deletes the trip and all related documents (days, events, places, bookings, suggestions, proposals, share links). Deleting a non-existent trip returns 404.

### Days

```
GET    /api/trips/:tripId/days
POST   /api/trips/:tripId/days
GET    /api/days/:dayId
```

### Events

```
GET    /api/days/:dayId/events
POST   /api/days/:dayId/events
PATCH  /api/events/:eventId
DELETE /api/events/:eventId
```

### Places

```
GET    /api/trips/:tripId/places?query=
POST   /api/trips/:tripId/places
PATCH  /api/places/:placeId
```

### Bookings

```
GET    /api/trips/:tripId/bookings
POST   /api/trips/:tripId/bookings
PATCH  /api/bookings/:bookingId
DELETE /api/bookings/:bookingId
```

### Suggestions

```
GET    /api/trips/:tripId/suggestions?city=
```

### Public Share Links

```
GET    /api/share/:token
```

## Auth (magic link + refresh cookie)

Auth uses passwordless magic links and HttpOnly refresh cookies. Access token is a short-lived JWT sent in `Authorization: Bearer <token>`.

**Endpoints:**

- `POST /api/auth/request-link` — Body: `{ "email": "you@example.com" }`. In dev, response includes `magicLink` for testing.
- `GET /api/auth/verify?token=<login-token>` — Exchanges one-time token for access token + sets refresh cookie. Returns `{ accessToken, user }`.
- `POST /api/auth/refresh` — Cookie only. Returns new `accessToken`.
- `POST /api/auth/logout` — Revokes session and clears cookie.

**Testing with curl (credentials/cookies):**

```bash
# 1. Request magic link (dev returns link in response)
curl -X POST http://localhost:4000/api/auth/request-link \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@trippio.local"}' \
  -c cookies.txt

# 2. Open the magicLink from the response in a browser, or call verify with the token:
# curl "http://localhost:4000/api/auth/verify?token=PASTE_TOKEN_HERE" -b cookies.txt -c cookies.txt

# 3. Refresh (uses cookie)
curl -X POST http://localhost:4000/api/auth/refresh -b cookies.txt

# 4. List trips (use accessToken from verify or refresh)
curl http://localhost:4000/api/trips -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 5. Logout
curl -X POST http://localhost:4000/api/auth/logout -b cookies.txt
```

Trips are scoped to the signed-in user (`GET /api/trips` and `POST /api/trips` require `Authorization: Bearer <accessToken>`).

## Share Links (Slice 3)

Owners can create either:

- `viewer` share links (no login required, read-only)
- `editor` share links (login required, then collaborator claim)

### Endpoints

- `POST /api/trips/:tripId/share-links` (owner auth required)  
  Body: `{ "role": "viewer" | "editor", "expiresInDays": 7 }`  
  Returns one-time-visible URL payload: `{ "url": "http://localhost:5173/share/<raw-token>" }`
- `GET /api/share/:token` (public/optional auth)
  - viewer link -> `{ "shareAccessToken": "...", "tripId": "...", "role": "viewer" }`
  - editor link without auth -> `{ "claimed": false, "requiresAuth": true, "tripId": "...", "role": "editor" }`
  - editor link with auth -> binds collaborator and returns `{ "claimed": true, "tripId": "...", "role": "editor" }`

Notes:

- Viewer share access token expires in 60 minutes.
- Reopening a viewer link mints a fresh 60-minute viewer token.
- Editor links do not mint a share JWT; they bind the signed-in user as a trip collaborator (`editor`).

### Curl examples

```bash
# Create editor share link (owner token required)
curl -X POST http://localhost:4000/api/trips/<tripId>/share-links \
  -H "Authorization: Bearer <ownerAccessToken>" \
  -H "Content-Type: application/json" \
  -d '{"role":"editor"}'

# Resolve editor share link without auth -> requiresAuth true
curl http://localhost:4000/api/share/<rawShareToken>

# Resolve editor share link with auth -> claimed true
curl http://localhost:4000/api/share/<rawShareToken> \
  -H "Authorization: Bearer <editorUserAccessToken>"

# After claim, editor can write to trip resources
curl -X POST http://localhost:4000/api/days/<dayId>/events \
  -H "Authorization: Bearer <editorUserAccessToken>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Editor test event","type":"sight"}'
```

## Access Management (Slice 4)

Trip owners can manage collaborators and share links.

### Endpoints

- `GET /api/trips/:tripId/collaborators` - List collaborators with populated user email
- `PATCH /api/trips/:tripId/collaborators/:userId` - Update collaborator role (`viewer` or `editor`)
- `DELETE /api/trips/:tripId/collaborators/:userId` - Remove collaborator
- `GET /api/trips/:tripId/share-links` - List all share links for a trip
- `POST /api/trips/:tripId/share-links/:shareLinkId/revoke` - Revoke a share link immediately

### Curl examples

```bash
# List collaborators
curl -H "Authorization: Bearer <ownerAccessToken>" \
  http://localhost:4000/api/trips/<tripId>/collaborators

# Change collaborator role
curl -X PATCH http://localhost:4000/api/trips/<tripId>/collaborators/<userId> \
  -H "Authorization: Bearer <ownerAccessToken>" \
  -H "Content-Type: application/json" \
  -d '{"role":"viewer"}'

# Remove collaborator
curl -X DELETE http://localhost:4000/api/trips/<tripId>/collaborators/<userId> \
  -H "Authorization: Bearer <ownerAccessToken>"

# List share links
curl -H "Authorization: Bearer <ownerAccessToken>" \
  http://localhost:4000/api/trips/<tripId>/share-links

# Revoke share link
curl -X POST http://localhost:4000/api/trips/<tripId>/share-links/<shareLinkId>/revoke \
  -H "Authorization: Bearer <ownerAccessToken>"
```

## Example curl Commands

```bash
# Health check
curl http://localhost:4000/health

# List trips (requires auth header from login/verify/refresh)
curl http://localhost:4000/api/trips -H "Authorization: Bearer <accessToken>"

# Get a specific trip (replace <tripId>)
curl http://localhost:4000/api/trips/<tripId>

# Get days for a trip
curl http://localhost:4000/api/trips/<tripId>/days

# Get events for a day
curl http://localhost:4000/api/days/<dayId>/events

# Create a new event
curl -X POST http://localhost:4000/api/days/<dayId>/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Visit temple","startTime":"10:00","endTime":"12:00","type":"sight","order":0,"status":"planned"}'

# Get bookings
curl http://localhost:4000/api/trips/<tripId>/bookings

# Get suggestions for a city
curl "http://localhost:4000/api/trips/<tripId>/suggestions?city=Tokyo"

# Get places (with optional search)
curl "http://localhost:4000/api/trips/<tripId>/places?query=temple"
```

## Project Structure

```
src/
├── config/
│   └── db.js            # Mongoose connection
├── controllers/         # Request handlers
├── middleware/
│   ├── asyncHandler.js  # Async error wrapper
│   ├── errorHandler.js  # Central error handler
│   └── notFound.js      # 404 handler
├── models/              # Mongoose schemas
├── routes/
│   └── api.routes.js    # Route entry point
├── scripts/
│   └── seed.js          # Database seeder
├── seed/
│   └── seedData.js      # Mock data
├── services/            # Business logic / DB queries
└── server.js            # App entry point
```
