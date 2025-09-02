import { ExternalLink, Star } from 'lucide-react'

interface AffiliateBoxProps {
  title: string
  description: string
  price: string
  originalPrice?: string
  rating?: number
  link: string
  image?: string
  pros?: string[]
  disclaimer?: boolean
}

export default function AffiliateBox({
  title,
  description,
  price,
  originalPrice,
  rating = 5,
  link,
  image,
  pros = [],
  disclaimer = true
}: AffiliateBoxProps) {
  return (
    <div className="not-prose my-8">
      <div className="relative overflow-hidden rounded-2xl border-2 border-brand-amber/20 bg-gradient-to-br from-brand-amber/5 to-white p-6 shadow-lg">
        {/* Recommended badge */}
        <div className="absolute -top-3 left-6">
          <span className="inline-flex items-center rounded-full bg-brand-amber px-4 py-1 text-sm font-semibold text-white shadow-md">
            ⭐ Recommended
          </span>
        </div>
        
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start">
          {/* Product image placeholder */}
          {image && (
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-lg bg-brand-gray-100 border border-brand-gray-200"></div>
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-brand-navy mb-2">
              {title}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? 'fill-brand-amber text-brand-amber' : 'text-brand-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-brand-gray-600">({rating}/5)</span>
            </div>
            
            <p className="text-brand-gray-700 mb-4 leading-relaxed">
              {description}
            </p>
            
            {/* Pros list */}
            {pros.length > 0 && (
              <ul className="mb-4 space-y-1">
                {pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-brand-gray-700">
                    <span className="text-green-500 font-bold">✓</span>
                    {pro}
                  </li>
                ))}
              </ul>
            )}
            
            {/* Pricing and CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-brand-navy">{price}</span>
                {originalPrice && (
                  <span className="text-lg text-brand-gray-500 line-through">{originalPrice}</span>
                )}
              </div>
              
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-amber px-6 py-3 font-semibold text-white shadow-md hover:bg-amber-600 hover:shadow-lg transition-all duration-200"
              >
                Check Price
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Affiliate disclaimer */}
        {disclaimer && (
          <div className="mt-6 border-t border-brand-gray-200 pt-4">
            <p className="text-xs text-brand-gray-500">
              <strong>Affiliate Disclosure:</strong> This post contains affiliate links. 
              If you purchase through these links, we may earn a commission at no extra cost to you. 
              We only recommend products we genuinely believe in.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
