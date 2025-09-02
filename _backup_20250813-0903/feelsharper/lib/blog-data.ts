export interface BlogPost {
  id: string
  slug: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  featured: boolean
  image?: string
  readingTime: {
    text: string
    minutes: number
  }
  url: string
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'fix-your-sleep-in-3-days',
    title: 'How to Fix Your Sleep in 3 Days',
    description: 'A systematic approach to transforming your sleep quality using evidence-based strategies that work with your biology, not against it.',
    date: '2024-01-15',
    category: 'Sleep',
    tags: ['sleep optimization', 'circadian rhythm', 'recovery', 'performance'],
    featured: true,
    image: '/images/sleep-optimization.jpg',
    readingTime: {
      text: '12 min read',
      minutes: 12
    },
    url: '/blog/fix-your-sleep-in-3-days'
  },
  {
    id: '2',
    slug: 'energy-management-fundamentals',
    title: 'Energy Management: The Foundation of Peak Performance',
    description: 'Why managing your energy is more important than managing your time, and the 4 pillars that determine your daily energy levels.',
    date: '2024-01-10',
    category: 'Energy',
    tags: ['energy management', 'productivity', 'performance', 'fundamentals'],
    featured: false,
    readingTime: {
      text: '8 min read',
      minutes: 8
    },
    url: '/blog/energy-management-fundamentals'
  },
  {
    id: '3',
    slug: 'focus-in-distracted-world',
    title: 'Deep Focus in a Distracted World',
    description: 'How to build unshakeable focus using neuroscience-backed techniques that work even in our hyper-connected age.',
    date: '2024-01-05',
    category: 'Focus',
    tags: ['focus', 'attention', 'productivity', 'neuroscience'],
    featured: false,
    readingTime: {
      text: '10 min read',
      minutes: 10
    },
    url: '/blog/focus-in-distracted-world'
  },
  {
    id: '4',
    slug: 'testosterone-optimization-guide',
    title: 'The Complete Guide to Natural Testosterone Optimization',
    description: 'Evidence-based strategies to optimize your testosterone levels naturally through sleep, nutrition, exercise, and lifestyle factors.',
    date: '2024-01-01',
    category: 'Libido',
    tags: ['testosterone', 'hormones', 'libido', 'optimization'],
    featured: true,
    readingTime: {
      text: '15 min read',
      minutes: 15
    },
    url: '/blog/testosterone-optimization-guide'
  },
  {
    id: '5',
    slug: 'morning-routine-optimization',
    title: 'The Science-Based Morning Routine',
    description: 'How to design a morning routine that primes your body and mind for peak performance all day long.',
    date: '2023-12-28',
    category: 'Energy',
    tags: ['morning routine', 'habits', 'energy', 'optimization'],
    featured: false,
    readingTime: {
      text: '7 min read',
      minutes: 7
    },
    url: '/blog/morning-routine-optimization'
  },
  {
    id: '6',
    slug: 'stress-resilience-building',
    title: 'Building Unbreakable Stress Resilience',
    description: 'The physiological and psychological strategies that help high-performers thrive under pressure instead of cracking.',
    date: '2023-12-25',
    category: 'Focus',
    tags: ['stress management', 'resilience', 'performance', 'psychology'],
    featured: false,
    readingTime: {
      text: '11 min read',
      minutes: 11
    },
    url: '/blog/stress-resilience-building'
  }
]

export function getAllPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug)
}

export function getPostsByCategory(category: string): BlogPost[] {
  return blogPosts
    .filter(post => post.category.toLowerCase() === category.toLowerCase())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts
    .filter(post => post.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getRelatedPosts(currentSlug: string, category: string, limit: number = 3): BlogPost[] {
  return blogPosts
    .filter(post => post.category === category && post.slug !== currentSlug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}
