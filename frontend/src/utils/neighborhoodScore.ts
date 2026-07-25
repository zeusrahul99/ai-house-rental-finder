import { NearbyPlace, NeighborhoodScore } from '../types/nearby';

export function calculateNeighborhoodScore(places: NearbyPlace[]): NeighborhoodScore {
  const categories = {
    hospitals: places.filter((p) => p.category === 'hospitals' || p.category === 'pharmacies'),
    education: places.filter((p) => p.category === 'schools' || p.category === 'colleges'),
    healthcare: places.filter((p) => p.category === 'hospitals'),
    transportation: places.filter((p) => p.category === 'bus_stops' || p.category === 'railway_stations'),
    food: places.filter((p) => p.category === 'restaurants' || p.category === 'grocery_stores'),
    parks: places.filter((p) => p.category === 'parks'),
  };

  const getScore = (list: NearbyPlace[], maxExpected = 5): number => {
    if (list.length === 0) return 2; // base score if none found
    
    // Average rating component
    const ratings = list.map((p) => p.rating || 4.0);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    
    // Count component (more amenities is better, capped)
    const countBonus = Math.min(list.length / maxExpected, 1) * 5;
    
    // Weighted combination: 60% rating, 40% availability/count
    const rawScore = (avgRating / 5) * 5 * 0.6 + countBonus * 0.4;
    
    // Return rounded to nearest half star, minimum 2.5, max 5
    const rounded = Math.round(rawScore * 2) / 2;
    return Math.max(2.5, Math.min(rounded, 5));
  };

  const healthcareScore = getScore(categories.healthcare, 3);
  const educationScore = getScore(categories.education, 4);
  const transportationScore = getScore(categories.transportation, 3);
  const foodScore = getScore(categories.food, 5);
  
  // Safety is calculated by combination of active parks (well lit, public areas) and basic utilities presence
  const safetyBase = categories.parks.length > 0 ? getScore(categories.parks, 2) : 3.5;
  const safetyScore = Math.max(3.0, Math.min(Math.round((safetyBase * 0.7 + healthcareScore * 0.3) * 2) / 2, 5));

  return {
    safety: safetyScore,
    education: educationScore,
    healthcare: healthcareScore,
    transportation: transportationScore,
    food: foodScore,
  };
}
