"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Dumbbell, Apple, TrendingUp, Activity } from 'lucide-react';

export default function FitnessHero() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { value: 'Free', label: 'Always', icon: Activity },
    { value: 'Simple', label: 'Tracking', icon: Apple },
    { value: 'Fast', label: 'Logging', icon: Dumbbell },
    { value: 'Clear', label: 'Progress', icon: TrendingUp },
  ];

  const features = [
    {
      icon: Apple,
      title: 'Food Logging',
      description: 'Track macros and micros with frictionless, fast food entry'
    },
    {
      icon: Dumbbell,
      title: 'Workout Tracking',
      description: 'Log sets, reps, and weights with AI-powered workout parsing'
    },
    {
      icon: TrendingUp,
      title: 'Progress Insights',
      description: 'See your gains with clean graphs and trend analysis'
    }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg text-text-primary">
      <div className="max-w-7xl mx-auto text-center px-4 py-20">
        {/* Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="text-sm font-medium text-text-secondary">Free fitness tracking that works</span>
        </div>

        {/* Main Heading */}
        <h1 className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="block text-text-primary">Feel</span>
          <span className="block text-navy">
            Sharper
          </span>
        </h1>

        {/* Subheading */}
        <p className={`text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Track food, workouts, and weight. <br className="hidden md:block" />
          See progress with clean graphs. Completely free.
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-20 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link 
            href="/sign-up" 
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-text-primary transition-all duration-200 bg-navy hover:bg-navy-600 rounded-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <span className="relative">Start Tracking</span>
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link 
            href="/today" 
            className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-text-primary transition-all duration-200 bg-surface border border-border rounded-xl hover:bg-surface-2 hover:border-navy focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <span>View Demo</span>
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-surface border border-border rounded-xl p-6 group hover:scale-105 hover:bg-surface-2 transition-all duration-300">
                <Icon className="w-8 h-8 mx-auto mb-3 text-navy group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className={`grid md:grid-cols-3 gap-6 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative">
                <div className="relative bg-surface border border-border rounded-xl p-6 text-left hover:bg-surface-2 transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-navy">
                    <Icon className="w-6 h-6 text-text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badge */}
        <div className={`mt-20 flex items-center justify-center gap-8 transition-all duration-1000 delay-600 ${mounted ? 'opacity-60' : 'opacity-0'}`}>
          <p className="text-sm text-text-muted font-medium">No subscriptions</p>
          <p className="text-sm text-text-muted font-medium">•</p>
          <p className="text-sm text-text-muted font-medium">No ads</p>
          <p className="text-sm text-text-muted font-medium">•</p>
          <p className="text-sm text-text-muted font-medium">Just fitness tracking</p>
        </div>
      </div>
    </section>
  );
}