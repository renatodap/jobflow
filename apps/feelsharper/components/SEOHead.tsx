import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  tags?: string[]
}

export default function SEOHead({
  title = "Feel Sharper - Free Fitness Tracker",
  description = "Track food, workouts, and weight with clean graphs. Completely free, no ads, no subscriptions.",
  image = "/images/og-default.jpg",
  url = "https://feelsharper.com",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Feel Sharper",
  tags = []
}: SEOHeadProps) {
  const fullTitle = title.includes('Feel Sharper') ? title : `${title} | Feel Sharper`
  const fullUrl = url.startsWith('http') ? url : `https://feelsharper.com${url}`
  const fullImage = image.startsWith('http') ? image : `https://feelsharper.com${image}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type === "article" ? "Article" : "WebSite",
    "name": fullTitle,
    "headline": title,
    "description": description,
    "image": fullImage,
    "url": fullUrl,
    ...(type === "article" && {
      "author": {
        "@type": "Organization",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": "Feel Sharper",
        "logo": {
          "@type": "ImageObject",
          "url": "https://feelsharper.com/images/logo.png"
        }
      },
      "datePublished": publishedTime,
      "dateModified": modifiedTime || publishedTime,
      "keywords": tags.join(", ")
    }),
    ...(type === "website" && {
      "publisher": {
        "@type": "Organization",
        "name": "Feel Sharper"
      }
    })
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Feel Sharper" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Article specific */}
      {type === "article" && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:author" content={author} />
          {tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </Head>
  )
}
