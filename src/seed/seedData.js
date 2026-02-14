/**
 * Seed data for a 12-day Japan trip (MVP).
 *
 * All ObjectId references are wired up in the seed script at insert-time;
 * here we use string keys (e.g. "place:senso-ji") that the script replaces
 * with real Mongo ObjectIds after places are inserted.
 */

// ── Trip ────────────────────────────────────────────────────
const trip = {
  name: 'Japan 12-Day MVP',
  startDate: new Date('2025-10-01'),
  endDate: new Date('2025-10-12'),
  timezone: 'Asia/Tokyo',
  createdBy: 'seed-user',
  collaborators: [{ userId: 'seed-user', role: 'owner' }],
  shareLinks: [],
};

// ── Days ────────────────────────────────────────────────────
const days = [
  { date: '2025-10-01', city: 'Tokyo',     order: 1,  notes: 'Arrival day – settle in and explore Asakusa.' },
  { date: '2025-10-02', city: 'Tokyo',     order: 2,  notes: 'Shibuya, Harajuku & Shinjuku.' },
  { date: '2025-10-03', city: 'Tokyo',     order: 3,  notes: 'Akihabara & Ueno area.' },
  { date: '2025-10-04', city: 'Tokyo',     order: 4,  notes: 'Tsukiji outer market & Odaiba.' },
  { date: '2025-10-05', city: 'Hakone',    order: 5,  notes: 'Day trip to Hakone – onsen & Mt Fuji views.' },
  { date: '2025-10-06', city: 'Kyoto',     order: 6,  notes: 'Travel to Kyoto, Fushimi Inari.' },
  { date: '2025-10-07', city: 'Kyoto',     order: 7,  notes: 'Arashiyama bamboo grove & temples.' },
  { date: '2025-10-08', city: 'Kyoto',     order: 8,  notes: 'Kinkaku-ji, Nijo Castle, Gion.' },
  { date: '2025-10-09', city: 'Nara',      order: 9,  notes: 'Day trip to Nara – deer park & Todai-ji.' },
  { date: '2025-10-10', city: 'Osaka',     order: 10, notes: 'Travel to Osaka, Dotonbori.' },
  { date: '2025-10-11', city: 'Osaka',     order: 11, notes: 'Osaka Castle & Shinsekai.' },
  { date: '2025-10-12', city: 'Osaka',     order: 12, notes: 'Departure day.' },
];

