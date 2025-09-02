# UI Design System Guidelines

---
id: ui-design-system
owner: design-team
status: active
last_updated: 2025-08-12
links:
  - "[Problem Statement](../00-vision/problem.md)"
  - "[Stack Decision](../02-decisions/stack.md)"
  - "[Feature Inventory](../05-product/feature-inventory.md)"
---

## Purpose
Define comprehensive UI design system guidelines for StudySharper to ensure consistent, accessible, and effective user experience across all features and platforms.

## Scope
Complete design system covering colors, typography, components, layouts, interactions, accessibility, and platform-specific considerations for the AI-powered study platform.

## Design Philosophy

### Core Principles
1. **Focus-Driven Design**: Minimize distractions, maximize study effectiveness
2. **Cognitive Load Awareness**: Reduce mental overhead in interface design
3. **Learning Science Integration**: UI supports proven study methodologies
4. **Accessibility First**: Inclusive design for diverse learning needs
5. **Performance Optimized**: Fast, responsive interactions for uninterrupted learning

### Brand Personality
- **Calm**: Peaceful, stress-reducing study environment
- **Intelligent**: Smart assistance without overwhelming complexity
- **Trustworthy**: Reliable, consistent, scientifically-backed
- **Empowering**: Makes users feel capable and in control

## Color System

### Primary Palette
```css
:root {
  /* Primary - Deep Blue (Focus/Intelligence) */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6; /* Main brand color */
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
  --primary-950: #172554;

  /* Secondary - Emerald (Success/Progress) */
  --secondary-50: #ecfdf5;
  --secondary-100: #d1fae5;
  --secondary-200: #a7f3d0;
  --secondary-300: #6ee7b7;
  --secondary-400: #34d399;
  --secondary-500: #10b981;
  --secondary-600: #059669;
  --secondary-700: #047857;
  --secondary-800: #065f46;
  --secondary-900: #064e3b;
  --secondary-950: #022c22;
}
```

### Neutral Palette
```css
:root {
  /* Gray Scale */
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-300: #d1d5db;
  --neutral-400: #9ca3af;
  --neutral-500: #6b7280;
  --neutral-600: #4b5563;
  --neutral-700: #374151;
  --neutral-800: #1f2937;
  --neutral-900: #111827;
  --neutral-950: #030712;
}
```

### Semantic Colors
```css
:root {
  /* Status Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;

  /* Study Method Colors */
  --method-review: #8b5cf6;     /* Purple - Spaced Repetition */
  --method-practice: #f59e0b;   /* Orange - Active Practice */
  --method-read: #06b6d4;       /* Cyan - Reading/Research */
  --method-create: #10b981;     /* Green - Note Creation */
}
```

### Dark Mode Support
```css
:root[data-theme="dark"] {
  --background: #0f172a;
  --foreground: #f1f5f9;
  --card: #1e293b;
  --card-foreground: #f1f5f9;
  --popover: #1e293b;
  --popover-foreground: #f1f5f9;
  --muted: #334155;
  --muted-foreground: #94a3b8;
  --border: #334155;
  --input: #334155;
  --accent: #334155;
  --accent-foreground: #f1f5f9;
}
```

## Typography

### Font System
```css
:root {
  /* Primary Font - Inter (UI Text) */
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  
  /* Secondary Font - JetBrains Mono (Code/Data) */
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
  
  /* Reading Font - Georgia (Long Content) */
  --font-serif: Georgia, "Times New Roman", serif;
}
```

### Text Scales
```css
:root {
  /* Desktop Scale */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Typography Usage
- **Headings**: Inter, bold weights (600-700)
- **Body Text**: Inter, regular (400) and medium (500)
- **UI Elements**: Inter, medium (500) and semibold (600)
- **Code/Data**: JetBrains Mono, regular (400)
- **Long Reading**: Georgia, regular (400) for note content

## Component Library

### Button System
```typescript
// Button Variants
type ButtonVariant = 
  | "primary"      // Main CTAs
  | "secondary"    // Secondary actions
  | "outline"      // Subtle actions
  | "ghost"        // Minimal actions
  | "destructive"  // Delete/danger actions
  | "link"         // Text links

// Button Sizes
type ButtonSize = "sm" | "default" | "lg" | "icon"

