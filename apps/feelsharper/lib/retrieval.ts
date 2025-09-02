import { generateEmbedding } from './embeddings';
import { getVectorStore, SearchResult } from './vector-store';

export interface RetrievalResult {
  title: string;
  slug: string;
  relevantContent: string;
  similarity: number;
  link: string;
  type: 'post' | 'chunk';
  category: string;
}

export interface RetrievalOptions {
  maxResults?: number;
  similarityThreshold?: number;
  includeChunks?: boolean;
  maxContentLength?: number;
}

/**
 * Retrieve relevant content based on user query
 */
export async function retrieveRelevantContent(
  query: string, 
  options: RetrievalOptions = {}
): Promise<RetrievalResult[]> {
  const {
    maxResults = 3,
    similarityThreshold = 0.7,
    includeChunks = true,
    maxContentLength = 500
  } = options;

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Search vector store
    const vectorStore = getVectorStore();
    const searchResults = await vectorStore.search(queryEmbedding, {
      limit: maxResults * 2, // Get more results to filter and deduplicate
      threshold: similarityThreshold,
      includeChunks
    });

    // Process and deduplicate results
    const processedResults = processSearchResults(searchResults, maxContentLength);
    
    // Limit to max results
    return processedResults.slice(0, maxResults);
    
  } catch (error) {
    console.error('Error retrieving content:', error);
    return [];
  }
}

/**
 * Process search results and convert to retrieval format
 */
function processSearchResults(
  searchResults: SearchResult[], 
  maxContentLength: number
): RetrievalResult[] {
  const seenSlugs = new Set<string>();
  const results: RetrievalResult[] = [];

  for (const result of searchResults) {
    // Skip if we already have content from this post
    if (seenSlugs.has(result.slug)) {
      continue;
    }
    
    seenSlugs.add(result.slug);

    // Truncate content if too long
    let content = result.content;
    if (content.length > maxContentLength) {
      content = content.slice(0, maxContentLength) + '...';
    }

    results.push({
      title: result.title,
      slug: result.slug,
      relevantContent: content,
      similarity: result.similarity,
      link: `/blog/${result.slug}`,
      type: result.type,
      category: result.metadata.category
    });
  }

  return results;
}

/**
 * Build context prompt for Claude with retrieved content
 */
export function buildContextPrompt(
  relevantContent: RetrievalResult[], 
  userMessage: string
): string {
  let prompt = '';
  
  if (relevantContent.length > 0) {
    prompt += 'RELEVANT FEEL SHARPER CONTENT:\n\n';
    
    relevantContent.forEach((content, index) => {
      prompt += `Article ${index + 1}: "${content.title}"\n`;
      prompt += `Link: ${content.link}\n`;
      prompt += `Relevant excerpt: ${content.relevantContent}\n\n`;
    });
  }
  
  prompt += `USER QUERY: ${userMessage}`;
  return prompt;
}

/**
 * Enhanced query preprocessing for better retrieval
 */
export function preprocessQuery(query: string): string {
  // Convert common wellness terms to more searchable format
  const termMappings: Record<string, string> = {
    'sleep': 'sleep optimization rest recovery',
    'energy': 'energy vitality fatigue',
    'focus': 'focus concentration mental clarity',
    'libido': 'libido testosterone sexual health',
    'supplements': 'supplements vitamins minerals',
    'morning routine': 'morning routine habits',
    'magnesium': 'magnesium sleep minerals',
    'ashwagandha': 'ashwagandha stress adaptogens',
    'melatonin': 'melatonin sleep hormone'
  };

  let processedQuery = query.toLowerCase();
  
  // Expand query with related terms
  for (const [term, expansion] of Object.entries(termMappings)) {
    if (processedQuery.includes(term)) {
      processedQuery += ` ${expansion}`;
    }
  }

  return processedQuery;
}

/**
 * Get query suggestions based on available content
 */
export function getQuerySuggestions(): string[] {
  return [
    "Should I take magnesium at night?",
    "What's better for sleep: magnesium or ashwagandha?",
    "How do I build a morning routine for better energy?",
    "I wake up at 3am every night, what should I do?",
    "What supplements actually work for energy?",
    "I crash at 2pm every day, help?",
    "How do I optimize my sleep if I work night shifts?",
    "What's the minimum effective dose for better sleep?"
  ];
}
