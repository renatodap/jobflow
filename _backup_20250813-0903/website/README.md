# Sharpened Website - Premium Edition

A stunning, premium dark-mode landing page for Sharpened, built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## Quick Start

```bash
# Install dependencies
pnpm i

# Start development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start
```

## Features

### Visual & Motion
- **Particle Background**: Interactive animated particles in hero section
- **Framer Motion Animations**: Smooth scroll reveals, hover effects, and transitions
- **Gradient Animations**: Animated gradient overlays and text effects
- **Expandable Sections**: Smooth accordion for manifesto content
- **Responsive Design**: Mobile-first, tested on screens <375px width

### Technical
- **Next.js 14 App Router**: Latest Next.js features
- **TypeScript**: Full type safety
- **Tailwind CSS**: Custom brand tokens and animations
- **OG Image API**: Dynamic social media preview cards at `/api/og`
- **Performance**: Optimized for Lighthouse 90+ scores

## Media Assets Required

Please provide the following media assets for optimal presentation:

### Hero Section
- **Background Video**: `/public/brand/hero-bg.mp4`
  - Format: MP4, 15-30 seconds, looping
  - Resolution: 1920x1080
  - Style: Abstract, tech-themed, subtle motion

### Product Previews
- **FeelSharper**: `/public/brand/feelsharper-preview.mp4`
- **StudySharper**: `/public/brand/studysharper-preview.mp4`
  - Format: MP4 or static image (PNG/JPG)
  - Resolution: 1280x720 minimum
  - Content: Product interface screenshots or demo videos

### Icons & Illustrations
- **Promise Icons**: `/public/brand/icons/`
  - Format: SVG preferred
  - Style: Minimalist, line-based, consistent stroke width

### Manifesto Background
- **Texture**: `/public/brand/manifesto-bg.jpg`
  - Format: JPG/PNG
  - Resolution: 1920x1080
  - Style: Subtle, abstract, low contrast

## Customization

### Brand Colors
Edit `tailwind.config.js` to adjust brand colors:
```js
colors: {
  'charcoal': '#0D0D0D',
  'electric-blue': '#1479FF',
  'vibrant-red': '#FF4A4A',
  'cyan-pulse': '#00D0FF',
}
```

### Animation Speed
Adjust Framer Motion settings in components:
```js
transition={{ duration: 0.6, ease: "easeOut" }}
```

### Particle Effects
Edit `src/components/ParticleBackground.tsx`:
- `particleCount`: Number of particles (default: 80)
- `maxDistance`: Connection distance (default: 120)
- Speed and opacity settings

### Social Links
Update footer social media links in `src/app/page.tsx`:
```tsx
<motion.a href="YOUR_TWITTER_URL">
<motion.a href="YOUR_GITHUB_URL">
<motion.a href="YOUR_LINKEDIN_URL">
```

## Performance Optimization

- Images: Use Next.js Image component for automatic optimization
- Fonts: Inter font loaded via Next.js font optimization
- Code splitting: Automatic with App Router
- Lazy loading: Components loaded on viewport entry

## Deployment

### Vercel (Recommended)
```bash
vercel
```

### Custom Domain
1. Deploy to Vercel
2. Add domain in Vercel dashboard
3. Update DNS records

## License

© 2024 Sharpened. All rights reserved.