// ── Places ──────────────────────────────────────────────────
const places = [
  // Tokyo
  { key: 'senso-ji',        name: 'Senso-ji Temple',        address: '2-3-1 Asakusa, Taito, Tokyo 111-0032',          lat: 35.7148, lng: 139.7967, googleMapsUrl: 'https://maps.app.goo.gl/senso-ji',       tags: ['temple', 'sight'] },
  { key: 'tokyo-skytree',   name: 'Tokyo Skytree',          address: '1-1-2 Oshiage, Sumida, Tokyo 131-0045',         lat: 35.7101, lng: 139.8107, googleMapsUrl: 'https://maps.app.goo.gl/skytree',       tags: ['sight', 'observation'] },
  { key: 'shibuya-crossing', name: 'Shibuya Crossing',      address: 'Shibuya, Tokyo 150-0041',                       lat: 35.6595, lng: 139.7004, googleMapsUrl: 'https://maps.app.goo.gl/shibuya',       tags: ['sight'] },
  { key: 'meiji-jingu',     name: 'Meiji Jingu Shrine',     address: '1-1 Yoyogi-Kamizonocho, Shibuya, Tokyo 151-8557', lat: 35.6764, lng: 139.6993, googleMapsUrl: 'https://maps.app.goo.gl/meiji-jingu',  tags: ['shrine', 'sight'] },
  { key: 'takeshita',       name: 'Takeshita Street',       address: 'Jingumae, Shibuya, Tokyo 150-0001',             lat: 35.6716, lng: 139.7030, googleMapsUrl: 'https://maps.app.goo.gl/takeshita',     tags: ['shopping'] },
  { key: 'akihabara',       name: 'Akihabara Electric Town', address: 'Sotokanda, Chiyoda, Tokyo 101-0021',           lat: 35.7023, lng: 139.7745, googleMapsUrl: 'https://maps.app.goo.gl/akihabara',     tags: ['shopping', 'culture'] },
  { key: 'ueno-park',       name: 'Ueno Park',             address: 'Ueno, Taito, Tokyo 110-0007',                    lat: 35.7146, lng: 139.7734, googleMapsUrl: 'https://maps.app.goo.gl/ueno-park',     tags: ['park', 'museum'] },
  { key: 'tsukiji',         name: 'Tsukiji Outer Market',   address: '4-16-2 Tsukiji, Chuo, Tokyo 104-0045',          lat: 35.6654, lng: 139.7707, googleMapsUrl: 'https://maps.app.goo.gl/tsukiji',       tags: ['food', 'market'] },
  { key: 'teamlab',         name: 'teamLab Borderless',     address: 'Azabudai Hills, Minato, Tokyo 106-0041',        lat: 35.6604, lng: 139.7312, googleMapsUrl: 'https://maps.app.goo.gl/teamlab',       tags: ['art', 'museum'] },
  { key: 'ichiran-shibuya', name: 'Ichiran Ramen Shibuya',  address: '1-22-7 Jinnan, Shibuya, Tokyo 150-0041',        lat: 35.6614, lng: 139.6981, googleMapsUrl: 'https://maps.app.goo.gl/ichiran',       tags: ['food', 'ramen'] },
  // Hakone
  { key: 'hakone-shrine',   name: 'Hakone Shrine',          address: '80-1 Motohakone, Hakone, Ashigarashimo 250-0522', lat: 35.1937, lng: 139.0228, googleMapsUrl: 'https://maps.app.goo.gl/hakone-shrine', tags: ['shrine', 'sight'] },
  { key: 'owakudani',       name: 'Owakudani Valley',       address: 'Sengokuhara, Hakone, Ashigarashimo 250-0631',   lat: 35.2431, lng: 139.0261, googleMapsUrl: 'https://maps.app.goo.gl/owakudani',     tags: ['nature', 'sight'] },
  // Kyoto
  { key: 'fushimi-inari',   name: 'Fushimi Inari Taisha',   address: '68 Fukakusa-Yabunouchicho, Fushimi, Kyoto 612-0882', lat: 34.9671, lng: 135.7727, googleMapsUrl: 'https://maps.app.goo.gl/fushimi-inari', tags: ['shrine', 'sight'] },
  { key: 'arashiyama',      name: 'Arashiyama Bamboo Grove', address: 'Sagaogurayama Tabuchiyamacho, Ukyo, Kyoto 616-8394', lat: 35.0094, lng: 135.6722, googleMapsUrl: 'https://maps.app.goo.gl/arashiyama', tags: ['nature', 'sight'] },
  { key: 'kinkaku-ji',      name: 'Kinkaku-ji (Golden Pavilion)', address: '1 Kinkakujicho, Kita, Kyoto 603-8361',    lat: 35.0394, lng: 135.7292, googleMapsUrl: 'https://maps.app.goo.gl/kinkaku-ji',   tags: ['temple', 'sight'] },
  { key: 'nijo-castle',     name: 'Nijo Castle',            address: '541 Nijojocho, Nakagyo, Kyoto 604-8301',        lat: 35.0142, lng: 135.7481, googleMapsUrl: 'https://maps.app.goo.gl/nijo-castle',   tags: ['castle', 'sight'] },
  { key: 'gion',            name: 'Gion District',          address: 'Gionmachi, Higashiyama, Kyoto 605-0073',        lat: 35.0037, lng: 135.7756, googleMapsUrl: 'https://maps.app.goo.gl/gion',          tags: ['culture', 'sight'] },
  // Nara
  { key: 'todai-ji',        name: 'Todai-ji Temple',        address: '406-1 Zoshicho, Nara 630-8211',                 lat: 34.6889, lng: 135.8398, googleMapsUrl: 'https://maps.app.goo.gl/todai-ji',     tags: ['temple', 'sight'] },
  { key: 'nara-park',       name: 'Nara Park',              address: 'Nara, 630-8211',                                 lat: 34.6851, lng: 135.8430, googleMapsUrl: 'https://maps.app.goo.gl/nara-park',     tags: ['park', 'nature'] },
  // Osaka
  { key: 'dotonbori',       name: 'Dotonbori',              address: 'Dotonbori, Chuo, Osaka 542-0071',               lat: 34.6687, lng: 135.5026, googleMapsUrl: 'https://maps.app.goo.gl/dotonbori',     tags: ['food', 'nightlife'] },
  { key: 'osaka-castle',    name: 'Osaka Castle',           address: '1-1 Osakajo, Chuo, Osaka 540-0002',             lat: 34.6873, lng: 135.5262, googleMapsUrl: 'https://maps.app.goo.gl/osaka-castle',  tags: ['castle', 'sight'] },
  { key: 'shinsekai',       name: 'Shinsekai',              address: 'Ebisuhigashi, Naniwa, Osaka 556-0002',          lat: 34.6523, lng: 135.5063, googleMapsUrl: 'https://maps.app.goo.gl/shinsekai',     tags: ['food', 'culture'] },
  { key: 'kuromon',         name: 'Kuromon Market',         address: '2-4-1 Nipponbashi, Chuo, Osaka 542-0073',       lat: 34.6628, lng: 135.5069, googleMapsUrl: 'https://maps.app.goo.gl/kuromon',       tags: ['food', 'market'] },
];

