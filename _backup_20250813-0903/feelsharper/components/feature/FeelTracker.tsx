'use client';

import React from 'react';
import { TrendingUp, Target, Calendar, Zap, Brain, Moon } from 'lucide-react';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import { Heading, Subheading, Body } from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

/**
 * Feel Tracker teaser component showcasing habit tracking and optimization
 * Introduces the concept of systematic self-monitoring for peak performance
 */
export default function FeelTracker() {
  const metrics = [
    { icon: Moon, label: 'Sleep Quality', value: '8.2', trend: '+0.3', color: 'text-blue-600' },
    { icon: Zap, label: 'Energy Level', value: '7.8', trend: '+0.5', color: 'text-yellow-600' },
    { icon: Brain, label: 'Mental Clarity', value: '8.5', trend: '+0.2', color: 'text-purple-600' },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-neutral-0 to-neutral-50">
      <Container size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content side */}
          <div>
            <Badge variant="secondary" size="lg" className="mb-6">
              Coming Soon
            </Badge>
            
            <Subheading className="text-4xl lg:text-5xl mb-6">
              Track Your
              <br />
              <span className="text-brand-amber">Optimization</span>
            </Subheading>
            
            <Body size="lg" className="text-xl text-neutral-600 mb-8 leading-relaxed">
              Feel Tracker transforms your daily habits into data-driven insights. 
              Monitor sleep, energy, focus, and vitality with precision tracking designed for peak performers.
            </Body>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-amber rounded-full"></div>
                <Body className="text-neutral-700">Daily habit tracking with smart insights</Body>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-amber rounded-full"></div>
                <Body className="text-neutral-700">Personalized optimization recommendations</Body>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-amber rounded-full"></div>
                <Body className="text-neutral-700">Integration with Feel Sharper protocols</Body>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" disabled>
                Join Waitlist
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                onClick={() => {
                  const chatButton = document.querySelector('[aria-label="Open Ask Feel Sharper chat"]') as HTMLButtonElement;
                  if (chatButton) chatButton.click();
                }}
              >
                Ask About Tracking
              </Button>
            </div>
          </div>

          {/* Preview mockup */}
          <div className="relative">
            {/* Main dashboard card */}
            <Card variant="elevated" className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Subheading className="text-xl mb-1">Today's Performance</Subheading>
                  <Body className="text-neutral-500">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Body>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <Body className="text-green-600 font-medium">+12%</Body>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="space-y-4">
                {metrics.map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <div key={metric.label} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-0 rounded-lg flex items-center justify-center">
                          <IconComponent className={`h-5 w-5 ${metric.color}`} />
                        </div>
                        <div>
                          <Body className="font-medium text-neutral-900">{metric.label}</Body>
                          <Body className="text-sm text-neutral-500">Daily average</Body>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-neutral-900">{metric.value}</div>
                        <div className="text-sm text-green-600 font-medium">{metric.trend}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick actions */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <Body className="text-neutral-600">Quick Log</Body>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </button>
                    <button className="w-8 h-8 bg-yellow-100 hover:bg-yellow-200 rounded-lg flex items-center justify-center transition-colors">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                    </button>
                    <button className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Floating insight card */}
            <Card 
              variant="elevated" 
              className="absolute -bottom-4 -right-4 w-64 bg-brand-amber-light border-brand-amber z-20"
              padding="sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-brand-amber rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-neutral-900" />
                </div>
                <div>
                  <Body className="font-medium text-neutral-900 mb-1">Optimization Tip</Body>
                  <Body className="text-sm text-neutral-700">
                    Your sleep quality improved 15% this week. Consider maintaining your current bedtime routine.
                  </Body>
                </div>
              </div>
            </Card>

            {/* Background decoration */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-brand-amber/10 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-neutral-300/20 rounded-full blur-xl -z-10"></div>
          </div>
        </div>
      </Container>
    </section>
  );
}
