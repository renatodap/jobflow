import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAllPosts, getPostBySlug } from '../../../lib/blog-data'
import SimpleHeader from '@/components/navigation/SimpleHeader'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <SimpleHeader />
      <article className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-navy hover:text-navy-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
        
        <div className="space-y-6 mb-8">
          <h1 className="text-4xl font-bold text-text-primary">
            {post.title}
          </h1>
          
          <p className="text-xl text-text-secondary">
            {post.description}
          </p>
        </div>

        <div className="prose prose-lg max-w-none text-text-secondary">
          <div className="space-y-4">
            <p>This is a comprehensive guide on {post.title.toLowerCase()}. Our evidence-based approach focuses on practical, actionable strategies that deliver real results.</p>
            <p>This article is coming soon. Check back later for full content.</p>
          </div>
        </div>
      </article>
    </div>
  )
}
