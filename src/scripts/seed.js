#!/usr/bin/env node

/**
 * Idempotent seed script – populates MongoDB with a 12-day Japan trip.
 *
 * Usage:  npm run seed
 */

require('dotenv').config();

const mongoose = require('mongoose');
const connectDb = require('../config/db');
const { Trip, Day, Event, Place, Booking, Suggestion } = require('../models');
const seedData = require('../seed/seedData');

const TRIP_NAME = seedData.trip.name; // "Japan 12-Day MVP"

async function cleanPrevious() {
  const existing = await Trip.findOne({ name: TRIP_NAME });
  if (!existing) return;

  const tripId = existing._id;
  console.log(`🗑  Removing previous seed trip (${tripId})…`);

  await Promise.all([
    Day.deleteMany({ tripId }),
    Event.deleteMany({ tripId }),
    Place.deleteMany({ tripId }),
    Booking.deleteMany({ tripId }),
    Suggestion.deleteMany({ tripId }),
    Trip.deleteOne({ _id: tripId }),
  ]);

  console.log('   Done – old data removed.');
}

async function seed() {
  await connectDb();

  // 1. Clean up any existing seed data
  await cleanPrevious();

  // 2. Insert Trip
  const trip = await Trip.create(seedData.trip);
  const tripId = trip._id;
  console.log(`✅  Trip created: ${trip.name} (${tripId})`);

  // 3. Insert Places (we need their IDs for events)
  const placeDocs = await Place.insertMany(
    seedData.places.map((p) => ({
      tripId,
      name: p.name,
      address: p.address,
      phone: p.phone,
      lat: p.lat,
      lng: p.lng,
      googleMapsUrl: p.googleMapsUrl,
      tags: p.tags,
      notes: p.notes,
    }))
  );
  // Build a key → ObjectId map
  const placeMap = {};
  seedData.places.forEach((p, i) => {
    placeMap[p.key] = placeDocs[i]._id;
  });
  console.log(`✅  ${placeDocs.length} places inserted.`);

  // 4. Insert Days
  const dayDocs = await Day.insertMany(
    seedData.days.map((d) => ({
      tripId,
      date: new Date(d.date),
      city: d.city,
      notes: d.notes,
      order: d.order,
    }))
  );
  console.log(`✅  ${dayDocs.length} days inserted.`);

  // 5. Insert Events (resolve dayIdx → dayId, placeKey → placeId)
  const eventRecords = seedData.events.map((e) => {
    const dayDoc = dayDocs[e.dayIdx];
    return {
      tripId,
      dayId: dayDoc._id,
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      type: e.type,
      placeId: e.placeKey ? placeMap[e.placeKey] : undefined,
      transit: e.transit || {},
      links: e.links || [],
      order: e.order,
      status: e.status,
    };
  });
  const eventDocs = await Event.insertMany(eventRecords);
  console.log(`✅  ${eventDocs.length} events inserted.`);

  // 6. Insert Bookings
  const bookingDocs = await Booking.insertMany(
    seedData.bookings.map((b) => ({ ...b, tripId }))
  );
  console.log(`✅  ${bookingDocs.length} bookings inserted.`);

  // 7. Insert Suggestions
  const suggestionDocs = await Suggestion.insertMany(
    seedData.suggestions.map((s) => ({ ...s, tripId }))
  );
  console.log(`✅  ${suggestionDocs.length} suggestions inserted.`);

  console.log('\n🎉  Seed complete!\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