// Usage Examples
<Button variant="primary" size="default">Start Studying</Button>
<Button variant="outline" size="sm">Edit Course</Button>
<Button variant="ghost" size="icon"><Calendar /></Button>
```

### Form Components
```typescript
// Input Types
<Input 
  type="text" 
  placeholder="Course name..."
  label="Course Name"
  description="What should we call this course?"
  error="Course name is required"
/>

// Select Components
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select study method" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="review">Spaced Repetition</SelectItem>
    <SelectItem value="practice">Active Practice</SelectItem>
  </SelectContent>
</Select>

// Checkbox & Radio
<Checkbox id="enable-ai" />
<RadioGroup defaultValue="morning">
  <RadioGroupItem value="morning" id="morning" />
  <RadioGroupItem value="evening" id="evening" />
</RadioGroup>
```

### Navigation Components
```typescript
// Main Navigation
<Sidebar>
  <SidebarItem icon={<Home />} href="/dashboard">
    Dashboard
  </SidebarItem>
  <SidebarItem icon={<Calendar />} href="/schedule">
    Study Plan
  </SidebarItem>
  <SidebarItem icon={<Book />} href="/notes">
    Notes
  </SidebarItem>
</Sidebar>

// Breadcrumbs
<Breadcrumb>
  <BreadcrumbItem href="/courses">Courses</BreadcrumbItem>
  <BreadcrumbItem href="/courses/cs101">CS 101</BreadcrumbItem>
  <BreadcrumbItem>Data Structures</BreadcrumbItem>
</Breadcrumb>

// Tabs
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="schedule">Schedule</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>
</Tabs>
```

### Card System
```typescript
// Standard Card
<Card>
  <CardHeader>
    <CardTitle>CS 101 - Data Structures</CardTitle>
    <CardDescription>Next exam: March 15, 2025</CardDescription>
  </CardHeader>
  <CardContent>
    <Progress value={75} />
    <p>75% complete</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline">View Details</Button>
  </CardFooter>
</Card>

// Study Session Card
<StudyCard
  subject="Binary Trees"
  duration="25 min"
  method="Active Practice"
  difficulty="Medium"
  status="scheduled"
/>
```

### Data Display
```typescript
// Tables
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Course</TableHead>
      <TableHead>Progress</TableHead>
      <TableHead>Next Review</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>CS 101</TableCell>
      <TableCell><Progress value={75} /></TableCell>
      <TableCell>Tomorrow 2:00 PM</TableCell>
    </TableRow>
  </TableBody>
</Table>

// Stats Grid
<StatsGrid>
  <StatCard
    title="Study Streak"
    value="12 days"
    change="+2 from last week"
    trend="up"
  />
  <StatCard
    title="Cards Reviewed"
    value="147"
    change="+23 today"
    trend="up"
  />
</StatsGrid>
```

## Layout System

### Grid Structure
```css
/* 12-column grid system */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

/* Responsive breakpoints */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Page Layout Templates
```typescript
// Dashboard Layout
<DashboardLayout>
  <Sidebar />
  <MainContent>
    <Header />
    <PageContent />
  </MainContent>
</DashboardLayout>

// Study Session Layout
<StudyLayout>
  <StudyHeader />
  <StudyContent />
  <StudyControls />
</StudyLayout>

// Mobile-First Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Auto-responsive cards */}
</div>
```

### Spacing System
```css
:root {
  --space-px: 1px;
  --space-0: 0px;
  --space-0_5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1_5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2_5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-3_5: 0.875rem;  /* 14px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-9: 2.25rem;     /* 36px */
  --space-10: 2.5rem;     /* 40px */
  --space-12: 3rem;       /* 48px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
}
```

## Interaction Design

### Animation System
```css
:root {
  /* Timing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Durations */
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
}

/* Component Animations */
.fade-in {
  animation: fadeIn var(--duration-200) var(--ease-out);
}

.slide-up {
  animation: slideUp var(--duration-300) var(--ease-out);
}

.scale-in {
  animation: scaleIn var(--duration-150) var(--ease-out);
}
```

### Micro-interactions
- **Button Hover**: Subtle scale (1.02x) + shadow increase
- **Card Hover**: Lift effect with shadow
- **Form Focus**: Border color change + glow
- **Loading States**: Skeleton screens, progress indicators
- **Success Feedback**: Checkmark animation + color change

### Touch Targets
- **Minimum Size**: 44px × 44px (iOS guidelines)
- **Comfortable Size**: 48px × 48px
- **Spacing**: 8px minimum between touch targets
- **Gesture Support**: Swipe, pinch-to-zoom where appropriate

