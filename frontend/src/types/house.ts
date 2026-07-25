import { HouseOwner, HouseReview } from './nearby';

export interface House {
  id: number;
  title: string;
  state: string;
  city: string;
  area: string;
  location: string;
  rent: number;
  description: string;
  owner?: HouseOwner;
  reviews?: HouseReview[];
}
