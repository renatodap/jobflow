'use client';

import React from 'react';
import { Moon, Zap, Brain, Dumbbell, Heart, Target } from 'lucide-react';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import { Heading, Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';

/**
 * Feature grid showcasing core wellness categories
 * Each card represents a key optimization area with clear value proposition
 */
export default function FeatureGrid() {
  const features = [
    {
      icon: Moon,
      title: 'Sleep Optimization',
      description: 'Master your sleep architecture with evidence-based protocols for deeper rest and faster recovery.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      articles: 12
    },
    {
      icon: Zap,
      title: 'Energy Systems',
      description: 'Unlock sustained energy through metabolic optimization, nutrition timing, and strategic supplementation.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      articles: 8
    },
    {
      icon: Brain,
      title: 'Cognitive Enhancement',
      description: 'Sharpen focus and mental clarity with nootropics, meditation, and cognitive training protocols.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      articles: 15
    },
    {
      icon: Heart,
      title: 'Hormonal Health',
      description: 'Optimize testosterone, cortisol, and other key hormones for peak masculine vitality.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      articles: 10
    },
    {
      icon: Dumbbell,
      title: 'Performance Training',
      description: 'Build strength, power, and resilience with systematic training and recovery protocols.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      articles: 18
    },
    {
      icon: Target,
      title: 'Habit Architecture',
      description: 'Design sustainable systems for long-term optimization and consistent peak performance.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      articles: 6
    }
  ];

  return (
    <section id="features" className="py-24 bg-neutral-0">
      <Container size="lg">
        {/* Section header */}
        <div className="text-center mb-16">
          <Subheading className="text-4xl lg:text-5xl mb-6">
            Systematic Optimization
          </Subheading>
          <Body size="lg" className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Every aspect of male performance, broken down into actionable systems. 
            No hype, no shortcuts—just evidence-based strategies that work.
          </Body>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            
            return (
              <Card 
                key={feature.title}
                variant="elevated"
                className="group hover:shadow-strong transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon and title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <Subheading className="text-xl mb-2 group-hover:text-brand-amber transition-colors">
                      {feature.title}
                    </Subheading>
                    <div className="text-sm text-neutral-500 font-medium">
                      {feature.articles} Articles
                    </div>
                  </div>
                </div>

                {/* Description */}
                <Body className="text-neutral-600 mb-6 leading-relaxed">
                  {feature.description}
                </Body>

                {/* CTA */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full group-hover:bg-brand-amber group-hover:text-neutral-900 transition-all"
                >
                  Explore {feature.title}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Card variant="bordered" className="max-w-2xl mx-auto bg-gradient-to-r from-brand-amber-light to-neutral-50">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-brand-amber rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-neutral-900" />
              </div>
              <Subheading className="text-2xl">
                Get Personalized Guidance
              </Subheading>
            </div>
            <Body className="text-neutral-700 mb-6">
              Ask Feel Sharper AI about any wellness topic. Get instant, evidence-based answers 
              tailored to your specific situation.
            </Body>
            <Button 
              size="lg"
              onClick={() => {
                const chatButton = document.querySelector('[aria-label="Open Ask Feel Sharper chat"]') as HTMLButtonElement;
                if (chatButton) chatButton.click();
              }}
            >
              Start Conversation
            </Button>
          </Card>
        </div>
      </Container>
    </section>
  );
}
