#!/usr/bin/env node

/**
 * Idempotent seed script – populates MongoDB with a 12-day Japan trip.
 *
 * Data mirrors the client-side mock data so both offline (localStorage)
 * and seeded (MongoDB) environments are identical.
 *
 * Usage:  npm run seed
 */

require('dotenv').config();

const mongoose = require('mongoose');
const connectDb = require('../config/db');
const { Trip, Day, Event, Place, Booking, Suggestion, User } = require('../models');
const seedData = require('../seed/seedData');

const DEV_USER_EMAIL = 'dev@trippio.local';

const TRIP_NAME = seedData.trip.name; // "Japan 2026"

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

  // 2. Get or create dev user for createdBy
  let devUser = await User.findOne({ email: DEV_USER_EMAIL });
  if (!devUser) {
    devUser = await User.create({ email: DEV_USER_EMAIL });
    console.log(`✅  Dev user created: ${devUser.email}`);
  } else {
    console.log(`✅  Dev user exists: ${devUser.email}`);
  }

  // 3. Insert Trip (owned by dev user)
  const { createdBy: _c, ...tripFields } = seedData.trip;
  const trip = await Trip.create({ ...tripFields, createdBy: devUser._id });
  const tripId = trip._id;
  console.log(`✅  Trip created: ${trip.name} (${tripId})`);

  // 4. Insert Places (we need their IDs for events)
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

  // 5. Insert Days
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

  // 6. Insert Events (resolve dayIdx → dayId, placeKey → placeId)
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
      transit: e.transit || undefined,
      links: e.links || [],
      order: e.order,
      status: e.status,
      notes: e.notes,
    };
  });
  const eventDocs = await Event.insertMany(eventRecords);
  console.log(`✅  ${eventDocs.length} events inserted.`);

  // 7. Insert Bookings
  const bookingDocs = await Booking.insertMany(
    seedData.bookings.map((b) => ({
      tripId,
      type: b.type,
      title: b.title,
      confirmationNumber: b.confirmationNumber,
      date: b.date,
      startTime: b.startTime,
      location: b.location,
      links: b.links || [],
      notes: b.notes,
    }))
  );
  console.log(`✅  ${bookingDocs.length} bookings inserted.`);

  // 8. Insert Suggestions
  const suggestionDocs = await Suggestion.insertMany(
    seedData.suggestions.map((s) => ({
      tripId,
      city: s.city,
      title: s.title,
      type: s.type,
      why: s.why,
    }))
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
