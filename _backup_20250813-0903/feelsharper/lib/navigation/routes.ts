// Centralized navigation configuration for Feel Sharper
// Single source of truth for all navigation items

import { 
  Home, 
  Target,
  MessageSquare, 
  Dumbbell, 
  CalendarDays, 
  Settings,
  BookOpen,
  Info,
  Mail,
  Shield,
  LogIn,
  UserPlus,
  Apple,
  Activity,
  TrendingUp,
  Scale
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  requiresAuth?: boolean;
  showInMenu?: boolean;
  showInFooter?: boolean;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}

// Main navigation items - Fitness-focused IA
export const mainNavigation: NavigationItem[] = [
  { 
    name: 'Home', 
    href: '/', 
    icon: Home,
    showInMenu: false,
    showInFooter: false
  },
  { 
    name: 'Today', 
    href: '/today', 
    icon: Target,
    requiresAuth: true,
    showInMenu: true,
    showInFooter: false
  },
  { 
    name: 'Food', 
    href: '/food', 
    icon: Apple,
    requiresAuth: true,
    showInMenu: true,
    showInFooter: false
  },
  { 
    name: 'Workouts', 
    href: '/workouts', 
    icon: Dumbbell,
    requiresAuth: true,
    showInMenu: true,
    showInFooter: false
  },
  { 
    name: 'Weight', 
    href: '/weight', 
    icon: Activity,
    requiresAuth: true,
    showInMenu: true,
    showInFooter: false
  },
  { 
    name: 'Body', 
    href: '/body', 
    icon: Scale,
    requiresAuth: true,
    showInMenu: true,
    showInFooter: false
  },
  { 
    name: 'Insights', 
    href: '/insights', 
    icon: TrendingUp,
    requiresAuth: true,
    showInMenu: true,
    showInFooter: false
  },
  { 
    name: 'Account', 
    href: '/settings', 
    icon: Settings,
    requiresAuth: true,
    showInMenu: true,
    showInFooter: false
  },
];

// Footer navigation items
export const footerNavigation: NavigationItem[] = [
  { 
    name: 'Blog', 
    href: '/blog', 
    icon: BookOpen,
    showInMenu: false,
    showInFooter: true
  },
  { 
    name: 'About', 
    href: '/about', 
    icon: Info,
    showInMenu: false,
    showInFooter: true
  },
  { 
    name: 'Newsletter', 
    href: '/newsletter', 
    icon: Mail,
    showInMenu: false,
    showInFooter: true
  },
  { 
    name: 'Privacy', 
    href: '/privacy', 
    icon: Shield,
    showInMenu: false,
    showInFooter: true
  },
];

// Auth navigation items
export const authNavigation: NavigationItem[] = [
  { 
    name: 'Sign In', 
    href: '/sign-in', 
    icon: LogIn,
    showInMenu: true,
    showInFooter: false
  },
  { 
    name: 'Sign Up', 
    href: '/sign-up', 
    icon: UserPlus,
    showInMenu: true,
    showInFooter: false
  },
];

// Get navigation items based on auth status
export function getNavigationItems(isAuthenticated: boolean): NavigationItem[] {
  const items = [...mainNavigation, ...footerNavigation];
  
  if (isAuthenticated) {
    return items.filter(item => !authNavigation.includes(item as any));
  } else {
    return [
      ...items.filter(item => !item.requiresAuth),
      ...authNavigation
    ];
  }
}

// Get menu items for mobile/desktop navigation
export function getMenuItems(isAuthenticated: boolean, isMobile: boolean): NavigationItem[] {
  const items = getNavigationItems(isAuthenticated);
  
  return items.filter(item => {
    if (!item.showInMenu) return false;
    if (item.mobileOnly && !isMobile) return false;
    if (item.desktopOnly && isMobile) return false;
    return true;
  });
}

// Get footer items
export function getFooterItems(): NavigationItem[] {
  return footerNavigation;
}

// Categories for blog
export const blogCategories = [
  { name: 'Sleep', slug: 'sleep' },
  { name: 'Energy', slug: 'energy' },
  { name: 'Focus', slug: 'focus' },
  { name: 'Libido', slug: 'libido' },
  { name: 'Recovery', slug: 'recovery' },
  { name: 'Nutrition', slug: 'nutrition' },
];

// Quick action items for /today page
export const quickActions = [
  { 
    label: 'Log Food', 
    href: '/food/add', 
    icon: Apple, 
    color: 'bg-success' 
  },
  { 
    label: 'Log Workout', 
    href: '/workouts/add', 
    icon: Dumbbell, 
    color: 'bg-navy' 
  },
  { 
    label: 'Add Weight', 
    href: '/weight/add', 
    icon: Activity, 
    color: 'bg-info' 
  },
];