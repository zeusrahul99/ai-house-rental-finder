import { NearbyPlace } from '../types/nearby';

interface NearbyPlaceCardProps {
  place: NearbyPlace;
  isSelected: boolean;
  onClick: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  hospitals: '🏥',
  schools: '🏫',
  colleges: '🎓',
  bus_stops: '🚌',
  railway_stations: '🚂',
  atms: '🏧',
  restaurants: '🍽️',
  grocery_stores: '🛒',
  pharmacies: '💊',
  parks: '🌳',
};

export default function NearbyPlaceCard({ place, isSelected, onClick }: NearbyPlaceCardProps) {
  const getCategoryLabel = (cat: string) => {
    return cat.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: '12px',
        border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
        background: isSelected ? '#f8fafc' : '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: isSelected ? '#eff6ff' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            flexShrink: 0,
            border: '1px solid #f1f5f9',
          }}
        >
          {CATEGORY_ICONS[place.category] || '📍'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <h4
            style={{
              margin: 0,
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {place.name}
          </h4>
          <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>
            {getCategoryLabel(place.category)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            {place.rating && (
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                ★ {place.rating.toFixed(1)}
                {place.userRatingsTotal && (
                  <span style={{ color: '#94a3b8', fontWeight: 400 }}> ({place.userRatingsTotal})</span>
                )}
              </span>
            )}
            {place.openNow !== undefined && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: place.openNow ? '#16a34a' : '#dc2626',
                }}
              >
                ● {place.openNow ? 'Open' : 'Closed'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2563eb' }}>
          {place.distance.toFixed(2)} km
        </span>
        <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
          away
        </span>
      </div>
    </div>
  );
}
