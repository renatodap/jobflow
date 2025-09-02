# CLAUDE.md - Jabô Café Website [ENHANCED VERSION]

## 🚨 CRITICAL DATA PROTECTION RULES

### NEVER MODIFY OR GENERATE FAKE DATA FOR:
1. **Contact Information** - Always use exact values:
   - Email: `renatofap@jabo.cafe`
   - Phone: `(11) 98415-3337` or `+5511984153337`
   - Address: `Fazenda Jaboticabeiras, S/N - Japy, Guaxupé - MG, 37800-000`

2. **Real Testimonials** - Only use these verified testimonials:
   - **Barbara Grings**: "Ter experimentado o Café Jabô foi uma sensação de nostalgia com emoções. Um café frutado, leve, muito saboroso e que traz consigo tanta história, selos e cuidado que é impossível tomar com pressa ou tomar sem sentir alguma coisa. Parabéns à família produtora e à fazenda Jaboticabeiras por terem criado esse patrimônio brasileiro."
   - **Isabella Salton**: "Perfeito ! Obrigada!!!! Delicioso !"

3. **Employee Profiles** - Real team members:
   - **Reginaldo**: Mestre de Colheita, 25 years experience
   - **Everaldo**: Especialista em Sustentabilidade, 18 years experience

4. **Historical Facts**:
   - Founded: 1938 by João Batista
   - Location: Guaxupé, Minas Gerais, Brazil
   - Coordinates: -21.3053, -46.7128

## 📋 PRE-MODIFICATION CHECKLIST

Before ANY code changes:
1. ✅ Run `npm run typecheck` to ensure type safety
2. ✅ Verify no real data is being modified
3. ✅ Check if constants should be in `lib/constants.ts`
4. ✅ Validate all contact info matches exact format
5. ✅ Ensure testimonials are from approved list only

## 🛡️ DATA INTEGRITY RULES

### ALWAYS:
- Store business constants in centralized location (`lib/constants.ts`)
- Use TypeScript interfaces for all data structures
- Validate email/phone formats before using
- Mark demo data clearly with `// DEMO DATA - NOT REAL` comments
- Keep real customer data separate from test data

### NEVER:
- Generate fake customer testimonials or reviews
- Create fictional employee profiles or stories
- Modify verified contact information
- Use Lorem Ipsum for production content
- Mix demo data with production data

## 🏗️ CODE QUALITY STANDARDS

### Before committing:
```bash
# Required checks
npm run typecheck    # Must pass with zero errors
npm run lint         # Fix all linting issues
npm run build        # Ensure production build succeeds
```

### Type Safety Requirements:
```typescript
// ALL data structures must have interfaces:
interface BusinessData {
  email: string;      // Must match email regex
  phone: string;      // Must be Brazilian format
  verified: boolean;  // Track data verification status
}

// Validate critical data:
const validateContactInfo = (data: BusinessData): boolean => {
  return /^[^\s@]+@jabo\.cafe$/.test(data.email) && 
         /^\+55\d{10,11}$/.test(data.phone);
};
```

## 📁 FILE STRUCTURE & DATA LOCATIONS

### Critical Data Files (READ-ONLY):
- `app/layout.tsx`: SEO metadata, structured data
- `app/page.tsx`: Main testimonials, contact CTAs
- `components/storytelling/EmployeeSpotlight.tsx`: Real employee profiles
- `components/interactive/HistoryTimeline.tsx`: Company history

### Safe to Modify:
- UI components (styling, animations)
- Blog post content (with factual information)
- Page layouts (maintaining data integrity)
- Development tooling configurations

## 🔒 PROTECTED CONSTANTS

Create and maintain `lib/constants.ts`:
```typescript
export const BUSINESS_INFO = {
  email: 'renatofap@jabo.cafe',
  phone: '+5511984153337',
  whatsapp: '5511984153337',
  address: {
    street: 'Fazenda Jaboticabeiras, S/N',
    neighborhood: 'Japy',
    city: 'Guaxupé',
    state: 'MG',
    postalCode: '37800-000',
    country: 'Brasil'
  },
  social: {
    instagram: ['@jabocafe', '@fazendajaboticabeiras'],
    youtube: '@jabocafe7101'
  },
  founded: 1938,
  coordinates: {
    lat: -21.3053,
    lng: -46.7128
  }
} as const; // Make immutable
```

## ⚠️ DEMO DATA HANDLING

When using demo/test data:
```typescript
// DEMO DATA - NOT FOR PRODUCTION
const DEMO_TESTIMONIALS = [
  { 
    id: 'demo-1',
    name: 'TESTE Usuario Demo',
    text: 'Este é um depoimento de demonstração apenas.',
    isDemo: true // Always flag demo data
  }
];

// Production check
if (process.env.NODE_ENV === 'production' && data.isDemo) {
  throw new Error('Demo data cannot be used in production');
}
```

## 🚀 DEPLOYMENT VERIFICATION

Before deploying:
1. Verify all contact information is correct
2. Ensure no demo data in production build
3. Check all testimonials are from approved list
4. Validate structured data for SEO
5. Test all contact forms and links
6. Confirm WhatsApp integration uses correct number

## 📝 CONTENT GUIDELINES

### Language Standards:
- Primary: Portuguese (Brazilian) - pt-BR
- Use formal but warm tone
- Emphasize tradition (since 1938)
- Highlight sustainability and quality
- Respect coffee culture terminology

### SEO & Metadata:
- Title: Include "Jabô Café" or "Fazenda Jaboticabeiras"
- Description: Mention "café especial", "Guaxupé", "desde 1938"
- Keywords: Focus on specialty coffee, sustainability, Brazilian coffee

## 🔧 ERROR PREVENTION

### Common Mistakes to Avoid:
1. ❌ Using placeholder text in production
2. ❌ Generating random customer names
3. ❌ Creating fake social proof
4. ❌ Modifying historical dates or facts
5. ❌ Changing verified contact details
6. ❌ Mixing test and production data

### Validation Helpers:
```typescript
// Always validate before using:
import { BUSINESS_INFO } from '@/lib/constants';

// Never hardcode, always reference:
const contactEmail = BUSINESS_INFO.email; // ✅
const email = "contact@example.com";      // ❌
```

## 📊 DATA GOVERNANCE

### Single Source of Truth:
- Business info: `lib/constants.ts`
- Product data: `lib/products.ts`
- Testimonials: `lib/testimonials.ts`
- Employee data: `lib/team.ts`

### Change Management:
- Document all data changes in commit messages
- Update CLAUDE.md when business info changes
- Version control all critical data updates
- Maintain audit trail for testimonials

Remember: This is a real business website. Every piece of data represents real people, real products, and real reputation. Treat all data with respect and maintain absolute accuracy.