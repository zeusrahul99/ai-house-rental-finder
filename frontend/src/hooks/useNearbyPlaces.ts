import { useState, useEffect } from 'react';
import { NearbyPlace, PlaceCategory } from '../types/nearby';
import { calculateDistance } from '../utils/distance';

// Memory cache for fetched nearby places to prevent duplicate API queries
const cache: Record<string, NearbyPlace[]> = {};

// Highly realistic mock places generated based on house coordinates to ensure the feature functions out-of-the-box without an API key.
const MOCK_PLACES_TEMPLATES: Record<string, Array<{ name: string; type: string; offsetLat: number; offsetLng: number; rating: number; reviews: number }>> = {
  hospitals: [
    { name: 'Apex General Hospital', type: 'hospital', offsetLat: 0.004, offsetLng: -0.005, rating: 4.2, reviews: 120 },
    { name: 'Care Community Clinic', type: 'hospital', offsetLat: -0.008, offsetLng: 0.003, rating: 3.9, reviews: 45 },
  ],
  schools: [
    { name: 'St. Mary Public School', type: 'school', offsetLat: -0.002, offsetLng: 0.006, rating: 4.5, reviews: 78 },
    { name: 'Oakridge High School', type: 'school', offsetLat: 0.009, offsetLng: -0.002, rating: 4.1, reviews: 54 },
  ],
  colleges: [
    { name: 'Raghu Engineering College', type: 'university', offsetLat: 0.012, offsetLng: -0.015, rating: 4.4, reviews: 420 },
    { name: 'Newton Institute of Technology', type: 'university', offsetLat: -0.015, offsetLng: 0.011, rating: 3.8, reviews: 92 },
  ],
  bus_stops: [
    { name: 'College Junction Bus Stop', type: 'bus_station', offsetLat: 0.001, offsetLng: -0.002, rating: 3.5, reviews: 12 },
    { name: 'Main Road Bus Station', type: 'bus_station', offsetLat: -0.005, offsetLng: 0.005, rating: 4.0, reviews: 25 },
  ],
  railway_stations: [
    { name: 'Local Railway Station Terminal', type: 'train_station', offsetLat: 0.022, offsetLng: -0.018, rating: 3.7, reviews: 150 },
  ],
  atms: [
    { name: 'SBI ATM', type: 'atm', offsetLat: 0.002, offsetLng: 0.001, rating: 4.1, reviews: 8 },
    { name: 'HDFC Bank ATM', type: 'atm', offsetLat: -0.003, offsetLng: -0.004, rating: 4.3, reviews: 15 },
  ],
  restaurants: [
    { name: 'Spice Garden Restaurant', type: 'restaurant', offsetLat: 0.003, offsetLng: 0.004, rating: 4.6, reviews: 320 },
    { name: 'Grand Food Court', type: 'restaurant', offsetLat: -0.006, offsetLng: 0.002, rating: 4.0, reviews: 180 },
    { name: 'Cafe Coffee Day', type: 'restaurant', offsetLat: 0.001, offsetLng: -0.006, rating: 4.2, reviews: 90 },
  ],
  grocery_stores: [
    { name: 'Heritage Fresh Supermarket', type: 'supermarket', offsetLat: 0.005, offsetLng: -0.003, rating: 4.3, reviews: 110 },
    { name: 'Reliance Smart Point', type: 'supermarket', offsetLat: -0.002, offsetLng: 0.008, rating: 4.1, reviews: 85 },
  ],
  pharmacies: [
    { name: 'Apollo Pharmacy', type: 'pharmacy', offsetLat: 0.002, offsetLng: 0.002, rating: 4.5, reviews: 60 },
    { name: 'MedPlus Pharmacy', type: 'pharmacy', offsetLat: -0.004, offsetLng: -0.002, rating: 4.2, reviews: 35 },
  ],
  parks: [
    { name: 'HUDA Park & Playground', type: 'park', offsetLat: 0.007, offsetLng: -0.007, rating: 4.4, reviews: 210 },
    { name: 'Green Meadows Walking Park', type: 'park', offsetLat: -0.009, offsetLng: 0.009, rating: 4.3, reviews: 140 },
  ],
};

