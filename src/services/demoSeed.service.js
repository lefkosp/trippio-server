// TEMPORARY — remove this once the group has real trip data of their own.
//
// Clones the "Japan 2026" demo trip for a specific new user, so a first-time
// sign-in has something to look at instead of an empty app. Unlike the old
// `npm run seed` script this doesn't touch any shared trip — each new user
// gets their own independent copy (own Trip/Days/Places/Events/etc., owned
// by them via `createdBy`), so two people signing up around the same time
// can't stomp on each other's demo data.

const { Trip, Day, Event, Place, Booking, Suggestion, Proposal, User } = require('../models');
const seedData = require('../seed/seedData');

async function getOrCreateFriendUsers() {
  const users = [];
  for (const email of seedData.friends) {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email });
    }
    users.push(user);
  }
  return users;
}

async function cloneDemoTripForUser(ownerId) {
  const friendUsers = await getOrCreateFriendUsers();
  const userDocs = [{ _id: ownerId }, ...friendUsers];

  const { createdBy: _c, collaborators: _co, ...tripFields } = seedData.trip;
  const trip = await Trip.create({ ...tripFields, createdBy: ownerId });
  const tripId = trip._id;

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
  const placeMap = {};
  seedData.places.forEach((p, i) => {
    placeMap[p.key] = placeDocs[i]._id;
  });

  const dayDocs = await Day.insertMany(
    seedData.days.map((d) => ({
      tripId,
      date: new Date(d.date),
      city: d.city,
      notes: d.notes,
      order: d.order,
    }))
  );

  const eventDocs = await Event.insertMany(
    seedData.events.map((e) => ({
      tripId,
      dayId: dayDocs[e.dayIdx]._id,
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
    }))
  );

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

  const suggestionDocs = await Suggestion.insertMany(
    seedData.suggestions.map((s) => ({
      tripId,
      city: s.city,
      title: s.title,
      type: s.type,
      why: s.why,
    }))
  );

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

  console.log(
    `[demo seed] cloned "${trip.name}" (${tripId}) for user ${ownerId}: ` +
      `${placeDocs.length} places, ${dayDocs.length} days, ${eventDocs.length} events, ` +
      `${bookingDocs.length} bookings, ${suggestionDocs.length} suggestions, ${proposalDocs.length} proposals`
  );

  return trip;
}

module.exports = { cloneDemoTripForUser };
