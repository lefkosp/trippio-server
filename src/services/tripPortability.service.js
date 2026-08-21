// Export/import a trip as a single portable JSON document — the backup/restore
// path for Phase 4, and also usable to move a trip between environments or
// accounts. Every ObjectId reference inside the export is replaced with a
// small local id (places/days) or an email (users), since the raw ids won't
// exist in whichever database the export gets imported into.

const { Trip, Day, Event, Place, Booking, Suggestion, Proposal, User } = require('../models');

const SCHEMA_VERSION = 1;

async function exportTrip(tripId) {
  const trip = await Trip.findById(tripId).lean();
  if (!trip) return null;

  const [days, events, places, bookings, suggestions, proposals] = await Promise.all([
    Day.find({ tripId }).sort({ order: 1, date: 1 }).lean(),
    Event.find({ tripId }).lean(),
    Place.find({ tripId }).lean(),
    Booking.find({ tripId }).lean(),
    Suggestion.find({ tripId }).lean(),
    Proposal.find({ tripId }).lean(),
  ]);

  const dayLocalId = new Map(days.map((d, i) => [String(d._id), `d${i}`]));
  const placeLocalId = new Map(places.map((p, i) => [String(p._id), `p${i}`]));

  const userIds = new Set();
  const collectUser = (id) => {
    if (id) userIds.add(String(id));
  };
  collectUser(trip.createdBy);
  (trip.collaborators || []).forEach((c) => collectUser(c.userId));
  proposals.forEach((p) => {
    collectUser(p.proposedBy);
    collectUser(p.approvedBy);
    collectUser(p.rejectedBy);
    collectUser(p.promotedBy);
    (p.votes || []).forEach((v) => collectUser(v.userId));
  });
  const users = await User.find({ _id: { $in: [...userIds] } }).lean();
  const emailById = new Map(users.map((u) => [String(u._id), u.email]));
  const emailFor = (id) => (id ? emailById.get(String(id)) : undefined);

  return {
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    trip: {
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      timezone: trip.timezone,
      preferences: trip.preferences,
    },
    collaborators: (trip.collaborators || [])
      .map((c) => ({ email: emailFor(c.userId), role: c.role }))
      .filter((c) => c.email),
    places: places.map((p, i) => ({
      localId: `p${i}`,
      name: p.name,
      address: p.address,
      phone: p.phone,
      lat: p.lat,
      lng: p.lng,
      googleMapsUrl: p.googleMapsUrl,
      tags: p.tags,
      notes: p.notes,
      nameZh: p.nameZh,
      metroStation: p.metroStation,
      metroLine: p.metroLine,
      requiresAdvanceBooking: p.requiresAdvanceBooking,
      bookingWindowDays: p.bookingWindowDays,
    })),
    days: days.map((d, i) => ({
      localId: `d${i}`,
      date: d.date,
      city: d.city,
      notes: d.notes,
      order: d.order,
    })),
    events: events.map((e) => ({
      dayLocalId: dayLocalId.get(String(e.dayId)),
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      type: e.type,
      placeLocalId: e.placeId ? placeLocalId.get(String(e.placeId)) : undefined,
      transit: e.transit,
      links: e.links,
      order: e.order,
      status: e.status,
      notes: e.notes,
    })),
    bookings: bookings.map((b) => ({
      type: b.type,
      title: b.title,
      confirmationNumber: b.confirmationNumber,
      date: b.date,
      startTime: b.startTime,
      location: b.location,
      links: b.links,
      notes: b.notes,
    })),
    suggestions: suggestions.map((s) => ({
      city: s.city,
      title: s.title,
      placeLocalId: s.placeId ? placeLocalId.get(String(s.placeId)) : undefined,
      type: s.type,
      why: s.why,
      links: s.links,
    })),
    proposals: proposals.map((p) => ({
      title: p.title,
      description: p.description,
      category: p.category,
      url: p.url,
      imageUrl: p.imageUrl,
      source: p.source,
      city: p.city,
      tags: p.tags,
      suggestedDayLocalId: p.suggestedDayId ? dayLocalId.get(String(p.suggestedDayId)) : undefined,
      suggestedPlaceLocalId: p.suggestedPlaceId ? placeLocalId.get(String(p.suggestedPlaceId)) : undefined,
      links: p.links,
      proposedByEmail: emailFor(p.proposedBy),
      status: p.status,
      votes: (p.votes || [])
        .map((v) => ({ email: emailFor(v.userId), value: v.value, votedAt: v.votedAt }))
        .filter((v) => v.email),
      approvedByEmail: emailFor(p.approvedBy),
      approvedAt: p.approvedAt,
      rejectedByEmail: emailFor(p.rejectedBy),
      rejectedAt: p.rejectedAt,
      promotedPlaceLocalId: p.placeId ? placeLocalId.get(String(p.placeId)) : undefined,
      promotedByEmail: emailFor(p.promotedBy),
      promotedAt: p.promotedAt,
      createdAt: p.createdAt,
    })),
  };
}

function validationError(message) {
  const err = new Error(message);
  err.code = 'VALIDATION_ERROR';
  return err;
}

async function getOrCreateUserByEmail(email) {
  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email });
  return user;
}

/**
 * Recreate a trip owned by `ownerId` from an export produced by exportTrip.
 * Always creates a new trip — never overwrites an existing one. Collaborators
 * and proposal authors/voters are resolved by email, creating a User record
 * (same lazy-creation the magic-link flow already uses) if one doesn't exist
 * yet in this database.
 */
