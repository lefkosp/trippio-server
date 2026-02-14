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

Example `.env`:

```
PORT=4000
MONGO_URL=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/
CLIENT_ORIGIN=http://localhost:5173
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `4000` | Server listen port |
| `MONGO_URL` | **Yes** | — | MongoDB connection string |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |

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
```

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

## Example curl Commands

```bash
# Health check
curl http://localhost:4000/health

# List all trips
curl http://localhost:4000/api/trips

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
