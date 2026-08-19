#!/usr/bin/env node

/**
 * Idempotent seed – creates (or updates the dates on) the real trip skeleton.
 * No fake itinerary; collaborators are added afterward via the app's share-link flow.
 *
 * Usage:  npm run seed:trip
 */

require('dotenv').config();

const mongoose = require('mongoose');
const connectDb = require('../config/db');
const { Trip, User } = require('../models');

const OWNER_EMAIL = (process.env.SEED_OWNER_EMAIL || 'paplefkos@gmail.com').toLowerCase().trim();
const TRIP_NAME = 'China 2026';
const START_DATE = '2026-10-22';
const END_DATE = '2026-11-06';

async function seed() {
  await connectDb();

  let owner = await User.findOne({ email: OWNER_EMAIL });
  if (!owner) {
    owner = await User.create({ email: OWNER_EMAIL });
    console.log(`✅  Owner user created: ${owner.email}`);
  } else {
    console.log(`✅  Owner user exists: ${owner.email}`);
  }

  let trip = await Trip.findOne({ name: TRIP_NAME, createdBy: owner._id });
  if (trip) {
    trip.startDate = new Date(START_DATE);
    trip.endDate = new Date(END_DATE);
    await trip.save();
    console.log(`✅  Trip updated: ${trip.name} (${trip._id})`);
  } else {
    trip = await Trip.create({
      name: TRIP_NAME,
      startDate: new Date(START_DATE),
      endDate: new Date(END_DATE),
      timezone: 'Asia/Shanghai',
      createdBy: owner._id,
    });
    console.log(`✅  Trip created: ${trip.name} (${trip._id})`);
  }

  console.log('\n🎉  Seed complete! Invite collaborators via the Access screen in the app.\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
