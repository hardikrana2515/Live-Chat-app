/**
 * Talkyy Fictional Cast Reference Data (Phase 4)
 * Establishes consistent fictional characters across direct chat,
 * group chat, shared media, and video calls.
 */

export const CAST_MEMBERS = [
  {
    id: 'elena',
    name: 'Elena Costa',
    role: 'Architect & Travel Writer',
    location: 'Lisbon, Portugal',
    age: '30',
    portrait: '/assets/cast/elena.jpg',
    videoFrame: '/assets/calls/call-elena.jpg',
    appearance: 'Warm olive skin tone, shoulder-length wavy dark brown hair, hazel eyes, natural warm smile.',
    clothingStyle: 'Relaxed cream linen buttoned shirts, breathable natural fabrics, minimalist gold chain.',
    scenes: [
      'Private 1:1 Chat (Lisbon morning stroll story & voice note)',
      'Group Chat ("Weekend Hikers" participant)',
      'Voice & Video Call (Active attendee, laughing & listening)'
    ],
    accentColor: '#2858E8',
    status: 'Online',
    statusText: 'Walking through Alfama'
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    role: 'Sound Designer & Engineer',
    location: 'London, United Kingdom',
    age: '28',
    portrait: '/assets/cast/marcus.jpg',
    videoFrame: '/assets/calls/call-marcus.jpg',
    appearance: 'Black heritage, clean short fade haircut, neat groomed beard, kind attentive dark eyes.',
    clothingStyle: 'Mustard yellow crewneck sweater, classic indigo denim jacket, clean minimalist layers.',
    scenes: [
      'Private 1:1 Chat (Conversation partner with Elena)',
      'Group Chat ("Weekend Hikers" participant)',
      'Voice & Video Call (Attentive listener & speaker)'
    ],
    accentColor: '#173BB5',
    status: 'Online',
    statusText: 'In studio'
  },
  {
    id: 'sofia',
    name: 'Sofia Chen',
    role: 'Environmental Designer',
    location: 'Vancouver, Canada',
    age: '26',
    portrait: '/assets/cast/sofia.jpg',
    videoFrame: '/assets/calls/call-sofia.jpg',
    appearance: 'East Asian heritage, stylish sleek chin-length black bob with wispy bangs, expressive candid smile.',
    clothingStyle: 'Forest green knit sweater, relaxed earth-toned casual layers.',
    scenes: [
      'Group Chat ("Weekend Hikers" coordinator)',
      'Voice & Video Call (Active speaker with live cobalt audio waveform)'
    ],
    accentColor: '#0F766E',
    status: 'Online',
    statusText: 'Active speaker'
  },
  {
    id: 'dev',
    name: 'Dev Patel',
    role: 'Outdoor Photographer',
    location: 'Bristol, United Kingdom',
    age: '31',
    portrait: '/assets/cast/dev.jpg',
    videoFrame: null,
    appearance: 'South Asian heritage, thick dark wavy textured hair, neat groomed stubble, friendly relaxed smile.',
    clothingStyle: 'Casual navy utility overshirt over heather grey t-shirt.',
    scenes: [
      'Group Chat ("Weekend Hikers" trail scout & poll creator)'
    ],
    accentColor: '#D97706',
    status: 'Online',
    statusText: 'Scouting trails'
  },
  {
    id: 'leo',
    name: 'Grandfather Leo',
    role: 'Retired Teacher & Musician',
    location: 'Florence, Italy',
    age: '68',
    portrait: '/assets/cast/leo.jpg',
    videoFrame: '/assets/calls/call-leo.jpg',
    appearance: 'European heritage, soft wavy silver-gray hair and neat beard, kind hazel eyes with warm laugh lines.',
    clothingStyle: 'Charcoal-gray buttoned wool cardigan over light blue collared shirt.',
    scenes: [
      'Voice & Video Call (Strumming acoustic guitar for Sunday family & friends call)'
    ],
    accentColor: '#78350F',
    status: 'Online',
    statusText: 'Playing acoustic guitar'
  }
];

export const MOMENTS = [
  {
    id: 'lisbon',
    src: '/assets/moments/lisbon-tram.jpg',
    caption: 'Tram 28 climbing the steep Alfama hill this morning. The light was unbelievable!',
    author: 'Elena Costa',
    timestamp: '10:42 AM',
    aspectRatio: '4:3',
    location: 'Alfama, Lisbon'
  },
  {
    id: 'trail',
    src: '/assets/moments/alpine-trail.jpg',
    caption: 'Scouted the ridge loop before work. Pine air is 10/10 today. Saturday hike is on!',
    author: 'Dev Patel',
    timestamp: '8:15 AM',
    aspectRatio: '4:3',
    location: 'Alpine Lake Trail'
  }
];
