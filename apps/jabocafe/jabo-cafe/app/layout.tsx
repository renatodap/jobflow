import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "Jabô Café - Tradição e Sustentabilidade Desde 1938 | Fazenda Jaboticabeiras",
  description: "Café especial cultivado com paixão há três gerações em Guaxupé, MG. Práticas sustentáveis, colheita manual e qualidade premiada. Conheça nossa história.",
  keywords: "café especial, Jabô, Guaxupé, Minas Gerais, fazenda Jaboticabeiras, café sustentável, café orgânico, café arábica, café premiado, agricultura regenerativa",
  authors: [{ name: "Fazenda Jaboticabeiras" }],
  creator: "Família Jaboticabeiras",
  publisher: "Jabô Café",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://jabo.cafe'),
  openGraph: {
    title: "Jabô Café - Tradição e Sustentabilidade Desde 1938",
    description: "Café especial cultivado com paixão há três gerações. Práticas sustentáveis e qualidade premiada.",
    url: 'https://jabo.cafe',
    siteName: 'Jabô Café',
    images: [
      {
        url: '/images/IMAGE_hero_people_fazenda.webp',
        width: 1920,
        height: 1080,
        alt: 'Família Jaboticabeiras na fazenda de café',
      }
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jabô Café - Tradição Desde 1938",
    description: "Café especial cultivado com paixão há três gerações em Guaxupé, MG.",
    creator: "@jabocafe",
    images: ['/images/IMAGE_hero_people_fazenda.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Jabô Café - Fazenda Jaboticabeiras',
    description: 'Café especial cultivado com tradição desde 1938 em Guaxupé, MG',
    url: 'https://jabo.cafe',
    telephone: '+5511984153337',
    email: 'renatofap@jabo.cafe',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Fazenda Jaboticabeiras, S/N - Japy',
      addressLocality: 'Guaxupé',
      addressRegion: 'MG',
      postalCode: '37800-000',
      addressCountry: 'BR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -21.3053,
      longitude: -46.7128
    },
    image: 'https://jabo.cafe/images/IMAGE_fazenda_vista_aerea.webp',
    priceRange: '$$$',
    servesCuisine: 'Café Especial',
    foundingDate: '1938',
    founder: {
      '@type': 'Person',
      name: 'João Batista'
    },
    sameAs: [
      'https://www.instagram.com/jabocafe',
      'https://www.instagram.com/fazendajaboticabeiras',
      'https://www.youtube.com/@jabocafe7101'
    ]
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Café Jabô Especial',
    description: 'Café 100% arábica cultivado de forma sustentável',
    brand: {
      '@type': 'Brand',
      name: 'Jabô Café'
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: '45.00',
      priceCurrency: 'BRL'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '89'
    }
  }

  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#6d4c41" />
        <link rel="icon" href="/images/IMAGE_jabo_logo.png" />
        <link rel="apple-touch-icon" href="/images/IMAGE_jabo_logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        
        {/* Preconnect to optimize font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <LanguageProvider>
          <a href="#main" className="skip-to-content">
            Pular para o conteúdo principal
          </a>
          <main id="main">{children}</main>
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}