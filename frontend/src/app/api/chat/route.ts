import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const FALLBACK_ANSWERS: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ['2 bhk', '2bhk'],
    answer:
      'Great choice! I found a 2 BHK near Raghu Engineering College for ₹11,000/month with parking and good ventilation. There is also a furnished 2 BHK in Rushikonda at ₹13,500/month with AC and Wi-Fi. Would you like more details on either?',
  },
  {
    keywords: ['1 bhk', '1bhk', 'bachelor', 'single'],
    answer:
      'For a 1 BHK, I have two options: a studio in Nellore at ₹9,000/month near local markets, and an affordable bachelor flat in Madhurawada at ₹6,500/month with no brokerage. Which location suits you better?',
  },
  {
    keywords: ['3 bhk', '3bhk', 'family', 'villa'],
    answer:
      'For families, I recommend the 3 BHK in Guntur at ₹15,000/month with lift and 24/7 security. For a premium option, there is a 3 BHK villa in MVP Colony, Vizag at ₹25,000/month with a private garden and covered parking.',
  },
  {
    keywords: ['budget', 'cheap', 'affordable', 'low'],
    answer:
      'The most affordable listing is a 1 BHK bachelor flat in Madhurawada at ₹6,500/month. For slightly more, the Nellore 1 BHK studio at ₹9,000/month is also a great value pick.',
  },
  {
    keywords: ['vizag', 'visakhapatnam', 'rushikonda', 'madhurawada', 'mvp'],
    answer:
      'In Vizag I have 3 listings: a 2 BHK in Bheemunipatnam (₹11,000), a furnished 2 BHK in Rushikonda (₹13,500), a 1 BHK in Madhurawada (₹6,500), and a 3 BHK villa in MVP Colony (₹25,000). Which area and budget works for you?',
  },
  {
    keywords: ['furnished', 'furnish'],
    answer:
      'I have two fully furnished options: a 2 BHK in Rushikonda, Vizag at ₹13,500/month with AC and Wi-Fi, and a 3 BHK villa in MVP Colony with full amenities at ₹25,000/month.',
  },
];

function getFallbackAnswer(question: string): string {
  const q = question.toLowerCase();
  for (const { keywords, answer } of FALLBACK_ANSWERS) {
    if (keywords.some((kw) => q.includes(kw))) return answer;
  }
  return 'Please tell me your preferred location, budget, and number of rooms and I will find the best matches for you!';
}

export async function POST(request: Request) {
  let question = '';
  try {
    const body = await request.json();
    question = (body.question ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!question) {
    return NextResponse.json({ answer: 'Please ask me something about rentals!' });
  }

  // Try backend when configured
  if (BACKEND_URL) {
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        cache: 'no-store',
      });
      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend unreachable — fall through to local answers
    }
  }

  // Fallback: keyword-based smart replies
  return NextResponse.json({ answer: getFallbackAnswer(question) });
}
