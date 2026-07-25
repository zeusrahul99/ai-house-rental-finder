import { PlaceCategory } from '../types/nearby';

interface NearbyFiltersProps {
  selectedCategory: PlaceCategory | 'all';
  onSelectCategory: (category: PlaceCategory | 'all') => void;
}

const CATEGORIES: Array<{ id: PlaceCategory | 'all'; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: '📍' },
  { id: 'hospitals', label: 'Hospitals', icon: '🏥' },
  { id: 'schools', label: 'Schools', icon: '🏫' },
  { id: 'colleges', label: 'Colleges', icon: '🎓' },
  { id: 'bus_stops', label: 'Bus Stops', icon: '🚌' },
  { id: 'railway_stations', label: 'Railway', icon: '🚂' },
  { id: 'atms', label: 'ATMs', icon: '🏧' },
  { id: 'restaurants', label: 'Restaurants', icon: '🍽️' },
  { id: 'grocery_stores', label: 'Grocery', icon: '🛒' },
  { id: 'pharmacies', label: 'Pharmacies', icon: '💊' },
  { id: 'parks', label: 'Parks', icon: '🌳' },
];

export default function NearbyFilters({ selectedCategory, onSelectCategory }: NearbyFiltersProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '20px',
              border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: isActive ? '#eff6ff' : '#ffffff',
              color: isActive ? '#2563eb' : '#475569',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