const CATEGORY_MAP: Record<PlaceCategory, string[]> = {
  hospitals: ['hospital'],
  schools: ['school'],
  colleges: ['university'],
  bus_stops: ['bus_station'],
  railway_stations: ['train_station'],
  atms: ['atm'],
  restaurants: ['restaurant', 'cafe', 'food'],
  grocery_stores: ['supermarket', 'grocery_or_supermarket', 'store'],
  pharmacies: ['pharmacy'],
  parks: ['park'],
};

export function useNearbyPlaces(lat: number, lng: number, mapLoaded: boolean) {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lng) return;

    const cacheKey = `${lat},${lng}`;
    if (cache[cacheKey]) {
      setPlaces(cache[cacheKey]);
      setLoading(false);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    const googleNamespace = (window as any).google;

    // Use Mock Data if no API key or map script hasn't loaded window.google maps object
    if (!apiKey || !mapLoaded || typeof window === 'undefined' || !googleNamespace?.maps?.places) {
      setLoading(true);
      const mockResult: NearbyPlace[] = [];
      
      // Seed mock places using coordinate offsets relative to center
      Object.entries(MOCK_PLACES_TEMPLATES).forEach(([catKey, templates]) => {
        templates.forEach((t, i) => {
          const plat = lat + t.offsetLat;
          const plng = lng + t.offsetLng;
          const dist = calculateDistance(lat, lng, plat, plng);
          mockResult.push({
            id: `mock-${catKey}-${i}`,
            name: t.name,
            category: catKey,
            lat: plat,
            lng: plng,
            distance: dist,
            rating: t.rating,
            userRatingsTotal: t.reviews,
            openNow: Math.random() > 0.3,
            address: `${t.name} Local Address Area`,
          });
        });
      });

      // Sort by distance
      mockResult.sort((a, b) => a.distance - b.distance);
      
      setTimeout(() => {
        cache[cacheKey] = mockResult;
        setPlaces(mockResult);
        setLoading(false);
      }, 800);
      return;
    }

    // Live fetching using Google Places Service
    setLoading(true);
    setError(null);

    const mapDiv = document.createElement('div');
    const map = new googleNamespace.maps.Map(mapDiv, { center: { lat, lng }, zoom: 15 });
    const service = new googleNamespace.maps.places.PlacesService(map);

    const fetchCategory = (cat: PlaceCategory): Promise<NearbyPlace[]> => {
      const types = CATEGORY_MAP[cat];
      return new Promise((resolve) => {
        service.nearbySearch(
          {
            location: { lat, lng },
            radius: 2000, // 2 km
            type: types[0],
          },
          (results: any, status: any) => {
          if (status !== googleNamespace.maps.places.PlacesServiceStatus.OK || !results) {
              resolve([]);
              return;
            }

            const formatted: NearbyPlace[] = results.map((place: any) => {
              const plat = place.geometry?.location?.lat() || lat;
              const plng = place.geometry?.location?.lng() || lng;
              return {
                id: place.place_id || Math.random().toString(),
                name: place.name || 'Nearby Place',
                category: cat,
                lat: plat,
                lng: plng,
                distance: calculateDistance(lat, lng, plat, plng),
                rating: place.rating,
                userRatingsTotal: place.user_ratings_total,
                openNow: place.opening_hours?.isOpen(),
                address: place.vicinity,
              };
            });
            resolve(formatted);
          }
        );
      });
    };

    const categoriesList = Object.keys(CATEGORY_MAP) as PlaceCategory[];
    
    Promise.all(categoriesList.map((cat) => fetchCategory(cat)))
      .then((resultsList) => {
        const allPlaces = resultsList.flat();
        allPlaces.sort((a, b) => a.distance - b.distance);
        cache[cacheKey] = allPlaces;
        setPlaces(allPlaces);
      })
      .catch((err) => {
        console.error('Error fetching nearby places:', err);
        setError('Could not fetch nearby facilities.');
      })
      .finally(() => {
        setLoading(false);
      });

  }, [lat, lng, mapLoaded]);

  return { places, loading, error };
}
