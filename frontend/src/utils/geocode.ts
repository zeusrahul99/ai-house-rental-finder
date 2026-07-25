interface Coordinates {
  lat: number;
  lng: number;
}

const HOUSE_COORDS: Record<number, Coordinates> = {
  1: { lat: 17.8912, lng: 83.4357 }, // near Raghu Engineering College, Bheemunipatnam
  2: { lat: 14.4491, lng: 79.9874 }, // Market Center, Nellore
  3: { lat: 17.8188, lng: 83.3444 }, // Rushikonda, Vizag (Villa)
  4: { lat: 17.8010, lng: 83.3770 }, // Sea View flat, Rushikonda/Madhurawada
  5: { lat: 17.8123, lng: 83.3533 }, // Madhurawada bachelor flat
  6: { lat: 17.7408, lng: 83.3323 }, // MVP Colony premium villa
  7: { lat: 17.4483, lng: 78.3741 }, // Hitech City apartment
  8: { lat: 12.9719, lng: 77.6412 }, // Indiranagar luxury penthouse
};

export async function geocodeAddress(address: string, houseId?: number): Promise<Coordinates> {
  // If we have a known house ID fallback, use that as the primary fallback
  if (houseId && HOUSE_COORDS[houseId]) {
    return HOUSE_COORDS[houseId];
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!apiKey) {
    // If no API key and no specific houseId, return a generic default (Vizag center)
    return { lat: 17.6868, lng: 83.2185 };
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }

  // Fallback if geocoding fails
  return { lat: 17.6868, lng: 83.2185 };
}
