/**
 * Seed data for a 12-day Japan trip.
 *
 * Mirrors the client mock data in trippio-client/src/mocks/data.ts so that
 * both offline (localStorage) and seeded (MongoDB) environments start with
 * identical content.
 *
 * String `key` fields on places and `dayIdx`/`placeKey` on events are used
 * by the seed script to wire up real Mongo ObjectIds at insert-time.
 */

// ── Trip ────────────────────────────────────────────────────
const trip = {
  name: 'Japan 2026',
  startDate: new Date('2026-03-20'),
  endDate: new Date('2026-03-31'),
  timezone: 'Asia/Tokyo',
  createdBy: 'user-1',
  collaborators: [{ userId: 'user-1', role: 'owner' }],
  shareLinks: [],
};

// ── Places ──────────────────────────────────────────────────
const places = [
  {
    key: 'senso-ji',
    name: 'Senso-ji Temple',
    address: '2 Chome-3-1 Asakusa, Taito City, Tokyo',
    phone: '+81-3-3842-0181',
    lat: 35.7148,
    lng: 139.7967,
    googleMapsUrl: 'https://maps.google.com/?q=Senso-ji+Temple',
    tags: ['shrine', 'sight'],
    notes: 'Oldest temple in Tokyo. Best visited early morning.',
  },
  {
    key: 'tsukiji',
    name: 'Tsukiji Outer Market',
    address: '4 Chome-16-2 Tsukiji, Chuo City, Tokyo',
    lat: 35.6654,
    lng: 139.7707,
    googleMapsUrl: 'https://maps.google.com/?q=Tsukiji+Outer+Market',
    tags: ['food'],
    notes: 'Great for fresh sushi and street food breakfast.',
  },
  {
    key: 'fushimi-inari',
    name: 'Fushimi Inari Shrine',
    address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto',
    phone: '+81-75-641-7331',
    lat: 34.9671,
    lng: 135.7727,
    googleMapsUrl: 'https://maps.google.com/?q=Fushimi+Inari+Shrine',
    tags: ['shrine', 'sight'],
    notes: 'Famous torii gates. Go at dawn to avoid crowds.',
  },
  {
    key: 'ichiran-shibuya',
    name: 'Ichiran Ramen Shibuya',
    address: '1 Chome-22-7 Jinnan, Shibuya City, Tokyo',
    phone: '+81-3-3463-3667',
    lat: 35.6612,
    lng: 139.6998,
    googleMapsUrl: 'https://maps.google.com/?q=Ichiran+Ramen+Shibuya',
    tags: ['food'],
    notes: 'Individual booths. Tonkotsu ramen.',
  },
  {
    key: 'arashiyama',
    name: 'Arashiyama Bamboo Grove',
    address: 'Sagaogurayama Tabuchiyamacho, Ukyo Ward, Kyoto',
    lat: 35.0094,
    lng: 135.6722,
    googleMapsUrl: 'https://maps.google.com/?q=Arashiyama+Bamboo+Grove',
    tags: ['sight'],
    notes: 'Stunning bamboo forest. Best early morning.',
  },
  {
    key: 'dotonbori',
    name: 'Dotonbori',
    address: 'Dotonbori, Chuo Ward, Osaka',
    lat: 34.6687,
    lng: 135.5013,
    googleMapsUrl: 'https://maps.google.com/?q=Dotonbori+Osaka',
    tags: ['food', 'sight'],
    notes: 'Neon lights district. Try takoyaki and okonomiyaki.',
  },
  {
    key: 'teamlab',
    name: 'TeamLab Borderless',
    address: 'Azabudai Hills Garden Plaza B B1F, 1-2-4 Azabudai, Minato-ku, Tokyo',
    lat: 35.6585,
    lng: 139.7375,
    googleMapsUrl: 'https://maps.google.com/?q=TeamLab+Borderless+Azabudai',
    tags: ['museum', 'sight'],
    notes: 'Book tickets in advance. Allow 2-3 hours.',
  },
];

