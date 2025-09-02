'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Zap, TrendingUp } from 'lucide-react';
import { analytics, conversionTracking } from '@/components/providers/PostHogProvider';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for getting started with fitness tracking',
    features: [
      { text: 'Unlimited food logging', included: true },
      { text: 'Workout tracking & history', included: true },
      { text: 'Progress graphs & insights', included: true },
      { text: 'Basic AI coaching', included: true },
      { text: 'Mobile app access', included: true },
      { text: 'Advanced AI coaching', included: false },
      { text: 'Custom workout programs', included: false },
      { text: 'Team/squad features', included: false },
    ],
    popular: false,
    cta: 'Start Free Trial',
    color: 'border-gray-700',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'Advanced features for serious athletes',
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'Advanced AI coaching', included: true },
      { text: 'Custom workout programs', included: true },
      { text: 'Nutrition meal planning', included: true },
      { text: 'Priority support', included: true },
      { text: 'Export data & reports', included: true },
      { text: 'Team/squad features', included: true },
      { text: 'API access', included: true },
    ],
    popular: true,
    cta: 'Start Pro Trial',
    color: 'border-blue-500',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // Track pricing page view
    conversionTracking.trackPricingView();
  }, []);

  const handleCheckout = async (planId: string) => {
    try {
      setLoading(planId);
      
      // Track checkout initiation
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        analytics.trackCheckout(planId, parseInt(plan.price.replace('$', '')));
        conversionTracking.trackCTAClick('checkout', 'pricing_page');
      }
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (data.error) {
        if (response.status === 401) {
          router.push('/sign-in?redirect=/pricing');
        } else {
          alert(data.error);
        }
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your fitness journey. Cancel anytime, no questions asked.
          </p>
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>30-day money back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 ${plan.color} bg-gray-900/50 backdrop-blur p-8 ${
                plan.popular ? 'shadow-2xl shadow-blue-500/20' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-white' : 'text-gray-500'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading !== null}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === plan.id ? 'Processing...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">
                We accept all major credit cards, debit cards, and digital wallets through Stripe.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-400">
                Yes! Both plans come with a 7-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">How do I cancel my subscription?</h3>
              <p className="text-gray-400">
                You can cancel anytime from your account settings. Your access continues until the end of your billing period.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-2xl p-12 border border-blue-500/20">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your fitness journey?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of athletes using FeelSharper to track progress, optimize training, and achieve their goals.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleCheckout('starter')}
              className="px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Start with Starter
            </button>
            <button
              onClick={() => handleCheckout('pro')}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Go Pro Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}