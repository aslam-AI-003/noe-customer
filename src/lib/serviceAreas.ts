// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE AREAS — Thanjavur to Kumbakonam Corridor (~60km)
// All towns/villages where NOE delivers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ServiceArea {
  id: string;
  name: string;
  nameTamil: string;
  district: 'Thanjavur' | 'Kumbakonam';
  lat: number;
  lng: number;
  pincode: string;
  type: 'city' | 'town' | 'village';
}

// ━━━ Main service areas in Thanjavur-Kumbakonam corridor ━━━
export const SERVICE_AREAS: ServiceArea[] = [
  // ─── Thanjavur District (Main) ───
  { id: 'thanjavur', name: 'Thanjavur', nameTamil: 'தஞ்சாவூர்', district: 'Thanjavur', lat: 10.7870, lng: 79.1378, pincode: '613001', type: 'city' },
  { id: 'vallam', name: 'Vallam', nameTamil: 'வல்லம்', district: 'Thanjavur', lat: 10.7553, lng: 79.0792, pincode: '613403', type: 'town' },
  { id: 'sengipatti', name: 'Sengipatti', nameTamil: 'செங்கிப்பட்டி', district: 'Thanjavur', lat: 10.7489, lng: 79.1089, pincode: '613402', type: 'village' },
  { id: 'pillaiyarpatti', name: 'Pillaiyarpatti', nameTamil: 'பிள்ளையார்பட்டி', district: 'Thanjavur', lat: 10.7523, lng: 79.1234, pincode: '613403', type: 'village' },
  { id: 'budalur', name: 'Budalur', nameTamil: 'புதலூர்', district: 'Thanjavur', lat: 10.7945, lng: 79.0617, pincode: '613602', type: 'town' },
  { id: 'thiruvaiyaru', name: 'Thiruvaiyaru', nameTamil: 'திருவையாறு', district: 'Thanjavur', lat: 10.8833, lng: 79.1050, pincode: '613204', type: 'town' },
  { id: 'papanasam', name: 'Papanasam', nameTamil: 'பாபநாசம்', district: 'Thanjavur', lat: 10.9263, lng: 79.2698, pincode: '614205', type: 'town' },
  { id: 'thiruvidaimarudur', name: 'Thiruvidaimarudur', nameTamil: 'திருவிடைமருதூர்', district: 'Thanjavur', lat: 10.9983, lng: 79.4517, pincode: '612104', type: 'town' },
  { id: 'ayyavadi', name: 'Ayyavadi', nameTamil: 'அய்யாவாடி', district: 'Thanjavur', lat: 10.9100, lng: 79.3200, pincode: '612201', type: 'village' },
  { id: 'swamimalai', name: 'Swamimalai', nameTamil: 'சுவாமிமலை', district: 'Thanjavur', lat: 10.9573, lng: 79.3289, pincode: '612302', type: 'town' },
  { id: 'kumbakudi', name: 'Kumbakudi', nameTamil: 'கும்பகுடி', district: 'Thanjavur', lat: 10.8200, lng: 79.1800, pincode: '613002', type: 'village' },

  // ─── Kumbakonam Area ───
  { id: 'kumbakonam', name: 'Kumbakonam', nameTamil: 'கும்பகோணம்', district: 'Kumbakonam', lat: 10.9617, lng: 79.3881, pincode: '612001', type: 'city' },
  { id: 'darasuram', name: 'Darasuram', nameTamil: 'தாராசுரம்', district: 'Kumbakonam', lat: 10.9483, lng: 79.3567, pincode: '612702', type: 'town' },
  { id: 'patteswaram', name: 'Patteswaram', nameTamil: 'பட்டீஸ்வரம்', district: 'Kumbakonam', lat: 10.9500, lng: 79.3400, pincode: '612703', type: 'town' },
  { id: 'thirubuvanam', name: 'Thirubuvanam', nameTamil: 'திருபுவனம்', district: 'Kumbakonam', lat: 10.9300, lng: 79.3100, pincode: '612601', type: 'town' },
  { id: 'nachiyarkoil', name: 'Nachiyarkoil', nameTamil: 'நாச்சியார்கோவில்', district: 'Kumbakonam', lat: 10.9783, lng: 79.4283, pincode: '612602', type: 'town' },
  { id: 'valangaiman', name: 'Valangaiman', nameTamil: 'வலங்கைமான்', district: 'Kumbakonam', lat: 10.8900, lng: 79.3900, pincode: '612804', type: 'town' },
  { id: 'aduthurai', name: 'Aduthurai', nameTamil: 'ஆடுதுறை', district: 'Kumbakonam', lat: 11.0100, lng: 79.4800, pincode: '612101', type: 'town' },
  { id: 'mayiladuthurai', name: 'Mayiladuthurai', nameTamil: 'மயிலாடுதுறை', district: 'Kumbakonam', lat: 11.1014, lng: 79.6527, pincode: '609001', type: 'city' },
  { id: 'sirkazhi', name: 'Sirkazhi', nameTamil: 'சீர்காழி', district: 'Kumbakonam', lat: 11.2333, lng: 79.7333, pincode: '609110', type: 'town' },

  // ─── In-between villages ───
  { id: 'orathanadu', name: 'Orathanadu', nameTamil: 'ஓரத்தநாடு', district: 'Thanjavur', lat: 10.6288, lng: 79.2220, pincode: '614625', type: 'town' },
  { id: 'ammapettai', name: 'Ammapettai', nameTamil: 'அம்மாப்பேட்டை', district: 'Thanjavur', lat: 10.8100, lng: 79.2300, pincode: '613110', type: 'village' },
  { id: 'needamangalam', name: 'Needamangalam', nameTamil: 'நீடாமங்கலம்', district: 'Thanjavur', lat: 10.7667, lng: 79.4167, pincode: '614404', type: 'town' },
  { id: 'mannargudi', name: 'Mannargudi', nameTamil: 'மன்னார்குடி', district: 'Thanjavur', lat: 10.6628, lng: 79.4522, pincode: '614001', type: 'city' },
];

