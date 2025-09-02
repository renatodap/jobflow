'use client';

import React from 'react';
import { Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { Heading, Body } from '@/components/ui/Typography';
import Badge from '@/components/ui/Badge';

/**
 * Modern hero section that emphasizes the AI assistant
 * Features clean typography, strategic CTAs, and brand messaging
 */
export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-neutral-50 to-neutral-0 py-24 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.1),transparent_50%)]" />
      
      <Container size="lg">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge announcement */}
          <div className="mb-8 animate-fade-in">
            <Badge variant="secondary" size="lg" className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Introducing Ask Feel Sharper AI
            </Badge>
          </div>

          {/* Main headline */}
          <Heading className="text-5xl lg:text-7xl mb-8 animate-slide-up">
            Peak Performance
            <br />
            <span className="text-brand-amber">Made Simple</span>
          </Heading>

          {/* Subheadline */}
          <Body size="lg" className="text-xl lg:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto animate-slide-up">
            Most men drift through life accepting mediocrity. Feel Sharper rejects this. 
            Get evidence-based strategies to optimize your sleep, energy, focus, and vitality—with AI guidance.
          </Body>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up">
            <Button 
              size="xl" 
              className="group min-w-[200px]"
              onClick={() => {
                // Scroll to Ask Feel Sharper or open chat
                const chatButton = document.querySelector('[aria-label="Open Ask Feel Sharper chat"]') as HTMLButtonElement;
                if (chatButton) {
                  chatButton.click();
                } else {
                  // Fallback: scroll to bottom where chat would be
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }
              }}
            >
              <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Ask Feel Sharper AI
            </Button>
            
            <Button 
              variant="ghost" 
              size="xl"
              className="group min-w-[200px]"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Content
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Social proof / stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in">
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 mb-2">10k+</div>
              <Body className="text-neutral-600">Men Optimized</Body>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 mb-2">24/7</div>
              <Body className="text-neutral-600">AI Guidance</Body>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900 mb-2">100%</div>
              <Body className="text-neutral-600">Evidence-Based</Body>
            </div>
          </div>
        </div>
      </Container>

      {/* Floating AI assistant preview */}
      <div className="absolute bottom-8 right-8 hidden lg:block animate-scale-in">
        <div className="bg-neutral-0 rounded-2xl shadow-strong p-4 max-w-sm border border-neutral-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-brand-amber rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-neutral-900" />
            </div>
            <div>
              <div className="font-medium text-sm text-neutral-900">Ask Feel Sharper</div>
              <div className="text-xs text-neutral-500">AI Wellness Coach</div>
            </div>
          </div>
          <Body className="text-sm text-neutral-700 mb-3">
            "Should I take magnesium at night for better sleep?"
          </Body>
          <div className="bg-neutral-50 rounded-lg p-3">
            <Body className="text-sm text-neutral-600">
              Based on Feel Sharper's sleep optimization guide, magnesium glycinate 200-400mg taken 1-2 hours before bed can...
            </Body>
          </div>
        </div>
      </div>
    </section>
  );
}
