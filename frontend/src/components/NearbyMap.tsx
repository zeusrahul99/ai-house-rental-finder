import { useEffect, useRef, useState } from 'react';
import { NearbyPlace } from '../types/nearby';

interface NearbyMapProps {
  lat: number;
  lng: number;
  places: NearbyPlace[];
  selectedPlace: NearbyPlace | null;
  onSelectPlace: (place: NearbyPlace) => void;
  mapLoaded: boolean;
}

export default function NearbyMap({
  lat,
  lng,
  places,
  selectedPlace,
  onSelectPlace,
  mapLoaded,
}: NearbyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [useMock, setUseMock] = useState(true);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    const googleNamespace = (window as any).google;
    if (apiKey && mapLoaded && googleNamespace?.maps) {
      setUseMock(false);
    } else {
      setUseMock(true);
    }
  }, [mapLoaded]);

  // Live Map rendering logic
  useEffect(() => {
    const googleNamespace = (window as any).google;
    if (useMock || !mapRef.current || !googleNamespace?.maps) return;

    const map = new googleNamespace.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
      mapId: 'DEMO_MAP_ID', // optional map styling ID
      disableDefaultUI: false,
      zoomControl: true,
    });

    // Custom House Marker (using SVG)
    const houseMarker = new googleNamespace.maps.Marker({
      position: { lat, lng },
      map,
      title: 'Rental House',
      icon: {
        path: 'M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z',
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        scale: 1.5,
        anchor: new googleNamespace.maps.Point(12, 12),
      },
    });

    const infowindow = new googleNamespace.maps.InfoWindow();

    // Map nearby places markers
    const markers = places.map((place) => {
      const marker = new googleNamespace.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map,
        title: place.name,
        icon: {
          path: googleNamespace.maps.SymbolPath.CIRCLE,
          fillColor: selectedPlace?.id === place.id ? '#ef4444' : '#10b981',
          fillOpacity: 0.9,
          scale: selectedPlace?.id === place.id ? 10 : 7,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
        },
      });

      marker.addListener('click', () => {
        onSelectPlace(place);
        infowindow.setContent(`
          <div style="padding: 8px; font-family: sans-serif; max-width: 200px;">
            <strong style="display:block; margin-bottom:4px; font-size:14px; color:#0f172a;">${place.name}</strong>
            <span style="font-size:12px; color:#64748b; text-transform:capitalize;">${place.category.replace('_', ' ')}</span>
            <div style="margin-top:6px; display:flex; align-items:center; gap:4px; font-size:12px;">
              <span style="color:#f59e0b;">★ ${place.rating || 'N/A'}</span>
              <span style="color:#94a3b8;">(${place.userRatingsTotal || 0})</span>
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${place.lat},${place.lng}" 
               target="_blank" 
               style="display:inline-block; margin-top:8px; font-size:12px; color:#2563eb; text-decoration:none; font-weight:600;">
               Get Directions ↗
            </a>
          </div>
        `);
        infowindow.open(map, marker);
      });

      return { id: place.id, marker };
    });

    // Handle external selection
    if (selectedPlace) {
      const targetMarker = markers.find((m) => m.id === selectedPlace.id);
      if (targetMarker) {
        map.panTo({ lat: selectedPlace.lat, lng: selectedPlace.lng });
        // Trigger click event info window
        googleNamespace.maps.event.trigger(targetMarker.marker, 'click');
      }
    }

    return () => {
      markers.forEach((m) => m.marker.setMap(null));
      houseMarker.setMap(null);
    };
  }, [useMock, lat, lng, places, selectedPlace, onSelectPlace]);

  // Render highly interactive Mock Map if API Key is not yet configured.
  if (useMock) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#f1f5f9',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #cbd5e1',
        }}
      >
        {/* Mock Map Vector Grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            opacity: 0.6,
          }}
        />

        {/* Mock Road Lines */}
        <div style={{ position: 'absolute', width: '100%', height: '4px', background: '#e2e8f0', top: '30%' }} />
        <div style={{ position: 'absolute', width: '100%', height: '4px', background: '#e2e8f0', top: '70%' }} />
        <div style={{ position: 'absolute', width: '4px', height: '100%', background: '#e2e8f0', left: '25%' }} />
        <div style={{ position: 'absolute', width: '4px', height: '100%', background: '#e2e8f0', left: '75%' }} />

        {/* Center / House Marker */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'default',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#2563eb',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(37,99,235,0.4)',
              fontSize: '18px',
              border: '2px solid #ffffff',
            }}
          >
            🏠
          </div>
          <span
            style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              marginTop: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            Rental Property
          </span>
        </div>

        {/* Places Markers */}
        {places.map((place) => {
          // Map coordinates offset to mock percentages
          // Relative to center coordinates (lat, lng)
          const offsetLatPct = 50 - (place.lat - lat) * 1200; // factor adjusted for scale
          const offsetLngPct = 50 + (place.lng - lng) * 1200;

          const isSelected = selectedPlace?.id === place.id;

          const getCategoryEmoji = (cat: string) => {
            switch (cat) {
              case 'hospitals': return '🏥';
              case 'schools': return '🏫';
              case 'colleges': return '🎓';
              case 'bus_stops': return '🚌';
              case 'railway_stations': return '🚂';
              case 'atms': return '🏧';
              case 'restaurants': return '🍽️';
              case 'grocery_stores': return '🛒';
              case 'pharmacies': return '💊';
              case 'parks': return '🌳';
              default: return '📍';
            }
          };

          return (
            <div
              key={place.id}
              onClick={() => onSelectPlace(place)}
              style={{
                position: 'absolute',
                top: `${Math.min(90, Math.max(10, offsetLatPct))}%`,
                left: `${Math.min(90, Math.max(10, offsetLngPct))}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isSelected ? 9 : 5,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: isSelected ? '34px' : '26px',
                  height: isSelected ? '34px' : '26px',
                  borderRadius: '50%',
                  background: isSelected ? '#ef4444' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  border: isSelected ? '2px solid #ffffff' : '1.5px solid #10b981',
                  fontSize: isSelected ? '18px' : '14px',
                }}
                title={place.name}
              >
                {getCategoryEmoji(place.category)}
              </div>
            </div>
          );
        })}

        {/* API Warning tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e2e8f0',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#64748b',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
          Local Mock Map Mode (API Key missing)
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '16px' }} />
  );
}
