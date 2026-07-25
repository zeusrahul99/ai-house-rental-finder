'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/* ─── Location Hierarchy Data ─── */
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

/* ─── Sample data ─── */
const SAMPLE_LISTINGS = [
  {
    id: 1,
    title: '2 BHK Modern Apartment',
    location: 'Bheemunipatnam, Vizag',
    rent: 11000,
    tags: ['2 BHK', 'Furnished', 'Wi-Fi'],
    image: '/house1.png',
    badge: 'Available Now',
  },
  {
    id: 3,
    title: 'Spacious 3 BHK Villa',
    location: 'Rushikonda, Vizag',
    rent: 13500,
    tags: ['3 BHK', 'Fully Furnished', 'Parking'],
    image: '/house3.png',
    badge: 'Premium',
  },
  {
    id: 4,
    title: '2 BHK Sea View Flat',
    location: 'Madhurawada, Vizag',
    rent: 14500,
    tags: ['2 BHK', 'Sea View', 'AC'],
    image: '/house4.png',
    badge: 'Hot Property',
  },
];

const FEATURES = [
  {
    icon: '📍',
    title: 'State, City & Area Filters',
    desc: 'Filter properties precisely by State (Andhra Pradesh, Telangana, Karnataka), City, and specific Locality/Area preferences.',
  },
  {
    icon: '⚡',
    title: 'Real-time Listings',
    desc: 'Browse fresh, up-to-date rental listings synced directly from verified landlords and property managers.',
  },
  {
    icon: '🔒',
    title: 'Verified Properties',
    desc: 'Every listing goes through a verification process to ensure authenticity, accurate pricing, and reliable contact.',
  },
];

const HOW_IT_WORKS = [
  { num: '01', icon: '📍', title: 'Set Location', desc: 'Narrow down your search by selecting your target State, City, and Locality preferences.' },
  { num: '02', icon: '🏠', title: 'Explore & Compare', desc: 'Dive into detailed listings with photos, amenities, neighborhood scores, and AI insights.' },
  { num: '03', icon: '🤝', title: 'Connect & Move In', desc: 'Contact verified landlords directly or schedule a visit — all from within the app, with zero middlemen.' },
];

const TESTIMONIALS = [
  {
    stars: 5,
    text: '"I found my dream apartment near Raghu Engineering College in under 10 minutes by filtering for Vizag and Bheemunipatnam area. Brilliant application!"',
    name: 'Priya Sharma',
    role: 'Software Engineer, Vizag',
    image: '/customer-priya.png',
  },
  {
    stars: 5,
    text: '"As a landlord, this platform brings me genuine inquiries. The location filter for specific areas helps connect with real tenants looking nearby."',
    name: 'Ramesh Babu',
    role: 'Property Owner, Bheemunipatnam',
    image: '/customer-ramesh.png',
  },
];

const SEARCH_SUGGESTIONS = [
  'Vizag • Bheemunipatnam',
  'Hyderabad • Gachibowli',
  'Bengaluru • Indiranagar',
];

