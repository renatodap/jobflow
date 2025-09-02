import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createSupabaseServer } from '@/lib/supabase/server';

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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 });
    }

    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update user's subscription status
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_plan: session.metadata?.plan || 'starter',
            subscription_id: session.subscription as string,
            subscription_started_at: new Date().toISOString(),
          })
          .eq('id', session.metadata?.userId);

        if (error) {
          console.error('Failed to update user subscription:', error);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        console.log('Subscription activated for user:', session.metadata?.userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            subscription_plan: subscription.metadata.plan,
            subscription_updated_at: new Date().toISOString(),
          })
          .eq('subscription_id', subscription.id);

        if (error) {
          console.error('Failed to update subscription:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Cancel subscription
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            subscription_ended_at: new Date().toISOString(),
          })
          .eq('subscription_id', subscription.id);

        if (error) {
          console.error('Failed to cancel subscription:', error);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        
        // Log successful payment
        const subscriptionId = invoice.subscription;
        console.log('Payment successful for subscription:', subscriptionId);
        
        // Update last payment date
        if (subscriptionId) {
          const { error } = await supabase
            .from('profiles')
            .update({
              last_payment_at: new Date().toISOString(),
              subscription_status: 'active',
            })
            .eq('subscription_id', subscriptionId);

          if (error) {
            console.error('Failed to update payment info:', error);
          }
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        
        // Handle failed payment
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId) {
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'past_due',
              last_payment_failed_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscriptionId);

          if (error) {
            console.error('Failed to update payment failure:', error);
          }
        }

        
        // TODO: Send email notification about failed payment
        console.log('Payment failed for subscription:', subscriptionId);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}