// ━━━ Helper functions ━━━

// Get all area names (for dropdown)
export function getAreaNames(): string[] {
  return SERVICE_AREAS.map(a => a.name);
}

// Get areas by district
export function getAreasByDistrict(district: string): ServiceArea[] {
  return SERVICE_AREAS.filter(a => a.district === district);
}

// Get area by ID
export function getAreaById(id: string): ServiceArea | undefined {
  return SERVICE_AREAS.find(a => a.id === id);
}

// Get nearby areas (within radius km)
export function getNearbyAreas(areaId: string, radiusKm: number = 15): ServiceArea[] {
  const area = getAreaById(areaId);
  if (!area) return [];

  return SERVICE_AREAS.filter(a => {
    if (a.id === areaId) return false;
    const dist = getDistanceKm(area.lat, area.lng, a.lat, a.lng);
    return dist <= radiusKm;
  });
}

// Calculate distance between two lat/lng points (Haversine formula)
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate delivery fee based on distance
export function getDeliveryFee(distanceKm: number): number {
  if (distanceKm <= 2) return 25;
  if (distanceKm <= 5) return 40;
  if (distanceKm <= 10) return 60;
  if (distanceKm <= 15) return 80;
  return 100; // 15km+
}

// Check if an area is serviceable
export function isServiceable(areaName: string): boolean {
  return SERVICE_AREAS.some(a =>
    a.name.toLowerCase() === areaName.toLowerCase() ||
    a.nameTamil === areaName
  );
}

// Get area from GPS coordinates (find nearest)
export function getAreaFromGPS(lat: number, lng: number): ServiceArea | null {
  let nearest: ServiceArea | null = null;
  let minDist = Infinity;

  for (const area of SERVICE_AREAS) {
    const dist = getDistanceKm(lat, lng, area.lat, area.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = area;
    }
  }

  // Only return if within 20km of any service area
  if (minDist <= 20) return nearest;
  return null;
}

// Default area
export const DEFAULT_AREA = SERVICE_AREAS[0]; // Thanjavur
