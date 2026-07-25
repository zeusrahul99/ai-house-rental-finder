import { NeighborhoodScore as ScoreType } from '../types/nearby';

interface NeighborhoodScoreProps {
  score: ScoreType;
}

export default function NeighborhoodScore({ score }: NeighborhoodScoreProps) {
  const categories = [
    { key: 'safety', label: 'Safety', val: score.safety, color: '#16a34a' },
    { key: 'education', label: 'Education', val: score.education, color: '#9333ea' },
    { key: 'healthcare', label: 'Healthcare', val: score.healthcare, color: '#e11d48' },
    { key: 'transportation', label: 'Transportation', val: score.transportation, color: '#2563eb' },
    { key: 'food', label: 'Food & Dining', val: score.food, color: '#d97706' },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} style={{ color: '#f59e0b', fontSize: '1rem' }}>★</span>);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <span
            key={i}
            style={{
              position: 'relative',
              display: 'inline-block',
              color: '#cbd5e1',
              fontSize: '1rem',
            }}
          >
            <span style={{ position: 'absolute', overflow: 'hidden', width: '50%', color: '#f59e0b' }}>★</span>
            ★
          </span>
        );
      } else {
        stars.push(<span key={i} style={{ color: '#cbd5e1', fontSize: '1rem' }}>★</span>);
      }
    }
    return stars;
  };

  const getOverallScore = () => {
    const sum = score.safety + score.education + score.healthcare + score.transportation + score.food;
    return (sum / 5).toFixed(1);
  };

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '12px',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          📍 Neighborhood Score
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>
            {getOverallScore()}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>/ 5</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {categories.map((cat) => (
          <div
            key={cat.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.88rem',
            }}
          >
            <span style={{ color: '#475569', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: cat.color }} />
              {cat.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '1px' }}>{renderStars(cat.val)}</div>
              <span style={{ width: '22px', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>
                {cat.val.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