export default function Home() {
  const [searchInput, setSearchInput] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [favorited, setFavorited] = useState<Record<number, boolean>>({});

  const availableCities = ['All Cities', ...(
    selectedState !== 'All States' && LOCATION_HIERARCHY[selectedState]
      ? Object.keys(LOCATION_HIERARCHY[selectedState])
      : Array.from(new Set(Object.values(LOCATION_HIERARCHY).flatMap(cMap => Object.keys(cMap))))
  )];

  const availableAreas = ['All Areas', ...(
    selectedState !== 'All States' && selectedCity !== 'All Cities' && LOCATION_HIERARCHY[selectedState]?.[selectedCity]
      ? LOCATION_HIERARCHY[selectedState][selectedCity].filter(a => a !== 'All Areas')
      : selectedCity !== 'All Cities'
        ? Array.from(new Set(Object.values(LOCATION_HIERARCHY).flatMap(cMap => cMap[selectedCity] || []).filter(a => a !== 'All Areas')))
        : Array.from(new Set(Object.values(LOCATION_HIERARCHY).flatMap(cMap => Object.values(cMap).flat()).filter(a => a !== 'All Areas')))
  )];

  const handleStateChange = (st: string) => {
    setSelectedState(st); setSelectedCity('All Cities'); setSelectedArea('All Areas');
  };
  const handleCityChange = (ct: string) => {
    setSelectedCity(ct); setSelectedArea('All Areas');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set('q', searchInput.trim());
    if (selectedState !== 'All States') params.set('state', selectedState);
    if (selectedCity !== 'All Cities') params.set('city', selectedCity);
    if (selectedArea !== 'All Areas') params.set('area', selectedArea);
    window.location.href = `/houses${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const handleChipClick = (chip: string) => {
    if (chip.includes('•')) {
      const parts = chip.split('•').map(p => p.trim());
      if (parts.length === 2) {
        setSelectedCity(parts[0]); setSelectedArea(parts[1]);
        window.location.href = `/houses?city=${encodeURIComponent(parts[0])}&area=${encodeURIComponent(parts[1])}`;
        return;
      }
    }
    setSearchInput(chip);
  };

  const toggleFav = (id: number) => {
    setFavorited((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <nav className="navbar" role="navigation">
        <a href="#" className="navbar-logo">
          <div className="navbar-logo-icon">🏠</div>
          <span className="navbar-logo-text">Rental<span>AI</span></span>
        </a>
        <ul className="navbar-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#listings">Listings</a></li>
          <li><a href="#testimonials">Reviews</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
        </ul>
        <div className="navbar-cta">
          <Link href="/houses" className="btn-secondary">Browse Houses</Link>
          <Link href="/houses" className="btn-primary">Search Now</Link>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="hero" style={{ 
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95)), url(/house6.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Perfect Home <br /><span className="gradient-text">without the hassle.</span>
          </h1>
          <p className="hero-subtitle">
            Browse verified listings tailored to your exact State, City, and Area preferences. Your next rental is just a search away.
          </p>

          <div className="hero-search">
            <form onSubmit={handleSearch}>
              <div className="search-filters">
                <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={selectedCity} onChange={(e) => handleCityChange(e.target.value)}>
                  {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                  {availableAreas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="search-input-row">
                <span className="hero-search-icon">🔍</span>
                <input
                  type="text"
                  className="hero-search-input"
                  placeholder="Keyword (e.g. '2 BHK furnished', 'AC')"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit" className="hero-search-btn">Find Homes</button>
              </div>
            </form>
          </div>
          <div className="search-tags">
            {SEARCH_SUGGESTIONS.map(s => (
              <button key={s} className="search-tag" onClick={() => handleChipClick(s)}>{s}</button>
            ))}
          </div>

          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-value">5,000+</span>
              <span className="stat-label">Verified Listings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">Zero</span>
              <span className="stat-label">Hidden Fees</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">3.5M+</span>
              <span className="stat-label">Happy Renters</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES */}
      <section className="section" id="features">
        <div style={{textAlign: 'center'}}>
          <div className="section-tag">Why Choose Us</div>
          <h2 className="section-title">The Better Way to Rent</h2>
          <p className="section-subtitle" style={{margin: '0 auto 48px'}}>
            We provide a transparent, easy-to-use platform that connects you with the best verified rentals in your area.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <article key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 3. LISTINGS */}
      <section className="section" id="listings" style={{background: '#f8fafc'}}>
        <div style={{textAlign: 'center'}}>
          <div className="section-tag">Featured Homes</div>
          <h2 className="section-title">Top Hand-Picked Rentals</h2>
          <p className="section-subtitle" style={{margin: '0 auto 48px'}}>
            Check out our most popular listings available for immediate move-in.
          </p>
        </div>
        <div className="listings-grid">
          {SAMPLE_LISTINGS.map((house) => (
            <Link key={house.id} href={`/houses/${house.id}`} className="listing-card">
              <div className="listing-img-container">
                <Image src={house.image} alt={house.title} fill style={{ objectFit: 'cover' }} />
                <div className="listing-badge">{house.badge}</div>
                <button
                  className="listing-fav"
                  onClick={(e) => { e.preventDefault(); toggleFav(house.id); }}
                >
                  {favorited[house.id] ? '❤️' : '🤍'}
                </button>
              </div>
              <div className="listing-body">
                <div className="listing-price">₹{house.rent.toLocaleString()}<span> / month</span></div>
                <h3 className="listing-title">{house.title}</h3>
                <p className="listing-location">📍 {house.location}</p>
                <div className="listing-tags">
                  {house.tags.map((t) => <span key={t} className="listing-tag">{t}</span>)}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/houses" className="btn-primary">View All Listings →</Link>
        </div>
      </section>

      {/* 4. REVIEWS */}
      <section className="testimonials-section" id="testimonials">
        <div style={{textAlign: 'center'}}>
          <div className="section-tag">Testimonials</div>
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-subtitle" style={{margin: '0 auto 48px'}}>
            Thousands of tenants and landlords trust RentalAI.
          </p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <article key={i} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: t.stars }).map((_, s) => <span key={s}>⭐</span>)}
              </div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{overflow: 'hidden', padding: 0}}>
                  <Image src={t.image} alt={t.name} width={48} height={48} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                </div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="hiw-section" id="how-it-works">
        <div className="hiw-inner">
          <div className="section-tag">Process</div>
          <h2 className="section-title">Rent in 3 Simple Steps</h2>
          <p className="section-subtitle" style={{margin: '0 auto 48px'}}>
            Our streamlined process makes finding and securing your next rental easier than ever before.
          </p>
          <div className="hiw-steps">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="hiw-step">
                <div className="hiw-step-num">{step.num}</div>
                <span className="hiw-step-icon">{step.icon}</span>
                <h3 className="hiw-step-title">{step.title}</h3>
                <p className="hiw-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card">
          <div className="section-tag" style={{background: 'rgba(255,255,255,0.2)', color: 'white'}}>Get Started</div>
          <h2 className="cta-title">Ready to Find Your <span className="gradient-text">Perfect Rental?</span></h2>
          <p className="cta-subtitle">Start your search now — it's completely free.</p>
          <div className="cta-actions">
            <button className="btn-primary" onClick={() => window.scrollTo(0, 0)}>Search Homes</button>
            <Link href="/houses" className="btn-secondary">Browse Listings</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        © 2026 RentalAI. All rights reserved.
      </footer>
    </>
  );
}
