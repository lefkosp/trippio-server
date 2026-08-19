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
const { Trip, Day, Event, Place, Booking, Suggestion, Proposal, User } = require('../models');
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
    Proposal.deleteMany({ tripId }),
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

  // 2b. Get or create the friend users referenced by proposals' userIdx
  // (0 = devUser, 1-3 = these, in order) — persist across reseeds same as
  // devUser, so re-running the seed doesn't spawn duplicate accounts.
  const friendUsers = [];
  for (const email of seedData.friends) {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
      console.log(`✅  Friend user created: ${user.email}`);
    }
    friendUsers.push(user);
  }
  const userDocs = [devUser, ...friendUsers];

  // 3. Insert Trip (owned by dev user — ownership is createdBy, not a collaborator row)
  const { createdBy: _c, collaborators: _co, ...tripFields } = seedData.trip;
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

  // 9. Insert Proposals (resolve userIdx → userDocs, dayIdx → dayDocs,
  // placeKey/promotedPlaceKey → placeMap)
  const proposalDocs = await Proposal.insertMany(
    seedData.proposals.map((p) => ({
      tripId,
      title: p.title,
      description: p.description,
      category: p.category,
      city: p.city,
      source: p.source,
      url: p.url,
      tags: p.tags || [],
      suggestedDayId: p.dayIdx != null ? dayDocs[p.dayIdx]._id : undefined,
      suggestedPlaceId: p.placeKey ? placeMap[p.placeKey] : undefined,
      proposedBy: userDocs[p.proposedByIdx ?? 0]._id,
      status: p.status,
      votes: (p.votes || []).map((v) => ({
        userId: userDocs[v.userIdx]._id,
        value: v.value,
        votedAt: new Date(v.votedAt),
      })),
      approvedBy: p.approvedByIdx != null ? userDocs[p.approvedByIdx]._id : undefined,
      approvedAt: p.approvedAt ? new Date(p.approvedAt) : undefined,
      rejectedBy: p.rejectedByIdx != null ? userDocs[p.rejectedByIdx]._id : undefined,
      rejectedAt: p.rejectedAt ? new Date(p.rejectedAt) : undefined,
      placeId: p.promotedPlaceKey ? placeMap[p.promotedPlaceKey] : undefined,
      promotedBy: p.promotedByIdx != null ? userDocs[p.promotedByIdx]._id : undefined,
      promotedAt: p.promotedAt ? new Date(p.promotedAt) : undefined,
      createdAt: new Date(p.createdAt),
    })),
    { timestamps: false }
  );
  console.log(`✅  ${proposalDocs.length} proposals inserted.`);

  console.log('\n🎉  Seed complete!\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