// ── Events (keyed by day index 0-11) ───────────────────────
// placeKey references the `key` field in places array above
const events = [
  // Day 0 – Tokyo arrival
  { dayIdx: 0, title: 'Arrive at Narita Airport',        startTime: '14:00', endTime: '15:30', type: 'transport', order: 0, status: 'planned', transit: { mode: 'train', from: 'Narita Airport', to: 'Asakusa', instructions: 'Skyliner to Ueno, then Ginza line to Asakusa.' } },
  { dayIdx: 0, title: 'Check in hotel',                  startTime: '16:00', endTime: '16:30', type: 'hotel',     order: 1, status: 'planned' },
  { dayIdx: 0, title: 'Explore Senso-ji Temple',         startTime: '17:00', endTime: '18:30', type: 'sight',     order: 2, status: 'planned', placeKey: 'senso-ji' },
  { dayIdx: 0, title: 'Dinner at Asakusa street food',   startTime: '19:00', endTime: '20:00', type: 'food',      order: 3, status: 'planned' },

  // Day 1 – Tokyo Shibuya / Harajuku
  { dayIdx: 1, title: 'Meiji Jingu Shrine',              startTime: '09:00', endTime: '10:30', type: 'sight',     order: 0, status: 'planned', placeKey: 'meiji-jingu' },
  { dayIdx: 1, title: 'Takeshita Street shopping',       startTime: '10:45', endTime: '12:00', type: 'sight',     order: 1, status: 'planned', placeKey: 'takeshita' },
  { dayIdx: 1, title: 'Lunch – Harajuku crepes',         startTime: '12:00', endTime: '13:00', type: 'food',      order: 2, status: 'planned' },
  { dayIdx: 1, title: 'Shibuya Crossing & Hachiko',      startTime: '14:00', endTime: '15:00', type: 'sight',     order: 3, status: 'planned', placeKey: 'shibuya-crossing' },
  { dayIdx: 1, title: 'Shinjuku Gyoen Garden',           startTime: '15:30', endTime: '17:00', type: 'sight',     order: 4, status: 'planned' },
  { dayIdx: 1, title: 'Ichiran Ramen dinner',            startTime: '18:30', endTime: '19:30', type: 'food',      order: 5, status: 'planned', placeKey: 'ichiran-shibuya' },
  { dayIdx: 1, title: 'Shinjuku nightlife walk',         startTime: '20:00', endTime: '22:00', type: 'free',      order: 6, status: 'planned' },

  // Day 2 – Akihabara & Ueno
  { dayIdx: 2, title: 'Akihabara Electric Town',         startTime: '10:00', endTime: '12:30', type: 'sight',     order: 0, status: 'planned', placeKey: 'akihabara' },
  { dayIdx: 2, title: 'Lunch – maid café experience',    startTime: '12:30', endTime: '13:30', type: 'food',      order: 1, status: 'planned' },
  { dayIdx: 2, title: 'Ueno Park & museums',             startTime: '14:00', endTime: '17:00', type: 'sight',     order: 2, status: 'planned', placeKey: 'ueno-park' },
  { dayIdx: 2, title: 'Tokyo Skytree sunset',            startTime: '17:30', endTime: '19:00', type: 'sight',     order: 3, status: 'planned', placeKey: 'tokyo-skytree' },

  // Day 3 – Tsukiji & Odaiba
  { dayIdx: 3, title: 'Tsukiji Outer Market breakfast',   startTime: '07:30', endTime: '09:30', type: 'food',     order: 0, status: 'planned', placeKey: 'tsukiji' },
  { dayIdx: 3, title: 'teamLab Borderless',              startTime: '10:30', endTime: '13:00', type: 'sight',     order: 1, status: 'planned', placeKey: 'teamlab' },
  { dayIdx: 3, title: 'Lunch at Odaiba mall',            startTime: '13:00', endTime: '14:00', type: 'food',      order: 2, status: 'planned' },
  { dayIdx: 3, title: 'Free time / shopping',            startTime: '14:00', endTime: '17:00', type: 'free',      order: 3, status: 'planned' },

  // Day 4 – Hakone day trip
  { dayIdx: 4, title: 'Train to Hakone',                 startTime: '08:00', endTime: '09:30', type: 'transport', order: 0, status: 'planned', transit: { mode: 'train', from: 'Shinjuku', to: 'Hakone-Yumoto', instructions: 'Romancecar limited express.' } },
  { dayIdx: 4, title: 'Hakone Shrine',                   startTime: '10:00', endTime: '11:30', type: 'sight',     order: 1, status: 'planned', placeKey: 'hakone-shrine' },
  { dayIdx: 4, title: 'Owakudani volcanic valley',       startTime: '12:00', endTime: '13:30', type: 'sight',     order: 2, status: 'planned', placeKey: 'owakudani' },
  { dayIdx: 4, title: 'Lunch & black eggs',              startTime: '13:30', endTime: '14:30', type: 'food',      order: 3, status: 'planned' },
  { dayIdx: 4, title: 'Onsen experience',                startTime: '15:00', endTime: '17:00', type: 'free',      order: 4, status: 'planned' },
  { dayIdx: 4, title: 'Return to Tokyo',                 startTime: '17:30', endTime: '19:00', type: 'transport', order: 5, status: 'planned', transit: { mode: 'train', from: 'Hakone-Yumoto', to: 'Shinjuku' } },

  // Day 5 – Travel to Kyoto, Fushimi Inari
  { dayIdx: 5, title: 'Shinkansen to Kyoto',             startTime: '08:30', endTime: '10:45', type: 'transport', order: 0, status: 'planned', transit: { mode: 'train', from: 'Tokyo Station', to: 'Kyoto Station', instructions: 'Nozomi shinkansen, ~2h15m.' } },
  { dayIdx: 5, title: 'Check in Kyoto hotel',            startTime: '11:00', endTime: '11:30', type: 'hotel',     order: 1, status: 'planned' },
  { dayIdx: 5, title: 'Lunch near Kyoto Station',        startTime: '11:30', endTime: '12:30', type: 'food',      order: 2, status: 'planned' },
  { dayIdx: 5, title: 'Fushimi Inari Taisha',            startTime: '13:30', endTime: '16:30', type: 'sight',     order: 3, status: 'planned', placeKey: 'fushimi-inari' },
  { dayIdx: 5, title: 'Dinner at Nishiki Market area',   startTime: '18:00', endTime: '19:30', type: 'food',      order: 4, status: 'planned' },

  // Day 6 – Arashiyama
  { dayIdx: 6, title: 'Arashiyama Bamboo Grove',         startTime: '08:00', endTime: '10:00', type: 'sight',     order: 0, status: 'planned', placeKey: 'arashiyama' },
  { dayIdx: 6, title: 'Tenryu-ji Temple',                startTime: '10:00', endTime: '11:30', type: 'sight',     order: 1, status: 'planned' },
  { dayIdx: 6, title: 'Monkey Park Iwatayama',           startTime: '12:00', endTime: '13:30', type: 'sight',     order: 2, status: 'planned' },
  { dayIdx: 6, title: 'Lunch in Arashiyama',             startTime: '13:30', endTime: '14:30', type: 'food',      order: 3, status: 'planned' },
  { dayIdx: 6, title: 'Free afternoon – explore Kyoto',  startTime: '15:00', endTime: '18:00', type: 'free',      order: 4, status: 'planned' },

  // Day 7 – Kinkaku-ji, Nijo Castle, Gion
  { dayIdx: 7, title: 'Kinkaku-ji Golden Pavilion',      startTime: '09:00', endTime: '10:30', type: 'sight',     order: 0, status: 'planned', placeKey: 'kinkaku-ji' },
  { dayIdx: 7, title: 'Nijo Castle',                     startTime: '11:00', endTime: '12:30', type: 'sight',     order: 1, status: 'planned', placeKey: 'nijo-castle' },
  { dayIdx: 7, title: 'Lunch – Kyoto ramen',             startTime: '12:30', endTime: '13:30', type: 'food',      order: 2, status: 'planned' },
  { dayIdx: 7, title: 'Philosopher\'s Path walk',        startTime: '14:00', endTime: '15:30', type: 'sight',     order: 3, status: 'planned' },
  { dayIdx: 7, title: 'Gion district evening stroll',    startTime: '17:00', endTime: '19:00', type: 'sight',     order: 4, status: 'planned', placeKey: 'gion' },
  { dayIdx: 7, title: 'Kaiseki dinner',                  startTime: '19:30', endTime: '21:00', type: 'food',      order: 5, status: 'planned' },

  // Day 8 – Nara day trip
  { dayIdx: 8, title: 'Train to Nara',                   startTime: '08:30', endTime: '09:15', type: 'transport', order: 0, status: 'planned', transit: { mode: 'train', from: 'Kyoto Station', to: 'Nara Station', instructions: 'JR Nara Line, ~45 min.' } },
  { dayIdx: 8, title: 'Nara Park & deer',                startTime: '09:30', endTime: '11:00', type: 'sight',     order: 1, status: 'planned', placeKey: 'nara-park' },
  { dayIdx: 8, title: 'Todai-ji Temple',                 startTime: '11:00', endTime: '12:30', type: 'sight',     order: 2, status: 'planned', placeKey: 'todai-ji' },
  { dayIdx: 8, title: 'Lunch in Nara',                   startTime: '12:30', endTime: '13:30', type: 'food',      order: 3, status: 'planned' },
  { dayIdx: 8, title: 'Kasuga Taisha Shrine',            startTime: '14:00', endTime: '15:30', type: 'sight',     order: 4, status: 'planned' },
  { dayIdx: 8, title: 'Return to Kyoto',                 startTime: '16:00', endTime: '16:45', type: 'transport', order: 5, status: 'planned', transit: { mode: 'train', from: 'Nara Station', to: 'Kyoto Station' } },

  // Day 9 – Travel to Osaka, Dotonbori
  { dayIdx: 9, title: 'Shinkansen to Osaka',             startTime: '09:00', endTime: '09:30', type: 'transport', order: 0, status: 'planned', transit: { mode: 'train', from: 'Kyoto Station', to: 'Shin-Osaka', instructions: 'Shinkansen, ~15 min.' } },
  { dayIdx: 9, title: 'Check in Osaka hotel',            startTime: '10:00', endTime: '10:30', type: 'hotel',     order: 1, status: 'planned' },
  { dayIdx: 9, title: 'Kuromon Market brunch',           startTime: '11:00', endTime: '12:30', type: 'food',      order: 2, status: 'planned', placeKey: 'kuromon' },
  { dayIdx: 9, title: 'Shinsaibashi shopping',           startTime: '13:00', endTime: '15:00', type: 'free',      order: 3, status: 'planned' },
  { dayIdx: 9, title: 'Dotonbori street food tour',      startTime: '17:00', endTime: '20:00', type: 'food',      order: 4, status: 'planned', placeKey: 'dotonbori' },

  // Day 10 – Osaka Castle & Shinsekai
  { dayIdx: 10, title: 'Osaka Castle',                   startTime: '09:00', endTime: '11:30', type: 'sight',     order: 0, status: 'planned', placeKey: 'osaka-castle' },
  { dayIdx: 10, title: 'Lunch – okonomiyaki',            startTime: '12:00', endTime: '13:00', type: 'food',      order: 1, status: 'planned' },
  { dayIdx: 10, title: 'Shinsekai & Tsutenkaku Tower',   startTime: '14:00', endTime: '16:00', type: 'sight',     order: 2, status: 'planned', placeKey: 'shinsekai' },
  { dayIdx: 10, title: 'Kushikatsu dinner',              startTime: '18:00', endTime: '19:30', type: 'food',      order: 3, status: 'planned' },
  { dayIdx: 10, title: 'Namba nightlife',                startTime: '20:00', endTime: '22:00', type: 'free',      order: 4, status: 'planned' },

  // Day 11 – Departure
  { dayIdx: 11, title: 'Pack & check out',               startTime: '08:00', endTime: '09:30', type: 'hotel',     order: 0, status: 'planned' },
  { dayIdx: 11, title: 'Last-minute souvenir shopping',  startTime: '09:30', endTime: '11:00', type: 'free',      order: 1, status: 'planned' },
  { dayIdx: 11, title: 'Train to Kansai Airport',        startTime: '11:30', endTime: '12:30', type: 'transport', order: 2, status: 'planned', transit: { mode: 'train', from: 'Namba', to: 'Kansai International Airport', instructions: 'Nankai Rapi:t express, ~40 min.' } },
  { dayIdx: 11, title: 'Departure flight',               startTime: '15:00', endTime: '15:00', type: 'transport', order: 3, status: 'planned' },
];