async function importTrip(ownerId, payload) {
  if (!payload || typeof payload !== 'object') {
    throw validationError('Invalid trip export file');
  }
  if (payload.version !== SCHEMA_VERSION) {
    throw validationError(`Unsupported export version: ${payload.version}`);
  }
  if (!payload.trip || !payload.trip.name || !payload.trip.startDate || !payload.trip.endDate) {
    throw validationError('Invalid trip export: missing trip fields');
  }

  const emailToUserId = new Map();
  async function resolveUserId(email) {
    if (!email) return undefined;
    if (!emailToUserId.has(email)) {
      const user = await getOrCreateUserByEmail(email);
      emailToUserId.set(email, user._id);
    }
    return emailToUserId.get(email);
  }

  const collaborators = [];
  for (const c of payload.collaborators || []) {
    const userId = await resolveUserId(c.email);
    if (userId && String(userId) !== String(ownerId)) {
      collaborators.push({ userId, role: c.role === 'editor' ? 'editor' : 'viewer' });
    }
  }

  const trip = await Trip.create({
    name: payload.trip.name,
    startDate: new Date(payload.trip.startDate),
    endDate: new Date(payload.trip.endDate),
    timezone: payload.trip.timezone || undefined,
    preferences: payload.trip.preferences || undefined,
    createdBy: ownerId,
    collaborators,
  });
  const tripId = trip._id;

  const places = payload.places || [];
  const placeDocs = places.length
    ? await Place.insertMany(
        places.map((p) => ({
          tripId,
          name: p.name,
          address: p.address,
          phone: p.phone,
          lat: p.lat,
          lng: p.lng,
          googleMapsUrl: p.googleMapsUrl,
          tags: p.tags,
          notes: p.notes,
          nameZh: p.nameZh,
          metroStation: p.metroStation,
          metroLine: p.metroLine,
          requiresAdvanceBooking: p.requiresAdvanceBooking,
          bookingWindowDays: p.bookingWindowDays,
        }))
      )
    : [];
  const placeIdByLocal = new Map(places.map((p, i) => [p.localId, placeDocs[i]?._id]));

  const days = payload.days || [];
  const dayDocs = days.length
    ? await Day.insertMany(
        days.map((d) => ({
          tripId,
          date: new Date(d.date),
          city: d.city,
          notes: d.notes,
          order: d.order,
        }))
      )
    : [];
  const dayIdByLocal = new Map(days.map((d, i) => [d.localId, dayDocs[i]?._id]));

  const events = payload.events || [];
  if (events.length) {
    await Event.insertMany(
      events.map((e) => ({
        tripId,
        dayId: dayIdByLocal.get(e.dayLocalId),
        title: e.title,
        startTime: e.startTime,
        endTime: e.endTime,
        type: e.type,
        placeId: e.placeLocalId ? placeIdByLocal.get(e.placeLocalId) : undefined,
        transit: e.transit,
        links: e.links,
        order: e.order,
        status: e.status,
        notes: e.notes,
      }))
    );
  }

  const bookings = payload.bookings || [];
  if (bookings.length) {
    await Booking.insertMany(
      bookings.map((b) => ({
        tripId,
        type: b.type,
        title: b.title,
        confirmationNumber: b.confirmationNumber,
        date: b.date,
        startTime: b.startTime,
        location: b.location,
        links: b.links,
        notes: b.notes,
      }))
    );
  }

  const suggestions = payload.suggestions || [];
  if (suggestions.length) {
    await Suggestion.insertMany(
      suggestions.map((s) => ({
        tripId,
        city: s.city,
        title: s.title,
        placeId: s.placeLocalId ? placeIdByLocal.get(s.placeLocalId) : undefined,
        type: s.type,
        why: s.why,
        links: s.links,
      }))
    );
  }

  const proposals = payload.proposals || [];
  if (proposals.length) {
    const proposalDocs = [];
    for (const p of proposals) {
      proposalDocs.push({
        tripId,
        title: p.title,
        description: p.description,
        category: p.category,
        url: p.url,
        imageUrl: p.imageUrl,
        source: p.source,
        city: p.city,
        tags: p.tags,
        suggestedDayId: p.suggestedDayLocalId ? dayIdByLocal.get(p.suggestedDayLocalId) : undefined,
        suggestedPlaceId: p.suggestedPlaceLocalId ? placeIdByLocal.get(p.suggestedPlaceLocalId) : undefined,
        links: p.links,
        proposedBy: (await resolveUserId(p.proposedByEmail)) || ownerId,
        status: p.status,
        votes: await Promise.all(
          (p.votes || []).map(async (v) => ({
            userId: await resolveUserId(v.email),
            value: v.value,
            votedAt: v.votedAt,
          }))
        ),
        approvedBy: await resolveUserId(p.approvedByEmail),
        approvedAt: p.approvedAt,
        rejectedBy: await resolveUserId(p.rejectedByEmail),
        rejectedAt: p.rejectedAt,
        placeId: p.promotedPlaceLocalId ? placeIdByLocal.get(p.promotedPlaceLocalId) : undefined,
        promotedBy: await resolveUserId(p.promotedByEmail),
        promotedAt: p.promotedAt,
        createdAt: p.createdAt,
      });
    }
    await Proposal.insertMany(proposalDocs, { timestamps: false });
  }

  return trip;
}

module.exports = { exportTrip, importTrip, SCHEMA_VERSION };
