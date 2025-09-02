// Google Analytics 4 Implementation
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-30HCSHPSF5';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

// Initialize GA
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track events
export const event = (action: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, parameters);
  }
};

// E-commerce tracking
export const trackPurchase = (transactionData: {
  transaction_id: string;
  value: number;
  currency: string;
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>;
}) => {
  event('purchase', transactionData);
};

// Track add to cart
export const trackAddToCart = (item: {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}) => {
  event('add_to_cart', {
    currency: 'BRL',
    value: item.price * item.quantity,
    items: [item],
  });
};

// Track view item
export const trackViewItem = (item: {
  item_id: string;
  item_name: string;
  price: number;
}) => {
  event('view_item', {
    currency: 'BRL',
    value: item.price,
    items: [item],
  });
};

// Track form submissions
export const trackFormSubmission = (formName: string) => {
  event('generate_lead', {
    form_name: formName,
  });
};

// Track quiz completion
export const trackQuizCompletion = (quizResult: string) => {
  event('quiz_complete', {
    quiz_result: quizResult,
    engagement_type: 'interactive_content',
  });
};

// Track influencer referral
export const trackInfluencerReferral = (influencerCode: string) => {
  event('influencer_referral', {
    influencer_code: influencerCode,
    referral_type: 'influencer',
  });
};

// Track WhatsApp click
export const trackWhatsAppClick = () => {
  event('contact_whatsapp', {
    contact_method: 'whatsapp',
  });
};