# **Feel Sharper – Dark-First Fitness Brand Guide**

---

## **1. Brand Strategy**

### **Purpose**

To provide free, frictionless fitness tracking that helps people log food, workouts, and weight with clean progress insights.

### **Vision Statement**

Fitness tracking that just works – no complexity, no subscriptions, no ads. Just results.

### **Mission Statement**

To deliver the simplest, fastest fitness tracker that respects users with a clean dark interface, instant logging, and clear progress graphs.

### **Core Values**

1. **Free Forever** – No subscriptions, trials, or hidden costs. Fitness tracking should be accessible.
2. **Frictionless** – Every action should be fast and obvious. No unnecessary steps.
3. **Dark-First** – Dark mode is default. Clean, focused interface that reduces eye strain.
4. **Privacy** – User data stays private. No tracking, no ads, no data selling.
5. **Progress-Focused** – Clear graphs and trends that motivate through visible improvement.
6. **Multi-Tenant Safe** – Your data is yours alone. No cross-user data leakage.

### **Target Audience**

- **Primary**:
    - Fitness-conscious individuals (18–45) aiming to improve athletic performance, physique, or health metrics.
    - Includes both beginners (seeking structure) and advanced athletes (seeking optimization).
- **Secondary**:
    - Sports-specific enthusiasts (tennis, running, cycling, weightlifting)
    - People recovering from injury seeking guided return-to-performance plans.

### **Unique Value Proposition**

Unlike fragmented fitness apps, Feel Sharper delivers a **unified, adaptive, and motivating platform** — blending personalized coaching, precise tracking, integrated tools, and a social layer — to help users consistently achieve measurable results.

### **Brand Personality**

- **Mentor** – Knowledgeable, supportive, inspiring.
- **Innovator** – Tech-savvy, forward-thinking, efficient.
- **Training Partner** – Relatable, goal-driven, shares the struggle.

---

## **2. Visual Identity**

### **Logo**

- **Primary Logo**:
    - Text “Feel Sharper” in bold modern sans-serif, with a dynamic “sharp edge” motif integrated into the “S.”
- **Secondary Logo**:
    - Just the stylized “S” mark (works in small icons, app favicons, avatars).
- **Monochrome Versions**:
    - Black on white
    - White on black
- **Usage Rules**:
    - Minimum clear space: equal to the height of the “F” around the logo.
    - Minimum width: 100px for digital, 20mm for print.

### **Dark-First Color System**

**Background Colors (Dark Primary)**
- `bg: #0A0A0A` – Pure black background
- `surface: #111418` – Near-black surface
- `surface-2: #161A1F` – Elevated surface
- `surface-3: #1D2127` – Higher elevation

**Text Colors (White Primary)**
- `text-primary: #FFFFFF` – Primary text (white)
- `text-secondary: #C7CBD1` – Secondary text (light gray)
- `text-muted: #8B9096` – Muted text (mid gray)
- `text-disabled: #6B6F76` – Disabled text

**Brand Colors (Navy Focus)**
- `navy: #0B2A4A` – Primary brand navy
- `navy-600: #123B69` – Darker navy for hover states
- `navy-400: #1F5798` – Lighter navy for accents

**Semantic Colors**
- `success: #10B981` – Success green for positive actions
- `warning: #F59E0B` – Warning amber for alerts
- `error: #EF4444` – Error red for validation
- `info: #3B82F6` – Info blue for tips

**Functional Colors**
- `border: #23272E` – Border color between elements
- `focus: #E5E7EB` – Focus rings for accessibility

**Usage Ratio**: 70% backgrounds/text, 20% navy brand colors, 10% semantic accents.

### **Typography**

- **Primary Typeface**: *Inter* (Headlines – Bold/SemiBold)
- **Secondary Typeface**: *Inter* (Body – Regular/Medium)
- **Fallback**: Arial, Helvetica, sans-serif
- **Sizing Hierarchy (Desktop)**:
    - H1: 42px
    - H2: 32px
    - H3: 24px
    - Body: 16px
    - Caption: 14px
- **Sizing Hierarchy (Mobile)**:
    - H1: 28px
    - H2: 22px
    - H3: 18px
    - Body: 14px