// ── Bookings ────────────────────────────────────────────────
const bookings = [
  { type: 'flight', provider: 'ANA',           confirmationCode: 'ANA-JP-7821',   dateTime: new Date('2025-10-01T06:00:00Z'), notes: 'Outbound: Home → Narita',                 link: 'https://www.ana.co.jp' },
  { type: 'flight', provider: 'ANA',           confirmationCode: 'ANA-JP-7822',   dateTime: new Date('2025-10-12T15:00:00Z'), notes: 'Return: Kansai → Home',                    link: 'https://www.ana.co.jp' },
  { type: 'hotel',  provider: 'Hotel Gracery Asakusa', confirmationCode: 'GRC-44201', dateTime: new Date('2025-10-01T16:00:00Z'), notes: 'Tokyo stay – 5 nights (Oct 1-5)',     link: 'https://gracery.com' },
  { type: 'hotel',  provider: 'Hotel Granvia Kyoto',   confirmationCode: 'GRV-88102', dateTime: new Date('2025-10-06T11:00:00Z'), notes: 'Kyoto stay – 4 nights (Oct 6-9)',     link: 'https://granvia-kyoto.co.jp' },
  { type: 'hotel',  provider: 'Cross Hotel Osaka',     confirmationCode: 'CRH-55903', dateTime: new Date('2025-10-10T10:00:00Z'), notes: 'Osaka stay – 2 nights (Oct 10-11)',   link: 'https://crosshotel.com/osaka' },
  { type: 'rail',   provider: 'JR Pass',        confirmationCode: 'JRP-2025-1234', dateTime: new Date('2025-10-01T00:00:00Z'), notes: '14-day Japan Rail Pass (Ordinary)',        link: 'https://japanrailpass.net' },
  { type: 'reservation', provider: 'teamLab',   confirmationCode: 'TL-OCT03-5678', dateTime: new Date('2025-10-04T10:30:00Z'), notes: 'teamLab Borderless timed entry 10:30 AM', link: 'https://borderless.teamlab.art' },
  { type: 'activity', provider: 'Hakone Free Pass', confirmationCode: 'HFP-98765',  dateTime: new Date('2025-10-05T08:00:00Z'), notes: 'Hakone 2-day free pass (using 1 day)',    link: 'https://www.hakonenavi.jp' },
];

