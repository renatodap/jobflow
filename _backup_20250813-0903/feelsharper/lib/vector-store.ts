import { PostEmbedding, ContentChunk, cosineSimilarity } from './embeddings';

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  content: string;
  similarity: number;
  type: 'post' | 'chunk';
  metadata: {
    category: string;
    tags: string[];
    summary: string;
  };
}

export interface VectorStore {
  addPost(post: PostEmbedding): Promise<void>;
  search(queryEmbedding: number[], options?: SearchOptions): Promise<SearchResult[]>;
  clear(): Promise<void>;
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  includeChunks?: boolean;
}

/**
 * In-memory vector store for development and small-scale production
 * For larger scale, consider Supabase Vector, Pinecone, or Chroma
 */
export class InMemoryVectorStore implements VectorStore {
  private posts: PostEmbedding[] = [];
  private chunks: (ContentChunk & { postId: string; postTitle: string; postSlug: string })[] = [];

  async addPost(post: PostEmbedding): Promise<void> {
    // Store the post
    this.posts.push(post);

    // Store chunks with post reference
    for (const chunk of post.chunks) {
      this.chunks.push({
        ...chunk,
        postId: post.id,
        postTitle: post.title,
        postSlug: post.slug
      });
    }
  }

  async search(queryEmbedding: number[], options: SearchOptions = {}): Promise<SearchResult[]> {
    const { limit = 5, threshold = 0.7, includeChunks = true } = options;
    const results: SearchResult[] = [];

    // Search posts
    for (const post of this.posts) {
      if (!post.embedding) continue;

      const similarity = cosineSimilarity(queryEmbedding, post.embedding);
      
      if (similarity >= threshold) {
        results.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          similarity,
          type: 'post',
          metadata: {
            category: post.category,
            tags: post.tags,
            summary: post.summary
          }
        });
      }
    }

    // Search chunks if enabled
    if (includeChunks) {
      for (const chunk of this.chunks) {
        if (!chunk.embedding) continue;

        const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
        
        if (similarity >= threshold) {
          results.push({
            id: chunk.id,
            title: chunk.postTitle,
            slug: chunk.postSlug,
            content: chunk.content,
            similarity,
            type: 'chunk',
            metadata: {
              category: 'chunk',
              tags: [],
              summary: chunk.content.slice(0, 150) + '...'
            }
          });
        }
      }
    }

    // Sort by similarity and limit results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  async clear(): Promise<void> {
    this.posts = [];
    this.chunks = [];
  }

  getStats() {
    return {
      posts: this.posts.length,
      chunks: this.chunks.length,
      totalEmbeddings: this.posts.filter(p => p.embedding).length + 
                      this.chunks.filter(c => c.embedding).length
    };
  }
}

// Global vector store instance
let vectorStoreInstance: InMemoryVectorStore | null = null;

export function getVectorStore(): InMemoryVectorStore {
  if (!vectorStoreInstance) {
    vectorStoreInstance = new InMemoryVectorStore();
  }
  return vectorStoreInstance;
}

/**
 * Initialize vector store with all posts
 * This should be called during build time or app startup
 */
export async function initializeVectorStore(posts: PostEmbedding[]): Promise<void> {
  const store = getVectorStore();
  await store.clear();
  
  for (const post of posts) {
    await store.addPost(post);
  }
  
  console.log(`Vector store initialized with ${posts.length} posts`);
}
