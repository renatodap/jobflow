'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Initialize PostHog
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false, // We'll manually track pageviews
    capture_pageleave: true,
    autocapture: true, // Automatically capture clicks, form submissions, etc.
    persistence: 'localStorage',
    bootstrap: {
      distinctID: undefined, // Will be set when user signs in
    },
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug();
      }
    },
  });
}

export function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + '?' + searchParams.toString();
      }
      
      // Track pageview with additional properties
      posthog.capture('$pageview', {
        $current_url: url,
        $pathname: pathname,
        $search: searchParams?.toString() || '',
      });
    }
  }, [pathname, searchParams]);

  return null;
}

interface PostHogProviderProps {
  children: React.ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Analytics helper functions
export const analytics = {
  // User events
  identify: (userId: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.identify(userId, properties);
    }
  },
  
  reset: () => {
    if (posthog) {
      posthog.reset();
    }
  },

  // Conversion events
  trackSignup: (method: string, plan?: string) => {
    if (posthog) {
      posthog.capture('user_signed_up', {
        signup_method: method,
        plan: plan || 'free',
        timestamp: new Date().toISOString(),
      });
    }
  },

  trackCheckout: (plan: string, price: number) => {
    if (posthog) {
      posthog.capture('checkout_started', {
        plan,
        price,
        currency: 'USD',
        timestamp: new Date().toISOString(),
      });
    }
  },

  trackPurchase: (plan: string, price: number, subscriptionId: string) => {
    if (posthog) {
      posthog.capture('purchase_completed', {
        plan,
        price,
        currency: 'USD',
        subscription_id: subscriptionId,
        timestamp: new Date().toISOString(),
      });
    }
  },

  trackChurn: (plan: string, reason?: string) => {
    if (posthog) {
      posthog.capture('subscription_cancelled', {
        plan,
        cancellation_reason: reason,
        timestamp: new Date().toISOString(),
      });
    }
  },

  // Feature usage events
  trackFeatureUsage: (feature: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(`feature_${feature}_used`, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    }
  },

  trackWorkoutLogged: (exercises: number, duration: number) => {
    if (posthog) {
      posthog.capture('workout_logged', {
        exercise_count: exercises,
        duration_minutes: duration,
        timestamp: new Date().toISOString(),
      });
    }
  },

  trackFoodLogged: (calories: number, mealType: string) => {
    if (posthog) {
      posthog.capture('food_logged', {
        calories,
        meal_type: mealType,
        timestamp: new Date().toISOString(),
      });
    }
  },

  trackWeightLogged: (weight: number, unit: string) => {
    if (posthog) {
      posthog.capture('weight_logged', {
        weight,
        unit,
        timestamp: new Date().toISOString(),
      });
    }
  },

  // Engagement events
  trackEngagement: (action: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(`engagement_${action}`, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    }
  },

  // A/B Testing
  getFeatureFlag: (flag: string): boolean | string | undefined => {
    if (posthog) {
      return posthog.getFeatureFlag(flag);
    }
    return undefined;
  },

  // Session recording control
  startSessionRecording: () => {
    if (posthog) {
      posthog.startSessionRecording();
    }
  },

  stopSessionRecording: () => {
    if (posthog) {
      posthog.stopSessionRecording();
    }
  },

  // Custom events
  track: (event: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    }
  },
};

// Conversion tracking utilities
export const conversionTracking = {
  // Landing page events
  trackLandingView: (source?: string, campaign?: string) => {
    analytics.track('landing_page_viewed', {
      source: source || 'direct',
      campaign: campaign || 'none',
      referrer: document.referrer,
    });
  },

  trackCTAClick: (ctaType: string, location: string) => {
    analytics.track('cta_clicked', {
      cta_type: ctaType,
      location,
      page: window.location.pathname,
    });
  },

  trackPricingView: () => {
    analytics.track('pricing_page_viewed', {
      referrer: document.referrer,
    });
  },

  // Funnel tracking
  trackFunnelStep: (step: string, stepNumber: number) => {
    analytics.track('funnel_step_completed', {
      step_name: step,
      step_number: stepNumber,
    });
  },

  // Error tracking
  trackError: (error: string, context: string) => {
    analytics.track('error_occurred', {
      error_message: error,
      error_context: context,
      page: window.location.pathname,
    });
  },
};

export default analytics;