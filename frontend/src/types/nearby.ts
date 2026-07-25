export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  distance: number; // in km
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  address?: string;
}

export interface NeighborhoodScore {
  safety: number;
  education: number;
  healthcare: number;
  transportation: number;
  food: number;
}

export interface TravelTime {
  walking?: string;
  driving?: string;
  transit?: string;
}

export interface HouseOwner {
  name: string;
  verified: boolean;
  phone?: string;
  agency?: string;
}

export interface HouseReview {
  rating: number;
  comment: string;
  reviewer: string;
  date: string;
}

export type PlaceCategory =
  | 'hospitals'
  | 'schools'
  | 'colleges'
  | 'bus_stops'
  | 'railway_stations'
  | 'atms'
  | 'restaurants'
  | 'grocery_stores'
  | 'pharmacies'
  | 'parks';
