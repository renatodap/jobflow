import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import { Heading, Subheading, Body, Caption } from '@/components/ui/Typography';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

import { BlogPost } from '@/lib/blog-data';

interface ArticlePreviewProps {
  posts: BlogPost[];
}

/**
 * Modern article preview section showcasing featured content
 * Features clean card design with proper typography hierarchy
 */
export default function ArticlePreview({ posts }: ArticlePreviewProps) {
  return (
    <section className="py-24 bg-neutral-50">
      <Container size="lg">
        {/* Section header */}
        <div className="text-center mb-16">
          <Subheading className="text-4xl lg:text-5xl mb-6">
            Latest Insights
          </Subheading>
          <Body size="lg" className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Evidence-based strategies and optimization protocols. 
            Every article is designed to move you closer to peak performance.
          </Body>
        </div>

        {/* Featured article grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {posts.map((post, index) => (
            <Card 
              key={post.slug}
              variant="elevated"
              className="group hover:shadow-strong transition-all duration-300 h-full flex flex-col"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Category badge */}
              <div className="mb-4">
                <Badge variant="secondary" size="sm">
                  {post.category}
                </Badge>
              </div>

              {/* Article title */}
              <Subheading className="text-xl mb-4 group-hover:text-brand-amber transition-colors line-clamp-2">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </Subheading>

              {/* Article summary */}
              <Body className="text-neutral-600 mb-6 flex-1 line-clamp-3">
                {post.description}
              </Body>

              {/* Article metadata */}
              <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <Caption>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Caption>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <Caption>{post.readingTime.text}</Caption>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="default" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Read more link */}
              <Link 
                href={`/blog/${post.slug}`}
                className="inline-flex items-center text-brand-amber hover:text-amber-600 font-medium transition-colors group"
              >
                Read Article
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Card>
          ))}
        </div>

        {/* View all articles CTA */}
        <div className="text-center">
          <Link href="/blog">
            <Button 
              variant="outline" 
              size="lg"
            >
              View All Articles
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
