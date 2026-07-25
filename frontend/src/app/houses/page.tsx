'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import ListingComparison from '../../components/ListingComparison';
import type { House } from '../../types/house';

const HOUSE_IMAGES: Record<number, string> = {
  1: '/house1.png',
  2: '/house2.png',
  3: '/house3.png',
  4: '/house4.png',
  5: '/house5.png',
  6: '/house6.png',
  7: '/house7.png',
  8: '/house8.png',
};

const HOUSE_META: Record<number, { beds: number; baths: number; sqft: number; badge: string; badgeColor: string }> = {
  1: { beds: 2, baths: 2, sqft: 950,  badge: 'Verified',    badgeColor: '#16a34a' },
  2: { beds: 1, baths: 1, sqft: 500,  badge: 'Top Pick',    badgeColor: '#9333ea' },
  3: { beds: 3, baths: 2, sqft: 1400, badge: 'Family',      badgeColor: '#0284c7' },
  4: { beds: 2, baths: 2, sqft: 1050, badge: 'Sea View',    badgeColor: '#0891b2' },
  5: { beds: 1, baths: 1, sqft: 450,  badge: 'No Brokerage',badgeColor: '#b45309' },
  6: { beds: 3, baths: 3, sqft: 2100, badge: 'Premium',     badgeColor: '#be185d' },
  7: { beds: 2, baths: 2, sqft: 1200, badge: 'Tech Hub',    badgeColor: '#2563eb' },
  8: { beds: 3, baths: 3, sqft: 1850, badge: 'Luxury',      badgeColor: '#dc2626' },
};

const LOCATION_HIERARCHY: Record<string, Record<string, string[]>> = {
  'Andhra Pradesh': {
    'Vizag': ['All Areas', 'Bheemunipatnam', 'Rushikonda', 'Madhurawada', 'MVP Colony'],
    'Nellore': ['All Areas', 'Market Center', 'Dargamitta'],
    'Guntur': ['All Areas', 'Brodipet', 'Lakshmipuram'],
  },
  'Telangana': {
    'Hyderabad': ['All Areas', 'Gachibowli', 'Hitech City', 'Madhapur', 'Kondapur'],
  },
  'Karnataka': {
    'Bengaluru': ['All Areas', 'Indiranagar', 'Whitefield', 'Koramangala', 'HSR Layout'],
  },
};

const STATES = ['All States', 'Andhra Pradesh', 'Telangana', 'Karnataka'];

const SORT_OPTIONS = [
  { value: 'default', label: 'Recommended' },
  { value: 'rent_asc', label: 'Price: Low → High' },
  { value: 'rent_desc', label: 'Price: High → Low' },
];

const QUICK_FILTERS = ['All', '1 BHK', '2 BHK', '3 BHK', 'Furnished', 'Vizag', 'Hyderabad', 'Bengaluru'];

function HousesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [input, setInput] = useState(searchParams.get('q') ?? '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') ?? 'All States');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') ?? 'All Cities');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') ?? 'All Areas');

  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState('default');
  const [favorited, setFavorited] = useState<Record<number, boolean>>({});
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const toggleCompare = (id: number) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].slice(0, 4)
    );
  };

  // Compute available cities based on selected state
  const availableCities = ['All Cities', ...(
    selectedState !== 'All States' && LOCATION_HIERARCHY[selectedState]
      ? Object.keys(LOCATION_HIERARCHY[selectedState])
      : Array.from(new Set(Object.values(LOCATION_HIERARCHY).flatMap(cMap => Object.keys(cMap))))
  )];

  // Compute available areas based on selected city/state
  const availableAreas = ['All Areas', ...(
    selectedState !== 'All States' && selectedCity !== 'All Cities' && LOCATION_HIERARCHY[selectedState]?.[selectedCity]
      ? LOCATION_HIERARCHY[selectedState][selectedCity].filter(a => a !== 'All Areas')
      : selectedCity !== 'All Cities'
        ? Array.from(new Set(
            Object.values(LOCATION_HIERARCHY)
              .flatMap(cMap => cMap[selectedCity] || [])
              .filter(a => a !== 'All Areas')
          ))
        : Array.from(new Set(
            Object.values(LOCATION_HIERARCHY)
              .flatMap(cMap => Object.values(cMap).flat())
              .filter(a => a !== 'All Areas')
          ))
  )];

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedState && selectedState !== 'All States') params.set('state', selectedState);
    if (selectedCity && selectedCity !== 'All Cities') params.set('city', selectedCity);
    if (selectedArea && selectedArea !== 'All Areas') params.set('area', selectedArea);

    const url = `/api/houses${params.toString() ? `?${params.toString()}` : ''}`;
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setHouses(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [searchTerm, selectedState, selectedCity, selectedArea]);

  const updateFiltersInUrl = (newQ: string, newState: string, newCity: string, newArea: string) => {
    const params = new URLSearchParams();
    if (newQ) params.set('q', newQ);
    if (newState && newState !== 'All States') params.set('state', newState);
    if (newCity && newCity !== 'All Cities') params.set('city', newCity);
    if (newArea && newArea !== 'All Areas') params.set('area', newArea);
    router.replace(params.toString() ? `/houses?${params.toString()}` : '/houses');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim();
    setSearchTerm(t);
    setActiveFilter('All');
    updateFiltersInUrl(t, selectedState, selectedCity, selectedArea);
  };

  const handleStateChange = (stateVal: string) => {
    setSelectedState(stateVal);
    setSelectedCity('All Cities');
    setSelectedArea('All Areas');
    updateFiltersInUrl(searchTerm, stateVal, 'All Cities', 'All Areas');
  };

  const handleCityChange = (cityVal: string) => {
    setSelectedCity(cityVal);
    setSelectedArea('All Areas');
    updateFiltersInUrl(searchTerm, selectedState, cityVal, 'All Areas');
  };

  const handleAreaChange = (areaVal: string) => {
    setSelectedArea(areaVal);
    updateFiltersInUrl(searchTerm, selectedState, selectedCity, areaVal);
  };

  const handleQuickFilter = (f: string) => {
    setActiveFilter(f);
    const q = f === 'All' ? '' : f;
    setInput(q);
    setSearchTerm(q);
    updateFiltersInUrl(q, selectedState, selectedCity, selectedArea);
  };

  const clearAllFilters = () => {
    setInput('');
    setSearchTerm('');
    setSelectedState('All States');
    setSelectedCity('All Cities');
    setSelectedArea('All Areas');
    setActiveFilter('All');
    router.replace('/houses');
  };

  const toggleFav = (id: number) => setFavorited((p) => ({ ...p, [id]: !p[id] }));

  const sorted = [...houses].sort((a, b) => {
    if (sort === 'rent_asc') return a.rent - b.rent;
    if (sort === 'rent_desc') return b.rent - a.rent;
    return 0;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 20, height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#6C63FF,#A78BFA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            }}>🏠</div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>
              Rental<span style={{ color: '#6C63FF' }}>AI</span>
            </span>
          </Link>

          {/* Inline search */}
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 0, maxWidth: 560 }} role="search">
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 8,
              background: '#f1f5f9', border: '1.5px solid #e2e8f0',
              borderRadius: '10px 0 0 10px', padding: '0 14px',
              transition: 'border-color 0.2s',
            }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#6C63FF')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <svg width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                id="listings-search-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search by keyword, house type, or amenities…"
                aria-label="Search properties"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.9rem', color: '#1e293b', padding: '12px 0' }}
              />
              {input && (
                <button type="button" onClick={() => { setInput(''); setSearchTerm(''); updateFiltersInUrl('', selectedState, selectedCity, selectedArea); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem', lineHeight: 1, padding: 0 }}>✕</button>
              )}
            </div>
            <button type="submit" id="listings-search-btn" style={{
              padding: '0 20px', background: 'linear-gradient(135deg,#6C63FF,#A78BFA)',
              color: '#fff', border: 'none', borderRadius: '0 10px 10px 0',
              fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>Search</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
            <select id="listings-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}
              aria-label="Sort properties"
              style={{
                padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8,
                background: '#fff', color: '#475569', fontSize: '0.85rem', outline: 'none', cursor: 'pointer',
              }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* View toggle */}
            <div style={{ display: 'flex', border: '1.5px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              {(['grid', 'list'] as const).map(v => (
                <button key={v} id={`view-${v}-btn`} onClick={() => setViewMode(v)}
                  aria-label={`${v} view`}
                  style={{
                    padding: '7px 12px', border: 'none', cursor: 'pointer',
                    background: viewMode === v ? '#6C63FF' : '#fff',
                    color: viewMode === v ? '#fff' : '#64748b',
                    fontSize: '0.85rem', transition: 'all 0.15s',
                  }}>
                  {v === 'grid' ? '⊞' : '☰'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Location Preference Filters (State / City / Area) ── */}
        <div style={{
          borderTop: '1px solid #f1f5f9', background: '#fafbfc',
          padding: '12px 24px', maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
            📍 Location Preferences:
          </span>

          {/* State Selector */}
          <select
            id="state-select"
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            aria-label="Filter by State"
            style={selectFilterStyle(selectedState !== 'All States')}
          >
            {STATES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>

          {/* City Selector */}
          <select
            id="city-select"
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            aria-label="Filter by City"
            style={selectFilterStyle(selectedCity !== 'All Cities')}
          >
            {availableCities.map(ct => <option key={ct} value={ct}>{ct}</option>)}
          </select>

          {/* Area Selector */}
          <select
            id="area-select"
            value={selectedArea}
            onChange={(e) => handleAreaChange(e.target.value)}
            aria-label="Filter by Area"
            style={selectFilterStyle(selectedArea !== 'All Areas')}
          >
            {availableAreas.map(ar => <option key={ar} value={ar}>{ar}</option>)}
          </select>

          {/* Active location indicator or Clear All */}
          {(selectedState !== 'All States' || selectedCity !== 'All Cities' || selectedArea !== 'All Areas' || searchTerm) && (
            <button
              onClick={clearAllFilters}
              style={{
                background: 'none', border: 'none', color: '#6C63FF',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                padding: '4px 8px', borderRadius: 6, textDecoration: 'underline',
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Quick filter pills */}
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '10px 24px', maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {QUICK_FILTERS.map(f => (
            <button key={f} id={`filter-${f.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => handleQuickFilter(f)}
              style={{
                padding: '5px 16px', borderRadius: 999, whiteSpace: 'nowrap',
                border: `1.5px solid ${activeFilter === f ? '#6C63FF' : '#e2e8f0'}`,
                background: activeFilter === f ? '#EEF2FF' : '#fff',
                color: activeFilter === f ? '#6C63FF' : '#64748b',
                fontSize: '0.82rem', fontWeight: activeFilter === f ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
              {f}
            </button>
          ))}
        </div>
      </nav>

      {sorted.length > 0 && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 24px 0' }}>
          <ListingComparison listings={sorted} selectedIds={compareIds} onToggle={toggleCompare} />
        </div>
      )}

      {/* ── Main Content ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* Page heading */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 800,
            fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: '#0f172a', marginBottom: 4,
          }}>
            {selectedArea !== 'All Areas'
              ? `Rentals in ${selectedArea}, ${selectedCity}`
              : selectedCity !== 'All Cities'
              ? `Rentals in ${selectedCity}, ${selectedState !== 'All States' ? selectedState : ''}`
              : selectedState !== 'All States'
              ? `Rentals in ${selectedState}`
              : searchTerm
              ? `Results for "${searchTerm}"`
              : 'All Rental Properties'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {loading ? 'Loading…' : `${sorted.length} propert${sorted.length !== 1 ? 'ies' : 'y'} found`}
            {selectedState !== 'All States' && ` · ${selectedState}`}
            {selectedCity !== 'All Cities' && ` › ${selectedCity}`}
            {selectedArea !== 'All Areas' && ` › ${selectedArea}`}
          </p>
        </div>

        {/* ── Loading Skeletons ── */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ height: 220, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                <div style={{ padding: 20 }}>
                  {[70,50,90].map((w,j) => (
                    <div key={j} style={{ height: 12, background: '#f1f5f9', borderRadius: 6, marginBottom: 10, width: `${w}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #fecaca' }}>
            <p style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</p>
            <h2 style={{ color: '#0f172a', marginBottom: 8 }}>Could not load listings</h2>
            <p style={{ color: '#64748b', marginBottom: 20 }}>Please try again.</p>
            <button className="btn-primary" id="retry-btn" onClick={() => setSearchTerm(searchTerm)}>Retry</button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 16 }}>
            <p style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</p>
            <h2 style={{ color: '#0f172a', marginBottom: 8 }}>No properties found in this location</h2>
            <p style={{ color: '#64748b', marginBottom: 24 }}>
              Try selecting a different State, City, or Area preference, or clear your location filters.
            </p>
            <button id="clear-search-btn" onClick={clearAllFilters}
              style={{ padding: '10px 24px', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              Reset Filters
            </button>
          </div>
        )}

        {/* ── Grid View ── */}
        {!loading && !error && sorted.length > 0 && viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }} role="list">
            {sorted.map(house => {
              const meta = HOUSE_META[house.id] ?? HOUSE_META[1];
              return (
                <Link key={house.id} href={`/houses/${house.id}`} role="listitem" id={`listing-${house.id}`}
                  aria-label={`${house.title}, ₹${house.rent.toLocaleString()} per month`}
                  style={{ textDecoration: 'none', display: 'block' }}>
                  <article style={{
                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    border: '1px solid #f1f5f9',
                    transition: 'all 0.22s ease',
                    cursor: 'pointer',
                  }}
                    onMouseOver={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
                    }}
                  >
                    {/* Photo */}
                    <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: '#f1f5f9' }}>
                      <Image
                        src={HOUSE_IMAGES[house.id] ?? '/house1.png'}
                        alt={house.title}
                        fill
                        style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        sizes="(max-width:768px) 100vw, 360px"
                        onMouseOver={(e) => ((e.target as HTMLImageElement).style.transform = 'scale(1.04)')}
                        onMouseOut={(e) => ((e.target as HTMLImageElement).style.transform = 'scale(1)')}
                      />
                      {/* Badge */}
                      <span style={{
                        position: 'absolute', top: 12, left: 12,
                        padding: '4px 12px', borderRadius: 999,
                        background: meta.badgeColor, color: '#fff',
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.03em',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.20)',
                      }}>{meta.badge}</span>
                      {/* Fav */}
                      <button
                        id={`fav-${house.id}`}
                        aria-label={favorited[house.id] ? 'Saved' : 'Save property'}
                        onClick={(e) => { e.preventDefault(); toggleFav(house.id); }}
                        style={{
                          position: 'absolute', top: 10, right: 10,
                          width: 36, height: 36, borderRadius: '50%',
                          background: '#fff', border: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', fontSize: '1rem', transition: 'transform 0.15s',
                        }}
                        onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.15)')}
                        onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
                      >
                        {favorited[house.id] ? '❤️' : '🤍'}
                      </button>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '16px 18px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.3rem', color: '#6C63FF' }}>
                          ₹{house.rent.toLocaleString()}
                          <span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#94a3b8' }}>/mo</span>
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{meta.sqft} sq.ft</span>
                      </div>

                      <h3 style={{ fontWeight: 700, fontSize: '0.97rem', color: '#0f172a', marginBottom: 5, lineHeight: 1.4 }}>
                        {house.title}
                      </h3>

                      <p style={{ fontSize: '0.83rem', color: '#64748b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#6C63FF" strokeWidth="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                        {house.location}
                      </p>

                      {/* Amenity chips */}
                      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={chipStyle}>🛏 {meta.beds} Bed</span>
                        <span style={chipStyle}>🚿 {meta.baths} Bath</span>
                        <span style={{ ...chipStyle, marginLeft: 'auto', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>✓ Verified</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); toggleCompare(house.id); }}
                        style={{
                          marginTop: 14,
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 12,
                          border: compareIds.includes(house.id) ? '1px solid #6C63FF' : '1px solid #cbd5e1',
                          background: compareIds.includes(house.id) ? '#eef2ff' : '#f8fafc',
                          color: compareIds.includes(house.id) ? '#4338CA' : '#475569',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {compareIds.includes(house.id) ? 'Remove from compare' : 'Compare this home'}
                      </button>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── List View ── */}
        {!loading && !error && sorted.length > 0 && viewMode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} role="list">
            {sorted.map(house => {
              const meta = HOUSE_META[house.id] ?? HOUSE_META[1];
              return (
                <Link key={house.id} href={`/houses/${house.id}`} role="listitem" id={`listing-list-${house.id}`}
                  style={{ textDecoration: 'none', display: 'block' }}>
                  <article style={{
                    background: '#fff', borderRadius: 14, overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9',
                    display: 'flex', transition: 'box-shadow 0.2s',
                  }}
                    onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.11)')}
                    onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)')}
                  >
                    <div style={{ position: 'relative', width: 240, flexShrink: 0, background: '#f1f5f9' }}>
                      <Image src={HOUSE_IMAGES[house.id] ?? '/house1.png'} alt={house.title}
                        fill style={{ objectFit: 'cover' }} sizes="240px" />
                      <span style={{
                        position: 'absolute', top: 10, left: 10,
                        padding: '3px 10px', borderRadius: 999,
                        background: meta.badgeColor, color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                      }}>{meta.badge}</span>
                    </div>
                    <div style={{ padding: '18px 22px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#6C63FF' }}>
                          ₹{house.rent.toLocaleString()}<span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#94a3b8' }}>/mo</span>
                        </span>
                        <button id={`fav-list-${house.id}`}
                          aria-label={favorited[house.id] ? 'Saved' : 'Save'}
                          onClick={(e) => { e.preventDefault(); toggleFav(house.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                          {favorited[house.id] ? '❤️' : '🤍'}
                        </button>
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: 5 }}>{house.title}</h3>
                      <p style={{ fontSize: '0.83rem', color: '#64748b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#6C63FF" strokeWidth="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                        {house.location}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>
                        {house.description.slice(0, 120)}…
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={chipStyle}>🛏 {meta.beds} Bed</span>
                        <span style={chipStyle}>🚿 {meta.baths} Bath</span>
                        <span style={chipStyle}>📐 {meta.sqft} sq.ft</span>
                        <span style={{ ...chipStyle, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>✓ Verified</span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function selectFilterStyle(isActive: boolean): React.CSSProperties {
  return {
    padding: '7px 14px',
    borderRadius: 8,
    border: `1.5px solid ${isActive ? '#6C63FF' : '#cbd5e1'}`,
    background: isActive ? '#EEF2FF' : '#fff',
    color: isActive ? '#6C63FF' : '#334155',
    fontWeight: isActive ? 600 : 400,
    fontSize: '0.84rem',
    outline: 'none',
    cursor: 'pointer',
  };
}

const chipStyle: React.CSSProperties = {
  padding: '4px 10px', borderRadius: 6,
  background: '#f8fafc', border: '1px solid #e2e8f0',
  fontSize: '0.76rem', color: '#475569', fontWeight: 500,
  display: 'flex', alignItems: 'center', gap: 4,
};

export default function HousesPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading listings…</p>
      </div>
    }>
      <HousesContent />
    </Suspense>
  );
}
