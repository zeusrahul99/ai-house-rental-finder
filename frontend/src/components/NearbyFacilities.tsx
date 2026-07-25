import { useState, useEffect } from 'react';
import { NearbyPlace, PlaceCategory } from '../types/nearby';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { useTravelTime } from '../hooks/useTravelTime';
import { geocodeAddress } from '../utils/geocode';
import { calculateNeighborhoodScore } from '../utils/neighborhoodScore';
import NearbyMap from './NearbyMap';
import NearbyFilters from './NearbyFilters';
import NearbyPlaceCard from './NearbyPlaceCard';
import NeighborhoodScore from './NeighborhoodScore';
import TravelTimePanel from './TravelTimePanel';

interface NearbyFacilitiesProps {
  location: string;
  houseId: number;
}

export default function NearbyFacilities({ location, houseId }: NearbyFacilitiesProps) {
  const mapLoaded = useGoogleMaps();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'all'>('all');
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Geocode address on mount
  useEffect(() => {
    geocodeAddress(location, houseId).then((res) => {
      setCoords(res);
    });
  }, [location, houseId]);

  // Fetch nearby places
  const { places, loading, error } = useNearbyPlaces(
    coords?.lat || 0,
    coords?.lng || 0,
    mapLoaded
  );

  // Filter places based on selected category & keyword search
  const filteredPlaces = places.filter((place) => {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesKeyword =
      !searchKeyword.trim() ||
      place.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      place.category.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  // Automatically select the first place in the filtered list if none is selected
  useEffect(() => {
    if (filteredPlaces.length > 0) {
      // Find current selected in new filtered list
      const stillExists = filteredPlaces.find((p) => p.id === selectedPlace?.id);
      if (!stillExists) {
        setSelectedPlace(filteredPlaces[0]);
      }
    } else {
      setSelectedPlace(null);
    }
  }, [filteredPlaces, selectedPlace]);

  // Commute times hooks
  const {
    houseToDest,
    userToHouse,
    locationPermission,
    requestUserLocation,
    loading: loadingCommute,
  } = useTravelTime(
    coords?.lat || 0,
    coords?.lng || 0,
    selectedPlace?.lat || null,
    selectedPlace?.lng || null,
    mapLoaded
  );

  // Compute neighborhood score
  const neighborhoodScore = calculateNeighborhoodScore(places);

  if (!coords) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
        Locating property coordinates...
      </div>
    );
  }

  return (
    <div style={{ marginTop: '48px', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: '1.6rem',
            color: '#0f172a',
            marginBottom: '6px',
          }}
        >
          📍 Nearby Facilities & Neighborhood Score
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Explore key amenities, commute durations, and neighborhood ratings within a 2 km radius.
        </p>
      </div>

      {/* Filter pills & search row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <NearbyFilters selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        </div>
        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            placeholder="🔍 Search places..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        {/* Left column: Map & Commute Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Map Container */}
          <div style={{ width: '100%', height: '360px', borderRadius: '16px', overflow: 'hidden' }}>
            <NearbyMap
              lat={coords.lat}
              lng={coords.lng}
              places={filteredPlaces}
              selectedPlace={selectedPlace}
              onSelectPlace={setSelectedPlace}
              mapLoaded={mapLoaded}
            />
          </div>

          {/* Commute Duration panel */}
          {selectedPlace && (
            <TravelTimePanel
              placeName={selectedPlace.name}
              travelTime={houseToDest}
              userToHouse={userToHouse}
              locationPermission={locationPermission}
              requestUserLocation={requestUserLocation}
              loading={loadingCommute}
            />
          )}
        </div>

        {/* Right column: Neighborhood Score & List Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Neighborhood Score Card */}
          <NeighborhoodScore score={neighborhoodScore} />

          {/* List of nearby facilities */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0f172a',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '10px',
              }}
            >
              🏢 Amenities List ({filteredPlaces.length})
            </h3>

            {loading ? (
              // Loading skeletons
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: '66px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      animation: 'pulse-glow 1.5s infinite ease-in-out',
                      border: '1px solid #f1f5f9',
                    }}
                  />
                ))}
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#dc2626', fontSize: '0.9rem' }}>
                ⚠️ {error}
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                No nearby places found matching your selection.
              </div>
            ) : (
              <div style={{ maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                {filteredPlaces.map((place) => (
                  <NearbyPlaceCard
                    key={place.id}
                    place={place}
                    isSelected={selectedPlace?.id === place.id}
                    onClick={() => setSelectedPlace(place)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
