import { useState, useEffect } from 'react';
import { TravelTime } from '../types/nearby';

export function useTravelTime(
  houseLat: number,
  houseLng: number,
  destLat: number | null,
  destLng: number | null,
  mapLoaded: boolean
) {
  const [houseToDest, setHouseToDest] = useState<TravelTime>({});
  const [userToHouse, setUserToHouse] = useState<TravelTime>({});
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  // Request user current location
  const requestUserLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationPermission('granted');
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location', error);
        setLocationPermission('denied');
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    if (!houseLat || !houseLng || destLat === null || destLng === null) {
      setHouseToDest({});
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    const googleNamespace = (window as any).google;

    // Use Mock calculations if API key or Map is not loaded
    if (!apiKey || !mapLoaded || typeof window === 'undefined' || !googleNamespace?.maps?.DirectionsService) {
      // Calculate realistic mock speeds
      // Distance is approximately the hypotenuse
      const dLat = destLat - houseLat;
      const dLng = destLng - houseLng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng) * 111; // rough km conversion
      
      const walkingMin = Math.round((dist / 5) * 60); // 5 km/h
      const drivingMin = Math.max(1, Math.round((dist / 35) * 60)); // 35 km/h
      const transitMin = Math.max(2, Math.round((dist / 15) * 60)); // 15 km/h
      
      setHouseToDest({
        walking: walkingMin > 60 ? `${Math.floor(walkingMin / 60)}h ${walkingMin % 60}m` : `${walkingMin} mins`,
        driving: `${drivingMin} mins`,
        transit: `${transitMin} mins`,
      });
      return;
    }

    // Google Directions service calculation
    setLoading(true);
    const service = new googleNamespace.maps.DirectionsService();

    const getTravelDuration = (mode: any): Promise<string> => {
      return new Promise((resolve) => {
        service.route(
          {
            origin: { lat: houseLat, lng: houseLng },
            destination: { lat: destLat, lng: destLng },
            travelMode: mode,
          },
          (result: any, status: any) => {
            if (status === googleNamespace.maps.DirectionsStatus.OK && result && result.routes[0]?.legs[0]) {
              resolve(result.routes[0].legs[0].duration?.text || '');
            } else {
              resolve('');
            }
          }
        );
      });
    };

    Promise.all([
      getTravelDuration(googleNamespace.maps.TravelMode.WALKING),
      getTravelDuration(googleNamespace.maps.TravelMode.DRIVING),
      getTravelDuration(googleNamespace.maps.TravelMode.TRANSIT),
    ]).then(([walking, driving, transit]) => {
      setHouseToDest({
        walking: walking || undefined,
        driving: driving || undefined,
        transit: transit || undefined,
      });
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

  }, [houseLat, houseLng, destLat, destLng, mapLoaded]);

  // Compute travel time from user to house if userLocation is active
  useEffect(() => {
    if (!userLocation || !houseLat || !houseLng) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

    const googleNamespace = (window as any).google;
    if (!apiKey || !mapLoaded || typeof window === 'undefined' || !googleNamespace?.maps?.DirectionsService) {
      // Mock calculation from user's current location to the house
      const dLat = userLocation.lat - houseLat;
      const dLng = userLocation.lng - houseLng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
      
      const drivingMin = Math.max(1, Math.round((dist / 40) * 60));
      const transitMin = Math.max(2, Math.round((dist / 20) * 60));

      setUserToHouse({
        driving: drivingMin > 60 ? `${Math.floor(drivingMin / 60)}h ${drivingMin % 60}m` : `${drivingMin} mins`,
        transit: transitMin > 60 ? `${Math.floor(transitMin / 60)}h ${transitMin % 60}m` : `${transitMin} mins`,
      });
      return;
    }

    const service = new googleNamespace.maps.DirectionsService();

    const getTravelDuration = (mode: any): Promise<string> => {
      return new Promise((resolve) => {
        service.route(
          {
            origin: { lat: userLocation.lat, lng: userLocation.lng },
            destination: { lat: houseLat, lng: houseLng },
            travelMode: mode,
          },
          (result: any, status: any) => {
            if (status === googleNamespace.maps.DirectionsStatus.OK && result && result.routes[0]?.legs[0]) {
              resolve(result.routes[0].legs[0].duration?.text || '');
            } else {
              resolve('');
            }
          }
        );
      });
    };

    Promise.all([
      getTravelDuration(googleNamespace.maps.TravelMode.DRIVING),
      getTravelDuration(googleNamespace.maps.TravelMode.TRANSIT),
    ]).then(([driving, transit]) => {
      setUserToHouse({
        driving: driving || undefined,
        transit: transit || undefined,
      });
    });

  }, [userLocation, houseLat, houseLng, mapLoaded]);

  return {
    houseToDest,
    userToHouse,
    loading,
    locationPermission,
    requestUserLocation,
  };
}
