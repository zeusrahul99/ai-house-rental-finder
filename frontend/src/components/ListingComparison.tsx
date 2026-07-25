'use client';

import type { House } from '../types/house';

interface ListingComparisonProps {
  listings: House[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export default function ListingComparison({ listings, selectedIds, onToggle }: ListingComparisonProps) {
  const selectedListings = listings.filter((listing) => selectedIds.includes(listing.id));

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Compare Listings</h3>
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{selectedListings.length} selected</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {listings.slice(0, 4).map((listing) => (
          <label key={listing.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', color: '#475569' }}>
            <input
              type="checkbox"
              checked={selectedIds.includes(listing.id)}
              onChange={() => onToggle(listing.id)}
              style={{ width: 16, height: 16 }}
            />
            <span>{listing.title}</span>
          </label>
        ))}
      </div>

      {selectedListings.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 8px', color: '#64748b', fontSize: '0.82rem' }}>Feature</th>
                {selectedListings.map((listing) => (
                  <th key={listing.id} style={{ padding: '12px 8px', color: '#0f172a', fontSize: '0.82rem' }}>{listing.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['rent', 'location', 'description'].map((feature) => (
                <tr key={feature} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{feature === 'rent' ? 'Rent' : feature === 'location' ? 'Location' : 'Details'}</td>
                  {selectedListings.map((listing) => (
                    <td key={`${listing.id}-${feature}`} style={{ padding: '12px 8px', color: '#334155', fontSize: '0.85rem' }}>
                      {feature === 'rent' ? `₹${listing.rent.toLocaleString()}` : feature === 'location' ? listing.location : listing.description}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Select up to 4 properties to compare side by side.</p>
      )}
    </div>
  );
}