### **Photography Style**

- Real, in-action shots of people training, running, cooking healthy meals.
- Lighting: Natural or high-contrast studio.
- Color grading: Slightly desaturated background, vibrant focus on subject.
- **Do’s**: Sweat, movement blur, candid smiles.
- **Don’ts**: Overly staged stock photos, generic gym interiors.

### **Illustration/Graphics**

- Minimal line icons with rounded edges, 2px stroke.
- Flat illustrations with modern gradients for onboarding and empty states.
- Icons use primary/secondary colors only.

---

## **3. Verbal Identity**

### **Tone of Voice**

- **Primary**: Motivational, straightforward.
- **Secondary**: Expert yet approachable.
- **Tertiary**: Friendly without being childish.

### **Voice Guidelines**

- Speak **to** the user, not about them.
- Keep sentences short and actionable.
- Avoid filler words — clarity is key.
- Use data and results to inspire action.

### **Messaging Framework**

- **Tagline**: *Your sharpest self, every day.*
- **Elevator Pitch**:
    
    “Feel Sharper is your all-in-one performance platform — tracking your workouts, nutrition, and recovery while keeping you motivated through AI-driven coaching and community support.”
    
- **Brand Story**:
    
    “Most people fail in fitness not because they don’t try, but because they lack clarity, consistency, and motivation. Feel Sharper solves this by creating a clean, adaptive, and engaging environment where every user knows exactly what to do today to move closer to their goals — with tools, data, and community working together.”
    

### **Copy Examples**

- **Onboarding**: “Let’s get sharper — what’s your goal?”
- **Dashboard Header**: “Here’s your game plan for today.”
- **Push Notification**: “Your sharpest day starts now. Let’s go.”

---

## **4. Usage Guidelines**

### **Logo Rules**

- Never stretch, skew, or recolor outside brand palette.
- Always keep clear space free of other elements.
- Use the “S” mark only when space is limited.

### **Color Rules**

- Primary blue dominates headers, CTAs, and highlights.
- Orange is for key action triggers (e.g., “Start Workout”).
- Green confirms success/progress.
- Red only for errors/warnings.

### **Typography Rules**

- Never mix non-brand fonts in UI.
- Maintain hierarchy — headlines always bolder than body.

### **Image Rules**

- Minimum resolution: 1500px width for banners.
- Never use low-quality or watermarked images.
- Crop to focus on action.

### **UI Components**

**Buttons**
- Primary: `bg-navy text-text-primary rounded-xl px-8 py-4` with hover `bg-navy-600`
- Secondary: `bg-surface border border-border text-text-primary rounded-xl px-8 py-4` with hover `bg-surface-2`
- Danger: `bg-error text-text-primary rounded-xl px-4 py-2`

**Cards**
- Base: `bg-surface border border-border rounded-xl p-6`
- Elevated: `bg-surface-2 border border-border rounded-xl p-6`
- Interactive: Add `hover:bg-surface-3 transition-all duration-300`

**Navigation** 
- Desktop: Top navbar with dark background
- Mobile: Hamburger menu with drawer/sheet pattern
- Active states: `text-navy` for current page
- Focus: `focus:ring-2 focus:ring-focus` for keyboard navigation

**Forms**
- Inputs: `bg-surface-2 border border-border rounded-lg px-3 py-2 text-text-primary`
- Labels: `text-text-secondary text-sm font-medium`
- Validation: `border-error text-error` for errors, `border-success` for valid

**Empty States**
- Container: `bg-surface-2 border-2 border-dashed border-border rounded-xl p-12`
- Icon: Large icon in `text-text-muted`
- Text: "Add your first [item]" in `text-text-secondary`
- Action: Primary button to start

**Loading States**
- Skeleton: `bg-surface-2 animate-pulse rounded`
- Spinners: Navy color with smooth rotation
- Progress bars: `bg-surface-2` track with `bg-navy` fill

### **Social Templates**

- Square and 4:5 portrait templates with logo in top-left.
- Consistent photo treatment and color overlays.

### **Accessibility**

- All text must meet WCAG AA contrast standards.
- Provide alt text for all images.
- Minimum touch target: 44px.