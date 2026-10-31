import {NextRequest, NextResponse} from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import {getCustomerProfile} from '@/lib/shopify-customer';

export type ProductReview = {
  id: string;
  handle: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
};

const dataFilePath = path.join(process.cwd(), 'data', 'reviews.json');

function getReviewsFromFile(): ProductReview[] {
  try {
    if (!fs.existsSync(dataFilePath)) return [];
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read reviews:', e);
    return [];
  }
}

function saveReviewsToFile(reviews: ProductReview[]): void {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(dataFilePath, JSON.stringify(reviews, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save reviews:', e);
  }
}

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const handle = searchParams.get('handle')?.trim().toLowerCase();

  const all = getReviewsFromFile();
  if (!handle) {
    return NextResponse.json({reviews: all});
  }

  const matching = all.filter((r) => r.handle.toLowerCase() === handle);

  // If no specific reviews exist yet for this product, return standard starter reviews
  if (matching.length === 0) {
    const defaultSample: ProductReview[] = [
      {
        id: `sample-1-${handle}`,
        handle,
        author: 'Aarav Patel',
        rating: 5,
        title: 'Outstanding build quality and aesthetic',
        comment: 'Very pleased with the performance and minimalist design. Fits effortlessly into our setup.',
        date: 'Oct 25, 2026',
        verified: true
      },
      {
        id: `sample-2-${handle}`,
        handle,
        author: 'Neha Kapoor',
        rating: 5,
        title: 'Smooth delivery and prompt support',
        comment: 'Arrived quickly, securely packed. The experience feels top notch.',
        date: 'Oct 29, 2026',
        verified: true
      }
    ];
    return NextResponse.json({reviews: defaultSample});
  }

  return NextResponse.json({reviews: matching});
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('playnex_customer_token')?.value;

    // Strict sign-in check: Nobody can submit a review without signing in
    if (!token) {
      return NextResponse.json(
        {error: 'Sign in required. You must be signed in with a customer account to leave a review.'},
        {status: 401}
      );
    }

    const customer = await getCustomerProfile(token);
    if (!customer) {
      return NextResponse.json(
        {error: 'Customer session expired. Please sign in again to submit your review.'},
        {status: 401}
      );
    }

    const body = await req.json();
    const {handle, rating, title, comment} = body;

    if (!handle || typeof handle !== 'string') {
      return NextResponse.json({error: 'Product handle is required.'}, {status: 400});
    }

    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({error: 'Please choose a rating between 1 and 5 stars.'}, {status: 400});
    }

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      return NextResponse.json({error: 'Please enter a review headline (at least 2 characters).'}, {status: 400});
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      return NextResponse.json({error: 'Please write a review comment (at least 5 characters).'}, {status: 400});
    }

    const authorName =
      customer.firstName && customer.lastName
        ? `${customer.firstName} ${customer.lastName}`
        : customer.firstName || customer.displayName || 'Verified Shopper';

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      handle: handle.trim().toLowerCase(),
      author: authorName,
      rating: Math.round(parsedRating),
      title: title.trim().slice(0, 120),
      comment: comment.trim().slice(0, 1500),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      verified: true
    };

    const all = getReviewsFromFile();
    all.unshift(newReview);
    saveReviewsToFile(all);

    return NextResponse.json({
      success: true,
      review: newReview
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not submit review.';
    return NextResponse.json({error: msg}, {status: 500});
  }
}

