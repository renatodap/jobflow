import { Check, X, Star } from 'lucide-react'

interface ComparisonItem {
  name: string
  price: string
  rating: number
  features: {
    [key: string]: boolean | string
  }
  pros: string[]
  cons: string[]
  recommended?: boolean
  link?: string
}

interface ComparisonTableProps {
  title: string
  items: ComparisonItem[]
  features: string[]
}

export default function ComparisonTable({ title, items, features }: ComparisonTableProps) {
  return (
    <div className="not-prose my-8">
      <h3 className="text-2xl font-bold text-brand-navy mb-6 text-center">{title}</h3>
      
      {/* Mobile-first: Stack cards on small screens */}
      <div className="block lg:hidden space-y-6">
        {items.map((item, index) => (
          <div key={index} className={`relative rounded-xl border-2 p-6 ${
            item.recommended 
              ? 'border-brand-amber bg-gradient-to-br from-brand-amber/5 to-white shadow-lg' 
              : 'border-brand-gray-200 bg-white shadow-sm'
          }`}>
            {item.recommended && (
              <div className="absolute -top-3 left-4">
                <span className="inline-flex items-center rounded-full bg-brand-amber px-3 py-1 text-sm font-semibold text-white">
                  ⭐ Best Choice
                </span>
              </div>
            )}
            
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-brand-navy mb-2">{item.name}</h4>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < item.rating ? 'fill-brand-amber text-brand-amber' : 'text-brand-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-brand-gray-600">({item.rating}/5)</span>
              </div>
              <div className="text-2xl font-bold text-brand-navy">{item.price}</div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-brand-navy mb-2">Features:</h5>
                <ul className="space-y-1">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      {typeof item.features[feature] === 'boolean' ? (
                        item.features[feature] ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )
                      ) : (
                        <span className="text-brand-amber font-medium">{item.features[feature]}</span>
                      )}
                      <span className="text-brand-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-green-700 mb-2">Pros:</h5>
                  <ul className="space-y-1">
                    {item.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-1 text-sm text-brand-gray-700">
                        <span className="text-green-500 font-bold">+</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold text-red-700 mb-2">Cons:</h5>
                  <ul className="space-y-1">
                    {item.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-1 text-sm text-brand-gray-700">
                        <span className="text-red-500 font-bold">-</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {item.link && (
                <div className="pt-4">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                      item.recommended
                        ? 'bg-brand-amber text-white hover:bg-amber-600'
                        : 'bg-brand-gray-100 text-brand-navy hover:bg-brand-gray-200'
                    }`}
                  >
                    Check Price
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop: Traditional table layout */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg">
          <thead>
            <tr className="bg-brand-navy text-white">
              <th className="p-4 text-left font-semibold">Product</th>
              <th className="p-4 text-center font-semibold">Rating</th>
              <th className="p-4 text-center font-semibold">Price</th>
              {features.map((feature) => (
                <th key={feature} className="p-4 text-center font-semibold text-sm">
                  {feature}
                </th>
              ))}
              <th className="p-4 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className={`border-b border-brand-gray-200 ${
                item.recommended ? 'bg-gradient-to-r from-brand-amber/5 to-white' : 'bg-white'
              } hover:bg-brand-gray-50 transition-colors duration-200`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-semibold text-brand-navy">{item.name}</div>
                      {item.recommended && (
                        <span className="inline-flex items-center rounded-full bg-brand-amber px-2 py-0.5 text-xs font-semibold text-white mt-1">
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < item.rating ? 'fill-brand-amber text-brand-amber' : 'text-brand-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-brand-gray-600 ml-1">({item.rating})</span>
                  </div>
                </td>
                <td className="p-4 text-center font-bold text-brand-navy">{item.price}</td>
                {features.map((feature) => (
                  <td key={feature} className="p-4 text-center">
                    {typeof item.features[feature] === 'boolean' ? (
                      item.features[feature] ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="text-brand-amber font-medium text-sm">{item.features[feature]}</span>
                    )}
                  </td>
                ))}
                <td className="p-4 text-center">
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                        item.recommended
                          ? 'bg-brand-amber text-white hover:bg-amber-600'
                          : 'bg-brand-gray-100 text-brand-navy hover:bg-brand-gray-200'
                      }`}
                    >
                      Check Price
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