## Accessibility Guidelines

### WCAG 2.1 AA Compliance
- **Contrast Ratios**: 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: Visible, high-contrast focus rings
- **Keyboard Navigation**: Full keyboard operability
- **Screen Reader Support**: Semantic HTML, ARIA labels

### Semantic HTML Structure
```html
<!-- Proper heading hierarchy -->
<h1>Dashboard</h1>
  <h2>Today's Study Plan</h2>
    <h3>CS 101 - Data Structures</h3>

<!-- Form accessibility -->
<form>
  <label for="course-name">Course Name</label>
  <input 
    id="course-name" 
    type="text" 
    aria-describedby="course-help"
    required
  />
  <div id="course-help">Enter the official course name</div>
</form>

<!-- Interactive elements -->
<button 
  aria-label="Start study session for CS 101"
  aria-pressed="false"
>
  Start Session
</button>
```

### Color Independence
- Never rely solely on color to convey information
- Use icons, text labels, and patterns alongside color
- Ensure sufficient contrast in all color combinations

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Mobile Design

### Responsive Breakpoints
```typescript
const breakpoints = {
  sm: '640px',  // Small tablets
  md: '768px',  // Tablets
  lg: '1024px', // Small laptops
  xl: '1280px', // Laptops
  '2xl': '1536px' // Large screens
}
```

### Mobile-Specific Patterns
- **Bottom Navigation**: Primary actions at bottom for thumb reach
- **Swipe Gestures**: Swipe to delete, navigate between cards
- **Pull-to-Refresh**: Standard mobile refresh pattern
- **Thumb Zones**: Important actions in comfortable reach areas

### Progressive Web App (PWA)
- **App-like Experience**: Full-screen mode, splash screens
- **Offline Support**: Cached content for offline study
- **Push Notifications**: Study reminders, streak notifications
- **Add to Home Screen**: Native app installation

## Data Visualization

### Chart Types
```typescript
// Progress Charts
<ProgressChart
  data={progressData}
  type="line"
  timeRange="week"
  color="primary"
/>

// Performance Dashboard
<PerformanceGrid>
  <MetricCard title="Study Time" value="2.5h" trend="up" />
  <MetricCard title="Retention Rate" value="87%" trend="stable" />
  <MetricCard title="Cards Due" value="23" trend="down" />
</PerformanceGrid>

// Study Calendar Heatmap
<StudyHeatmap
  data={studySessionData}
  scale="intensity"
  tooltipFormat="date"
/>
```

### Color Usage in Charts
- **Primary Data**: Use brand blue for main metrics
- **Secondary Data**: Use gray scale for context
- **Status Colors**: Green for positive, red for negative
- **Category Colors**: Distinct hues for different subjects

## Design Tokens

### Implementation
```typescript
// Design token structure
export const tokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      // ... full scale
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    }
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      // ... full scale
    }
  },
  spacing: {
    0: '0px',
    1: '0.25rem',
    // ... full scale
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    }
  }
}
```

## Component Documentation

### Storybook Integration
- **Component Library**: All components documented in Storybook
- **Usage Examples**: Multiple states and variants shown
- **Accessibility Tests**: Built-in a11y testing
- **Design Tokens**: Token usage clearly documented

### Code Standards
```typescript
// Component structure
interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Component = ({ 
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  className,
  ...props 
}: ComponentProps) => {
  return (
    <div 
      className={cn(
        'base-styles',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

## Acceptance Criteria
- [ ] Complete component library implemented with shadcn/ui
- [ ] WCAG 2.1 AA compliance verified with automated testing
- [ ] Mobile responsiveness tested across devices
- [ ] Dark mode support implemented for all components
- [ ] Performance impact <100ms for component renders
- [ ] Storybook documentation covers all components
- [ ] Design tokens properly implemented and used consistently

## Risks
- **Design System Adoption**: Developers may not follow guidelines consistently
- **Performance Impact**: Large component library could affect bundle size
- **Accessibility Maintenance**: Ongoing testing required for new components

## Open Questions
- Should we implement a design token theme switcher for user customization?
- How granular should component variants be vs. using CSS utility classes?
- What level of animation should be default vs. opt-in?

## Done means...
Complete, accessible, and performant design system implemented with comprehensive documentation, enabling consistent and effective UI development across all StudySharper features.