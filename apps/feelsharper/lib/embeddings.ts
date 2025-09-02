import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PostMetadata {
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  publishedAt: string;
}

export interface ContentChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  type: 'heading' | 'paragraph' | 'list' | 'callout';
  embedding?: number[];
}

export interface PostEmbedding {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
  chunks: ContentChunk[];
  embedding?: number[];
}

export interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
  }>;
}

/**
 * Generate embeddings with retry logic for rate limiting
 */
export async function generateEmbeddingWithRetry(text: string, maxRetries: number = 3): Promise<number[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateEmbedding(text);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Too Many Requests') && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`⏳ Rate limited, retrying in ${delay/1000}s (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Failed to generate embedding after ${maxRetries} attempts`);
}

/**
 * Generate embeddings using OpenAI's text-embedding-3-small model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for embeddings');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000), // Limit to 8k chars for cost efficiency
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data: EmbeddingResponse = await response.json();
  return data.data[0].embedding;
}

/**
 * Split content into meaningful chunks for better retrieval
 */
export function chunkContent(content: string): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  const lines = content.split('\n');
  let currentChunk = '';
  let chunkStart = 0;
  let chunkId = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Start new chunk on headings
    if (line.startsWith('#') && currentChunk.length > 0) {
      chunks.push({
        id: `chunk_${chunkId++}`,
        content: currentChunk.trim(),
        startIndex: chunkStart,
        endIndex: content.indexOf(currentChunk) + currentChunk.length,
        type: getChunkType(currentChunk)
      });
      currentChunk = line + '\n';
      chunkStart = content.indexOf(line);
    } else {
      currentChunk += line + '\n';
    }

    // Split large chunks (>800 chars)
    if (currentChunk.length > 800) {
      chunks.push({
        id: `chunk_${chunkId++}`,
        content: currentChunk.trim(),
        startIndex: chunkStart,
        endIndex: content.indexOf(currentChunk) + currentChunk.length,
        type: getChunkType(currentChunk)
      });
      currentChunk = '';
      chunkStart = i < lines.length - 1 ? content.indexOf(lines[i + 1]) : content.length;
    }
  }

  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push({
      id: `chunk_${chunkId}`,
      content: currentChunk.trim(),
      startIndex: chunkStart,
      endIndex: content.length,
      type: getChunkType(currentChunk)
    });
  }

  return chunks;
}

function getChunkType(content: string): 'heading' | 'paragraph' | 'list' | 'callout' {
  if (content.includes('##') || content.includes('###')) return 'heading';
  if (content.includes('- ') || content.includes('1. ')) return 'list';
  if (content.includes('> ') || content.includes('**Note:**')) return 'callout';
  return 'paragraph';
}

/**
 * Load and process all MDX posts
 */
export async function loadAllPosts(): Promise<PostEmbedding[]> {
  const postsDirectory = path.join(process.cwd(), 'content', 'posts');
  const filenames = fs.readdirSync(postsDirectory);
  
  const posts: PostEmbedding[] = [];

  for (const filename of filenames) {
    if (!filename.endsWith('.mdx')) continue;

    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContents);

    const slug = filename.replace('.mdx', '');
    const chunks = chunkContent(content);

    const post: PostEmbedding = {
      id: slug,
      title: frontmatter.title || 'Untitled',
      slug,
      summary: frontmatter.summary || '',
      category: frontmatter.category || 'wellness',
      tags: frontmatter.tags || [],
      content,
      chunks
    };

    posts.push(post);
  }

  return posts;
}

/**
 * Generate embeddings for all posts and chunks
 */
export async function generateAllEmbeddings(): Promise<PostEmbedding[]> {
  const posts = await loadAllPosts();
  
  console.log(`Generating embeddings for ${posts.length} posts...`);

  for (const post of posts) {
    try {
      // Generate embedding for full post (title + summary + content)
      const fullText = `${post.title}\n${post.summary}\n${post.content}`;
      post.embedding = await generateEmbeddingWithRetry(fullText);

      // Generate embeddings for each chunk with longer delays
      for (let i = 0; i < post.chunks.length; i++) {
        const chunk = post.chunks[i];
        chunk.embedding = await generateEmbeddingWithRetry(chunk.content);
        
        // Longer delay between chunk embeddings to respect rate limits
        if (i < post.chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      console.log(`✓ Generated embeddings for: ${post.title} (${post.chunks.length} chunks)`);
      
      // Delay between posts
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    } catch (error) {
      console.error(`❌ Failed to generate embeddings for: ${post.title}`, error);
      // Continue with other posts even if one fails
    }
  }

  return posts;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
