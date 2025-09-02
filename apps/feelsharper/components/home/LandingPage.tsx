'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, Zap, BarChart3, Trophy, Users, Shield, 
  ChevronRight, Check, Star, Clock, Target, Brain,
  Smartphone, Globe, Activity, Dumbbell
} from 'lucide-react';

const stats = [
  { value: '10,000+', label: 'Active Athletes' },
  { value: '500K+', label: 'Workouts Logged' },
  { value: '98%', label: 'Success Rate' },
  { value: '4.9/5', label: 'User Rating' },
];

const features = [
  {
    icon: Dumbbell,
    title: 'Smart Workout Tracking',
    description: 'AI-powered workout parser understands any format. Just type naturally.',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Beautiful graphs show your strength gains, weight trends, and consistency.',
  },
  {
    icon: Brain,
    title: 'AI Coaching',
    description: 'Get personalized recommendations based on your goals and progress.',
  },
  {
    icon: Activity,
    title: 'Nutrition Tracking',
    description: '8000+ verified foods from USDA database. Track macros effortlessly.',
  },
  {
    icon: Trophy,
    title: 'Personal Records',
    description: 'Automatic PR detection and celebration. Track your best lifts.',
  },
  {
    icon: Users,
    title: 'Squad Features',
    description: 'Train with friends, share progress, and stay accountable together.',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Marathon Runner',
    content: 'FeelSharper transformed my training. The AI coaching helped me shave 15 minutes off my marathon time.',
    rating: 5,
    image: 'SC',
  },
  {
    name: 'Mike Rodriguez',
    role: 'Powerlifter',
    content: 'Finally, a tracker that understands compound movements. My squat went from 315 to 405 in 6 months.',
    rating: 5,
    image: 'MR',
  },
  {
    name: 'Emma Thompson',
    role: 'CrossFit Athlete',
    content: 'The natural language input is a game-changer. I just describe my WOD and it tracks everything.',
    rating: 5,
    image: 'ET',
  },
];

const benefits = [
  'Track any workout format',
  'No ads, ever',
  'Works offline',
  'Export your data',
  'Dark mode by default',
  'Privacy-first design',
];

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Limited Time Offer Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-3 px-4 text-center">
        <p className="text-sm font-semibold flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          Limited Time: 50% OFF Pro Plan - Ends in {' '}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </p>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-cyan-900/20" />
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-semibold">AI-Powered Fitness Tracking</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Track Smarter,
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Train Harder</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The only fitness tracker that understands natural language. 
            Just type your workout like you'd text a friend.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/sign-up"
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/pricing"
              className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
            >
              View Pricing
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              ))}
              <span className="ml-2">4.9/5 from 2,847 reviews</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-700" />
            <div className="hidden sm:flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Bank-level security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gray-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-400 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Stop wasting time with complicated trackers
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-500 text-sm">✕</span>
                  </div>
                  <p className="text-gray-400">Other apps force you to select from endless exercise lists</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-500 text-sm">✕</span>
                  </div>
                  <p className="text-gray-400">Complex interfaces that require a manual to understand</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-500 text-sm">✕</span>
                  </div>
                  <p className="text-gray-400">Expensive subscriptions for basic features</p>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                <h3 className="text-2xl font-bold mb-4 text-green-400">With FeelSharper</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <p>Just type: "Bench 135x10, 185x5, 225x3" - Done!</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <p>Clean, intuitive interface you'll love using daily</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <p>Free tier forever, Pro features that actually matter</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to reach your goals
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features that adapt to your training style
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all"
              >
                <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by athletes worldwide
            </h2>
            <p className="text-xl text-gray-400">
              Join thousands achieving their fitness goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center font-semibold">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits List */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Why athletes choose FeelSharper
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-2xl p-12 border border-blue-500/30">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start your transformation today
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join 10,000+ athletes already using FeelSharper to reach their goals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/sign-up"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
            >
              Start 7-Day Free Trial
            </Link>
            <Link 
              href="/pricing"
              className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
            >
              View Pricing Plans
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            No credit card required • Cancel anytime • 30-day money back guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">FeelSharper</h3>
              <p className="text-gray-400 text-sm">
                The fitness tracker that speaks your language.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/api" className="hover:text-white">API Docs</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            © 2025 FeelSharper. Built with passion for athletes.
          </div>
        </div>
      </footer>
    </div>
  );
}