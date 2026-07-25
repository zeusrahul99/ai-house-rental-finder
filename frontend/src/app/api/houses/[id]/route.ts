import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const HOUSES: Record<number, { id: number; title: string; location: string; rent: number; description: string; owner?: { name: string; verified: boolean; phone?: string; agency?: string}; reviews?: { rating: number; comment: string; reviewer: string; date: string }[] }> = {
  1: {
    id: 1,
    title: '2 BHK near Raghu Engineering College',
    location: 'Bheemunipatnam, Vizag, Andhra Pradesh',
    rent: 11000,
    description: 'Well-ventilated 2 BHK with attached bathroom and parking. Close to Raghu Engineering College.',
    owner: { name: 'Priya Reddy', verified: true, phone: '+91 98765 43210', agency: 'Vizag Estates' },
    reviews: [
      { rating: 4.5, comment: 'Spacious rooms and quiet neighborhood.', reviewer: 'Anjali', date: '2024-03-21' },
      { rating: 4.0, comment: 'Great location close to campus.', reviewer: 'Rohan', date: '2024-04-10' },
    ],
  },
  2: {
    id: 2,
    title: '1 BHK Studio close to market',
    location: 'Nellore, Andhra Pradesh',
    rent: 9000,
    description: 'Compact 1 BHK with water supply and local transport access. Ideal for singles or couples.',
    owner: { name: 'Suresh Kumar', verified: true, phone: '+91 91234 56789', agency: 'CityStay Rentals' },
    reviews: [
      { rating: 3.8, comment: 'Affordable and convenient, though slightly small.', reviewer: 'Meena', date: '2024-02-18' },
      { rating: 4.1, comment: 'Very close to the market and bus station.', reviewer: 'Vikram', date: '2024-03-05' },
    ],
  },
  3: {
    id: 3,
    title: '3 BHK family apartment',
    location: 'Guntur, Andhra Pradesh',
    rent: 15000,
    description: 'Family-friendly apartment with lift and 24/7 security. Spacious rooms and modular kitchen.',
    owner: { name: 'Deepa Sharma', verified: false, phone: '+91 99887 76655', agency: 'Family Homes' },
    reviews: [
      { rating: 4.3, comment: 'Safe area with excellent facilities.', reviewer: 'Harsha', date: '2024-01-12' },
      { rating: 4.0, comment: 'Perfect for families and very well maintained.', reviewer: 'Sana', date: '2024-05-09' },
    ],
  },
  4: {
    id: 4,
    title: '2 BHK furnished flat',
    location: 'Rushikonda, Vizag, Andhra Pradesh',
    rent: 13500,
    description: 'Fully furnished 2 BHK with AC, Wi-Fi, and sea view. Walking distance to IT corridor.',
    owner: { name: 'Ravi Naidu', verified: true, phone: '+91 95672 33445', agency: 'Coastal Homes' },
    reviews: [
      { rating: 4.7, comment: 'Amazing sea view and premium furnishings.', reviewer: 'Neha', date: '2024-04-18' },
      { rating: 4.6, comment: 'Great for working professionals and couples.', reviewer: 'Arjun', date: '2024-05-02' },
    ],
  },
  5: {
    id: 5,
    title: '1 BHK bachelor flat',
    location: 'Madhurawada, Vizag, Andhra Pradesh',
    rent: 6500,
    description: 'Affordable 1 BHK for bachelors. Nearby bus stop and grocery stores. No brokerage.',
    owner: { name: 'Kavitha Rao', verified: true, phone: '+91 93456 77889', agency: 'Budget Rentals' },
    reviews: [
      { rating: 4.0, comment: 'Super affordable and close to shops.', reviewer: 'Vikas', date: '2024-02-27' },
      { rating: 3.9, comment: 'Simple but functional for a single tenant.', reviewer: 'Priya', date: '2024-03-16' },
    ],
  },
  6: {
    id: 6,
    title: '3 BHK villa with garden',
    location: 'MVP Colony, Vizag, Andhra Pradesh',
    rent: 25000,
    description: 'Premium 3 BHK villa with private garden, covered parking and UPS backup.',
    owner: { name: 'Anand Varma', verified: true, phone: '+91 98721 44211', agency: 'Luxury Living' },
    reviews: [
      { rating: 4.9, comment: 'Stunning villa with a fantastic garden area.', reviewer: 'Sara', date: '2024-05-14' },
      { rating: 4.8, comment: 'Spacious bedrooms and excellent parking.', reviewer: 'Nikhil', date: '2024-05-23' },
    ],
  },
  7: {
    id: 7,
    title: 'Luxury 2 BHK in Tech Hub',
    location: 'Gachibowli, Hyderabad, Telangana',
    rent: 28000,
    description: 'Modern gated community 2 BHK flat near DLF Cyber City with gym, pool and power backup.',
    owner: { name: 'Manoj Singh', verified: true, phone: '+91 91234 00123', agency: 'Metro Homes' },
    reviews: [
      { rating: 4.6, comment: 'Super convenient for IT professionals.', reviewer: 'Ritika', date: '2024-05-20' },
      { rating: 4.4, comment: 'Clean and secure building with great amenities.', reviewer: 'Karthik', date: '2024-05-28' },
    ],
  },
  8: {
    id: 8,
    title: '3 BHK Premium High-Rise Apartment',
    location: 'Indiranagar, Bengaluru, Karnataka',
    rent: 42000,
    description: 'Spacious 3 BHK in prime Indiranagar location near metro station with luxury amenities.',
    owner: { name: 'Simran Patel', verified: false, phone: '+91 99872 33554', agency: 'City Luxe Realty' },
    reviews: [
      { rating: 4.8, comment: 'Excellent location with premium finishes.', reviewer: 'Amit', date: '2024-04-08' },
      { rating: 4.5, comment: 'Great amenities and quick access to transit.', reviewer: 'Leena', date: '2024-04-19' },
    ],
  },
};

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const houseId = parseInt(params.id, 10);

  // Try backend first when configured
  if (BACKEND_URL) {
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/houses/${houseId}`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend unreachable — fall through to static data
    }
  }

  // Fallback: static data
  const house = HOUSES[houseId];
  if (!house) {
    return NextResponse.json({ error: 'House not found' }, { status: 404 });
  }
  return NextResponse.json(house);
}
