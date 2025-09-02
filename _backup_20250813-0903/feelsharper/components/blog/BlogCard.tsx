import Link from 'next/link'
import { format } from 'date-fns'
import { Clock, ArrowRight } from 'lucide-react'
import type { BlogPost } from '../../lib/blog-data'

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const cardClasses = featured 
    ? "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy to-brand-gray-800 p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300"
    : "group relative overflow-hidden rounded-xl bg-white border border-brand-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-brand-amber/30"

  return (
    <article className={cardClasses}>
      {featured && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center rounded-full bg-brand-amber px-3 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 text-sm mb-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              featured 
                ? 'bg-white/20 text-white' 
                : 'bg-brand-amber/10 text-brand-amber'
            }`}>
              {post.category}
            </span>
            <div className={`flex items-center gap-1 ${featured ? 'text-white/80' : 'text-brand-gray-500'}`}>
              <Clock className="h-3 w-3" />
              <span>{post.readingTime.text}</span>
            </div>
          </div>
          
          <h3 className={`text-xl font-bold leading-tight mb-3 group-hover:${featured ? 'text-brand-amber' : 'text-brand-amber'} transition-colors duration-200`}>
            <Link href={post.url} className="stretched-link">
              {post.title}
            </Link>
          </h3>
          
          <p className={`text-sm leading-relaxed mb-4 ${featured ? 'text-white/90' : 'text-brand-gray-600'}`}>
            {post.description}
          </p>
          
          <div className="flex items-center justify-between">
            <time 
              dateTime={post.date} 
              className={`text-xs ${featured ? 'text-white/70' : 'text-brand-gray-500'}`}
            >
              {format(new Date(post.date), 'MMM d, yyyy')}
            </time>
            
            <div className={`flex items-center gap-1 text-xs font-medium ${
              featured ? 'text-brand-amber' : 'text-brand-amber'
            } group-hover:gap-2 transition-all duration-200`}>
              Read more
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle hover effect */}
      <div className={`absolute inset-0 ${
        featured 
          ? 'bg-gradient-to-br from-brand-amber/10 to-transparent opacity-0 group-hover:opacity-100' 
          : 'bg-gradient-to-br from-brand-amber/5 to-transparent opacity-0 group-hover:opacity-100'
      } transition-opacity duration-300 pointer-events-none`} />
    </article>
  )
}
