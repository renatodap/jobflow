import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Initialize Stripe conditionally
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn('Stripe secret key not configured');
    return null;
  }
  return new Stripe(key, {
    apiVersion: '2025-07-30.basil',
  });
};

// Use Node.js runtime for Stripe
// export const runtime = 'edge';

// Pricing tiers
const PRICING_PLANS = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
    amount: 2900, // $29.00
    name: 'FeelSharper Starter',
    description: 'Perfect for getting started with fitness tracking',
    features: [
      'Unlimited food logging',
      'Workout tracking',
      'Progress graphs',
      'Basic AI coaching',
      'Mobile app access'
    ]
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro',
    amount: 4900, // $49.00
    name: 'FeelSharper Pro',
    description: 'Advanced features for serious athletes',
    features: [
      'Everything in Starter',
      'Advanced AI coaching',
      'Custom workout programs',
      'Nutrition planning',
      'Priority support',
      'Export data & reports',
      'Team/squad features'
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 });
    }
    
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Please sign in to continue' }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !PRICING_PLANS[plan as keyof typeof PRICING_PLANS]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const selectedPlan = PRICING_PLANS[plan as keyof typeof PRICING_PLANS];
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: selectedPlan.description,
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve pricing info
export async function GET() {
  return NextResponse.json({
    plans: PRICING_PLANS,
    currency: 'USD',
    features: {
      starter: PRICING_PLANS.starter.features,
      pro: PRICING_PLANS.pro.features,
    }
  });
}