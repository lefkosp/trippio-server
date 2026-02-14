const { Router } = require('express');

const tripRoutes = require('./trip.routes');
const dayRoutes = require('./day.routes');
const eventRoutes = require('./event.routes');
const placeRoutes = require('./place.routes');
const bookingRoutes = require('./booking.routes');
const suggestionRoutes = require('./suggestion.routes');

const router = Router();

// Trip routes are mounted at /api/trips/*
router.use('/trips', tripRoutes);

// Day, event, place, booking, suggestion routes use full sub-paths
router.use(dayRoutes);
router.use(eventRoutes);
router.use(placeRoutes);
router.use(bookingRoutes);
router.use(suggestionRoutes);

module.exports = router;