// ── Days ────────────────────────────────────────────────────
const days = [
  { date: '2026-03-20', city: 'Tokyo',  order: 1,  notes: 'Arrival day' },
  { date: '2026-03-21', city: 'Tokyo',  order: 2 },
  { date: '2026-03-22', city: 'Tokyo',  order: 3 },
  { date: '2026-03-23', city: 'Tokyo',  order: 4 },
  { date: '2026-03-24', city: 'Kyoto',  order: 5,  notes: 'Shinkansen to Kyoto' },
  { date: '2026-03-25', city: 'Kyoto',  order: 6 },
  { date: '2026-03-26', city: 'Kyoto',  order: 7 },
  { date: '2026-03-27', city: 'Osaka',  order: 8,  notes: 'Train to Osaka' },
  { date: '2026-03-28', city: 'Osaka',  order: 9 },
  { date: '2026-03-29', city: 'Osaka',  order: 10 },
  { date: '2026-03-30', city: 'Tokyo',  order: 11, notes: 'Back to Tokyo' },
  { date: '2026-03-31', city: 'Tokyo',  order: 12, notes: 'Departure day' },
];

// ── Events (keyed by day index 0-11) ───────────────────────
// dayIdx references the index in the days array above
// placeKey references the `key` field in the places array above
const events = [
  // Day 0 (Mar 20) – Arrival
  {
    dayIdx: 0,
    title: 'Arrive at Narita Airport',
    startTime: '14:00',
    type: 'transport',
    order: 1,
    status: 'planned',
    transit: {
      mode: 'train',
      from: 'Narita Airport',
      to: 'Shinjuku Station',
      instructions: 'Narita Express (NEX) to Shinjuku. ~90 min. Use JR Pass.',
    },
    notes: 'Pick up pocket WiFi at airport',
  },
  {
    dayIdx: 0,
    title: 'Check into hotel',
    startTime: '16:30',
    type: 'hotel',
    order: 2,
    status: 'planned',
    notes: 'Hotel Gracery Shinjuku',
  },
  {
    dayIdx: 0,
    title: 'Dinner at Ichiran Ramen',
    startTime: '18:30',
    type: 'food',
    placeKey: 'ichiran-shibuya',
    order: 3,
    status: 'planned',
    transit: {
      mode: 'walk',
      instructions: '10 min walk from hotel',
    },
  },

  // Day 1 (Mar 21) – Tokyo exploration
  {
    dayIdx: 1,
    title: 'Tsukiji Market breakfast',
    startTime: '07:30',
    type: 'food',
    placeKey: 'tsukiji',
    order: 1,
    status: 'planned',
    transit: {
      mode: 'train',
      from: 'Shinjuku',
      to: 'Tsukiji',
      instructions: 'Marunouchi Line → Ginza Line. ~25 min.',
    },
  },
  {
    dayIdx: 1,
    title: 'Senso-ji Temple',
    startTime: '10:00',
    type: 'sight',
    placeKey: 'senso-ji',
    order: 2,
    status: 'planned',
    transit: {
      mode: 'train',
      from: 'Tsukiji',
      to: 'Asakusa',
      instructions: 'Ginza Line to Asakusa. ~15 min.',
    },
  },
  {
    dayIdx: 1,
    title: 'TeamLab Borderless',
    startTime: '14:00',
    endTime: '17:00',
    type: 'sight',
    placeKey: 'teamlab',
    order: 3,
    status: 'planned',
    transit: {
      mode: 'train',
      from: 'Asakusa',
      to: 'Azabudai',
      instructions: 'Ginza Line → Hibiya Line. ~30 min.',
    },
    links: ['https://www.teamlab.art/e/borderless-azabudai/'],
  },

  // Day 4 (Mar 24) – Kyoto
  {
    dayIdx: 4,
    title: 'Shinkansen to Kyoto',
    startTime: '08:00',
    type: 'transport',
    order: 1,
    status: 'planned',
    transit: {
      mode: 'train',
      from: 'Tokyo Station',
      to: 'Kyoto Station',
      instructions: 'Nozomi Shinkansen. ~2h15m. Reserved car 7.',
    },
  },
  {
    dayIdx: 4,
    title: 'Fushimi Inari Shrine',
    startTime: '13:00',
    type: 'sight',
    placeKey: 'fushimi-inari',
    order: 2,
    status: 'planned',
    transit: {
      mode: 'train',
      from: 'Kyoto Station',
      to: 'Inari Station',
      instructions: 'JR Nara Line. 2 stops, ~5 min.',
    },
  },

  // Day 5 (Mar 25) – Kyoto
  {
    dayIdx: 5,
    title: 'Arashiyama Bamboo Grove',
    startTime: '07:00',
    type: 'sight',
    placeKey: 'arashiyama',
    order: 1,
    status: 'planned',
    transit: {
      mode: 'train',
      from: 'Kyoto Station',
      to: 'Saga-Arashiyama',
      instructions: 'JR San-in Line. ~15 min.',
    },
  },

  // Day 7 (Mar 27) – Osaka
  {
    dayIdx: 7,
    title: 'Train to Osaka',
    startTime: '09:00',
    type: 'transport',
    order: 1,
    status: 'planned',
    transit: {
      mode: 'train',
      from: 'Kyoto Station',
      to: 'Osaka Station',
      instructions: 'JR Special Rapid. ~30 min.',
    },
  },
  {
    dayIdx: 7,
    title: 'Dotonbori Street Food',
    startTime: '12:00',
    type: 'food',
    placeKey: 'dotonbori',
    order: 2,
    status: 'planned',
    transit: {
      mode: 'train',
      from: 'Osaka Station',
      to: 'Namba',
      instructions: 'Midosuji Line. ~10 min.',
    },
  },
];

