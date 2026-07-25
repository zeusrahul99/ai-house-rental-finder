import { TravelTime } from '../types/nearby';

interface TravelTimePanelProps {
  placeName: string;
  travelTime: TravelTime;
  userToHouse: TravelTime;
  locationPermission: 'prompt' | 'granted' | 'denied';
  requestUserLocation: () => void;
  loading: boolean;
}

export default function TravelTimePanel({
  placeName,
  travelTime,
  userToHouse,
  locationPermission,
  requestUserLocation,
  loading,
}: TravelTimePanelProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          🚗 Commute & Travel Times
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
          To selected destination: <strong style={{ color: '#0f172a' }}>{placeName}</strong>
        </span>
      </div>

      {/* House to Destination Commute */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '10px',
            padding: '10px',
            textAlign: 'center',
            border: '1px solid #f1f5f9',
          }}
        >
          <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>🚶</span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, display: 'block' }}>
            WALKING
          </span>
          <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
            {travelTime.walking || 'N/A'}
          </strong>
        </div>

        <div
          style={{
            background: '#f8fafc',
            borderRadius: '10px',
            padding: '10px',
            textAlign: 'center',
            border: '1px solid #f1f5f9',
          }}
        >
          <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>🚗</span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, display: 'block' }}>
            DRIVING
          </span>
          <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
            {travelTime.driving || 'N/A'}
          </strong>
        </div>

        <div
          style={{
            background: '#f8fafc',
            borderRadius: '10px',
            padding: '10px',
            textAlign: 'center',
            border: '1px solid #f1f5f9',
          }}
        >
          <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>🚌</span>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, display: 'block' }}>
            TRANSIT
          </span>
          <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
            {travelTime.transit || 'N/A'}
          </strong>
        </div>
      </div>

      {/* Compare commute from user location to rental house */}
      <div
        style={{
          borderTop: '1px dashed #e2e8f0',
          paddingTop: '16px',
        }}
      >
        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>
          Compare commute from your location
        </h4>

        {locationPermission === 'granted' && (
          <div style={{ display: 'flex', gap: '12px', background: '#eff6ff', padding: '12px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 600, display: 'block' }}>
                DRIVING TO HOUSE
              </span>
              <strong style={{ fontSize: '1rem', color: '#1e3a8a' }}>
                {userToHouse.driving || 'Calculating...'}
              </strong>
            </div>
            <div style={{ width: '1px', background: '#bfdbfe' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 600, display: 'block' }}>
                TRANSIT TO HOUSE
              </span>
              <strong style={{ fontSize: '1rem', color: '#1e3a8a' }}>
                {userToHouse.transit || 'Calculating...'}
              </strong>
            </div>
          </div>
        )}

        {locationPermission === 'prompt' && (
          <button
            onClick={requestUserLocation}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1.5px solid #2563eb',
              color: '#2563eb',
              background: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Locating...' : '📍 Compare commute from current location'}
          </button>
        )}

        {locationPermission === 'denied' && (
          <span style={{ fontSize: '0.8rem', color: '#dc2626', display: 'block', textAlign: 'center' }}>
            Location access denied. Enable permission to check your commute time.
          </span>
        )}
      </div>
    </div>
  );
}