// ── Suggestions ─────────────────────────────────────────────
const suggestions = [
  // Tokyo
  { city: 'Tokyo', title: 'Robot Restaurant show',       type: 'sight',  why: 'Wild, only-in-Tokyo experience – book in advance.' },
  { city: 'Tokyo', title: 'Tsukemen at Fuunji',          type: 'food',   why: 'Arguably the best tsukemen in Shinjuku.' },
  { city: 'Tokyo', title: 'Shinjuku Golden Gai',         type: 'food',   why: 'Tiny atmospheric bars, great for nightlife.' },
  { city: 'Tokyo', title: 'Roppongi Hills observation',  type: 'sight',  why: 'Alternative to Skytree with skyline views.' },
  // Kyoto
  { city: 'Kyoto', title: 'Tofuku-ji Temple',            type: 'sight',  why: 'Stunning in autumn; less crowded than Kinkaku-ji.' },
  { city: 'Kyoto', title: 'Nishiki Market snack crawl',  type: 'food',   why: 'Street food paradise – try yuba and matcha.' },
  { city: 'Kyoto', title: 'Tea ceremony experience',     type: 'sight',  why: 'Authentic cultural immersion; book through hotel.' },
  // Osaka
  { city: 'Osaka', title: 'Sumiyoshi Taisha Shrine',     type: 'sight',  why: 'One of Japan\'s oldest shrines, peaceful atmosphere.' },
  { city: 'Osaka', title: 'Takoyaki at Kukuru',          type: 'food',   why: 'Famous takoyaki stand in Dotonbori.' },
  { city: 'Osaka', title: 'Universal Studios Japan',     type: 'sight',  why: 'If you have a spare day – Super Nintendo World!' },
  // Hakone
  { city: 'Hakone', title: 'Lake Ashi pirate boat',      type: 'sight',  why: 'Scenic cruise with Mt Fuji backdrop.' },
  // Nara
  { city: 'Nara',  title: 'Naramachi old town',          type: 'sight',  why: 'Charming Edo-era streets and artisan shops.' },
];

module.exports = { trip, days, places, events, bookings, suggestions };
