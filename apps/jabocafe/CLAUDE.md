# CLAUDE.md - Jabô Café Website

This file provides guidance to Claude Code (claude.ai/code) when working with the Jabô Café website repository.

## Project Overview

This is the official website for Jabô Café (Fazenda Jaboticabeiras), a specialty coffee farm established in 1938 in Guaxupé, Minas Gerais, Brazil. The website showcases their sustainable coffee production, family tradition, and premium coffee products.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Development**: Node.js, npm

## Project Structure

```
jabo-cafe/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Homepage
│   ├── missao-valores/      # Mission and values page
│   ├── nossa-historia/      # Our history page
│   ├── nosso-cafe/          # Our coffee page
│   ├── sustentabilidade/    # Sustainability page
│   ├── blog/                # Blog page
│   ├── contato/             # Contact page
│   └── sobre/               # About page (legacy)
├── components/              # React components
│   ├── layout/             # Header and Footer
│   └── sections/           # Homepage sections
├── public/                 # Static assets
└── styles/                 # Global styles
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server on port 3456
npm run dev -- --port 3456

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npm run typecheck
```

## Important Information

### Contact Details (REAL - DO NOT CHANGE)
- **Email**: renatofap@jabo.cafe
- **Phone**: (11) 98415-3337
- **Address**: Fazenda Jaboticabeiras, S/N - Japy, Guaxupé - MG, 37800-000

### Social Media (REAL - DO NOT CHANGE)
- **Instagram**: @jabocafe
- **Instagram**: @fazendajaboticabeiras
- **YouTube**: @jabocafe7101

### Client Testimonials (REAL - DO NOT MODIFY)
1. **Barbara Grings**: "Ter experimentado o Café Jabô foi uma sensação de nostalgia com emoções. Um café frutado, leve, muito saboroso e que traz consigo tanta história, selos e cuidado que é impossível tomar com pressa ou tomar sem sentir alguma coisa. Parabéns à família produtora e à fazenda Jaboticabeiras por terem criado esse patrimônio brasileiro."

2. **Isabella Salton**: "Perfeito ! Obrigada!!!! Delicioso !"

### Blog Posts (As of November 19, 2024)
1. Sustentabilidade no Café: Como a Fazenda Jaboticabeiras Inspira uma Nova Geração de Produtores
2. O Papel da Fazenda Jaboticabeiras no Cenário Global de Cafés Especiais
3. Como Degustar Café Especial: Um Guia Para Apreciar Cada Nota de Sabor
4. O Impacto do Café Sustentável no Meio Ambiente e na Sociedade
5. A Jornada do Café Especial: Do Cultivo Sustentável ao Seu Paladar

## Design System

### Colors (Tailwind CSS classes)
- **Primary**: coffee-600, coffee-700, coffee-800, coffee-900
- **Secondary**: cream, coffee-50, coffee-100
- **Accent**: green-600, green-800 (for sustainability themes)

### Typography
- **Headings**: font-serif (for elegant, traditional look)
- **Body**: Default sans-serif

### Components
- Responsive navigation with mobile menu
- Animated sections using Framer Motion
- Contact forms with validation
- Social media integration
- Multi-language support structure (PT/EN/ES)

## Important Guidelines

1. **Content Accuracy**: NEVER create fake testimonials, reviews, or claims. All content must be factual.

2. **Language**: Primary language is Portuguese (Brazilian). The site structure supports multiple languages but content is currently in Portuguese.

3. **Sustainability Focus**: Emphasize sustainable and regenerative farming practices throughout the site.

4. **Family Tradition**: Highlight the 80+ years of family tradition since 1938.

5. **Contact Information**: Always use the real contact details provided above. Never generate fake contact information.

6. **Images**: Currently using placeholder gradients. Real images should be added in the /public directory when available.

## Pages Content Summary

### Home (/)
- Hero section with main value proposition
- About section highlighting tradition and quality
- Products showcase
- Real customer testimonials
- Blog preview
- Contact CTA

### Missão e Valores (/missao-valores)
- Mission statement
- Core values
- Sustainability commitment
- Quality focus

### Nossa História (/nossa-historia)
- Founded in 1938
- Three generations of coffee farming
- Timeline of important milestones
- Family tradition emphasis

### Nosso Café (/nosso-cafe)
- Coffee characteristics
- Production process
- Quality commitments
- Sustainability practices

### Sustentabilidade (/sustentabilidade)
- Environmental initiatives
- Regenerative agriculture
- Social impact
- Certifications

### Blog (/blog)
- Articles about coffee
- Sustainability topics
- Coffee preparation guides
- Industry insights

### Contato (/contato)
- Contact form
- Real contact information
- Social media links
- Location details

## Development Notes

- The site is fully responsive and mobile-friendly
- All animations are performant and accessible
- Forms are client-side only (backend integration needed for full functionality)
- SEO optimization should be added (meta tags, structured data)
- Analytics integration pending

## Future Enhancements

- E-commerce functionality for online coffee sales
- Customer portal for order tracking
- Newsletter subscription system
- Multi-language content management
- Image gallery of the farm
- Video content integration
- Coffee subscription service
- Virtual farm tours

## Deployment

The site is ready for deployment on platforms like:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any Node.js hosting platform

Remember to set up environment variables for any API keys or sensitive configuration.