// ── Bookings ────────────────────────────────────────────────
const bookings = [
  {
    type: 'flight',
    title: 'London → Tokyo (Narita)',
    confirmationNumber: 'BA4821-XYZ',
    date: '2026-03-20',
    startTime: '06:30',
    notes: 'Terminal 5. 11h 45m flight.',
    links: ['https://ba.com/manage'],
  },
  {
    type: 'hotel',
    title: 'Hotel Gracery Shinjuku',
    confirmationNumber: 'GRC-20260320-001',
    date: '2026-03-20',
    location: 'Shinjuku, Tokyo',
    notes: 'Check-in 15:00. Godzilla head on the roof!',
  },
  {
    type: 'hotel',
    title: 'Kyoto Granbell Hotel',
    confirmationNumber: 'KGH-20260324-042',
    date: '2026-03-24',
    location: 'Higashiyama, Kyoto',
    notes: 'Check-in 14:00. Near Gion.',
  },
  {
    type: 'activity',
    title: 'TeamLab Borderless Tickets',
    confirmationNumber: 'TLB-2026-9981',
    date: '2026-03-21',
    startTime: '14:00',
    notes: '2 tickets. Entry time 14:00.',
    links: ['https://www.teamlab.art/e/borderless-azabudai/'],
  },
  {
    type: 'rail',
    title: 'JR Pass (14-day)',
    confirmationNumber: 'JRP-2026-ABC',
    date: '2026-03-20',
    notes: 'Activate at Narita Airport JR counter. Covers Shinkansen.',
  },
  {
    type: 'flight',
    title: 'Tokyo (Narita) → London',
    confirmationNumber: 'BA4822-ABC',
    date: '2026-03-31',
    startTime: '11:00',
    notes: 'Terminal 1. 12h flight.',
  },
];

// ── Suggestions ─────────────────────────────────────────────
const suggestions = [
  {
    city: 'Tokyo',
    title: 'Shibuya Crossing',
    type: 'sight',
    why: 'Iconic Tokyo experience — watch from Starbucks above.',
  },
  {
    city: 'Tokyo',
    title: 'Meiji Shrine',
    type: 'sight',
    why: 'Peaceful Shinto shrine in Harajuku forest.',
  },
  {
    city: 'Kyoto',
    title: 'Kinkaku-ji (Golden Pavilion)',
    type: 'sight',
    why: 'Stunning gold-leaf temple. Must-see in Kyoto.',
  },
  {
    city: 'Osaka',
    title: 'Osaka Castle',
    type: 'sight',
    why: 'Historic castle with beautiful park grounds.',
  },
  {
    city: 'Osaka',
    title: 'Kuromon Market',
    type: 'food',
    why: "Osaka's kitchen — fresh seafood and street snacks.",
  },
];

module.exports = { trip, days, places, events, bookings, suggestions };
