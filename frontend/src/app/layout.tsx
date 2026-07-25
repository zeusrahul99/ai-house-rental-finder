import './globals.css';
import type { Metadata } from 'next';
import ChatWidget from '../components/ChatWidget';

export const metadata: Metadata = {
  title: 'RentalAI – Find Your Perfect Home with AI',
  description:
    'AI-powered house rental finder. Search thousands of verified listings using natural language. Get instant AI recommendations, compare properties, and move in faster.',
  keywords: ['house rental', 'AI rental finder', 'find flat', 'rent house', 'Vizag rentals', 'Andhra Pradesh rentals'],
  openGraph: {
    title: 'RentalAI – Find Your Perfect Home with AI',
    description: 'Search rentals with natural language and AI recommendations.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
