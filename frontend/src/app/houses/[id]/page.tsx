'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import NearbyFacilities from '../../../components/NearbyFacilities';
import type { House } from '../../../types/house';

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

const DETAIL_ICONS: Record<string, string> = {
  '1 BHK': '🛏️',
  '2 BHK': '🛏️',
  '3 BHK': '🛏️',
  furnished: '🪑',
  Furnished: '🪑',
  parking: '🅿️',
  Parking: '🅿️',
  lift: '🛗',
  security: '🔒',
  garden: '🌿',
  AC: '❄️',
  'Wi-Fi': '📶',
};

export default function HouseDetail() {
  const params = useParams();
  const idStr = params?.id as string;
  const houseId = parseInt(idStr, 10);

  const [house, setHouse] = useState<House | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (!idStr) return;
    setLoading(true);
    fetch(`/api/houses/${idStr}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data: House) => {
        setHouse(data);
        const imgSrc = HOUSE_IMAGES[data.id] || HOUSE_IMAGES[1];
        setActiveImage(imgSrc);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [idStr]);

  const meta = HOUSE_META[houseId] || HOUSE_META[1];
  const mainPhoto = activeImage || HOUSE_IMAGES[houseId] || '/house1.png';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Navbar */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          height: 64,
          background: '#ffffff',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          borderBottom: '1px solid #e2e8f0',
          gap: 16,
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            color: '#1e293b',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: '1.1rem',
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg,#6C63FF,#A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
          }}>🏠</div>
          Rental<span style={{ color: '#6C63FF' }}>AI</span>
        </Link>
        <span style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>›</span>
        <Link href="/houses" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
          All Listings
        </Link>
        {house && (
          <>
            <span style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>›</span>
            <span style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
              {house.title}
            </span>
          </>
        )}
      </nav>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '96px 24px 80px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{
              width: 48, height: 48,
              border: '3px solid #e2e8f0',
              borderTopColor: '#6C63FF',
              borderRadius: '50%',
              animation: 'spin-slow 0.8s linear infinite',
              margin: '0 auto 16px',
            }} />
            <p style={{ color: '#64748b' }}>Loading property details…</p>
          </div>
        )}

        {error && (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            background: '#fff',
            border: '1px solid #fecaca',
            borderRadius: 20,
          }}>
            <p style={{ fontSize: '2.5rem', marginBottom: 16 }}>😕</p>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", marginBottom: 12, color: '#0f172a' }}>Property not found</h2>
            <p style={{ color: '#64748b', marginBottom: 24 }}>
              This listing may have been removed or the ID is invalid.
            </p>
            <Link href="/houses" className="btn-primary">← Browse All Listings</Link>
          </div>
        )}

        {house && (
          <div>
            {/* Real Property Image Container */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: 440,
              borderRadius: 24,
              overflow: 'hidden',
              background: '#e2e8f0',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              marginBottom: 36,
            }}>
              <Image
                src={mainPhoto}
                alt={house.title}
                fill
                priority
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 1000px) 100vw, 1000px"
              />
              <span style={{
                position: 'absolute',
                top: 20, left: 20,
                padding: '6px 16px', borderRadius: 999,
                background: meta.badgeColor, color: '#fff',
                fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.03em',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              }}>{meta.badge}</span>
            </div>

            {/* Main Content Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>

              {/* Left Column: Title, Description, Amenities */}
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h1 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: 10,
                    lineHeight: 1.2,
                  }}>{house.title}</h1>

                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(house.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#4338CA', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 6, 
                      fontSize: '0.95rem',
                      textDecoration: 'none',
                      background: '#EEF2FF',
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: '1px solid #C7D2FE',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#E0E7FF';
                      e.currentTarget.style.borderColor = '#A5B4FC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#EEF2FF';
                      e.currentTarget.style.borderColor = '#C7D2FE';
                    }}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#4338CA" strokeWidth="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                    {house.location} <span style={{fontSize: '0.8rem'}}>↗</span>
                  </a>
                </div>

                {/* Property Specs bar */}
                <div style={{
                  display: 'flex', gap: 20, padding: '16px 20px',
                  background: '#ffffff', borderRadius: 16,
                  border: '1px solid #e2e8f0', marginBottom: 28,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>BEDROOMS</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>🛏️ {meta.beds} Bed</span>
                  </div>
                  <div style={{ width: 1, background: '#e2e8f0' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>BATHROOMS</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>🚿 {meta.baths} Bath</span>
                  </div>
                  <div style={{ width: 1, background: '#e2e8f0' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>AREA</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>📐 {meta.sqft} sq.ft</span>
                  </div>
                </div>

                {/* Description Box */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: '24px 28px',
                  marginBottom: 28,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: '#0f172a',
                    marginBottom: 12,
                  }}>About this property</h2>
                  <p style={{
                    color: '#475569',
                    lineHeight: 1.8,
                    fontSize: '0.95rem',
                  }}>{house.description}</p>
                </div>

                {/* Features & Highlights */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                    Key Features & Amenities
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {Object.entries(DETAIL_ICONS).map(([kw, icon]) =>
                      house.description.includes(kw) || house.title.includes(kw) ? (
                        <span
                          key={kw}
                          style={{
                            padding: '8px 18px',
                            background: '#EEF2FF',
                            border: '1.5px solid #C7D2FE',
                            borderRadius: 999,
                            fontSize: '0.85rem',
                            color: '#4338CA',
                            fontWeight: 600,
                          }}
                        >
                          {icon} {kw}
                        </span>
                      ) : null
                    )}
                    <span style={{ padding: '8px 18px', background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 999, fontSize: '0.85rem', color: '#15803D', fontWeight: 600 }}>
                      ✓ Verified Listing
                    </span>
                    <span style={{ padding: '8px 18px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 999, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                      ⚡ 24/7 Water & Power
                    </span>
                  </div>
                </div>

                {/* Removed AI listing insights for classic layout */}
              </div>

              {/* Right Column: Pricing & Contact Card */}
              <div>
                <div style={{
                  position: 'sticky', top: 88,
                  background: '#ffffff', border: '1px solid #e2e8f0',
                  borderRadius: 20, padding: 24,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                  <div style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    color: '#6C63FF',
                    marginBottom: 4,
                  }}>
                    ₹{house.rent.toLocaleString()}
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', fontWeight: 400, color: '#94a3b8' }}> / month</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, marginBottom: 18 }}>
                    ● No brokerage fee required
                  </p>

                  <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
                    <div style={{ background: '#f8fafc', borderRadius: 16, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Owner</p>
                      <p style={{ margin: '6px 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                        {house.owner?.name ?? 'Verified landlord'}
                      </p>
                      <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: house.owner?.verified ? '#16a34a' : '#f97316' }}>
                        {house.owner?.verified ? 'Verified owner' : 'Owner verification pending'}
                      </p>
                    </div>
                  </div>

                  <button
                    id="contact-landlord-btn"
                    type="button"
                    style={{
                      width: '100%', padding: '14px 20px',
                      background: 'linear-gradient(135deg, #6C63FF, #A78BFA)',
                      color: '#ffffff', border: 'none', borderRadius: 12,
                      fontFamily: "'Inter', sans-serif", fontWeight: 700,
                      fontSize: '0.95rem', cursor: 'pointer', margin: '18px 0 12px',
                      boxShadow: '0 4px 16px rgba(108,99,255,0.35)',
                      transition: 'all 0.2s',
                    }}
                  >
                    📞 Contact Landlord
                  </button>

                  <Link
                    href="/houses"
                    style={{
                      display: 'block', textAlign: 'center', width: '100%',
                      padding: '12px 20px', background: '#f8fafc',
                      color: '#475569', border: '1px solid #e2e8f0',
                      borderRadius: 12, fontFamily: "'Inter', sans-serif",
                      fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
                    }}
                  >
                    ← Back to All Listings
                  </Link>
                </div>
              </div>
            </div>

            {/* Nearby Facilities Section */}
            <NearbyFacilities location={house.location} houseId={house.id} />
          </div>
        )}
      </main>
    </div>
  );
}
